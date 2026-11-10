import React from 'react';
import { motion } from 'motion/react';
import {
  Scan,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CoreTechnologySectionProps {
  onEnterPlatform: () => void;
}

export const CoreTechnologySection: React.FC<CoreTechnologySectionProps> = ({
  onEnterPlatform,
}) => {
  const cards = [
    {
      number: '01',
      title: '3D Reconstruction',
      subtitle: 'Transform multi-view dental imagery into detailed 3D representations.',
      description:
        'Advanced photogrammetry solves Poisson surface equations across multi-angle intraoral photographs, generating watertight 3D polygon meshes with sub-millimeter cusp peaks and true anatomical cingula.',
      icon: Scan,
      metrics: 'Fidelity <0.08mm',
      tag: 'POISSON SYNTHESIS',
    },
    {
      number: '02',
      title: 'AI Tooth Segmentation',
      subtitle: 'Identify and distinguish individual teeth with intelligent segmentation.',
      description:
        'Multi-stage neural vision engines segment all 32 adult dentition instances in parallel, computing crown-to-root axis vectors, buccolingual inclination, and developmental fissure geography.',
      icon: Cpu,
      metrics: '32 Tooth Instances',
      tag: 'NEURAL CLUSTERING',
    },
    {
      number: '03',
      title: 'Odontogram Intelligence',
      subtitle: 'Connect visual dental structures with organized clinical information.',
      description:
        'Bidirectional synchronization between interactive 3D teeth and universal clinical charts. Click any cusp or root landmark to view restorations, periodontal pocket depths, and historical treatments.',
      icon: Layers,
      metrics: 'FDI · Universal · Palmer',
      tag: 'CLINICAL ONTOLOGY',
    },
    {
      number: '04',
      title: 'Occlusal Analysis',
      subtitle: 'Explore dental structures and evaluate occlusal relationships.',
      description:
        'Evaluate static and dynamic interarch contacts, computing exact overjet, overbite, Curve of Spee, and Curve of Wilson. Quantify clearance distances down to fifty microns before aligner fabrication.',
      icon: Activity,
      metrics: 'Class I / II / III Metrics',
      tag: 'OCCLUSAL KINEMATICS',
    },
  ];

  return (
    <section id="technology" className="py-28 px-6 lg:px-12 bg-[#020713] text-white relative overflow-hidden border-t border-white/06 select-none">
      {/* Background Volumetric Chamber Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-[#00E5CC]/06 via-[#4FA3FF]/05 to-[#C084FC]/06 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5CC]/10 border border-[#00E5CC]/30 mb-5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00E5CC]" />
            <span className="text-[10px] font-mono tracking-widest text-[#00E5CC] font-semibold uppercase">
              FOUNDATIONAL INTELLIGENCE
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.08] mb-4"
          >
            Precision Engineered.
            <br />
            <span className="italic bg-gradient-to-r from-[#00E5CC] via-[#4FA3FF] to-[#C084FC] bg-clip-text text-transparent">
              Intelligence Driven.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal"
          >
            Four technological pillars transforming raw photogrammetry into actionable clinical truth.
          </motion.p>
        </div>

        {/* Four Sophisticated Cards in 2x2 or 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                onClick={onEnterPlatform}
                className="group relative rounded-3xl p-7 bg-[#060D1A]/70 hover:bg-[#0A1424]/90 border border-white/08 hover:border-[#00E5CC]/40 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-[0_0_35px_rgba(0,229,204,0.15)] cursor-pointer"
              >
                <div>
                  {/* Card Top: Number Index & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-[#00E5CC] bg-[#00E5CC]/10 px-2.5 py-1 rounded-md border border-[#00E5CC]/30">
                      {card.number}
                    </span>
                    <div className="w-11 h-11 rounded-2xl bg-white/05 border border-white/10 flex items-center justify-center text-[#00E5CC] group-hover:scale-110 group-hover:bg-[#00E5CC]/10 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card Title & Subtitle */}
                  <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1">
                    {card.tag}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-2.5 group-hover:text-[#00E5CC] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-200 mb-3 leading-snug">
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                {/* Card Bottom: Metric & Arrow */}
                <div className="mt-8 pt-4 border-t border-white/08 flex items-center justify-between text-xs">
                  <span className="font-mono text-[#00E5CC] font-semibold">
                    {card.metrics}
                  </span>
                  <div className="flex items-center gap-1 text-slate-300 group-hover:text-[#00E5CC] transition-colors">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
