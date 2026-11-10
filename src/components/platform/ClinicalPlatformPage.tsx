/**
 * DENT X — Clinical Platform Workstation (/app)
 * 
 * Rebuilt as a zero-state, upload-driven 3D dental reconstruction experience.
 *   - Zero state: No seeded sample scans, KPIs = 0, Header says "No active case"
 *   - Background 7-stage reconstruction pipeline execution
 *   - Completion toast alert with direct launch to 3D Analysis
 *   - All navigation routes and collapsible sidebar preserved
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPage, Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { DashboardPage } from '../dashboard/DashboardPage';
import { NewScanPage } from '../newscan/NewScanPage';
import { ProcessingPage } from '../processing/ProcessingPage';
import { AnalysisPage } from '../viewer/AnalysisPage';
import { ComparisonPage } from '../comparison/ComparisonPage';
import { ReportsPage } from '../reports/ReportsPage';
import { ScanHistoryPage } from '../history/ScanHistoryPage';
import { SettingsPage } from '../settings/SettingsPage';
import { ReconstructionProvider, useReconstruction } from '../../context/ReconstructionContext';
import { NumberingSystem } from '../../types/dental';
import { CheckCircle2, Box, X, ArrowRight } from 'lucide-react';

const ClinicalPlatformInner: React.FC = () => {
  const navigate = useNavigate();
  const { activeCase, selectCase, toast, dismissToast } = useReconstruction();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [numberingSystem, setNumberingSystem] = useState<NumberingSystem>('fdi');

  const handleGoHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartProcessing = () => {
    setCurrentPage('processing');
  };

  const handleProcessingComplete = () => {
    setCurrentPage('analysis');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      {/* Global Background Reconstruction Completion Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white border border-teal-500/40 rounded-2xl p-4 shadow-2xl max-w-sm flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-xs font-bold text-white">{toast.title}</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{toast.message}</p>
            <div className="pt-1.5 flex items-center gap-2">
              <button
                onClick={async () => {
                  await selectCase(toast.caseId);
                  setCurrentPage('analysis');
                  dismissToast();
                }}
                className="px-3 py-1 bg-teal-400 hover:bg-teal-300 text-slate-950 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Open 3D Analysis</span>
              </button>
              <button
                onClick={dismissToast}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onGoHome={handleGoHome}
      />

      {/* 2. Main Content Area */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:pl-[250px]' : 'pl-0'
        } overflow-hidden`}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onGoHome={handleGoHome}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50">
          {currentPage === 'dashboard' && (
            <DashboardPage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'new_scan' && (
            <NewScanPage onStartProcessing={handleStartProcessing} />
          )}

          {currentPage === 'processing' && (
            <ProcessingPage onComplete={handleProcessingComplete} />
          )}

          {currentPage === 'analysis' && (
            <AnalysisPage
              numberingSystem={numberingSystem}
              onChangeNumberingSystem={setNumberingSystem}
              onNavigateToNewScan={() => setCurrentPage('new_scan')}
              onNavigateToComparison={() => setCurrentPage('comparison')}
              onNavigateToReport={() => setCurrentPage('reports')}
            />
          )}

          {currentPage === 'comparison' && (
            <ComparisonPage
              onNavigateToAnalysis={() => setCurrentPage('analysis')}
              onNavigateToNewScan={() => setCurrentPage('new_scan')}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsPage onNavigateToAnalysis={() => setCurrentPage('analysis')} />
          )}

          {currentPage === 'history' && (
            <ScanHistoryPage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              numberingSystem={numberingSystem}
              onChangeNumberingSystem={setNumberingSystem}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export const ClinicalPlatformPage: React.FC = () => {
  return (
    <ReconstructionProvider>
      <ClinicalPlatformInner />
    </ReconstructionProvider>
  );
};
