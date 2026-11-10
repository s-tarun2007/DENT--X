import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface MinimalFinalCtaProps {
  onEnterPlatform: () => void;
  onScrollTo: (id: string) => void;
}

export const MinimalFinalCta: React.FC<MinimalFinalCtaProps> = ({
  onEnterPlatform,
  onScrollTo,
}) => {
  return (
    <footer className="relative bg-[#020610] text-white border-t border-white/[0.06] select-none overflow-hidden">
      {/* Final CTA Section */}
      <div className="py-28 sm:py-36 px-6 lg:px-12 max-w-4xl mx-auto text-center">
        {/* Curiosity Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC]" />
          <span className="text-[11px] font-mono tracking-widest text-[#00E5CC] uppercase">
            06 · Initiation
          </span>
        </motion.div>

        {/* Question Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          className="text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] text-white mb-6 tracking-tight"
        >
          Ready to see{' '}
          <span className="italic text-[#00E5CC]">beneath the enamel?</span>
        </motion.h2>

        {/* Exactly One Sentence */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-normal"
        >
          Explore interactive odontograms, segmented 3D arches, and automated diagnostic metrics without installing software.
        </motion.p>

        {/* Single Primary Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={onEnterPlatform}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#00E5CC] hover:bg-[#34fedf] text-black text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-[0_0_30px_rgba(0,229,204,0.35)] hover:scale-[1.02]"
          >
            <span>Launch Clinical Workstation</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </motion.div>
      </div>

      {/* Slim Classy Footer */}
      <div className="border-t border-white/[0.08] py-8 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold tracking-tight">DENT-X</span>
            <span className="text-slate-600">·</span>
            <span>3D Dental Digital Twin Platform</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#00E5CC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC] animate-pulse" />
            <span>Operational · Sub-Millimeter Precision</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onScrollTo('hero')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Back to Top ↑
            </button>
            <button
              onClick={onEnterPlatform}
              className="text-slate-400 hover:text-[#00E5CC] transition-colors cursor-pointer"
            >
              Open Workstation →
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
