import React from 'react';
import { motion } from 'motion/react';
import {
  Scan,
  Cpu,
  Layers,
  Ruler,
  GitCompare,
  Download,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface PlatformCapabilitiesProps {
  onEnterPlatform: () => void;
}

export const PlatformCapabilities: React.FC<PlatformCapabilitiesProps> = ({
  onEnterPlatform,
}) => {
  const capabilities = [
    {
      id: 'photogrammetry',
      badge: '01 · 3D RECONSTRUCTION',
      title: 'Poisson Surface Synthesis',
      description:
        'Converts multi-angle intraoral photographs into watertight 3D polygon surfaces, preserving sub-millimeter cusp peaks and marginal ridges.',
      metric: '<0.08mm deviation',
      icon: Scan,
      accent: 'teal',
      glow: 'group-hover:border-[#00E5CC]/40',
      iconCol: 'text-[#00E5CC]',
    },
    {
      id: 'ai-segmentation',
      badge: '02 · AI INSTANCE SEGMENTATION',
      title: 'Automated Tooth Identification',
      description:
        'Server-side Gemini vision models isolate each of the 32 anatomical teeth, calculating crown height, mesiodistal width, and torque angles.',
      metric: '32 Tooth Instances',
      icon: Cpu,
      accent: 'blue',
      glow: 'group-hover:border-[#528BFF]/40',
      iconCol: 'text-[#528BFF]',
    },
    {
      id: 'digital-twin',
      badge: '03 · PATIENT DIGITAL TWIN',
      title: 'Longitudinal Treatment Records',
      description:
        'Maintains persistent patient timelines tracking arch widening, overjet reduction, and aligner staging milestones across months of care.',
      metric: 'Stage-by-stage tracking',
      icon: Layers,
      accent: 'violet',
      glow: 'group-hover:border-[#9B82FF]/40',
      iconCol: 'text-[#9B82FF]',
    },
    {
      id: 'caliper',
      badge: '04 · CLINICAL MEASUREMENTS',
      title: 'Interactive Caliper Tooling',
      description:
        'Place precision calipers across any two anatomical landmarks to calculate instant 3D Euclidean distances, Bolton ratios, and arch perimeters.',
      metric: 'Instant Euclidean distance',
      icon: Ruler,
      accent: 'teal',
      glow: 'group-hover:border-[#00E5CC]/40',
      iconCol: 'text-[#00E5CC]',
    },
    {
      id: 'comparison',
      badge: '05 · DUAL-SCAN COMPARISON',
      title: 'Tooth Displacement Vectors',
      description:
        'Computes 3D translation vectors (ΔX, ΔY, ΔZ) and crown tipping rotations between pre-treatment baseline and follow-up aligner progress scans.',
      metric: 'Side-by-side & overlay diff',
      icon: GitCompare,
      accent: 'blue',
      glow: 'group-hover:border-[#528BFF]/40',
      iconCol: 'text-[#528BFF]',
    },
    {
      id: 'export',
      badge: '06 · CAD / CAM READY',
      title: 'Direct .OBJ & .STL Exports',
      description:
        'Export watertight digital models formatted directly for dental CAD/CAM milling machines and medical-grade 3D resin printers.',
      metric: 'Dual format CAD export',
      icon: Download,
      accent: 'violet',
      glow: 'group-hover:border-[#9B82FF]/40',
      iconCol: 'text-[#9B82FF]',
    },
  ];

  return (
    <section id="features" className="py-28 px-4 sm:px-6 bg-[#050608] relative text-white">
      {/* Background Ambient Atmospheric Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-[#00E5CC]/05 via-[#528BFF]/04 to-[#9B82FF]/05 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="glass-pill px-4 py-1.5 inline-flex items-center gap-2 mb-4 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E5CC]" />
            <span className="text-[10px] font-mono tracking-widest text-[#00E5CC] font-semibold uppercase">
              CLINICAL CAPABILITY MATRIX
            </span>
          </div>

          <h2
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-[1.1] mb-4"
          >
            Core Clinical Architecture.
            <br />
            <span className="italic text-gradient-teal-violet">Intelligence in Every Dimension.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#929BAA] leading-relaxed font-normal">
            DENT-X unifies high-resolution surface synthesis, automated FDI odontogram labeling,
            and longitudinal treatment diffing into a single real-time clinical platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                onClick={onEnterPlatform}
                className={`glass-card-dark rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer group border border-white/08 ${item.glow}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-mono tracking-wider font-bold text-[#00E5CC] bg-[#00E5CC]/10 border border-[#00E5CC]/25 px-2.5 py-1 rounded-md">
                      {item.badge}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white/05 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-5 h-5 ${item.iconCol}`} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-[#00E5CC] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#929BAA] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/08 flex items-center justify-between text-xs font-semibold">
                  <span className="font-mono text-[#00E5CC]">{item.metric}</span>
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
