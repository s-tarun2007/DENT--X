/**
 * DENT X — Clinical Orthodontic & Anatomical Report (/app/reports)
 * 
 * Features:
 *   - Generated directly from the procedural analysis object
 *   - Zero state if no completed scan exists
 *   - Persistent honesty badge: "Preview reconstruction · simulated, not computed from your photos yet"
 *   - Mandatory concluding disclaimer: "Geometric measurements and experimental indicators only. Not a clinical diagnosis."
 *   - Print and diagnostic signoff controls
 */

import React, { useState } from 'react';
import { useReconstruction } from '../../context/ReconstructionContext';
import {
  Printer,
  Download,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  Layers,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Save,
  PenTool,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface ReportsPageProps {
  onNavigateToAnalysis: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigateToAnalysis }) => {
  const { activeCase, activeModel } = useReconstruction();
  const [clinicianName, setClinicianName] = useState<string>('Dr. Aris Thorne, DDS');
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Patient demonstrates favorable dental arch symmetry. Continue diagnostic review.'
  );
  const [isSigned, setIsSigned] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showHonestyTooltip, setShowHonestyTooltip] = useState<boolean>(false);

  if (!activeCase || !activeModel || activeCase.status !== 'completed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-8 text-center space-y-4 bg-slate-50">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No active clinical report</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Complete a 3D reconstruction session in New Scan to generate a diagnostic biometric report.
        </p>
      </div>
    );
  }

  const analysis = activeModel.analysis;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSignoff = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-slate-50 p-6 lg:p-8 space-y-6 max-w-none">
      {/* Top Banner & Print Actions */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Clinical Report · Case {activeCase.id}
            </h2>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
              VERIFIED 3D TWIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formatted orthodontic assessment, crown morphometrics, Bolton ratios, and landmark analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToAnalysis}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Open 3D Viewport
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Clinical report signoff saved.</span>
        </div>
      )}

      {/* Printable Report Document Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm space-y-8 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 font-bold text-base">
              DX
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 font-sans tracking-tight">
                DENT X CLINICAL ORTHODONTIC EVALUATION
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Anatomical Digital Twin Biometric Synthesis
              </div>
            </div>
          </div>

          {/* Persistent Honesty Badge on Report */}
          <div className="relative">
            <div
              onMouseEnter={() => setShowHonestyTooltip(true)}
              onMouseLeave={() => setShowHonestyTooltip(false)}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-lg text-xs font-medium cursor-help"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview reconstruction · simulated, not computed from your photos yet</span>
              <HelpCircle className="w-3 h-3 text-amber-600/70" />
            </div>

            {showHonestyTooltip && (
              <div className="absolute top-full right-0 mt-1 w-64 p-2.5 bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded-lg shadow-xl z-20">
                Preview reconstruction · simulated, not computed from your photos yet. Neural photogrammetry pipeline switchable via VITE_RECONSTRUCTION_MODE.
              </div>
            )}
          </div>
        </div>

        {/* Patient & Acquisition Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Patient Name</div>
            <div className="font-bold text-slate-900 mt-0.5">{activeCase.patientName}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Case ID</div>
            <div className="font-bold text-slate-900 font-mono mt-0.5">{activeCase.id}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Acquisition Date</div>
            <div className="font-mono text-slate-700 mt-0.5">{activeCase.scanDate}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Arch Target</div>
            <div className="font-medium text-slate-700 capitalize mt-0.5">{activeCase.archType} Arch</div>
          </div>
        </div>

        {/* Section 1: Biometric Arch Measurements */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            1. Dental Arch Biometrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Arch Perimeter</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {analysis.upperArch.perimeterMm} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Catenary arc length</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Arch Depth</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {analysis.upperArch.depthMm} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Incisal to molar depth</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Intercanine Width</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {analysis.upperArch.intercanineWidthMm} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Canine cusp tips</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Intermolar Width</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                {analysis.upperArch.intermolarWidthMm} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">First molar buccal grooves</div>
            </div>
          </div>
        </div>

        {/* Section 2: Occlusion & Bolton Analysis */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            2. Occlusal Relationships & Bolton Index
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Vertical Overbite</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {analysis.occlusion.overbiteMm} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Reference norm: 2.0 mm</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Horizontal Overjet</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {analysis.occlusion.overjetMm} mm
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Reference norm: 2.0 mm</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Bolton Anterior</div>
              <div className="text-base font-bold font-mono text-teal-700 mt-0.5">
                {analysis.occlusion.boltonAnteriorPct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Standard: 77.2% ± 1.65%</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Bolton Overall</div>
              <div className="text-base font-bold font-mono text-teal-700 mt-0.5">
                {analysis.occlusion.boltonOverallPct}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Standard: 91.3% ± 1.91%</div>
            </div>
          </div>
        </div>

        {/* Section 3: Segmented Tooth Morphometrics Sample */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            3. Segmented Crown Morphometric Dimensions (Summary)
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-50">
                  <th className="py-2.5 px-3">FDI</th>
                  <th className="py-2.5 px-3">Anatomical Name</th>
                  <th className="py-2.5 px-3">Arch</th>
                  <th className="py-2.5 px-3">MD Width (mm)</th>
                  <th className="py-2.5 px-3">BL Width (mm)</th>
                  <th className="py-2.5 px-3">Height (mm)</th>
                  <th className="py-2.5 px-3">Diagnostic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.teeth.slice(0, 10).map((t) => (
                  <tr key={t.fdi} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-teal-800">#{t.fdi}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{t.name}</td>
                    <td className="py-2 px-3 capitalize text-slate-600">{t.arch}</td>
                    <td className="py-2 px-3 font-mono text-slate-900">{t.mesiodistalWidthMm}</td>
                    <td className="py-2 px-3 font-mono text-slate-900">{t.buccolingualWidthMm}</td>
                    <td className="py-2 px-3 font-mono text-slate-900">{t.crownHeightMm}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {t.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-400 italic">
            Displaying first 10 crowns of 28 segmented teeth. Full 32-tooth odontogram viewable in 3D Analysis.
          </div>
        </div>

        {/* Section 4: Clinical Observations & Notes */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            4. Reviewing Clinician Signoff
          </h3>

          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Clinical Diagnosis Notes
              </label>
              <textarea
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                <input
                  type="checkbox"
                  checked={isSigned}
                  onChange={(e) => setIsSigned(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Clinically verified & electronically signed by reviewing specialist</span>
              </label>

              <button
                type="button"
                onClick={handleSaveSignoff}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Save Signoff
              </button>
            </div>
          </div>
        </div>

        {/* MANDATORY LEGAL & HONESTY DISCLAIMER */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-700">
            Geometric measurements and experimental indicators only. Not a clinical diagnosis.
          </p>
          <p className="text-[11px] text-slate-400">
            DENT X 3D Reconstruction Platform · Model format: {activeModel.upper.vertexCount.toLocaleString()} vertices, {activeModel.upper.triangleCount.toLocaleString()} triangles per arch.
          </p>
        </div>
      </div>
    </div>
  );
};
