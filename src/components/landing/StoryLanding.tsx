/**
 * StoryLanding — minimal, scroll-scrubbed landing for DENT-X.
 * One pinned stage: the glass tooth grows, glides lower-left, opens into
 * callouts, then sinks away while giant type crossfades chapter by chapter.
 * Then: word-by-word manifesto, three proof numbers.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  motion, useScroll, useSpring, useTransform, useReducedMotion, useInView, animate, MotionValue,
} from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const H1 = 'font-semibold uppercase tracking-[-0.03em] leading-[0.92] text-[clamp(2.4rem,8vw,7.5rem)]';

const useIsMobile = () => {
  const [m, setM] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const f = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return m;
};

/** A block of copy that fades/rises/unblurs in and out over a scroll range. */
const Chapter: React.FC<{ p: MotionValue<number>; r: [number, number, number, number]; className?: string; children: React.ReactNode }> = ({ p, r, className = '', children }) => {
  const opacity = useTransform(p, r, [0, 1, 1, 0]);
  const y = useTransform(p, r, [48, 0, 0, -48]);
  const filter = useTransform(p, r, ['blur(12px)', 'blur(0px)', 'blur(0px)', 'blur(12px)']);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'));
  return <motion.div style={{ opacity, y, filter, pointerEvents }} className={`absolute ${className}`}>{children}</motion.div>;
};

/** Thin leader line + label attached to a point on the tooth. */
const Callout: React.FC<{ p: MotionValue<number>; x: string; y: string; side: 'l' | 'r'; title: string; text: string }> = ({ p, x, y, side, title, text }) => {
  const { config } = useTheme();
  const opacity = useTransform(p, [0.46, 0.55, 0.74, 0.8], [0, 1, 1, 0]);
  const body = (
    <div className={side === 'l' ? 'text-right' : 'text-left'}>
      <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: config.accent }}>{title}</div>
      <div className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">{text}</div>
    </div>
  );
  const line = (
    <span
      className="block w-20 lg:w-32 h-px"
      style={{
        background: `linear-gradient(to right, ${config.accent}, transparent)`,
        transform: side === 'l' ? 'scaleX(-1)' : undefined,
      }}
    />
  );
  const dot = (
    <span
      className="block w-2 h-2 rounded-full"
      style={{
        backgroundColor: config.accent,
        boxShadow: `0 0 12px ${config.accent}`,
      }}
    />
  );
  return (
    <motion.div className="absolute hidden md:flex items-center gap-2" style={{ left: x, top: y, opacity, transform: `translate(${side === 'l' ? '-100%' : '0'}, -50%)` }}>
      {side === 'l' ? <>{body}{line}{dot}</> : <>{dot}{line}{body}</>}
    </motion.div>
  );
};

