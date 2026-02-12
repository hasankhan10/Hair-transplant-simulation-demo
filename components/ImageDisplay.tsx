
import React, { useState } from 'react';
import { VisualizationResult } from '../types';
import SurgicalCanvas from './SurgicalCanvas';

interface ImageDisplayProps {
  beforeImage: string | null;
  result: VisualizationResult | null;
  isProcessing: boolean;
  error: string | null;
  isMapping: boolean;
  setIsMapping: (val: boolean) => void;
  onSaveMask: (mask: string) => void;
  currentMask: string | null;
  progress: number;
  status: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  beforeImage,
  result,
  isProcessing,
  error,
  isMapping,
  setIsMapping,
  onSaveMask,
  currentMask,
  progress,
  status
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'result' | 'original'>('comparison');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!beforeImage || !result) return;
    setIsDownloading(true);

    try {
      const loadImg = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const [imgBefore, imgAfter] = await Promise.all([
        loadImg(beforeImage),
        loadImg(result.afterImage)
      ]);

      const targetHeight = 800;
      const ratioBefore = imgBefore.width / imgBefore.height;
      const ratioAfter = imgAfter.width / imgAfter.height;
      const widthBefore = targetHeight * ratioBefore;
      const widthAfter = targetHeight * ratioAfter;

      const canvas = document.createElement('canvas');
      canvas.width = widthBefore + widthAfter;
      canvas.height = targetHeight + 100;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(imgBefore, 0, 0, widthBefore, targetHeight);
      ctx.drawImage(imgAfter, widthBefore, 0, widthAfter, targetHeight);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 30px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BEFORE', widthBefore / 2, targetHeight + 50);
      ctx.fillText('AFTER', widthBefore + (widthAfter / 2), targetHeight + 60);

      const padding = 20;
      const logoH = 35;
      const logoW = 0; // Logo image removed, using text-based brand info only
      const brandBoxW = 240;
      const brandBoxH = 50;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.roundRect(canvas.width - brandBoxW - padding, targetHeight - brandBoxH - padding, brandBoxW, brandBoxH, 12);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
      ctx.fillText("Your Brand Name", canvas.width - brandBoxW - padding + 15, targetHeight - brandBoxH - padding + 22);
      ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText("Hair Simulation Suite", canvas.width - brandBoxW - padding + 15, targetHeight - brandBoxH - padding + 38);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `simulation-analysis-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!beforeImage && !isProcessing && !result) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-12 text-center relative bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        {error && (
          <div className="absolute top-8 left-8 right-8 z-20 bg-white border-l-4 border-l-red-500 shadow-premium p-4 rounded-xl flex items-center animate-in slide-in-from-top-4 duration-500">
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            </div>
            <span className="text-sm font-extrabold text-slate-700 font-jakarta uppercase tracking-tight">{error}</span>
          </div>
        )}
        <div className="w-24 h-24 bg-white rounded-[40px] shadow-premium flex items-center justify-center mb-8 border border-slate-100 rotate-6 group-hover:rotate-0 transition-transform">
          <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-secondary mb-3 font-jakarta uppercase tracking-tight">Visionary Simulation</h2>
        <p className="text-slate-400 max-w-sm font-medium text-sm leading-relaxed uppercase tracking-widest text-[10px]">
          Begin by uploading a clear scalp or frontal photo to initialize the AI engine.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden relative rounded-3xl">
      {isMapping && beforeImage && (
        <SurgicalCanvas
          image={beforeImage}
          onSave={(mask) => {
            onSaveMask(mask);
            setIsMapping(false);
          }}
          onCancel={() => setIsMapping(false)}
        />
      )}

      {/* Modern Tabs */}
      <div className="p-4 bg-white flex justify-center border-b border-slate-100">
        <div className="inline-flex p-1.5 bg-slate-100/80 rounded-[20px] shadow-inner-soft">
          {[
            { id: 'comparison', label: 'Analysis', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
            { id: 'result', label: 'Simulation', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', disabled: !result },
            { id: 'original', label: 'Source', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={tab.disabled}
              className={`px-6 py-2.5 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest transition-all ${activeTab === tab.id
                ? 'bg-white text-secondary shadow-sm ring-1 ring-slate-200'
                : 'text-slate-400 hover:text-slate-600'
                } ${tab.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tab.icon} /></svg>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow p-8 relative bg-[#FDFEFE] overflow-y-auto">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-white border-l-4 border-l-red-500 shadow-premium p-4 rounded-xl flex items-center animate-in slide-in-from-top-4 duration-500">
            <svg className="w-4 h-4 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-tight">{error}</span>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-x-8 inset-y-8 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 transition-all duration-500 rounded-3xl shadow-2xl border border-slate-100">
            <div className="w-full max-w-md">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping mr-2"></div>
                  <span className="text-[10px] text-primary font-extrabold uppercase tracking-[0.3em]">Quantum Simulation</span>
                </div>
                <h3 className="text-3xl font-black text-secondary tracking-tighter uppercase font-jakarta">{status}</h3>
              </div>

              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Processing Core</span>
                  <span className="text-2xl font-black tabular-nums text-secondary font-jakarta">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className={`h-1 rounded-full transition-all duration-700 ${progress >= (idx * 25) ? 'bg-primary' : 'bg-slate-100'}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="w-full h-full flex flex-col">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
              {/* Before View */}
              <div className="flex-1 w-full space-y-4 animate-in slide-in-from-left-4 duration-700">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em]">Phase A: Pre-Op</span>
                  <div className="px-3 py-1 bg-slate-800 text-white text-[9px] font-black uppercase rounded-lg">Source</div>
                </div>
                <div className="relative premium-card overflow-hidden bg-slate-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  {beforeImage && (
                    <img src={beforeImage} alt="Original" className="max-h-[550px] w-full block object-contain mix-blend-multiply" />
                  )}
                  {currentMask && !result && beforeImage && (
                    <img src={currentMask} alt="Mask" className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60 mix-blend-screen" />
                  )}
                </div>
              </div>

              {/* Simulation View */}
              <div className="flex-1 w-full space-y-4 animate-in slide-in-from-right-4 duration-700">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em]">Phase B: Projected</span>
                  <div className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase rounded-lg shadow-lg shadow-primary/20">Target</div>
                </div>
                <div className="relative premium-card overflow-hidden bg-slate-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  {result ? (
                    <img src={result.afterImage} alt="Result" className="max-h-[550px] w-full block object-contain mix-blend-multiply" />
                  ) : (
                    <div className="h-[550px] w-full flex items-center justify-center">
                      <div className="text-center space-y-4 opacity-30">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest">Awaiting Engine Run</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {result && (
              <div className="mt-12 flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Modern CTA */}
                <div className="w-full max-w-2xl bg-secondary p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-1000"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <h4 className="text-2xl font-black text-white tracking-tight mb-2 font-jakarta uppercase italic">Achieve This Look</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Professional Surgical Consultation</p>
                    </div>
                    <button
                      onClick={() => window.open(`https://wa.me/919147714312?text=${encodeURIComponent("I've seen my hair simulation result and want to discuss the surgical path.")}`, '_blank')}
                      className="w-full md:w-auto px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:bg-white hover:text-secondary transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      <span>Connect Privately</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center space-x-3 px-8 py-4 bg-white text-secondary font-extrabold rounded-2xl shadow-premium border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 uppercase text-[10px] tracking-widest"
                  >
                    {isDownloading ? (
                      <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    )}
                    <span>{isDownloading ? 'Generative Export...' : 'Export High-Res Analysis'}</span>
                  </button>
                </div>

                <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Precision: High Quality Modeling Enabled</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'result' && result && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-10 p-4 animate-in zoom-in-95 duration-700">
            <div className="relative max-w-3xl w-full premium-card overflow-hidden ring-4 ring-primary/5">
              <div className="absolute top-6 left-6 flex space-x-2 z-10">
                <span className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-xl">AI Prediction</span>
                <span className="bg-secondary/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest">Post-Restoration</span>
              </div>
              <img src={result.afterImage} alt="Full Result" className="w-full h-auto block object-contain aspect-auto" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-secondary/40 via-secondary/10 to-transparent p-10">
                <p className="text-white text-xs font-bold uppercase tracking-[0.2em] italic opacity-80 select-none">Visionary Digital Prototype</p>
              </div>
            </div>

            <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-6 p-1 bg-slate-100 rounded-[28px]">
              <div className="px-8 py-4">
                <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Download Full Scale</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">High-Fidelity Clinical JPG</p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full md:w-auto px-10 py-5 bg-white text-secondary font-black rounded-[24px] shadow-sm hover:bg-slate-50 transition-all uppercase text-[10px] tracking-[0.15em] border border-slate-200"
              >
                Download Analysis
              </button>
            </div>
          </div>
        )}

        {activeTab === 'original' && (
          <div className="w-full h-full flex items-center justify-center p-4 animate-in zoom-in-95 duration-700">
            <div className="relative premium-card overflow-hidden max-w-3xl w-full border-4 border-slate-50">
              <span className="absolute top-6 left-6 bg-secondary/90 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest z-10 backdrop-blur-md border border-white/10">Clinical Capture</span>
              <div className="relative bg-slate-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
                {beforeImage && (
                  <>
                    <img src={beforeImage} alt="Original" className="max-h-[700px] w-full block object-contain mix-blend-multiply" />
                    {currentMask && !result && (
                      <img src={currentMask} alt="Mask" className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen" />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-8 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(255,107,53,0.6)]"></div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] font-jakarta">Medical Standard Simulation Active</span>
        </div>

        <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center"><svg className="w-3.5 h-3.5 mr-1.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>End-to-End Encrypted</div>
          <div className="flex items-center"><svg className="w-3.5 h-3.5 mr-1.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Secure Bio-Analysis</div>
        </div>
      </div>
    </div>
  );
};

export default ImageDisplay;
