import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Box,
  Layers,
  Cpu,
  ArrowRight
} from 'lucide-react';

interface TechnologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterPlatform: () => void;
}

export const TechnologyModal: React.FC<TechnologyModalProps> = ({
  isOpen,
  onClose,
  onEnterPlatform,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#090D14] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] text-white"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/08 flex items-center justify-between bg-white/02 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5CC]/10 border border-[#00E5CC]/30 flex items-center justify-center text-[#00E5CC]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  DENT-X Core Architecture & Photogrammetry
                </h3>
                <span className="text-[10px] font-mono uppercase bg-[#00E5CC]/10 text-[#00E5CC] px-2 py-0.5 rounded border border-[#00E5CC]/30 font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-[#929BAA] mt-0.5">
                Sub-millimeter 3D reconstruction and clinical digital twin telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#929BAA]">
          {/* Key Pillar 1 */}
          <div className="p-4 bg-white/03 rounded-2xl border border-white/08 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-[#00E5CC]/10 border border-[#00E5CC]/20 flex items-center justify-center text-[#00E5CC] shrink-0 mt-0.5">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">
                Poisson Surface Reconstruction
              </div>
              <p className="leading-relaxed">
                Rather than generic voxel approximations, DENT-X solves an indicator Poisson equation across thousands of surface normal vectors, producing a continuous watertight manifold mesh that matches clinical dental anatomy with sub-millimeter precision.
              </p>
            </div>
          </div>

          {/* Key Pillar 2 */}
          <div className="p-4 bg-white/03 rounded-2xl border border-white/08 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-[#528BFF]/10 border border-[#528BFF]/20 flex items-center justify-center text-[#528BFF] shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">
                Gemini 3.8 Flash Vision Intelligence
              </div>
              <p className="leading-relaxed">
                The integrated multimodal neural pipeline analyzes photo lighting, angle, and blur in real time, isolating 32 individual tooth instances and providing instant clinical checks for wear facets, restorations, and impactions.
              </p>
            </div>
          </div>

          {/* Key Pillar 3 */}
          <div className="p-4 bg-white/03 rounded-2xl border border-white/08 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-[#9B82FF]/10 border border-[#9B82FF]/20 flex items-center justify-center text-[#9B82FF] shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">
                Longitudinal Vector Displacement Telemetry
              </div>
              <p className="leading-relaxed">
                By co-registering baseline impressions with follow-up aligner progress checks, DENT-X computes exact spatial displacement vectors (ΔX, ΔY, ΔZ) and crown tipping torque for each tooth.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/08 bg-white/02 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#929BAA] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#00E5CC]" />
            <span>Ready to experience real-time 3D reconstruction?</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/05 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEnterPlatform();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#00E5CC] to-[#49F5DF] text-black text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer hover:scale-105"
            >
              <span>Launch Live Workstation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
