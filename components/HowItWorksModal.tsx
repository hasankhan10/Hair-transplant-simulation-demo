
import React from 'react';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md cursor-pointer"
                onClick={onClose}
            ></div>

            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/20">
                {/* Header */}
                <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-secondary px-3 py-1.5 rounded-lg shadow-sm rotate-3">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Logo</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold font-jakarta text-secondary tracking-tight uppercase italic">How It Works</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Surgical Simulation Standards</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 text-slate-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-8 space-y-12 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    {/* Step 1 */}
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">1</div>
                        <div className="flex-1">
                            <h3 className="text-base font-extrabold text-secondary font-jakarta uppercase tracking-tight">Upload Your Photo</h3>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">
                                Choose a clear, high-resolution photo. For best results, use a <strong>front-facing</strong> or <strong>top-down scalp photo</strong> under good lighting.
                            </p>

                            {/* GIF - Step 1 */}
                            <div className="mt-6 w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner-soft">
                                <img
                                    src="/how-it-works/step1.gif"
                                    alt="Uploading photo demonstration"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Image Comparison - RESTORED FULL SECTION */}
                            <div className="mt-8 grid grid-cols-2 gap-6">
                                {/* Incorrect */}
                                <div className="space-y-3">
                                    <div className="bg-red-50 text-red-600 text-[9px] font-black px-3 py-1 rounded-lg border border-red-100 uppercase inline-flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        Incorrect
                                    </div>
                                    <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 grayscale opacity-40">
                                        <img src="/before crop.jpeg" alt="Incorrect photo" className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase text-center italic leading-tight">Too distant, includes body & torso</p>
                                </div>

                                {/* Correct */}
                                <div className="space-y-4">
                                    <div className="bg-green-50 text-green-600 text-[9px] font-black px-3 py-1 rounded-lg border border-green-100 uppercase inline-flex items-center gap-1">
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Correct
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm ring-2 ring-primary/5">
                                                <img src="/after crop.jpeg" alt="Correct headshot" className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase text-center italic">Front-facing face & scalp</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm ring-2 ring-primary/5">
                                                <img src="/top view.jpeg" alt="Correct top view" className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase text-center italic">Top-down scalp focus</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">2</div>
                        <div className="flex-1">
                            <h3 className="text-base font-extrabold text-secondary font-jakarta uppercase tracking-tight">Draw Your Desired Hairline</h3>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">
                                Use the <strong>Surgical Brush</strong> to mark the areas where you want to see hair growth. Our Smart Lasso will automatically fill in the enclosed areas for you.
                            </p>

                            {/* GIF - Step 2 */}
                            <div className="mt-4 w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner-soft">
                                <img
                                    src="/how-it-works/step2.gif"
                                    alt="Drawing hairline demonstration"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                <span className="text-[9px] text-primary font-black uppercase tracking-widest leading-none">Pro-Tip</span>
                                <p className="text-[11px] text-primary/80 font-bold mt-1 uppercase italic leading-tight">Cover the bald area completely for the most realistic look.</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">3</div>
                        <div className="flex-1">
                            <h3 className="text-base font-extrabold text-secondary font-jakarta uppercase tracking-tight">Choose Graft Density</h3>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">
                                Select between <strong>Low, Medium, or High</strong> density. This determines the thickness and volume of the simulated hair follicles.
                            </p>

                            {/* GIF - Step 3 */}
                            <div className="mt-4 w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner-soft">
                                <img
                                    src="/how-it-works/step3.gif"
                                    alt="Choosing density demonstration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl shadow-primary/20 animate-pulse">4</div>
                        <div className="flex-1">
                            <h3 className="text-base font-extrabold text-secondary font-jakarta uppercase tracking-tight">Generate AI Reconstruction</h3>
                            <p className="text-slate-500 mt-2 text-sm leading-relaxed font-medium">
                                Click <strong>'Generate Preview'</strong>. Our medical-grade AI will analyze your features and provide a realistic hair transplant visualization in seconds.
                            </p>

                            {/* GIF - Step 4 */}
                            <div className="mt-4 w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner-soft">
                                <img
                                    src="/how-it-works/step4.gif"
                                    alt="AI generation demonstration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Critical Rules Section */}
                    <div className="bg-medical-50 p-6 rounded-3xl border border-slate-200 mt-4 relative overflow-hidden">
                        <h4 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                            Rules for Best Results
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                                <div className="text-xs">
                                    <span className="font-extrabold text-secondary uppercase tracking-tight">No Hats or Headwear: </span>
                                    <span className="text-slate-500 font-medium">Ensure the scalp is completely visible for anatomical verification.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                                <div className="text-xs">
                                    <span className="font-extrabold text-secondary uppercase tracking-tight">Good Contrast: </span>
                                    <span className="text-slate-500 font-medium">Avoid photos where the head blends into the background.</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                                <div className="text-xs">
                                    <span className="font-extrabold text-secondary uppercase tracking-tight">Natural Light: </span>
                                    <span className="text-slate-500 font-medium">Outdoor or bright indoor light produces the most realistic hair textures.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex flex-col items-center">
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-secondary text-white font-black rounded-2xl hover:bg-slate-800 transition shadow-2xl uppercase text-[11px] tracking-[0.25em] font-jakarta animate-shimmer relative overflow-hidden"
                    >
                        Got It, Let's Start
                    </button>
                    <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Version 2.5.0 Clinical Suite</p>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksModal;
