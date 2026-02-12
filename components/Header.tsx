
import React from 'react';

interface HeaderProps {
  onShowHowItWorks: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowHowItWorks }) => {
  return (
    <header className="sticky top-0 z-50 py-4 px-6">
      <div className="max-w-7xl mx-auto glass-effect rounded-3xl px-6 py-4 flex items-center justify-between shadow-premium border border-white/50">
        <div className="flex items-center space-x-4">
          <div className="bg-secondary px-3 py-1.5 rounded-xl shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
            <span className="text-xs font-black text-white uppercase tracking-widest">Logo</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-secondary tracking-tight font-jakarta leading-none">
              Your <span className="text-primary italic">Brand Name</span>
            </h1>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">
              Simulation Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onShowHowItWorks}
            className="flex items-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-2xl transition-all active:scale-95 group"
          >
            <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-xs uppercase tracking-wider">How It Works</span>
          </button>

          <div className="hidden sm:flex items-center px-4 py-2 bg-green-50 text-green-700 font-bold border border-green-100 rounded-2xl">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            <span className="text-[10px] uppercase tracking-widest">AI Core Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
