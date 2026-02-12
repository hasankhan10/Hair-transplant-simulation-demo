import React, { useRef, useState, useEffect } from 'react';
import { HairLossCategory, HairType, Ethnicity, HairLossArea, GraftDensity, VisualizationParams } from '../types';
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
  setShowCamera
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  const densityLevels = [
    { label: 'Low', value: GraftDensity.LOW, metric: 'Conservative' },
    { label: 'Medium', value: GraftDensity.MEDIUM, metric: 'Standard' },
    { label: 'High', value: GraftDensity.HIGH, metric: 'Dense' }
  ];

  const currentDensityIndex = densityLevels.findIndex(d => d.value === params.density);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpload(event.target.result as string);
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

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
      setParams({ ...params, age: val });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Module 1: Image Input */}
      <div className="premium-card p-6 border-l-4 border-l-primary/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h3 className="text-sm font-extrabold text-secondary uppercase tracking-widest font-jakarta">01. Patient Data</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">Source Image Acquisition</span>
          </div>
          {hasImage && (
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl border border-slate-100"
              title="Clear Image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>

        {!hasImage ? (
          <button
            onClick={handleUploadClick}
            className="w-full group relative overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-14 px-6 transition-all hover:border-primary/50 hover:bg-white active:scale-[0.98]"
          >
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-100">
                <svg className="w-8 h-8 text-primary/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-base font-extrabold text-secondary font-jakarta">Add Patient Photo</span>
              <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-[0.2em]">Selfie or Scalp Photo</span>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm font-extrabold text-green-700 font-jakarta">Verified Clinical Photo</span>
              </div>
            </div>

            <button
              onClick={onStartMapping}
              className={`w-full flex items-center justify-center space-x-3 py-4 rounded-2xl text-sm font-extrabold transition-all border-2 relative overflow-hidden group ${params.mask
                ? 'bg-white text-secondary border-slate-200 hover:border-primary/50'
                : 'bg-secondary text-white border-secondary hover:bg-slate-800 shadow-lg'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="relative z-10">{params.mask ? 'Redraw Transplant Zone' : 'Map Transplant Area'}</span>
              {params.mask && <div className="absolute right-4 w-2 h-2 bg-primary rounded-full animate-ping"></div>}
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
        />
      </div>

      {/* Module 2: Specifications */}
      <div className="premium-card p-6 border-l-4 border-l-accent/30">
        <div className="flex flex-col mb-6">
          <h3 className="text-sm font-extrabold text-secondary uppercase tracking-widest font-jakarta">02. Surgical Spec</h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">Follicular Density Mapping</span>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex">
            {densityLevels.map((level, idx) => {
              const isSelected = currentDensityIndex === idx;
              return (
                <button
                  key={level.label}
                  onClick={() => setParams({ ...params, density: level.value })}
                  className={`flex-1 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 ${isSelected
                    ? 'bg-white text-primary shadow-sm border border-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-medical-50 rounded-2xl border border-white shadow-inner-soft">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter mb-1">
              <span className="text-slate-400">Selected Target</span>
              <span className="text-primary">{densityLevels[currentDensityIndex].metric} Recovery</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {params.density === GraftDensity.HIGH
                ? 'Maximum density for optimal scalp coverage and natural thickness.'
                : params.density === GraftDensity.MEDIUM
                  ? 'Standard clinical density for balanced restoration and growth.'
                  : 'Conservative placement focusing on hairline definition.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Pillar */}
      <div className="pt-2">
        <button
          onClick={onRun}
          disabled={!hasImage || isProcessing || !params.mask}
          className={`w-full group relative overflow-hidden py-6 rounded-3xl font-extrabold text-white transition-all transform active:scale-[0.97] flex flex-col items-center justify-center font-jakarta shadow-xl shadow-primary/20 ${!hasImage || isProcessing || !params.mask
            ? 'bg-slate-200 grayscale cursor-not-allowed text-slate-400 shadow-none'
            : 'bg-primary hover:bg-primary/90'
            }`}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm uppercase tracking-widest">Processing...</span>
            </div>
          ) : (
            <>
              <span className="text-base uppercase tracking-widest">Run Simulation</span>
              {!params.mask && hasImage && (
                <span className="text-[10px] font-bold opacity-60 mt-1 uppercase">Selection Required</span>
              )}
            </>
          )}

          {/* Shine effect on hover */}
          {!isProcessing && hasImage && params.mask && (
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
          )}
        </button>

        <div className="mt-6 p-4 rounded-2xl border border-dashed border-slate-200 flex items-start space-x-3">
          <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-normal uppercase italic tracking-tighter">
            * Medical AI is trained for ethnic & natural growth patterns. Draw the precise area to be restored.
          </p>
        </div>
      </div>

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
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default ControlPanel;
