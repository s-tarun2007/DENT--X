import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

const STEPS = [
  {
    num: '01',
    label: 'Scan',
    question: 'How do you turn scattered light into data?',
    description:
      'Raw intraoral photogrammetry and CBCT slices are ingested directly in real time, capturing true geometry without discomfort or retakes.',
  },
  {
    num: '02',
    label: 'Twin',
    question: 'What happens when geometry becomes watertight?',
    description:
      'Volumetric neural reconstruction synthesizes an isolated 3D digital twin with micron-level root furcation and crown fidelity.',
  },
  {
    num: '03',
    label: 'Insight',
    question: 'Where do invisible micro-pathologies hide?',
    description:
      'Computer vision maps occlusal contact areas, measures crown-to-root ratios, and flags early proximal decay before clinical manifestation.',
  },
  {
    num: '04',
    label: 'Report',
    question: 'How do you share clinical truth in seconds?',
    description:
      'Generate patient-ready 3D interactive records and laboratory-grade STL/OBJ CAD exports with one chairside click.',
  },
];

export const FourStepWorkflow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      id="workflow"
      ref={containerRef}
      className="relative py-28 sm:py-36 px-6 lg:px-12 bg-[#020610] text-white border-t border-white/[0.06] select-none overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
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
            03 · The Reconstruction Engine
          </span>
        </motion.div>

        {/* Section Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] text-white mb-20 tracking-tight"
        >
          From photons to living geometry{' '}
          <span className="italic text-[#00E5CC]">in four continuous steps.</span>
        </motion.h2>

        {/* 4-Step Sequence with Pinned, Scroll-Scrubbed Progress Line */}
        <div className="relative pl-8 sm:pl-12">
          {/* Base Inactive Hairline */}
          <div className="absolute left-2 sm:left-4 top-2 bottom-2 w-[1px] bg-white/[0.1]" />

          {/* Scrubbed Illuminated Teal Line */}
          <motion.div
            style={{ scaleY }}
            className="absolute left-2 sm:left-4 top-2 bottom-2 w-[1px] bg-[#00E5CC] origin-top shadow-[0_0_12px_#00E5CC]"
          />

          <div className="space-y-16 sm:space-y-24">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative text-left group"
              >
                {/* Step Indicator Node */}
                <div className="absolute -left-8 sm:-left-12 top-1 w-5 h-5 -translate-x-[2px] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full border border-[#00E5CC] bg-[#020610] group-hover:scale-125 transition-transform" />
                </div>

                {/* Step Metadata & Content */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-[#00E5CC] tracking-widest uppercase">
                    Step {step.num} · {step.label}
                  </span>
                </div>

                <h3
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  className="text-2xl sm:text-3xl text-white font-normal mb-3 leading-snug"
                >
                  {step.question}
                </h3>

                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
