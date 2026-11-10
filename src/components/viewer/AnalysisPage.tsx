/**
 * DENT X — 3D Analysis & Diagnostic Workstation (/app/analysis)
 * 
 * Features:
 *   - Zero state: If no active case or reconstruction pending, shows empty viewport
 *     "No reconstruction yet. Upload photos in New Scan." All metrics show "—".
 *   - Next-gen DentalViewer3D (exocad/3Shape pastel segmentation, touch controls, landmark spheres)
 *   - Synchronized Odontogram ToothChart & ToothInfoPanel
 *   - Bottom Drawer Tables: Tooth parameters, Inter-tooth distances, Arch metrics, Occlusion/Bolton, Indicators
 *   - Persistent Honesty Badge & OBJ/STL download
 */

import React, { useState } from 'react';
import { useReconstruction } from '../../context/ReconstructionContext';
import { DentalViewer3D, ActiveArchSelection } from './DentalViewer3D';
import { ToothChart } from './ToothChart';
import { ToothInfoPanel } from './ToothInfoPanel';
import { NumberingSystem } from '../../types/dental';
import {
  Box,
  Plus,
  ArrowRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Table,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface AnalysisPageProps {
  numberingSystem: NumberingSystem;
  onChangeNumberingSystem: (sys: NumberingSystem) => void;
  onNavigateToNewScan: () => void;
  onNavigateToComparison: () => void;
  onNavigateToReport: () => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  numberingSystem,
  onChangeNumberingSystem,
  onNavigateToNewScan,
  onNavigateToComparison,
  onNavigateToReport,
}) => {
  const { activeCase, activeModel } = useReconstruction();
  const [selectedToothFdi, setSelectedToothFdi] = useState<number | null>(null);
  const [activeArch, setActiveArch] = useState<ActiveArchSelection>('both');
  const [bottomDrawerTab, setBottomDrawerTab] = useState<'teeth' | 'gaps' | 'arch' | 'occlusion' | 'indicators'>('teeth');
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState<boolean>(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // If no case or case is still processing / no model
  const isZeroState = !activeCase || !activeModel || activeCase.status !== 'completed';

  const selectedTooth = React.useMemo(() => {
    if (!activeModel || !selectedToothFdi) return null;
    return activeModel.analysis.teeth.find((t) => t.fdi === selectedToothFdi) || null;
  }, [activeModel, selectedToothFdi]);

  // OBJ Export from raw jaw model buffers
  const handleExportObj = () => {
    if (!activeModel || !activeCase) return;
    let obj = `# DENT X Digital Twin Export - Case ${activeCase.id}\n# Patient: ${activeCase.patientName}\n# Units: Millimeters (mm)\n\n`;

    const appendJaw = (raw: typeof activeModel.upper, name: string) => {
      obj += `g ${name}\n`;
      const pos = raw.positions;
      for (let i = 0; i < pos.length; i += 3) {
        obj += `v ${pos[i].toFixed(3)} ${pos[i + 1].toFixed(3)} ${pos[i + 2].toFixed(3)}\n`;
      }
      const idx = raw.indices;
      for (let i = 0; i < idx.length; i += 3) {
        obj += `f ${idx[i] + 1} ${idx[i + 1] + 1} ${idx[i + 2] + 1}\n`;
      }
    };

    appendJaw(activeModel.upper, 'MaxillaryArch');
    appendJaw(activeModel.lower, 'MandibularArch');

    const blob = new Blob([obj], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCase.id}_reconstructed_model.obj`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice(`Downloaded Wavefront 3D mesh: ${activeCase.id}_reconstructed_model.obj`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // STL Export from raw jaw model buffers
  const handleExportStl = () => {
    if (!activeModel || !activeCase) return;
    let stl = `solid DENT_X_${activeCase.id.replace(/[^a-zA-Z0-9]/g, '_')}\n`;

    const appendJawStl = (raw: typeof activeModel.upper) => {
      const pos = raw.positions;
      const idx = raw.indices;
      for (let i = 0; i < idx.length; i += 3) {
        const i1 = idx[i] * 3;
        const i2 = idx[i + 1] * 3;
        const i3 = idx[i + 2] * 3;
        stl += `  facet normal 0 0 0\n    outer loop\n`;
        stl += `      vertex ${pos[i1].toFixed(3)} ${pos[i1 + 1].toFixed(3)} ${pos[i1 + 2].toFixed(3)}\n`;
        stl += `      vertex ${pos[i2].toFixed(3)} ${pos[i2 + 1].toFixed(3)} ${pos[i2 + 2].toFixed(3)}\n`;
        stl += `      vertex ${pos[i3].toFixed(3)} ${pos[i3 + 1].toFixed(3)} ${pos[i3 + 2].toFixed(3)}\n`;
        stl += `    endloop\n  endfacet\n`;
      }
    };

    appendJawStl(activeModel.upper);
    appendJawStl(activeModel.lower);
    stl += `endsolid DENT_X_${activeCase.id.replace(/[^a-zA-Z0-9]/g, '_')}\n`;

    const blob = new Blob([stl], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCase.id}_reconstructed_model.stl`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice(`Downloaded 3D Printable STL: ${activeCase.id}_reconstructed_model.stl`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-slate-50 p-6 space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xs">
            3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {activeCase ? `Case ${activeCase.id} · ${activeCase.patientName}` : 'No active case'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {activeCase ? `${activeCase.patientAge}y · ${activeCase.patientGender}` : '—'}
              </span>
              <span className="text-slate-300">·</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  activeCase?.status === 'completed'
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {activeCase?.status === 'completed'
                  ? 'WATERTIGHT 3D TWIN'
                  : activeCase
                  ? 'PROCESSING IN PROGRESS'
                  : 'ZERO STATE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {activeCase
                ? `Acquisition: ${activeCase.scanDate} · ${activeCase.images?.length || 0} photos`
                : 'Upload intraoral photographs in New Scan to construct anatomical 3D digital twin.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeCase?.status === 'completed' && (
            <>
              <button
                onClick={onNavigateToComparison}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Comparison
              </button>
              <button
                onClick={onNavigateToReport}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clinical Report
              </button>

              <button
                onClick={handleExportObj}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Download Wavefront OBJ 3D mesh"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>.OBJ</span>
              </button>

              <button
                onClick={handleExportStl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Download 3D Printable STL mesh"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span>.STL</span>
              </button>
            </>
          )}

          {isZeroState && (
            <button
              onClick={onNavigateToNewScan}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Acquire New Scan</span>
            </button>
          )}
        </div>
      </div>

      {exportNotice && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Diagnostic Workspace */}
      {isZeroState ? (
        /* ZERO STATE EMPTY VIEWPORT */
        <div className="flex-1 flex flex-col items-center justify-center min-h-[520px] bg-white border border-slate-200/90 rounded-2xl p-8 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-xs">
            <Box className="w-8 h-8 text-teal-600" />
          </div>

          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              No reconstruction yet. Upload photos in New Scan.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload 10–25 intraoral dental photographs (frontal retracted, occlusal, buccal views) to synthesize a watertight 3D digital twin with segmented tooth crowns and landmark biometrics.
            </p>
          </div>

          <button
            onClick={onNavigateToNewScan}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <span>Go to New Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Zero State Parameters Card (All values show "—") */}
          <div className="w-full max-w-2xl pt-6 border-t border-slate-100">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">
              Orthodontic Biometrics
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] font-mono text-slate-400">Arch Perimeter</div>
                <div className="text-lg font-mono font-bold text-slate-400 mt-0.5">—</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] font-mono text-slate-400">Arch Depth</div>
                <div className="text-lg font-mono font-bold text-slate-400 mt-0.5">—</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] font-mono text-slate-400">Overbite / Overjet</div>
                <div className="text-lg font-mono font-bold text-slate-400 mt-0.5">—</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <div className="text-[10px] font-mono text-slate-400">Bolton Anterior</div>
                <div className="text-lg font-mono font-bold text-slate-400 mt-0.5">—</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* POPULATED 3D ANALYSIS VIEWPORT */
        <div className="space-y-6 flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] xl:min-h-[680px]">
            {/* Left 8 Cols: Next-Gen 3D WebGL Viewer */}
            <div className="lg:col-span-8 flex flex-col h-[600px] xl:h-[680px] min-h-[540px]">
              <DentalViewer3D
                model={activeModel}
                caseId={activeCase.id}
                patientName={activeCase.patientName}
                selectedToothFdi={selectedToothFdi}
                onSelectToothFdi={setSelectedToothFdi}
                activeArch={activeArch}
                onChangeActiveArch={setActiveArch}
              />
            </div>

            {/* Right 4 Cols: Synchronized ToothInfoPanel & Odontogram ToothChart */}
            <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto max-h-[680px]">
              <ToothInfoPanel
                tooth={selectedTooth}
                archMetrics={activeModel.analysis.arch}
                onClearSelection={() => setSelectedToothFdi(null)}
              />

              <ToothChart
                teeth={activeModel.analysis.teeth}
                selectedToothFdi={selectedToothFdi}
                onSelectToothFdi={setSelectedToothFdi}
                numberingSystem={numberingSystem}
                onToggleNumberingSystem={onChangeNumberingSystem}
              />
            </div>
          </div>

          {/* Bottom Drawer Tables (Tooth parameters, Inter-tooth distances, Arch metrics, Occlusion/Bolton, Indicators) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <Table className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  Clinical Measurements & Diagnostic Tables
                </span>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
                  {(
                    [
                      ['teeth', 'Tooth Parameters'],
                      ['gaps', 'Inter-Tooth Distances'],
                      ['arch', 'Arch Metrics'],
                      ['occlusion', 'Occlusion & Bolton'],
                      ['indicators', `Indicators (${activeModel.analysis.issues.length})`],
                    ] as const
                  ).map(([tabKey, tabLabel]) => (
                    <button
                      key={tabKey}
                      onClick={() => {
                        setBottomDrawerTab(tabKey);
                        setIsBottomDrawerOpen(true);
                      }}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        bottomDrawerTab === tabKey
                          ? 'bg-white text-slate-900 font-bold shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tabLabel}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsBottomDrawerOpen((o) => !o)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                title={isBottomDrawerOpen ? 'Collapse Tables' : 'Expand Tables'}
              >
                {isBottomDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isBottomDrawerOpen && (
              <div className="p-5 text-xs overflow-x-auto">
                {/* TAB 1: Tooth Parameters Table */}
                {bottomDrawerTab === 'teeth' && (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-50">
                        <th className="py-2.5 px-3">FDI #</th>
                        <th className="py-2.5 px-3">Universal</th>
                        <th className="py-2.5 px-3">Palmer</th>
                        <th className="py-2.5 px-3">Anatomical Tooth Name</th>
                        <th className="py-2.5 px-3">Arch</th>
                        <th className="py-2.5 px-3">MD Width</th>
                        <th className="py-2.5 px-3">BL Width</th>
                        <th className="py-2.5 px-3">Height</th>
                        <th className="py-2.5 px-3">Torque</th>
                        <th className="py-2.5 px-3">Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeModel.analysis.teeth.map((t) => {
                        const isSelected = selectedToothFdi === t.fdi;
                        return (
                          <tr
                            key={t.fdi}
                            onClick={() => setSelectedToothFdi(isSelected ? null : t.fdi)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-teal-50/80 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2 px-3 font-mono font-bold text-teal-800">#{t.fdi}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">#{t.universalNumber}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{t.palmerCode}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{t.name}</td>
                            <td className="py-2 px-3 capitalize text-slate-600">{t.arch}</td>
                            <td className="py-2 px-3 font-mono text-slate-900">{t.mesiodistalWidthMm} mm</td>
                            <td className="py-2 px-3 font-mono text-slate-900">{t.buccolingualWidthMm} mm</td>
                            <td className="py-2 px-3 font-mono text-slate-900">{t.crownHeightMm} mm</td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {t.torqueAngleDeg > 0 ? `+${t.torqueAngleDeg}°` : `${t.torqueAngleDeg}°`}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  t.condition === 'Healthy Enamel'
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {t.condition}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* TAB 2: Inter-Tooth Distances */}
                {bottomDrawerTab === 'gaps' && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-500">
                      Calculated millimeter distance between adjacent contact surfaces. Distances exceeding 0.50 mm indicate clinical diastema or interdental spacing.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {activeModel.analysis.gaps.map((gap, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            gap.isProblematic
                              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                              : 'bg-slate-50 border-slate-200/80 text-slate-800'
                          }`}
                        >
                          <div>
                            <div className="font-mono font-bold">
                              #{gap.between[0]} ↔ #{gap.between[1]}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Contact Interface</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-sm">
                              {gap.contactGapMm} mm
                            </div>
                            <div
                              className={`text-[9px] font-mono uppercase font-semibold ${
                                gap.isProblematic ? 'text-rose-600' : 'text-teal-700'
                              }`}
                            >
                              {gap.isProblematic ? 'Spacing (>0.5)' : 'Tight Contact'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Arch Metrics */}
                {bottomDrawerTab === 'arch' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-900">Maxillary Arch (Upper)</span>
                        <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
                          14 Crowns
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Perimeter</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.upperArch.perimeterMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Arch Depth</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.upperArch.depthMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Intercanine Width</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.upperArch.intercanineWidthMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Intermolar Width</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.upperArch.intermolarWidthMm} mm
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-900">Mandibular Arch (Lower)</span>
                        <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
                          14 Crowns
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Perimeter</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.lowerArch.perimeterMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Arch Depth</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.lowerArch.depthMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Intercanine Width</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.lowerArch.intercanineWidthMm} mm
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Intermolar Width</div>
                          <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                            {activeModel.analysis.lowerArch.intermolarWidthMm} mm
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Occlusion & Bolton */}
                {bottomDrawerTab === 'occlusion' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Vertical Overbite</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                        {activeModel.analysis.occlusion.overbiteMm} mm
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Incisal edge overlap (Norm: 2.0 mm)</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Horizontal Overjet</div>
                      <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                        {activeModel.analysis.occlusion.overjetMm} mm
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Labial projection (Norm: 2.0 mm)</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Bolton Anterior Ratio</div>
                      <div className="text-xl font-bold font-mono text-teal-700 mt-1">
                        {activeModel.analysis.occlusion.boltonAnteriorPct}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Reference Norm: 77.2% ± 1.65%</div>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Bolton Overall Ratio</div>
                      <div className="text-xl font-bold font-mono text-teal-700 mt-1">
                        {activeModel.analysis.occlusion.boltonOverallPct}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Reference Norm: 91.3% ± 1.91%</div>
                    </div>
                  </div>
                )}

                {/* TAB 5: Clinical Indicators */}
                {bottomDrawerTab === 'indicators' && (
                  <div className="space-y-2.5">
                    {activeModel.analysis.issues.length === 0 ? (
                      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>All contact points, torque angulations, and arch metrics align within anatomical tolerances.</span>
                      </div>
                    ) : (
                      activeModel.analysis.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2.5"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{issue}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
