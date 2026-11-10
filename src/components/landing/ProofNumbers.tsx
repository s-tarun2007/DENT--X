import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface CountUpProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

const CountUpNumber: React.FC<CountUpProps> = ({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 2000,
}) => {
  const [val, setVal] = useState<number>(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(eased * end);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const ProofNumbers: React.FC = () => {
  return (
    <section
      id="proof"
      className="relative py-28 sm:py-36 px-6 lg:px-12 bg-[#020610] text-white border-t border-white/[0.06] select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-left">
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
            05 · Clinical Benchmarks
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] text-white mb-20 tracking-tight"
        >
          Three numbers that render{' '}
          <span className="italic text-[#00E5CC]">traditional impressions obsolete.</span>
        </motion.h2>

        {/* 3 Proof Numbers in Hairline Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 border-t border-white/[0.08] pt-12">
          {/* Proof 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <div
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-normal text-white mb-4 tracking-tight"
            >
              <CountUpNumber end={0.08} decimals={2} prefix="< " suffix=" mm" duration={2200} />
            </div>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
              Mean geometric surface deviation across full adult dentition, verified against high-precision industrial contact profilometry.
            </p>
          </motion.div>

          {/* Proof 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <div
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-normal text-[#00E5CC] mb-4 tracking-tight"
            >
              <CountUpNumber end={32} decimals={0} suffix=" teeth" duration={1800} />
            </div>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
              Simultaneously segmented and indexed into independent anatomical meshes with root canals, crown boundaries, and periodontal margins.
            </p>
          </motion.div>

          {/* Proof 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <div
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-normal text-white mb-4 tracking-tight"
            >
              <CountUpNumber end={2} decimals={0} prefix="< " suffix=" min" duration={2000} />
            </div>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
              Total compute time from intraoral photo capture to complete interactive digital twin ready for chairside diagnosis and export.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
