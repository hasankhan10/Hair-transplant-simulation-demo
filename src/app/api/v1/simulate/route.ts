import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';

const MODEL_NAME = 'gemini-2.5-flash-image';

const getBase64Data = (dataUrl: string): { data: string; mimeType: string } => {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return { data, mimeType };
};

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { patientImage, mask, density, apiKey: providedKey } = body;
        const apiKey = process.env.GEMINI_API_KEY || providedKey;

        if (!apiKey) {
            return NextResponse.json({ success: false, error: "API Key not found" }, { status: 401 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { data: patientBase64, mimeType: patientMime } = getBase64Data(patientImage);

        // --- 1. ANATOMICAL VALIDATION ---
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
            return NextResponse.json({
                success: false,
                error: "Please upload a clear photo of your scalp/head for simulation, not any other type of image."
            }, { status: 400 });
        }

        // --- 2. PREPARE AI INPUT (Adding the Green Mask) ---
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
                    width: metadata.width || 512,
                    height: metadata.height || 512,
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
        const densityLabel = (density ? String(density).split(' ')[0] : "MEDIUM").toUpperCase();

        const systemPrompt = `ROLE: EXPERT CLINICAL HAIR RESTORATION AI
TASK: Perform a photorealistic, high-fidelity surgical hair transplant simulation.

INSTRUCTIONS:
1. RECIPIENT ZONE TARGET (CRITICAL): The solid neon green mask marks the EXACT recipient zone where the transplant is planned. You must completely replace the ENTIRE green mask area with new, naturally growing hair. Do NOT leave a single green pixel exposed. Every pixel that is currently green MUST be replaced by hair or realistic scalp shading.
2. HAIR COLOR & HIGHLIGHT MATCHING (CRITICAL):
   - The color of the generated hair MUST EXACTLY match the patient's native hair color.
   - Distinguish between natural light reflections (gloss/sheen from overhead lights) and actual gray/white hair. The patient has dark/black hair; do NOT generate gray, white, or silver hair strands unless the patient's hair is already predominantly gray. Keep the hair solid black/dark.
3. NATIVE HAIR CLONING:
   - Visually extract, clone, and synthesize the texture, wave/curl pattern, and flow direction of the healthy hair from the donor zone (the sides and back of the patient's head).
   - Use this cloned texture to fill the green area.
   - IMPORTANT: Do NOT clone the thinning, balding, or sparse properties of the patient's top scalp. The new hair must be healthy, thick, robust, and fully formed.
4. DENSITY TARGET (${densityLabel}): 
   - LOW: Conservative hair density (30-35 grafts/cm²). The scalp is partially visible under the new hair.
   - MEDIUM: Standard clinical density (45-50 grafts/cm²). Full, natural-looking hair coverage with minimal scalp visibility under bright light. Healthy and natural volume.
   - HIGH: Maximum density hair restoration (60+ grafts/cm²). Generate extremely thick, dense, and voluminous hair. The scalp must be completely covered and 100% hidden under a lush layer of dense hair. Absolutely no thinning or bald spots must remain.
5. NATURAL HAIRLINE & BLENDING:
   - Create a natural, irregular, micro-jagged frontal hairline with individual follicular units at the edge (no straight, blocky, or artificial-looking hairpiece lines).
   - Feather and taper the new hair flawlessly into the patient's surrounding native hair so there is no visible seam or transition boundary.

CRITICAL CONSTRAINTS:
- NO BALDNESS REMAINING: For HIGH density, you must completely cover all bald or thinning spots within the green mask. It is a failure if the area looks balding or thin after the simulation.
- NO GREEN ALLOWED: Every neon green pixel must be completely replaced by realistic hair or scalp shading. No green tint or halo may remain.
- The final output must be a seamless, high-resolution, photorealistic clinical simulation.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {
                    parts: [
                        { text: "Here is the input image showing the patient with a green mask overlay marking the target recipient zone where you must draw the new hair:" },
                        {
                            inlineData: {
                                data: inputImageBase64,
                                mimeType: inputMime
                            }
                        }
                    ]
                }
            ],
            config: {
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                temperature: 0.2,
                topP: 0.85
            }
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
            return NextResponse.json({ success: false, error: "AI failed to generate results" }, { status: 500 });
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
            return NextResponse.json({ 
                success: false, 
                error: "The AI generated an unnatural result. Please click Generate Simulation again for a better outcome." 
            }, { status: 400 });
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

        return NextResponse.json({
            success: true,
            resultImage: `data:${aiMime};base64,${finalImageBase64}`
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
