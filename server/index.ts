
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config(); // Also load standard .env if it exists

const app = express();
const PORT = process.env.PORT || 3001;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Strips the data:image prefix to get just the base64 data
 */
const getBase64Data = (dataUrl: string): { data: string; mimeType: string } => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return { data, mimeType };
};

/**
 * Fetches and encodes ONE Master Reference image for the selected density from the local filesystem.
 */
async function getMasterReferenceServer(density: string): Promise<{ data: string; mimeType: string } | null> {
    const densityKey = (density || 'medium').toLowerCase();
    const fileExtensions = ['.jpg', '.JPG', '.jpeg', '.png'];
    const publicPath = path.join(__dirname, '../public');

    for (const ext of fileExtensions) {
        try {
            const filePath = path.join(publicPath, 'references', 'density', densityKey, `1${ext}`);
            const fs = await import('fs/promises');
            const buffer = await fs.readFile(filePath);
            const mimeType = ext.endsWith('png') ? 'image/png' : 'image/jpeg';
            return { data: buffer.toString('base64'), mimeType };
        } catch (e) {
            continue;
        }
    }
    return null;
}

/**
 * Server-side image composition using Sharp
 */
async function compositeStrictResultServer(
    originalBuffer: Buffer,
    aiResultBuffer: Buffer,
    maskBuffer: Buffer
): Promise<Buffer> {
    const originalMetadata = await sharp(originalBuffer).metadata();

    // 1. Create a feathered mask (8px blur like in the browser)
    const featheredMask = await sharp(maskBuffer)
        .resize(originalMetadata.width, originalMetadata.height)
        .blur(8)
        .toBuffer();

    // 2. Extract the AI result through the feathered mask
    const aiWithAlpha = await sharp(aiResultBuffer)
        .resize(originalMetadata.width, originalMetadata.height)
        .composite([{ input: featheredMask, blend: 'dest-in' }])
        .png()
        .toBuffer();

    // 3. Composite onto the original
    return sharp(originalBuffer)
        .composite([{ input: aiWithAlpha, top: 0, left: 0 }])
        .toBuffer();
}

