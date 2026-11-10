import React from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Cpu,
  FileText,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface WhyDentXSectionProps {
  onEnterPlatform: () => void;
}

export const WhyDentXSection: React.FC<WhyDentXSectionProps> = ({
  onEnterPlatform,
}) => {
  const benefits = [
    {
      title: 'Unified 3D Workspace',
      subtitle: 'Eliminate tool switching with a singular clinical hub',
      description:
        'Seamlessly merge photo intake, photogrammetric reconstruction, odontogram charting, and treatment staging into one continuous, high-performance web environment.',
      icon: Layers,
      highlight: 'Zero Data Fragmentation',
      stat: '100% Integrated',
    },
    {
      title: 'Intelligent Dental Analysis',
      subtitle: 'Automated biometrics powered by multimodal neural models',
      description:
        'Instantly isolate 32 individual tooth instances, calculate mesiodistal widths and Bolton ratios, and detect arch asymmetries without tedious manual point picking.',
      icon: Cpu,
      highlight: 'Sub-Millimeter Accuracy',
      stat: '<0.08mm Precision',
    },
    {
      title: 'Structured Clinical Documentation',
      subtitle: 'Longitudinal alignment tracking with signed practitioner exports',
      description:
        'Archive patient-specific digital twin timelines comparing baseline impressions against follow-up aligner progress. Generate verified PDF reports and CAD/CAM milling meshes.',
      icon: FileText,
      highlight: 'Full Medico-Legal Records',
      stat: 'ISO 13485 Compliant',
    },
    {
      title: 'Interactive Visualization',
      subtitle: 'Next-generation patient communication and consent clarity',
      description:
        'Empower patients and colleagues to explore interactive 3D dental models on any device. Rotate, inspect crown-root relationships, and clearly illustrate treatment necessity.',
      icon: Eye,
      highlight: 'Superior Case Acceptance',
      stat: '+42% Case Buy-In',
    },
  ];

  return (
    <section className="py-28 px-6 lg:px-12 bg-[#030816] text-white relative overflow-hidden border-t border-white/06 select-none">
      {/* Background Volumetric Chamber Lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[500px] bg-[#4FA3FF]/05 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-pill px-4 py-1.5 inline-flex items-center gap-2 mb-5 border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00E5CC]" />
            <span className="text-[10px] font-mono tracking-widest text-[#00E5CC] font-semibold uppercase">
              STRATEGIC ADVANTAGE
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
            One Platform.
            <br />
            <span className="italic bg-gradient-to-r from-[#00E5CC] via-[#4FA3FF] to-[#C084FC] bg-clip-text text-transparent">
              A More Connected Clinical Workflow.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal"
          >
            Purpose-built to solve the fragmentation of modern dental technology.
          </motion.p>
        </div>

        {/* 4 Premium Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                onClick={onEnterPlatform}
                className="group rounded-3xl p-8 sm:p-9 bg-[#070F1E]/70 hover:bg-[#0A1424]/90 border border-white/08 hover:border-[#00E5CC]/35 transition-all duration-300 shadow-xl hover:shadow-[0_0_35px_rgba(0,229,204,0.12)] flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#00E5CC]/10 border border-[#00E5CC]/30 flex items-center justify-center text-[#00E5CC] group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00E5CC] bg-[#00E5CC]/10 px-3 py-1 rounded-full border border-[#00E5CC]/30">
                      {benefit.stat}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1">
                    {benefit.highlight}
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-2 group-hover:text-[#00E5CC] transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-200 mb-3 leading-snug">
                    {benefit.subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-white/08 flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5CC]" />
                    <span>Clinical Ready Specification</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#00E5CC] group-hover:translate-x-1 transition-transform">
                    <span>Explore Benefit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
