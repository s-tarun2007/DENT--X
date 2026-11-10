import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface IntroductionSectionProps {
  onEnterPlatform: () => void;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  onEnterPlatform,
}) => {
  const [activeMode, setActiveMode] = useState<'3d' | '2d'>('3d');

  return (
    <section className="py-28 px-6 lg:px-12 bg-[#030816] text-white relative overflow-hidden border-t border-white/06 select-none">
      {/* Background Volumetric Chamber Illumination */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5CC]/05 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#4FA3FF]/05 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-20 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5CC]/10 border border-[#00E5CC]/30 mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00E5CC]" />
            <span className="text-[10px] font-mono tracking-widest text-[#00E5CC] font-semibold uppercase">
              THE DIAGNOSTIC EVOLUTION
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.08] mb-4"
          >
            Beyond Traditional
            <br />
            <span className="italic bg-gradient-to-r from-[#00E5CC] via-[#4FA3FF] to-[#C084FC] bg-clip-text text-transparent">
              Dental Diagnostics.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal"
          >
            One intelligent workspace. Every dimension of modern dental care.
          </motion.p>
        </div>

        {/* 2-Column Problem vs Solution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Problem Narrative & Clinical Realities */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 rounded-3xl p-8 sm:p-10 bg-[#060D1A]/80 border border-white/08 flex flex-col justify-between shadow-2xl relative"
          >
            <div>
              <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span>The Diagnostic Divide</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                Fragmented workflows compromise clinical precision.
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                Traditional practices navigate a disjointed patchwork of flat 2D bitewings,
                proprietary DICOM viewers, uncalibrated photography, and paper charts.
                Critical occlusal contacts and sub-millimeter torque discrepancies remain hidden in projection artifacts.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    ×
                  </div>
                  <span>2D radiographs compress volumetric arch anatomy into flat, distorted shadows.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    ×
                  </div>
                  <span>Disconnected chart notes fail to communicate spatial displacement over time.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    ×
                  </div>
                  <span>Patient acceptance suffers when clinicians struggle to explain invisible defects.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/08 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Obsolescence Risk</span>
              <span className="text-rose-400 font-semibold">Fragmented Diagnostics</span>
            </div>
          </motion.div>

          {/* Right Column: DENT-X Unified 3D Digital Twin Solution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-6 rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#0A1424] to-[#0E1A30] border border-[#00E5CC]/30 flex flex-col justify-between shadow-[0_0_50px_rgba(0,229,204,0.08)] relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-[#00E5CC] font-semibold">
                  <Layers className="w-4 h-4" />
                  <span>The DENT-X Standard</span>
                </div>

                {/* Interactive Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-white/05 rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setActiveMode('3d')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer font-medium ${
                      activeMode === '3d'
                        ? 'bg-[#00E5CC] text-black font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    3D Digital Twin
                  </button>
                  <button
                    onClick={() => setActiveMode('2d')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer font-medium ${
                      activeMode === '2d'
                        ? 'bg-white/20 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2D Legacy
                  </button>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                Unified 3D workspace. Computational diagnostic truth.
              </h3>

              <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                DENT-X reconstructs continuous Poisson surfaces from intraoral photography,
                pairing automated FDI tooth isolation with longitudinal displacement vectors (ΔX, ΔY, ΔZ)
                for every patient.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-[#00E5CC] shrink-0 mt-0.5" />
                  <span>Sub-millimeter volumetric precision (&lt;0.08mm deviation) across full dentition.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-[#00E5CC] shrink-0 mt-0.5" />
                  <span>Interactive calipers calculate Bolton ratios, arch perimeters, and overjet in real time.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-[#00E5CC] shrink-0 mt-0.5" />
                  <span>Direct CAD/CAM exports (.OBJ / .STL) formatted for chairside milling and aligner fabrication.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/08 flex items-center justify-between">
              <span className="text-xs font-mono text-[#00E5CC] font-bold">
                {activeMode === '3d' ? 'Watertight Poisson Manifold' : '2D Panoramic Distortion'}
              </span>

              <button
                onClick={onEnterPlatform}
                className="flex items-center gap-1.5 text-xs font-bold text-[#00E5CC] hover:text-[#49F5DF] transition-colors cursor-pointer group"
              >
                <span>Experience Unified 3D</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
