import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check } from 'lucide-react';
import { useTheme, ThemeAccent } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'expanded';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { theme, setTheme, allThemes, config } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          title={`Accent Theme: ${config.name}`}
          aria-label="Change Accent Theme"
        >
          <span
            className="w-3 h-3 rounded-full shadow-xs"
            style={{ backgroundColor: config.accent, boxShadow: `0 0 8px ${config.accent}` }}
          />
          <Palette className="w-3.5 h-3.5 opacity-70" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 z-50 p-2 rounded-xl bg-[#090D14]/95 border border-white/15 backdrop-blur-xl shadow-2xl min-w-[150px] space-y-1 select-none"
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                  Accent Color
                </div>
                {allThemes.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: t.accent,
                            boxShadow: isActive ? `0 0 8px ${t.accent}` : undefined,
                          }}
                        />
                        <span className="capitalize">{t.id}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default 'pill' variant: subtle inline row of dots
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-xs select-none transition-colors ${className}`}
      title={`Accent: ${config.name}`}
    >
      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden lg:inline mr-1">
        Accent
      </span>

      {allThemes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="group relative p-0.5 rounded-full cursor-pointer focus:outline-none"
            aria-label={`Select ${t.name} Accent`}
          >
            <span
              className={`block w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                isActive
                  ? 'ring-2 ring-white/90 scale-110 shadow-sm'
                  : 'opacity-55 hover:opacity-100 hover:scale-105'
              }`}
              style={{
                backgroundColor: t.accent,
                boxShadow: isActive ? `0 0 10px ${t.accent}` : undefined,
              }}
            />

            {/* Micro tooltip on hover */}
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-1.5 py-0.5 text-[9px] font-mono text-white opacity-0 transition-opacity group-hover:opacity-100 border border-white/10 z-50">
              {t.name.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
