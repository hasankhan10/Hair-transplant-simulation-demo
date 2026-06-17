"use client";

import React, { useState, useEffect } from 'react';
import {
  GraftDensity,
  VisualizationParams,
  VisualizationResult
} from '../types';
import ControlPanel from '../components/ControlPanel';
import ImageDisplay from '../components/ImageDisplay';
import Header from '../components/Header';
import HowItWorksModal from '../components/HowItWorksModal';
import { autoCropToHead } from '../services/imageProcessor';
import { generateHairVisualization, validateScalpImage } from '../services/geminiService';

export default function Home() {
  const [patientImage, setPatientImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  const [result, setResult] = useState<VisualizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Wizard flow step indicator (1: Upload, 2: Draw, 3: Density, 4: Generate)
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic white-label branding state
  const [branding, setBranding] = useState({
    name: 'Your Brand',
    tagline: 'AI Simulation Suite',
    primaryColor: '#FF6B35',
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [params, setParams] = useState<VisualizationParams>({
    density: GraftDensity.MEDIUM
  });

  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  // Predefined premium color palette options for client demos
  const colorSwatches = [
    { label: 'Clinical Orange (Default)', value: '#FF6B35' },
    { label: 'Royal Blue', value: '#1E40AF' },
    { label: 'Teal Green', value: '#0F766E' },
    { label: 'Charcoal Slate', value: '#334155' },
    { label: 'Indigo Purple', value: '#4F46E5' }
  ];

  // Proactive Camera Permission Request (Pre-warmer)
  useEffect(() => {
    const prewarmCamera = async () => {
      if (typeof window === 'undefined') return;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        try {
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
        processedImage = await autoCropToHead(imageData);

        setProcessingStatus('Verifying Scalp/Head Accuracy...');
        setProcessingProgress(50);

        const validation = await validateScalpImage(processedImage);

        if (!validation.success) {
          setError(validation.error || "Please upload a clear photo of your scalp/head for simulation.");
          setPatientImage(null);
          setCurrentStep(1);
          return;
        }
      }

      setPatientImage(processedImage);
      setResult(null);
      setError(null);
      setParams(prev => ({ ...prev, mask: undefined }));
      setCurrentStep(2); // Move to Step 2: Draw Bald Area
    } catch (err: any) {
      console.error("Upload/Validation failed:", err);
      setError(err.message || "An error occurred during medical validation.");
      setPatientImage(null);
      setCurrentStep(1);
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
    setCurrentStep(3); // Auto-advance to Step 3: Choose Density
  };

  const handleRunSimulation = async () => {
    if (!patientImage) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress(0);
    setProcessingStatus('Analyzing Scalp & Hair Pattern...');

    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 95) return prev;

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
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const reset = () => {
    setPatientImage(null);
    setResult(null);
    setError(null);
    setParams(prev => ({ ...prev, mask: undefined }));
    setCurrentStep(1);
  };

  return (
    <div
      style={{ '--primary-color': branding.primaryColor } as React.CSSProperties}
      className="min-h-screen flex flex-col bg-slate-50 transition-colors"
    >
      {!showCamera && (
        <Header
          onShowHowItWorks={() => setShowHowItWorks(true)}
          brandName={branding.name}
          brandTagline={branding.tagline}
        />
      )}

      <main className="flex-grow container mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Step Stepper Panel */}
          <div className="lg:col-span-4 space-y-6">
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
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          </div>

          {/* Right Column: Interactive Visualization Output */}
          <div className="lg:col-span-8">
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
              brandName={branding.name}
              brandTagline={branding.tagline}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-semibold">
            &copy; {new Date().getFullYear()} {branding.name} - {branding.tagline}.
          </p>
          <p className="text-slate-400 text-xs mt-2 italic">
            "AI-generated preview. Results may vary." Powered by <span className="text-primary font-bold">{branding.name} Suite</span>
          </p>
        </div>
      </footer>

      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />

      {/* Floating Settings Gear Trigger Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-800 transition active:scale-90 border border-white/10"
        title="Open Branding Widget"
      >
        <svg className="w-6 h-6 animate-[spin_8s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Dynamic Settings Sidebar Panel */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={() => setIsSettingsOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300 z-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-secondary font-poppins uppercase tracking-tight">White-Label Settings</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Demo customization deck</p>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Brand Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase">Brand Name</label>
                <input
                  type="text"
                  value={branding.name}
                  onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                  placeholder="Enter clinic or brand name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold"
                />
              </div>

              {/* Tagline Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase">Tagline</label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  placeholder="Enter suite subtitle"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold"
                />
              </div>

              {/* Color Picker Swatches */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 uppercase">Primary Theme Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch.value}
                      onClick={() => setBranding({ ...branding, primaryColor: swatch.value })}
                      style={{ backgroundColor: swatch.value }}
                      className={`h-10 rounded-xl transition-transform border border-black/5 hover:scale-105 active:scale-95 ${branding.primaryColor === swatch.value ? 'ring-4 ring-offset-2 ring-slate-900 scale-105' : ''}`}
                      title={swatch.label}
                    />
                  ))}
                </div>
                
                {/* Custom Color Selector */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Custom Color Picker</span>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex-shrink-0">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                      />
                    </div>
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={branding.primaryColor.toUpperCase()}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-full px-3 py-2 text-xs uppercase font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg uppercase tracking-wider font-poppins"
              >
                Apply Customizations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
