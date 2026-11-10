import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MinimalNavbarProps {
  onEnterPlatform: () => void;
  onScrollTo: (id: string) => void;
}

export const MinimalNavbar: React.FC<MinimalNavbarProps> = ({
  onEnterPlatform,
  onScrollTo,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#020610]/85 backdrop-blur-md border-b border-white/[0.08] transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onScrollTo('hero')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-md border border-[#00E5CC]/40 bg-[#00E5CC]/10 flex items-center justify-center transition-colors group-hover:border-[#00E5CC]">
            <span className="text-[#00E5CC] text-xs font-mono font-bold">X</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white text-sm font-semibold tracking-tight">DENT-X</span>
            <span className="text-[10px] font-mono text-[#00E5CC] uppercase tracking-widest hidden sm:inline">
              3D Intelligence
            </span>
          </div>
        </button>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <button
            onClick={() => onScrollTo('the-problem')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            The Problem
          </button>
          <button
            onClick={() => onScrollTo('workflow')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Workflow
          </button>
          <button
            onClick={() => onScrollTo('arch-demo')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            3D Arch
          </button>
          <button
            onClick={() => onScrollTo('proof')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Proof
          </button>
        </nav>

        {/* Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={onEnterPlatform}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00E5CC] hover:bg-[#32fedf] text-black text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(0,229,204,0.3)] hover:scale-[1.02]"
          >
            <span>Open Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
