import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onEnterPlatform: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onEnterPlatform,
  onScrollToSection,
}) => {
  const { config } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('platform');
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'platform', label: 'Platform', href: '#platform' },
    { id: 'technology', label: 'Technology', href: '#technology' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'workflow', label: 'Workflow', href: '#workflow' },
    { id: 'about', label: 'About', href: '#about' },
  ];

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(id);
    onScrollToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#020713]/85 backdrop-blur-xl border-b border-white/08 py-3.5 shadow-2xl'
          : 'bg-transparent py-5 sm:py-6'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Left Side: Glowing Tooth Icon + DENT-X Brand + Subtitle */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
          title="DENT-X — Return to Top"
        >
          {/* Stylized Neon Molar SVG Icon with dynamic theme accent */}
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-8 h-8 transition-transform duration-300 group-hover:scale-105"
              style={{
                color: config.accent,
                filter: `drop-shadow(0 0 10px ${config.glowColor})`,
              }}
            >
              <path
                d="M16 4.5C11.2 4.5 7.5 7.8 7.5 12.5C7.5 15.6 8.5 18.8 9.6 21.8C10.7 24.8 11.2 28.5 13.5 28.5C15.2 28.5 15.6 25 16 22.5C16.4 25 16.8 28.5 18.5 28.5C20.8 28.5 21.3 24.8 22.4 21.8C23.5 18.8 24.5 15.6 24.5 12.5C24.5 7.8 20.8 4.5 16 4.5Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.5 12C13 13.5 19 13.5 20.5 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeOpacity="0.9"
              />
            </svg>
          </div>

          {/* Typography */}
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-sans tracking-tight leading-none font-bold">
              <span className="text-white">DENT-</span>
              <span style={{ color: config.accent }}>X</span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-sans font-semibold tracking-[0.24em] text-slate-300 uppercase mt-1 leading-none">
              3D DENTAL INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(link.id, e)}
                className={`relative py-1.5 transition-colors duration-200 select-none ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-glow"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full"
                    style={{
                      backgroundColor: config.accent,
                      boxShadow: `0 0 12px ${config.accent}`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Side: Theme Toggle + Sign In & Explore Platform */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Subtle Theme Accent Switcher */}
          <ThemeToggle />

          <button
            onClick={onEnterPlatform}
            className="hidden sm:inline-flex items-center px-4 py-2 text-xs sm:text-sm font-medium text-white border border-white/20 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-sm"
          >
            Sign In
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnterPlatform}
            style={{
              backgroundColor: config.accent,
              boxShadow: `0 0 25px ${config.glowColor}`,
            }}
            className="flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-black rounded-full transition-all duration-300 cursor-pointer hover:opacity-90"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-3 mx-4 p-5 rounded-2xl bg-[#090D14]/95 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-3"
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => handleNavClick(link.id, e)}
              className="block py-2 px-3 text-sm font-medium text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: link.id === activeTab ? config.accent : undefined }}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <ThemeToggle />
            <button
              onClick={onEnterPlatform}
              style={{ backgroundColor: config.accent }}
              className="flex-1 py-2 text-center text-xs font-bold text-black rounded-full shadow-md"
            >
              Explore Platform
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};
