import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  PlayCircle,
  Box,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { HeroHologramToothCanvas } from './HeroHologramToothCanvas';

interface HeroProps {
  onEnterPlatform: () => void;
  onExploreTechnology: () => void;
  onScrollToExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onEnterPlatform,
  onExploreTechnology,
  onScrollToExplore,
}) => {
  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#020713] text-white pt-24 sm:pt-28 pb-4 sm:pb-6 select-none">
      {/* 1. Master Holographic Background with Pedestal, Concentric Rings, Beams, and Dotted Wave */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="/assets/hero-bg-pedestal.png"
          alt="DENT-X Holographic Dental Intelligence"
          className="w-full h-full object-cover object-right lg:object-center select-none"
        />
        {/* Deep navy left scrim for typography legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020713] via-[#020713]/80 to-transparent w-full lg:w-3/5 pointer-events-none" />
        {/* Soft volumetric atmospheric glow behind tooth */}
        <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] bg-gradient-to-tr from-[#00E5CC]/08 via-[#4FA3FF]/05 to-[#C084FC]/06 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* 2. Main Hero Grid: Left Typography + Right Live 3D Holographic Tooth */}
      <div className="relative z-10 max-w-[1600px] w-full mx-auto px-6 lg:px-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column: Eyebrow + Headlines + Description + Buttons */}
        <div className="lg:col-span-7 xl:col-span-7 py-6 lg:py-10 text-left">
          {/* Glowing Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00E5CC]/10 border border-[#00E5CC]/35 shadow-[0_0_18px_rgba(0,229,204,0.2)] backdrop-blur-md">
              <span className="text-[#00E5CC] text-sm leading-none">✦</span>
              <span className="text-white text-xs sm:text-[13px] font-medium tracking-wide">
                AI-Powered 3D Dental Platform
              </span>
            </div>
          </motion.div>

          {/* Main Cinematic Headings in Instrument Serif */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[68px] leading-[1.08] tracking-[-0.015em] font-normal text-white mb-5 select-none"
          >
            Engineered for Clinical Precision.
            <br />
            <span className="italic bg-gradient-to-r from-[#00E5CC] via-[#4FA3FF] to-[#C084FC] bg-clip-text text-transparent">
              Designed for Simplicity.
            </span>
          </motion.h1>

          {/* Supporting Clinical Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mb-7 font-normal"
          >
            DENT-X replaces fragmented diagnostic tools with a unified 3D workstation,
            combining computer vision, odontogram intelligence, and clinical documentation.
          </motion.p>

          {/* Cyan Glowing Accent Divider Line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.7 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 max-w-sm sm:max-w-md mb-8 origin-left"
          >
            <span className="w-1.5 h-1.5 rotate-45 bg-[#00E5CC] shadow-[0_0_8px_#00E5CC] shrink-0" />
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#00E5CC]/90 via-[#00E5CC]/40 to-[#00E5CC]/90 shadow-[0_0_8px_rgba(0,229,204,0.6)]" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#00E5CC] shadow-[0_0_8px_#00E5CC] shrink-0" />
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnterPlatform}
              className="flex items-center gap-2 px-7 py-3.5 bg-[#00E5CC] hover:bg-[#34eed8] text-black font-bold text-sm rounded-full shadow-[0_0_30px_rgba(0,229,204,0.45)] transition-all duration-200 cursor-pointer"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onExploreTechnology}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-medium backdrop-blur-md transition-all duration-200 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span>Watch Overview (2 min)</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right Column: Single Floating & Rotating 3D Holographic Tooth */}
        <div className="lg:col-span-5 xl:col-span-5 relative h-[380px] sm:h-[480px] lg:h-[580px] w-full flex items-center justify-center">
          <HeroHologramToothCanvas className="w-full h-full" />
        </div>
      </div>

      {/* 3. Bottom Feature Bar (4-Column Glassmorphism Strip with Dividers) */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-[1600px] mx-auto px-6 lg:px-12 pb-2 sm:pb-4 mt-auto"
      >
        <div className="rounded-full border border-white/10 bg-[#060D18]/85 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] px-6 sm:px-8 lg:px-10 py-3.5 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {/* 1. 3D Visualization */}
            <div
              onClick={onScrollToExplore}
              className="flex items-center gap-3.5 group cursor-pointer pt-2 sm:pt-0 sm:px-3 first:pl-0"
            >
              <div className="w-11 h-11 rounded-full border border-[#00E5CC]/30 bg-[#00E5CC]/10 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#00E5CC] transition-all duration-300">
                <Box className="w-5 h-5 text-[#00E5CC]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white text-sm font-semibold tracking-tight group-hover:text-[#00E5CC] transition-colors">
                  3D Visualization
                </span>
                <span className="text-slate-400 text-xs">
                  Interactive dental models
                </span>
              </div>
            </div>

            {/* 2. AI Analysis */}
            <div
              onClick={onScrollToExplore}
              className="flex items-center gap-3.5 group cursor-pointer pt-2 sm:pt-0 sm:px-3"
            >
              <div className="w-11 h-11 rounded-full border border-[#00E5CC]/30 bg-[#00E5CC]/10 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#00E5CC] transition-all duration-300">
                <Share2 className="w-5 h-5 text-[#00E5CC]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white text-sm font-semibold tracking-tight group-hover:text-[#00E5CC] transition-colors">
                  AI Analysis
                </span>
                <span className="text-slate-400 text-xs">
                  Clinical insights, faster
                </span>
              </div>
            </div>

            {/* 3. Integrated Workflow */}
            <div
              onClick={onScrollToExplore}
              className="flex items-center gap-3.5 group cursor-pointer pt-2 sm:pt-0 sm:px-3"
            >
              <div className="w-11 h-11 rounded-full border border-[#00E5CC]/30 bg-[#00E5CC]/10 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#00E5CC] transition-all duration-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-[#00E5CC]"
                >
                  <path
                    d="M12 3C8.5 3 6 5.5 6 9C6 11.5 6.8 14 7.5 16.5C8.2 19 8.5 21 10 21C11.5 21 11.8 18 12 16.5C12.2 18 12.5 21 14 21C15.5 21 15.8 19 16.5 16.5C17.2 14 18 11.5 18 9C18 5.5 15.5 3 12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white text-sm font-semibold tracking-tight group-hover:text-[#00E5CC] transition-colors">
                  Integrated Workflow
                </span>
                <span className="text-slate-400 text-xs">
                  From scan to treatment
                </span>
              </div>
            </div>

            {/* 4. Clinical Ready */}
            <div
              onClick={onScrollToExplore}
              className="flex items-center gap-3.5 group cursor-pointer pt-2 sm:pt-0 sm:px-3 last:pr-0"
            >
              <div className="w-11 h-11 rounded-full border border-[#00E5CC]/30 bg-[#00E5CC]/10 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#00E5CC] transition-all duration-300">
                <ShieldCheck className="w-5 h-5 text-[#00E5CC]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white text-sm font-semibold tracking-tight group-hover:text-[#00E5CC] transition-colors">
                  Clinical Ready
                </span>
                <span className="text-slate-400 text-xs">
                  Accurate, secure, and reliable
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
