"use client";

import React, { useRef, useState, useEffect } from 'react';
import { GraftDensity, VisualizationParams } from '../types';
import SmartCamera from './SmartCamera';

interface ControlPanelProps {
  params: VisualizationParams;
  setParams: React.Dispatch<React.SetStateAction<VisualizationParams>>;
  onUpload: (imageData: string, isVerified?: boolean) => void;
  onRun: () => void;
  onReset: () => void;
  onStartMapping: () => void;
  isProcessing: boolean;
  hasImage: boolean;
  showCamera: boolean;
  setShowCamera: (show: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
  onUpload,
  onRun,
  onReset,
  onStartMapping,
  isProcessing,
  hasImage,
  showCamera,
  setShowCamera,
  currentStep,
  setCurrentStep
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      }
    };
    checkMobile();
  }, []);

  const densityLevels = [
    { label: 'Low', value: GraftDensity.LOW, metric: 'Conservative (30-35 grafts/cm²)' },
    { label: 'Medium', value: GraftDensity.MEDIUM, metric: 'Standard (45-50 grafts/cm²)' },
    { label: 'High', value: GraftDensity.HIGH, metric: 'Dense (60+ grafts/cm²)' }
  ];

  const currentDensityIndex = densityLevels.findIndex(d => d.value === params.density);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpload(event.target.result as string);
          setCurrentStep(2); // Auto advance to step 2 after upload
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
    setShowUploadOptions(false);
  };

  const handleUploadClick = () => {
    if (isMobile) {
      setShowUploadOptions(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleDensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    setParams({ ...params, density: densityLevels[index].value });
  };

  const steps = [
    { number: 1, title: 'Upload Photo' },
    { number: 2, title: 'Draw Bald Area' },
    { number: 3, title: 'Choose Density' },
    { number: 4, title: 'Generate Look' }
  ];

  // Helper to allow jumping to previous completed steps
  const handleStepClick = (stepNumber: number) => {
    if (stepNumber === 1) {
      setCurrentStep(1);
    } else if (stepNumber === 2 && hasImage) {
      setCurrentStep(2);
    } else if (stepNumber === 3 && hasImage && params.mask) {
      setCurrentStep(3);
    } else if (stepNumber === 4 && hasImage && params.mask) {
      setCurrentStep(4);
    }
  };

  return (
    <div className="bg-white rounded-2xl clinical-shadow p-6 space-y-6 border border-slate-100 sticky top-24">
      {/* Wizard Progress Stepper */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulation Wizard</span>
          {hasImage && (
            <button
              onClick={() => {
                onReset();
                setCurrentStep(1);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-bold uppercase transition"
            >
              Restart
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s) => {
            const isCompleted = s.number < currentStep || (s.number === 1 && hasImage) || (s.number === 2 && params.mask);
            const isActive = s.number === currentStep;
            return (
              <button
                key={s.number}
                onClick={() => handleStepClick(s.number)}
                disabled={!isCompleted && !isActive}
                className="flex flex-col items-stretch text-left group"
              >
                <div className={`h-1.5 rounded-full transition-colors duration-300 ${isActive ? 'bg-primary' : isCompleted ? 'bg-primary/50' : 'bg-slate-100'}`} />
                <span className={`text-[9px] font-black uppercase tracking-tight mt-2 transition-colors duration-300 ${isActive ? 'text-primary' : isCompleted ? 'text-slate-600' : 'text-slate-300'}`}>
                  Step {s.number}
                </span>
                <span className={`text-[10px] font-bold truncate transition-colors duration-300 ${isActive ? 'text-secondary' : isCompleted ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="min-h-[200px] flex flex-col justify-center">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-secondary font-poppins">Upload Patient Photo</h3>
              <p className="text-xs text-slate-400 mt-1">Provide a high-quality selfie or scalp image under clean lighting.</p>
            </div>
            
            <button
              onClick={handleUploadClick}
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl py-12 px-4 transition hover:border-primary hover:bg-primary/5 group"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition border border-slate-100">
                <svg className="w-7 h-7 text-slate-400 group-hover:text-primary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition font-poppins">Capture / Choose Photo</span>
              <span className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider font-semibold">Selfie or Top-down Angle</span>
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-secondary font-poppins">Mark Recipient Area</h3>
              <p className="text-xs text-slate-400 mt-1">Specify where the new hair grafts will be surgically placed.</p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={onStartMapping}
                className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl text-sm font-bold transition shadow-sm border-2 ${params.mask ? 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>{params.mask ? 'Modify Hairline Selection' : 'Draw Hairline Mask'}</span>
              </button>

              {params.mask && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Continue to Density</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-secondary font-poppins">Select Graft Density</h3>
              <p className="text-xs text-slate-400 mt-1">Adjust desired coverage density parameters for the transplant.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Coverage Preference</span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  {densityLevels[currentDensityIndex].label}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600 mb-4">{densityLevels[currentDensityIndex].metric}</p>

              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={currentDensityIndex}
                onChange={handleDensityChange}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            <button
              onClick={() => setCurrentStep(4)}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2"
            >
              <span>Continue to Simulation</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-secondary font-poppins">Generate Look</h3>
              <p className="text-xs text-slate-400 mt-1">Run our clinical generative AI models to visualize transplantation.</p>
            </div>

            <button
              onClick={onRun}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center justify-center bg-primary hover:bg-primary/95 text-base font-poppins"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>Generate Simulation</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {currentStep > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isProcessing}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase flex items-center space-x-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-300 uppercase">Step {currentStep} of 4</span>
        </div>
      )}

      {/* Input element hidden */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileChange}
      />

      {/* Action Choice Modal (Mobile) */}
      {showUploadOptions && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowUploadOptions(false)}>
          <div className="w-full max-w-sm bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <h4 className="text-lg font-bold text-secondary mb-4 font-poppins text-center">Select Photo Method</h4>

            <div className="space-y-3">
              <button
                onClick={() => { setShowCamera(true); setShowUploadOptions(false); }}
                className="w-full flex items-center p-4 bg-primary/5 rounded-2xl border border-primary/20 hover:bg-primary/10 transition group"
              >
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mr-4 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-secondary font-poppins">Use Camera</span>
                  <span className="text-xs text-slate-500">Capture photo directly</span>
                </div>
              </button>

              <button
                onClick={() => { fileInputRef.current?.click(); }}
                className="w-full flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mr-4 text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-secondary font-poppins">Upload from Gallery</span>
                  <span className="text-xs text-slate-500">Choose existing photo</span>
                </div>
              </button>

              <button
                onClick={() => setShowUploadOptions(false)}
                className="w-full py-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <SmartCamera
          onCapture={(data) => {
            onUpload(data, true);
            setCurrentStep(2); // Auto advance to step 2 after capture
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default ControlPanel;