const Story: React.FC<{ onEnterPlatform: () => void }> = ({ onEnterPlatform }) => {
  const { config } = useTheme();
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 26, mass: 0.5 });

  const K = [0, 0.25, 0.52, 0.8, 1];
  const T = mobile
    ? { x: ['0vw', '-14vw', '0vw', '0vw', '0vw'], y: ['22vh', '30vh', '6vh', '50vh', '72vh'], s: [0.75, 1.05, 1.2, 0.9, 0.7] }
    : { x: ['24vw', '-27vw', '0vw', '0vw', '0vw'], y: ['6vh', '14vh', '2vh', '46vh', '70vh'], s: [0.8, 1.35, 1.2, 0.95, 0.75] };
  const x = useTransform(p, K, T.x);
  const y = useTransform(p, K, T.y);
  const scale = useTransform(p, K, T.s);
  const rotate = useTransform(p, K, [8, -4, 0, 2, 6]);
  const opacity = useTransform(p, [0, 0.82, 1], [1, 1, 0]);

  return (
    <section ref={ref} className="relative h-[520vh] bg-[#02050B]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* atmosphere */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 75% 40%, rgba(${config.rgb}, 0.12), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(155,130,255,0.08), transparent 50%)`,
          }}
        />

        {/* the tooth */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div style={{ x, y, opacity }} className="relative h-[38vh] md:h-[52vh] aspect-[710/820]">
            <div
              className="absolute -inset-[35%] rounded-full blur-2xl"
              style={{
                background: `radial-gradient(circle, rgba(${config.rgb}, 0.24), transparent 62%)`,
              }}
            />
            <motion.div style={{ scale, rotate }} className="relative w-full h-full">
              <motion.div className="w-full h-full" style={{ perspective: 900 }}
                animate={reduce ? undefined : { y: [0, -14, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
                <motion.img src="/assets/tooth-hero-cutout.png" alt="" draggable={false}
                  className="w-full h-full object-contain select-none"
                  style={{ transformStyle: 'preserve-3d', mixBlendMode: 'screen', filter: `drop-shadow(0 0 30px ${config.glowColor})` }}
                  animate={reduce ? undefined : { rotateY: [-14, 14, -14] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
              </motion.div>
            </motion.div>
            <Callout p={p} x="22%" y="20%" side="l" title="Enamel" text="Translucent outer shell" />
            <Callout p={p} x="44%" y="56%" side="l" title="Pulp chamber" text="Nerves & blood supply" />
            <Callout p={p} x="76%" y="38%" side="r" title="Dentin" text="Structural core" />
            <Callout p={p} x="68%" y="82%" side="r" title="Roots" text="Mapped to the tip" />
          </motion.div>
        </div>

        {/* chapter 0 — hero */}
        <Chapter p={p} r={[-0.2, -0.1, 0.15, 0.24]} className="left-6 md:left-14 top-[17vh] md:top-[20vh] max-w-[92vw]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}>
            <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-slate-400 mb-5">DENT-X · 3D Dental Intelligence</p>
            <h1 className={`${H1} text-white`}>See inside<br />every <span className="accent-gradient-text">tooth.</span></h1>
            <p className="mt-6 max-w-md text-slate-300 text-base md:text-lg">Ordinary photos in. A precise, explorable 3D digital twin out.</p>
            <button
              onClick={onEnterPlatform}
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = config.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <span>Open the workstation</span> <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </Chapter>
        <Chapter p={p} r={[-0.2, -0.1, 0.1, 0.2]} className="left-1/2 -translate-x-1/2 bottom-7">
          <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Scroll
            <motion.span
              className="block w-px h-8"
              style={{ background: `linear-gradient(to bottom, ${config.accent}, transparent)` }}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </Chapter>

        {/* chapter 1 */}
        <Chapter p={p} r={[0.22, 0.3, 0.44, 0.52]} className="right-6 md:right-14 top-[16vh] md:top-[20vh] text-right max-w-[92vw]">
          <h2 className={`${H1} text-white`}>Every angle.<br /><span className="accent-gradient-text">Every micron.</span></h2>
          <p className="mt-6 ml-auto max-w-sm text-slate-300">Sub-millimetre reconstruction, with all 32 teeth separated automatically.</p>
        </Chapter>

        {/* chapter 2 */}
        <Chapter p={p} r={[0.5, 0.58, 0.72, 0.8]} className="left-1/2 -translate-x-1/2 top-[12vh] text-center w-full px-6">
          <h2 className={`${H1} text-white`}>Nothing <span className="accent-gradient-text">hidden.</span></h2>
        </Chapter>

        {/* chapter 3 */}
        <Chapter p={p} r={[0.78, 0.86, 1.1, 1.2]} className="left-1/2 -translate-x-1/2 top-[22vh] text-center w-full px-6">
          <h2 className={`${H1} text-white`}>One workstation.<br /><span className="accent-gradient-text">Zero guesswork.</span></h2>
          <button
            onClick={onEnterPlatform}
            style={{
              backgroundColor: config.accent,
              boxShadow: `0 0 25px ${config.glowColor}`,
            }}
            className="mt-9 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-black text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            <span>Explore the platform</span> <ArrowRight className="w-4 h-4" />
          </button>
        </Chapter>
      </div>
    </section>
  );
};

const Word: React.FC<{ w: string; i: number; n: number; p: MotionValue<number>; accent: boolean }> = ({ w, i, n, p, accent }) => {
  const s = (i / n) * 0.75;
  const opacity = useTransform(p, [s, s + 0.14], [0.12, 1]);
  const filter = useTransform(p, [s, s + 0.14], ['blur(6px)', 'blur(0px)']);
  return <motion.span style={{ opacity, filter }} className={`inline-block mr-[0.28em] ${accent ? 'accent-gradient-text' : ''}`}>{w}</motion.span>;
};

const Manifesto: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] });
  const text = 'DENT-X turns a handful of ordinary photos into a precise 3D model of the whole mouth, so every diagnosis starts with the full picture.';
  const words = text.split(' ');
  const accent = new Set(['3D', 'model', 'full', 'picture.']);
  return (
    <section id="workflow" ref={ref} className="relative bg-[#02050B] px-6 md:px-14 py-[22vh]">
      <p className="max-w-5xl mx-auto text-white font-medium leading-[1.12] tracking-tight text-[clamp(1.7rem,4vw,3.6rem)]">
        {words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} accent={accent.has(w)} />)}
      </p>
    </section>
  );
};

const Stat: React.FC<{ pre?: string; v: number; d?: number; suf?: string; label: string }> = ({ pre = '', v, d = 0, suf = '', label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, v, { duration: 1.6, ease: 'easeOut', onUpdate: setN });
    return () => c.stop();
  }, [inView, v]);
  return (
    <div ref={ref} className="px-6 md:px-10 py-10 text-center md:text-left">
      <div className="accent-gradient-text font-semibold tracking-tight text-[clamp(3rem,7vw,6rem)] leading-none tabular-nums">{pre}{n.toFixed(d)}{suf}</div>
      <div className="mt-3 text-sm text-slate-400">{label}</div>
    </div>
  );
};

const Stats: React.FC = () => (
  <section id="features" className="bg-[#02050B] px-6 md:px-14 pb-[16vh]">
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 md:divide-x divide-white/10 border-y border-white/10">
      <Stat pre="<" v={0.08} d={2} suf=" mm" label="Surface deviation across the full dentition" />
      <Stat v={32} label="Teeth identified and separated automatically" />
      <Stat v={5} label="Stages from first photo to signed-off report" />
    </div>
  </section>
);

export const StoryLanding: React.FC<{ onEnterPlatform: () => void }> = ({ onEnterPlatform }) => (
  <>
    <div id="platform"><Story onEnterPlatform={onEnterPlatform} /></div>
    <Manifesto />
    <Stats />
  </>
);
