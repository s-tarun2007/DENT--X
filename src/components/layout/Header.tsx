/**
 * DENT X — Clinical Top Bar Header
 * 
 * Features:
 *   - Hamburger Sidebar Toggle
 *   - Brand Home Logo (navigates back to Landing Page)
 *   - Zero state: says "No active case" when no scan is active
 *   - Switch case dropdown hooked into active cases
 *   - Persistent Honesty Indicator
 */

import React, { useState } from 'react';
import { Plus, Database, Sparkles, Globe, Menu, PanelLeftClose, AlertCircle, HelpCircle } from 'lucide-react';
import { AppPage } from './Sidebar';
import { useReconstruction } from '../../context/ReconstructionContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  currentPage,
  onNavigate,
  onGoHome,
}) => {
  const { cases, activeCase, selectCase } = useReconstruction();
  const [showHonestyTooltip, setShowHonestyTooltip] = useState(false);

  const pageTitles: Record<AppPage, string> = {
    dashboard: 'Clinical Overview',
    new_scan: 'New Dental Scan Acquisition',
    processing: '3D Reconstruction Pipeline',
    analysis: 'Interactive 3D Dental Analysis',
    comparison: 'Dual-Scan Comparative Deviation',
    reports: 'Orthodontic & Anatomical Report',
    history: 'Scan Archive & Case Records',
    settings: 'Clinical Workspace Configuration',
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/90 flex items-center justify-between gap-4 sm:gap-6 shrink-0 z-20 shadow-2xs">
      {/* Zone 1: Hamburger Toggle + Brand Home Logo + Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isSidebarOpen
              ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-2xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
          title={isSidebarOpen ? 'Collapse Navigation Sidebar' : 'Open Navigation Sidebar'}
          aria-label="Toggle navigation sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5 text-teal-600" />
          ) : (
            <Menu className="w-5 h-5 text-slate-700" />
          )}
        </button>

        {/* DENT-X Brand Mark — HOME Button to return to Landing Page */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group text-left shrink-0"
          title="DENT-X Home — Return to Cinematic Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 8C5 4.5 8 2.5 12 2.5C16 2.5 19 4.5 19 8C19 12.5 17 19.5 14 21.5C12.8 22.3 11.2 22.3 10 21.5C7 19.5 5 12.5 5 8Z" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 7V15M8 11H16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex items-center leading-none">
            <span className="font-bold text-slate-900 tracking-tight text-base font-sans group-hover:text-teal-700 transition-colors">
              DENT
            </span>
            <span className="font-extrabold text-teal-600 text-base">X</span>
          </div>
        </button>

        <span className="text-slate-300 font-light hidden sm:inline" aria-hidden="true">/</span>

        {/* Current Active Section Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap truncate">
            {pageTitles[currentPage]}
          </h1>
          <span className="text-slate-300 font-light hidden lg:inline" aria-hidden="true">·</span>
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 truncate">
            {activeCase ? (
              <>
                <span>Case {activeCase.id}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700">{activeCase.patientName}</span>
              </>
            ) : (
              <span className="font-medium text-slate-400">No active case</span>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2: Switch Case Dropdown & Honesty Badge */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium hidden lg:inline">Switch Case:</span>
          {cases.length > 0 ? (
            <select
              value={activeCase?.id || ''}
              onChange={(e) => selectCase(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-md px-2.5 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
            >
              {cases.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.patientName} ({s.archType.toUpperCase()})
                </option>
              ))}
            </select>
          ) : (
            <span className="bg-slate-50 border border-slate-200 text-slate-400 text-xs rounded-md px-2.5 py-1.5 font-mono">
              No active case
            </span>
          )}
        </div>

        {/* Small persistent honesty indicator */}
        <div className="relative">
          <div
            onMouseEnter={() => setShowHonestyTooltip(true)}
            onMouseLeave={() => setShowHonestyTooltip(false)}
            className="flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded cursor-help"
          >
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span className="hidden xl:inline">Simulated preview</span>
          </div>
          {showHonestyTooltip && (
            <div className="absolute right-0 top-full mt-1.5 w-64 p-2.5 bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded-lg shadow-xl z-30">
              Preview reconstruction · simulated, not computed from your photos yet. Connects to backend API via VITE_RECONSTRUCTION_MODE.
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Navigation back to Landing Page & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <ThemeToggle variant="compact" />

        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Return to Landing Page"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Landing Page</span>
        </button>

        {currentPage !== 'new_scan' ? (
          <button
            onClick={() => onNavigate('new_scan')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('analysis')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Return to 3D Analysis</span>
          </button>
        )}
      </div>
    </header>
  );
};
