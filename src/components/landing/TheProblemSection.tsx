import React from 'react';
import { motion } from 'motion/react';

export const TheProblemSection: React.FC = () => {
  return (
    <section
      id="the-problem"
      className="relative py-28 sm:py-36 px-6 lg:px-12 bg-[#020610] text-white border-t border-white/[0.06] overflow-hidden select-none"
    >
      <div className="max-w-4xl mx-auto text-left">
        {/* Curiosity Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC]" />
          <span className="text-[11px] font-mono tracking-widest text-[#00E5CC] uppercase">
            02 · The Diagnostic Paradox
          </span>
        </motion.div>

        {/* The Problem in One Bold Line */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.12] text-white mb-8 tracking-tight"
        >
          Dentistry operates in three dimensions.{' '}
          <span className="italic text-[#00E5CC]">
            Why is diagnosis still performed on flat, shadowed slices?
          </span>
        </motion.h2>

        {/* Supporting Line in Inter */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl font-normal"
        >
          Hidden interproximal decay, subgingival root fractures, and micro-occlusal interferences remain masked on traditional 2D bitewings until irreversible tissue damage occurs.
        </motion.p>
      </div>
    </section>
  );
};
