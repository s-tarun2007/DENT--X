import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  Layers,
  Box,
  Cpu,
  Eye,
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface WorkflowSectionProps {
  onEnterPlatform: () => void;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  onEnterPlatform,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      step: 1,
      number: '01',
      title: 'Import Dental Images',
      subtitle: 'Intraoral photo ingestion with automated validation',
      icon: UploadCloud,
      description:
        'Upload multi-view photographs (frontal, occlusal, buccal views) or standard clinical image series. The ingest engine inspects focus, illumination, and landmark completeness.',
      features: [
        'Multi-angle photo support (5–16 standard intraoral angles)',
        'Server-side blur and illumination quality verification',
        'Direct patient record linking with persistent storage',
      ],
      tag: 'DATA INGESTION',
      latency: '< 1.5 seconds',
    },
    {
      step: 2,
      number: '02',
      title: 'Multi-View Processing',
      subtitle: 'Photogrammetric feature extraction and orientation',
      icon: Layers,
      description:
        'Computer vision pipelines extract thousands of keypoint descriptors across views, aligning individual camera poses into a calibrated 3D coordinate space.',
      features: [
        'SIFT and deep feature correspondence matching',
        'Automatic occlusal and sagittal plane orientation',
        'Rigid transformation alignment against dental arch templates',
      ],
      tag: 'FEATURE EXTRACTION',
      latency: '< 2.2 seconds',
    },
    {
      step: 3,
      number: '03',
      title: '3D Reconstruction',
      subtitle: 'Watertight Poisson surface polygon synthesis',
      icon: Box,
      description:
        'Solves an indicator Poisson equation across surface normal fields to reconstruct watertight, continuous polygon meshes capturing sub-millimeter cusp peaks and cervical margins.',
      features: [
        'Poisson surface synthesis with <0.08mm deviation',
        'Watertight non-manifold topology repair',
        'Direct .OBJ and .STL CAD/CAM export capability',
      ],
      tag: 'POLYGON SYNTHESIS',
      latency: '< 3.4 seconds',
    },
    {
      step: 4,
      number: '04',
      title: 'AI-Assisted Analysis',
      subtitle: 'Instance segmentation and FDI biometric labeling',
      icon: Cpu,
      description:
        'Neural models isolate 32 individual adult tooth instances, detecting restorations, wear facets, and computing 3D displacement vectors (ΔX, ΔY, ΔZ) relative to baseline scans.',
      features: [
        'Automated FDI, Universal, and Palmer tooth identification',
        'Longitudinal alignment displacement and rotation tracking',
        'Crown height, mesiodistal width, and torque telemetry',
      ],
      tag: 'NEURAL CLUSTERING',
      latency: '< 2.0 seconds',
    },
    {
      step: 5,
      number: '05',
      title: 'Clinical Visualization',
      subtitle: 'Interactive 3D digital twin & practitioner sign-off',
      icon: Eye,
      description:
        'Clinicians explore the completed interactive 3D digital twin, place Euclidean calipers, evaluate occlusal contacts, and generate formal diagnostic reports.',
      features: [
        'Interactive real-time 3D orbit, pan, and caliper measurement',
        'Synchronized odontogram and comparative baseline overlay',
        'Clinician-signed PDF reports ready for orthodontic referral',
      ],
      tag: 'CLINICAL READOUT',
      latency: 'Real-time 60 FPS',
    },
  ];

  const current = steps.find((s) => s.step === activeStep) || steps[0];
  const CurrentIcon = current.icon;

  return (
    <section id="workflow" className="py-28 px-6 lg:px-12 bg-[#020713] text-white relative overflow-hidden border-t border-white/06 select-none">
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[500px] bg-[#00E5CC]/05 rounded-full blur-[180px] pointer-events-none" />

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
            <Clock className="w-3.5 h-3.5 text-[#00E5CC]" />
            <span className="text-[10px] font-mono tracking-widest text-[#00E5CC] font-semibold uppercase">
              FIVE-STAGE PIPELINE
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
            From Dental Scan
            <br />
            <span className="italic bg-gradient-to-r from-[#00E5CC] via-[#4FA3FF] to-[#C084FC] bg-clip-text text-transparent">
              to Clinical Clarity.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal"
          >
            A continuous connected workflow transforming multi-view photographs into complete diagnostic intelligence.
          </motion.p>
        </div>

        {/* Connected 5-Step Glowing Timeline Bar */}
        <div className="relative mb-12">
          {/* Glowing connecting line behind the cards */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-[2px] -translate-y-1/2 bg-gradient-to-r from-[#00E5CC]/20 via-[#4FA3FF]/30 to-[#C084FC]/20 z-0" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 relative z-10">
            {steps.map((s) => {
              const isSelected = s.step === activeStep;
              const StepIcon = s.icon;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#091424] border-[#00E5CC] shadow-[0_0_25px_rgba(0,229,204,0.25)] ring-1 ring-[#00E5CC]/60'
                      : 'bg-[#060D1A]/60 border-white/08 hover:border-white/20 hover:bg-[#0A1424]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#00E5CC] text-black'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {s.number}
                    </span>
                    <StepIcon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-[#00E5CC]' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1">
                    {s.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {s.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Detailed Breakdown Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl p-6 sm:p-10 bg-[#070F1E]/85 border border-white/10 shadow-2xl backdrop-blur-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Stage Details */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#00E5CC]/10 border border-[#00E5CC]/30 flex items-center justify-center text-[#00E5CC] shrink-0">
                    <CurrentIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E5CC] font-bold">
                      STAGE {current.number} · {current.tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {current.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  {current.description}
                </p>

                <div className="space-y-3 pt-2">
                  {current.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#00E5CC] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={onEnterPlatform}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00E5CC] hover:bg-[#34eed8] text-black rounded-full text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(0,229,204,0.3)] transition-all cursor-pointer"
                  >
                    <span>Execute in Platform</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Right Column: Stage Telemetry Specs */}
              <div className="lg:col-span-5 bg-black/40 border border-white/08 rounded-2xl p-6 sm:p-7 space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-white/08 text-xs">
                  <span className="font-mono uppercase font-bold text-slate-400 text-[10px]">
                    STAGE TELEMETRY SPECIFICATION
                  </span>
                  <span className="text-[10px] font-mono text-[#00E5CC] bg-[#00E5CC]/10 px-2 py-0.5 rounded border border-[#00E5CC]/30 font-bold">
                    ACTIVE PIPELINE
                  </span>
                </div>

                <div className="p-3.5 bg-white/03 rounded-xl border border-white/06 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Pipeline Latency</span>
                  <span className="font-mono font-bold text-[#00E5CC] text-xs">{current.latency}</span>
                </div>

                <div className="p-3.5 bg-white/03 rounded-xl border border-white/06 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Algorithmic Stage</span>
                  <span className="font-mono font-bold text-white text-xs">{current.tag}</span>
                </div>

                <div className="p-3.5 bg-white/03 rounded-xl border border-white/06 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Clinical Data Compliance</span>
                  <span className="font-mono font-bold text-white text-xs">ISO 13485 Standard</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
