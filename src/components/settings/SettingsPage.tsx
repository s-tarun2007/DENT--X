/**
 * DENT X — Settings & Clinical Configuration Page
 * Configures numbering systems, 3D viewport rendering parameters,
 * backend engine health telemetry, and database backup exports.
 */

import React, { useState, useEffect } from 'react';
import { NumberingSystem, FastApiConfig } from '../../types/dental';
import { apiService } from '../../services/apiService';
import {
  Settings,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Monitor,
  Save,
  Layers,
  Sparkles,
  Download,
  Database,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SettingsPageProps {
  numberingSystem: NumberingSystem;
  onChangeNumberingSystem: (sys: NumberingSystem) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  numberingSystem,
  onChangeNumberingSystem,
}) => {
  const { theme, setTheme, allThemes } = useTheme();
  const [fastApiConfig, setFastApiConfig] = useState<FastApiConfig>(apiService.getConfig());
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string; latencyMs: number; data?: any } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Initial health check
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await apiService.pingBackend();
      setPingResult(res);
      setFastApiConfig(apiService.getConfig());
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveConfig = () => {
    apiService.updateConfig(fastApiConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportDatabase = async () => {
    const patients = await apiService.listPatients();
    const scans = await apiService.listScans();
    const backupData = {
      platform: 'DENT X 3D Dental Reconstruction & Analysis',
      exportTimestamp: new Date().toISOString(),
      patientsCount: patients.length,
      scansCount: scans.length,
      patients,
      scans,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dentx_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-slate-50 p-6 lg:p-8 space-y-6 max-w-none">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Clinical Preferences & Engine Integration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dental charting nomenclature, persistent database backup, and backend AI service endpoints.
          </p>
        </div>

        <button
          onClick={handleExportDatabase}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
        >
          <Download className="w-3.5 h-3.5 text-teal-600" />
          <span>Export Database JSON Backup</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Clinical workspace preferences saved successfully.</span>
        </div>
      )}

      {exportSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Full clinical database backup exported to JSON file.</span>
        </div>
      )}

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Dental Nomenclature & Unit Settings */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Dental Charting Nomenclature
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select standard tooth numbering notation for odontograms and biometric tables.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* FDI System */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="numbering"
                value="fdi"
                checked={numberingSystem === 'fdi'}
                onChange={() => onChangeNumberingSystem('fdi')}
                className="mt-0.5 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-slate-900">
                  FDI Two-Digit System (ISO 3950)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Standard worldwide notation (e.g. Tooth 11 = Upper Right Central Incisor, Tooth 36 = Lower Left 1st Molar).
                </div>
              </div>
            </label>

            {/* Universal System */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="numbering"
                value="universal"
                checked={numberingSystem === 'universal'}
                onChange={() => onChangeNumberingSystem('universal')}
                className="mt-0.5 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-slate-900">
                  Universal Numbering System (American Standard)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Sequential 1 through 32 notation (e.g. Tooth 8 = Upper Right Central Incisor, Tooth 19 = Lower Left 1st Molar).
                </div>
              </div>
            </label>

            {/* Palmer Notation */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="numbering"
                value="palmer"
                checked={numberingSystem === 'palmer'}
                onChange={() => onChangeNumberingSystem('palmer')}
                className="mt-0.5 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <div className="font-semibold text-slate-900">
                  Palmer Dental Notation
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Quadrant brackets with tooth index 1 through 8 (e.g. 1┘, └1, ┌6, 6┐).
                </div>
              </div>
            </label>
          </div>

          {/* Accent Color Theme Switcher */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-800">Accent Color Theme</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Shifts primary clinical highlights, laser scans, and telemetry indicators across all modules.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allThemes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{
                          backgroundColor: t.accent,
                          boxShadow: isActive ? `0 0 10px ${t.accent}` : undefined,
                        }}
                      />
                      {isActive && <span className="text-[10px] font-mono font-bold text-teal-400">ACTIVE</span>}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-semibold leading-tight capitalize">{t.id}</div>
                      <div className="text-[10px] opacity-75 font-mono">{t.name.split(' ')[1] || t.id}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Backend & AI Engine Integration Settings */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Backend Engine Health & AI Vision
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrated Express server, persistent database storage, and Gemini AI vision pipeline.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                API Base URL Endpoint
              </label>
              <input
                type="text"
                value={fastApiConfig.baseUrl}
                onChange={(e) => setFastApiConfig({ ...fastApiConfig, baseUrl: e.target.value })}
                placeholder="/api"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Test Connection Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isPinging}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>{isPinging ? 'Testing Endpoint...' : 'Ping Engine Health'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-teal-400" />
                <span>Save Config</span>
              </button>
            </div>

            {pingResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  pingResult.success
                    ? 'bg-teal-50/70 border-teal-200 text-teal-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5 text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Engine Online: {pingResult.latencyMs}ms Latency</span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  {pingResult.message}
                </div>
                {pingResult.data?.database && (
                  <div className="text-[10px] font-mono text-teal-800 pt-1 border-t border-teal-100 flex gap-3">
                    <span>Patients: {pingResult.data.database.patients}</span>
                    <span>Scans: {pingResult.data.database.scans}</span>
                    <span>Background Jobs: {pingResult.data.database.jobs}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