app.post('/api/v1/validate', async (req, res) => {
    try {
        const { patientImage, apiKey: providedKey } = req.body;
        const apiKey = process.env.GEMINI_API_KEY || providedKey;

        if (!apiKey) {
            return res.status(401).json({ success: false, error: "API Key not found" });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { data: patientBase64, mimeType: patientMime } = getBase64Data(patientImage);

        const validationPrompt = "Analyze this image. Is it a human scalp, human hair, or a human head/face suitable for a hair transplant simulation? Answer ONLY with 'TRUE' if it is, or 'FALSE' if it is anything else (animals, landscapes, objects, etc).";
        const validationResult = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{
                parts: [
                    { text: validationPrompt },
                    { inlineData: { data: patientBase64, mimeType: patientMime } }
                ]
            }]
        });

        let validationText = "";
        if (validationResult.candidates?.[0]?.content?.parts) {
            for (const part of validationResult.candidates[0].content.parts) {
                if ('text' in part) validationText += part.text;
            }
        }

        if (validationText.toUpperCase().includes("FALSE")) {
            return res.json({
                success: false,
                error: "Please upload a clear photo of your scalp/head for simulation, not any other type of image."
            });
        }

        return res.json({ success: true });
    } catch (error: any) {
        console.error("Validation Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/v1/simulate', async (req, res) => {
    try {
        const { patientImage, mask, density, apiKey: providedKey } = req.body;

        // Use server-side API key if available, otherwise use from request (for multi-tenant support if needed)
        const apiKey = process.env.GEMINI_API_KEY || providedKey;

        if (!apiKey) {
            return res.status(401).json({ success: false, error: "API Key not found" });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { data: patientBase64, mimeType: patientMime } = getBase64Data(patientImage);

        // --- 1. ANATOMICAL VALIDATION (Redundant check for API security) ---
        const validationPrompt = "Analyze this image. Is it a human scalp, human hair, or a human head/face suitable for a hair transplant simulation? Answer ONLY with 'TRUE' if it is, or 'FALSE' if it is anything else (animals, landscapes, objects, etc).";
        const validationResult = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{
                parts: [
                    { text: validationPrompt },
                    { inlineData: { data: patientBase64, mimeType: patientMime } }
                ]
            }]
        });

        let validationText = "";
        if (validationResult.candidates?.[0]?.content?.parts) {
            for (const part of validationResult.candidates[0].content.parts) {
                if ('text' in part) validationText += part.text;
            }
        }

        if (validationText.toUpperCase().includes("FALSE")) {
            return res.status(400).json({
                success: false,
                error: "Please upload a clear photo of your scalp/head for simulation, not any other type of image."
            });
        }

        // --- 2. PREPARE AI INPUT (Adding the Green Mask) ---
        // Note: For deep server-side logic, we recreate the green mask overlay
        let inputImageBase64 = patientBase64;
        let inputMime = patientMime;

        if (mask) {
            const { data: maskData } = getBase64Data(mask);
            const patBuffer = Buffer.from(patientBase64, 'base64');
            const maskBuffer = Buffer.from(maskData, 'base64');

            const metadata = await sharp(patBuffer).metadata();

            // Create a solid green layer
            const greenLayer = await sharp({
                create: {
                    width: metadata.width!,
                    height: metadata.height!,
                    channels: 4,
                    background: { r: 0, g: 255, b: 0, alpha: 1 }
                }
            }).png().toBuffer();

            // Mask the green layer with the user's mask
            const greenMask = await sharp(greenLayer)
                .composite([{ input: maskBuffer, blend: 'dest-in' }])
                .toBuffer();

            // Composite onto patient image
            const aiInputBuffer = await sharp(patBuffer)
                .composite([{ input: greenMask, top: 0, left: 0 }])
                .toBuffer();

            inputImageBase64 = aiInputBuffer.toString('base64');
            inputMime = 'image/png';
        }

        // --- 3. RUN SIMULATION ---
        const densityLabel = (density || "MEDIUM").toUpperCase();

        const prompt = `ROLE: EXPERT MEDICAL HAIR RESTORATION AI
TASK: Perform a photorealistic surgical hair transplant simulation.

INSTRUCTIONS:
1. TARGET AREA (CRITICAL): The solid neon green mask marks the EXACT recipient zone. You must completely cover and fill this ENTIRE green area with new, naturally growing hair. Do NOT leave a single green pixel exposed. Every area that is currently green MUST become hair.
2. NATIVE HAIR CLONING: You must visually extract, clone, and synthesize the texture of the hair from the sides and back of the patient's head in the photo. Use this exact cloned texture to fill the green area. Do NOT use outside references.
3. DENSITY TARGET (${densityLabel}): 
   - LOW: Sparse coverage (30-35 grafts/cm²), scalp clearly visible.
   - MEDIUM: Standard coverage (45-50 grafts/cm²), slight scalp visibility.
   - HIGH: Dense coverage (60+ grafts/cm²), no scalp visible.
4. BLENDING: The new hair must taper and feather flawlessly into the surrounding native hair. Create a natural, irregular, micro-jagged frontal hairline. No straight or artificial lines.

CRITICAL CONSTRAINTS:
- FATAL ERROR: You MUST physically draw/generate new hair over the solid neon green mask. Returning the original image with a bald green patch is a complete failure.
- NO GREEN ALLOWED: Completely remove and replace the green tint. No green pixels may remain anywhere on the image. Every green pixel must be replaced by hair or scalp.
- The final output must be a seamless, photorealistic medical simulation.`;

        const parts: any[] = [];

        // Add Patient (Identity)
        parts.push({ text: "[PRIMARY PATIENT PHOTO - USE THIS FOR ALL PIXELS AND IDENTITY]" });
        parts.push({
            inlineData: {
                data: inputImageBase64,
                mimeType: inputMime
            }
        });

        // Add Command
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ parts }],
        });

        let aiResultB64 = "";
        let aiMime = "";
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    aiResultB64 = part.inlineData.data;
                    aiMime = part.inlineData.mimeType;
                    break;
                }
            }
        }

        if (!aiResultB64) {
            return res.status(500).json({ success: false, error: "AI failed to generate results" });
        }

        // --- 4. AI QUALITY CONTROL (QA) CHECK BEFORE COMPOSITION ---
        const qcPrompt = "Analyze this hair transplant simulation result. Answer ONLY 'PASS' if it looks like a person with new hair added. FATAL ERROR: answer ONLY 'FAIL' if ANY of these are true: 1) There is a visible green tint, green pixels, or green patch on the scalp (this means the AI failed to draw hair over the mask), 2) NO new hair was added (it still looks completely bald in the target area), 3) the new hair looks like a solid black block or a literal wig pasted on. You must reject obvious failures or unchanged bald heads with green patches.";
        
        const qcResult = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [{
                parts: [
                    { text: qcPrompt },
                    { inlineData: { data: aiResultB64, mimeType: aiMime } }
                ]
            }]
        });

        let qcText = "";
        if (qcResult.candidates?.[0]?.content?.parts) {
            for (const part of qcResult.candidates[0].content.parts) {
                if ('text' in part) qcText += part.text;
            }
        }

        if (qcText.toUpperCase().includes("FAIL")) {
            return res.status(400).json({ 
                success: false, 
                error: "The AI generated an unnatural result. Please click Generate Simulation again for a better outcome." 
            });
        }

        // --- 5. FINAL COMPOSITION ---
        let finalImageBase64 = aiResultB64;
        if (mask) {
            const finalBuffer = await compositeStrictResultServer(
                Buffer.from(patientBase64, 'base64'),
                Buffer.from(aiResultB64, 'base64'),
                Buffer.from(getBase64Data(mask).data, 'base64')
            );
            finalImageBase64 = finalBuffer.toString('base64');
            aiMime = 'image/png';
        }

        res.json({
            success: true,
            resultImage: `data:${aiMime};base64,${finalImageBase64}`
        });

    } catch (error: any) {
        console.error("API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check for public API validation
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: "Hair Simulation API is live" });
});

// Serve static assets from front-end build (for production)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Handle SPAs - Only catch GET requests that are NOT API calls
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
});

// Global 404 for API
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: `API route not found: ${req.originalUrl}` });
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
