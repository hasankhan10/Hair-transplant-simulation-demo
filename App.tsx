
import React, { useState, useCallback } from 'react';
import {
  HairLossCategory,
  HairType,
  Ethnicity,
  HairLossArea,
  GraftDensity,
  VisualizationParams,
  VisualizationResult
} from './types';
import ControlPanel from './components/ControlPanel';
import ImageDisplay from './components/ImageDisplay';
import Header from './components/Header';
import HowItWorksModal from './components/HowItWorksModal';
import { autoCropToHead } from './services/imageProcessor';
import { generateHairVisualization, validateScalpImage } from './services/geminiService';

const App: React.FC = () => {
  const [patientImage, setPatientImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  const [result, setResult] = useState<VisualizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const [params, setParams] = useState<VisualizationParams>({
    density: GraftDensity.MEDIUM
  });

  // Proactive Camera Permission Request (Pre-warmer)
  React.useEffect(() => {
    const prewarmCamera = async () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        try {
          // Attempt to pre-request permission without keeping the stream open
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          console.log("Camera permission pre-granted");
        } catch (err) {
          console.warn("Camera pre-grant failed or denied:", err);
        }
      }
    };
    prewarmCamera();
  }, []);

  const handleImageUpload = async (imageData: string, isVerified: boolean = false) => {
    setIsProcessing(true);
    setError(null);
    setProcessingProgress(10);
    setProcessingStatus('Normalizing Photo...');

    try {
      let processedImage = imageData;

      if (!isVerified) {
        // Only normalize and validate if NOT already verified by Smart Camera
        processedImage = await autoCropToHead(imageData);

        setProcessingStatus('Verifying Scalp/Head Accuracy...');
        setProcessingProgress(50);

        const validation = await validateScalpImage(processedImage);

        if (!validation.success) {
          setError(validation.error || "Please upload a clear photo of your scalp/head for simulation.");
          setPatientImage(null);
          return;
        }
      }

      setPatientImage(processedImage);
      setResult(null);
      setError(null);
      setParams(prev => ({ ...prev, mask: undefined }));
    } catch (err: any) {
      console.error("Upload/Validation failed:", err);
      setError(err.message || "An error occurred during medical validation.");
      setPatientImage(null);
    } finally {
      setProcessingProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
        setProcessingStatus('');
      }, 500);
    }
  };

  const handleSaveMask = (mask: string) => {
    setParams(prev => ({
      ...prev,
      mask
    }));
  };

  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleRunSimulation = async () => {
    if (!patientImage) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStatus('Analyzing Scalp & Hair Pattern...');

    // Simulated progress updates for a more professional feel
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 95) return prev;

        // Update status based on progress
        if (prev > 75) setProcessingStatus('Finalizing Reconstruction...');
        else if (prev > 50) setProcessingStatus('Performing Follicular Placement...');
        else if (prev > 25) setProcessingStatus('Calculating Graft Density...');

        return prev + Math.random() * 5;
      });
    }, 400);

    try {
      const simulatedImage = await generateHairVisualization(patientImage, params);
      setProcessingProgress(100);
      setProcessingStatus('Simulation Complete');

      setResult({
        beforeImage: patientImage,
        afterImage: simulatedImage,
        timestamp: Date.now()
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate simulation. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setIsProcessing(false), 500); // Small delay to show 100%
    }
  };

  const reset = () => {
    setPatientImage(null);
    setResult(null);
    setError(null);
    setParams(prev => ({ ...prev, mask: undefined, areas: [] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] relative overflow-hidden">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <Header onShowHowItWorks={() => setShowHowItWorks(true)} />

      <main className="flex-grow container mx-auto px-6 py-6 lg:py-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Controls (Now looks like a floating sidebar) */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="sticky top-28">
              <ControlPanel
                params={params}
                setParams={setParams}
                onUpload={handleImageUpload}
                onRun={handleRunSimulation}
                isProcessing={isProcessing}
                hasImage={!!patientImage}
                onReset={reset}
                onStartMapping={() => setIsMapping(true)}
                showCamera={showCamera}
                setShowCamera={setShowCamera}
              />
            </div>
          </div>

          {/* Right Column: Visualization (Expanded) */}
          <div className="flex-grow">
            <div className="premium-card p-2 min-h-[600px] flex flex-col">
              <ImageDisplay
                beforeImage={patientImage}
                result={result}
                isProcessing={isProcessing}
                error={error}
                isMapping={isMapping}
                setIsMapping={setIsMapping}
                onSaveMask={handleSaveMask}
                currentMask={params.mask || null}
                progress={processingProgress}
                status={processingStatus}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-base">
            &copy; {new Date().getFullYear()} Your Brand Name Hair Transplant Simulation.
          </p>
          <p className="text-slate-400 text-sm mt-2 italic">
            "AI-generated preview. Results may vary." Developed by <span className="text-primary font-bold">Your Brand Name</span>
          </p>
        </div>
      </footer>

      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />
    </div >
  );
};

export default App;
