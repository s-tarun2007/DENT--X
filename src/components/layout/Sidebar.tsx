/**
 * DENT X — Collapsible Clinical Navigation Sidebar (~250px width)
 * 
 * Features:
 *   - Zero state: says "No active case" when no scan is active
 *   - Background reconstruction progress badge when pipeline is executing
 *   - Preserves exact styling, collapsible drawer, and mobile backdrop
 */

import React from 'react';
import {
  LayoutDashboard,
  Scan,
  History,
  Box,
  GitCompare,
  FileText,
  Settings,
  ChevronRight,
  ShieldCheck,
  Globe,
  X,
  Activity,
  Plus,
} from 'lucide-react';
import { useReconstruction } from '../../context/ReconstructionContext';

export type AppPage =
  | 'dashboard'
  | 'new_scan'
  | 'processing'
  | 'analysis'
  | 'comparison'
  | 'reports'
  | 'history'
  | 'settings';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onGoHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  onGoHome,
}) => {
  const { activeCase, activeJob, cases } = useReconstruction();

  const navItems = [
    { id: 'dashboard' as AppPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_scan' as AppPage, label: 'New Scan', icon: Scan },
    { id: 'history' as AppPage, label: 'Scan History', icon: History },
    { id: 'analysis' as AppPage, label: '3D Analysis', icon: Box },
    { id: 'comparison' as AppPage, label: 'Comparison', icon: GitCompare },
    { id: 'reports' as AppPage, label: 'Reports', icon: FileText },
    { id: 'settings' as AppPage, label: 'Settings', icon: Settings },
  ];

  const handlePageSelect = (id: AppPage) => {
    onNavigate(id);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sliding Sidebar Container */}
      <aside
        className={`w-[250px] min-w-[250px] max-w-[250px] h-screen fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200/90 flex flex-col select-none z-50 shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Close Button */}
        <div className="h-16 px-5 border-b border-slate-200/90 flex items-center justify-between shrink-0 bg-white">
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 cursor-pointer group text-left"
            title="DENT-X Home — Return to Cinematic Landing Page"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8C5 4.5 8 2.5 12 2.5C16 2.5 19 4.5 19 8C19 12.5 17 19.5 14 21.5C12.8 22.3 11.2 22.3 10 21.5C7 19.5 5 12.5 5 8Z" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 7V15M8 11H16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-slate-900 tracking-tight text-base font-sans">DENT</span>
                <span className="font-extrabold text-teal-600 text-base">X</span>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">
                3D Dental Platform
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Background Pipeline Alert Badge if running */}
        {activeJob && activeJob.status === 'running' && (
          <div className="p-3 bg-teal-50 border-b border-teal-200/80">
            <button
              onClick={() => handlePageSelect('processing')}
              className="w-full text-left p-2.5 bg-white rounded-xl border border-teal-300 shadow-2xs hover:bg-teal-100/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-teal-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                  <span>Pipeline Active</span>
                </span>
                <span className="font-mono text-teal-700">{activeJob.overallProgressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${activeJob.overallProgressPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                Case {activeJob.caseId}
              </div>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            Clinical Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handlePageSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 border border-teal-200/80 text-teal-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Fixed Footer: Active Case Information (or Zero State) & Home Link */}
        <div className="p-3.5 border-t border-slate-200/90 bg-slate-50/70 shrink-0 space-y-2.5">
          <div className="p-3.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                Active Case
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500">
                {activeCase ? activeCase.id : 'None'}
              </span>
            </div>

            {activeCase ? (
              <>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {activeCase.patientName}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>{activeCase.patientId}</span>
                  <span>·</span>
                  <span className="capitalize">{activeCase.archType} Arch</span>
                </div>
                <button
                  onClick={() => handlePageSelect('analysis')}
                  className="mt-3 w-full py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Box className="w-3.5 h-3.5 text-teal-400" />
                  <span>Launch 3D Analysis</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-500">
                  No active case selected
                </div>
                <button
                  onClick={() => handlePageSelect('new_scan')}
                  className="w-full py-2 px-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Acquire New Scan</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onGoHome}
            className="w-full py-2 px-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200/60"
            title="Return to Landing Page"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>Landing Page</span>
          </button>

          <div className="px-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">DENT-X Clinical Engine v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
