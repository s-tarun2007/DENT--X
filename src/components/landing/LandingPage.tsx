import React, { useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { StoryLanding } from './StoryLanding';
import { TechnologyShowcase } from './TechnologyShowcase';
import { LandingFooter } from './LandingFooter';
import { TechnologyModal } from './TechnologyModal';
import { Reveal } from './Reveal';
import { useTheme } from '../../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useTheme();
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [showCta, setShowCta] = useState(false);
  React.useEffect(() => scrollYProgress.on('change', (v) => setShowCta(v > 0.1 && v < 0.93)), [scrollYProgress]);

  const handleEnterPlatform = () => navigate('/app');
  const scrollToSection = (id: string) => {
    if (id === 'platform') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative bg-[#02050B] min-h-screen w-full flex flex-col overflow-x-clip text-white">
      <motion.div
        style={{
          scaleX: progress,
          background: `linear-gradient(to right, ${config.accent}, ${config.accentSecondary}, ${config.accentTertiary})`,
        }}
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60]"
      />
      <AnimatePresence>
        {showCta && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleEnterPlatform}
            style={{
              backgroundColor: config.accent,
              boxShadow: `0 10px 40px -8px ${config.glowColor}`,
            }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-black text-sm font-semibold hover:scale-105 transition-transform cursor-pointer"
          >
            <span>Open Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <Navbar onEnterPlatform={handleEnterPlatform} onScrollToSection={scrollToSection} />

      <StoryLanding onEnterPlatform={handleEnterPlatform} />

      <div id="technology"><Reveal><TechnologyShowcase onEnterPlatform={handleEnterPlatform} /></Reveal></div>

      <div id="about">
        <LandingFooter onEnterPlatform={handleEnterPlatform} onExploreTechnology={() => setIsTechModalOpen(true)} onScrollToSection={scrollToSection} />
      </div>

      <TechnologyModal isOpen={isTechModalOpen} onClose={() => setIsTechModalOpen(false)} onEnterPlatform={handleEnterPlatform} />
    </main>
  );
};
