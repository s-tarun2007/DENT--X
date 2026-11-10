import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, PlayCircle, Mail, CheckCircle2 } from 'lucide-react';

interface LandingFooterProps {
  onEnterPlatform: () => void;
  onExploreTechnology?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onEnterPlatform,
  onExploreTechnology,
  onScrollToSection,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  const navLinks = [
    { id: 'platform', label: 'Platform' },
    { id: 'technology', label: 'Technology' },
    { id: 'features', label: 'Features' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'about', label: 'About' },
  ];

  const handleLinkClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="about" className="bg-[#020713] text-white pt-24 pb-14 px-6 lg:px-12 relative overflow-hidden border-t border-white/06 select-none">
      {/* Background Volumetric Chamber Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-[#00E5CC]/08 via-[#4FA3FF]/05 to-[#C084FC]/08 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* SECTION 7 — FINAL CALL TO ACTION */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl p-10 sm:p-16 text-center max-w-4xl mx-auto bg-gradient-to-br from-[#070F1E] via-[#09152A] to-[#0D1E3A] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] mb-24 relative overflow-hidden"
        >
          {/* Subtle background dental watermark glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#00E5CC]/10 via-transparent to-transparent pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5CC]/10 border border-[#00E5CC]/30 text-[#00E5CC] text-[10px] font-mono uppercase tracking-widest font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLINICAL PRODUCTION PLATFORM</span>
          </div>

          <h2
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.08] mb-5"
          >
            Experience the Future of
            <br />
            <span className="italic bg-gradient-to-r from-[#00E5CC] via-[#4FA3FF] to-[#C084FC] bg-clip-text text-transparent">
              Dental Intelligence.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-9 font-normal">
            Bring reconstruction, visualization, and clinical intelligence together with DENT-X.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnterPlatform}
              className="flex items-center gap-2 px-8 py-4 bg-[#00E5CC] hover:bg-[#34eed8] text-black text-sm font-bold rounded-full shadow-[0_0_30px_rgba(0,229,204,0.45)] transition-all cursor-pointer"
            >
              <span>Explore DENT-X</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>

            {onExploreTechnology && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onExploreTechnology}
                className="flex items-center gap-2 px-7 py-4 rounded-full border border-white/20 bg-white/05 hover:bg-white/10 text-white text-sm font-medium backdrop-blur-md transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-white" />
                <span>Discover Our Technology</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* SECTION 8 — FOOTER & NAVIGATION LINKS */}
        <div className="pt-12 border-t border-white/08 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Left Brand Column */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="w-7 h-7 text-[#00E5CC]"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 229, 204, 0.7))' }}
              >
                <path
                  d="M16 4.5C11.2 4.5 7.5 7.8 7.5 12.5C7.5 15.6 8.5 18.8 9.6 21.8C10.7 24.8 11.2 28.5 13.5 28.5C15.2 28.5 15.6 25 16 22.5C16.4 25 16.8 28.5 18.5 28.5C20.8 28.5 21.3 24.8 22.4 21.8C23.5 18.8 24.5 15.6 24.5 12.5C24.5 7.8 20.8 4.5 16 4.5Z"
                  stroke="#00E5CC"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white leading-none">
                  DENT-<span className="text-[#00E5CC]">X</span>
                </span>
                <span className="text-[8px] font-semibold tracking-[0.24em] text-slate-400 uppercase mt-0.5">
                  3D DENTAL INTELLIGENCE
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              AI-powered 3D dental reconstruction and digital twin workstation.
              Unifying computer vision, odontogram intelligence, and clinical documentation into one seamless clinical standard.
            </p>

            <div className="flex items-center gap-2 text-[#00E5CC] font-mono text-[11px] pt-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5CC] animate-ping" />
              <span>All Clinical Services Operational</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3 text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => handleLinkClick(link.id, e)}
                    className="hover:text-[#00E5CC] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Legal & Contact Links */}
          <div className="md:col-span-4 space-y-3 text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Clinical Inquiries & Updates
            </h4>
            <p className="text-xs text-slate-400">
              Subscribe to institutional release notes and clinical photogrammetry papers.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@practice.com"
                className="bg-white/05 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5CC] flex-1"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#00E5CC] text-black font-bold text-xs rounded-full hover:bg-[#34eed8] transition-all cursor-pointer shrink-0"
              >
                Join
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-1.5 text-xs text-[#00E5CC]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Subscribed to clinical releases.</span>
              </div>
            )}

            <div className="flex items-center gap-4 pt-3 text-[11px] text-slate-500">
              <button
                onClick={onEnterPlatform}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Contact
              </button>
              <span>·</span>
              <button
                onClick={onEnterPlatform}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>·</span>
              <button
                onClick={onEnterPlatform}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-white/06 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 DENT-X. All rights reserved.</div>
          <div className="font-mono">Engineered for Clinical Precision.</div>
        </div>
      </div>
    </footer>
  );
};
