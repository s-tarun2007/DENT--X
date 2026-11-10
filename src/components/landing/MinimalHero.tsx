import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Tooth3DCanvas } from './Tooth3DCanvas';

interface MinimalHeroProps {
  onEnterPlatform: () => void;
}

export const MinimalHero: React.FC<MinimalHeroProps> = ({ onEnterPlatform }) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 500, y: 300 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] w-full flex items-center justify-center pt-24 pb-16 px-6 lg:px-12 overflow-hidden bg-[#020610] text-white select-none"
    >
      {/* Subtle Cursor Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 204, 0.06), transparent 70%)`,
        }}
      />

      {/* Hairline subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Exactly 7-word headline + one sentence + one button */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Teaser Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#00E5CC] uppercase">
              01 · The Enamel Reveal
            </span>
          </motion.div>

          {/* 7-Word Headline in Instrument Serif with line-by-line reveal */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-6xl lg:text-[72px] leading-[1.05] font-normal tracking-tight text-white mb-6"
          >
            What does a tooth look like{' '}
            <span className="italic text-[#00E5CC]">inside?</span>
          </motion.h1>

          {/* Exactly One Sentence in Inter */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mb-8 font-normal"
          >
            DENT-X reconstructs clinical photogrammetry into an interactive, micron-accurate 3D digital twin.
          </motion.p>

          {/* Exactly One Button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onEnterPlatform}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#00E5CC] hover:bg-[#34fedf] text-black text-sm font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-[0_0_25px_rgba(0,229,204,0.35)] hover:scale-[1.02]"
            >
              <span>Explore Clinical Workstation</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </motion.div>
        </div>

        {/* Right Column: Real 3D Rotating Tooth + Animated Measurement Callout */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px] flex items-center justify-center">
            {/* The 360 Rotating Physical 3D Model */}
            <Tooth3DCanvas className="w-full h-full" />

            {/* Animated Measurement Callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-2 sm:right-4 top-1/4 pointer-events-none"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#00E5CC]/30 bg-[#020610]/90 backdrop-blur-sm text-xs font-mono shadow-[0_0_15px_rgba(0,229,204,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC] animate-ping" />
                <span className="text-white text-[11px] tracking-tight">
                  Enamel <span className="text-[#00E5CC]">2.1 mm</span> · Root <span className="text-[#00E5CC]">13 mm</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
