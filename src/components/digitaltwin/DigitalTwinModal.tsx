/**
 * DENT X — Patient Digital Twin Timeline Modal
 * Visualizes the complete longitudinal orthodontic record of a patient:
 * timeline milestones, arch biometrics evolution (intercanine, intermolar, overbite),
 * tooth displacement progressions, and one-click comparative loading.
 */

import React, { useState, useEffect } from 'react';
import { DentalScan } from '../../types/dental';
import { PatientRecord } from '../../server/db';
import { apiService } from '../../services/apiService';
import {
  X,
  Sparkles,
  GitCompare,
  Box,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  Activity
} from 'lucide-react';

interface DigitalTwinModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectScan: (scan: DentalScan) => void;
  onNavigateToAnalysis: () => void;
  onNavigateToComparison: (scanA: DentalScan, scanB: DentalScan) => void;
}

export const DigitalTwinModal: React.FC<DigitalTwinModalProps> = ({
  patientId,
  isOpen,
  onClose,
  onSelectScan,
  onNavigateToAnalysis,
  onNavigateToComparison,
}) => {
  const [patientData, setPatientData] = useState<{
    patient: PatientRecord;
    scans: DentalScan[];
    digitalTwinTimeline: any[];
  } | null>(null);
  const [selectedMilestoneScanId, setSelectedMilestoneScanId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      apiService.getPatient(patientId).then((data) => {
        if (data) {
          setPatientData(data);
          if (data.scans.length > 0) {
            setSelectedMilestoneScanId(data.scans[data.scans.length - 1].id);
          }
        }
      });
    }
  }, [isOpen, patientId]);

  if (!isOpen || !patientData) return null;

  const { patient, scans, digitalTwinTimeline } = patientData;
  const activeMilestoneScan = scans.find((s) => s.id === selectedMilestoneScanId) || scans[0];
  const baselineScan = scans.find((s) => s.isBaseline) || scans[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
              <Sparkles className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Patient Digital Twin Timeline · {patient.name}
                </h3>
                <span className="font-mono text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-semibold">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Longitudinal orthodontic record connecting original impressions, 3D meshes, and tooth movement trajectory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Patient Overview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Demographics</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {patient.age}y · {patient.gender}
              </div>
              <div className="text-[11px] text-slate-500">{patient.contactPhone || 'No phone recorded'}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Scans</div>
              <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {scans.length} Impressions
              </div>
              <div className="text-[11px] text-teal-700 font-medium">Watertight Digital Twin</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">First Baseline</div>
              <div className="font-mono text-slate-800 mt-0.5 font-medium">
                {baselineScan ? `${baselineScan.id} (${baselineScan.scanDate})` : 'None'}
              </div>
              <div className="text-[11px] text-slate-500">Pre-treatment reference</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Treatment Status</div>
              <div className="text-slate-900 mt-0.5 font-semibold flex items-center gap-1.5 text-teal-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Aligner Staging Active</span>
              </div>
              <div className="text-[11px] text-slate-500">Progressing on schedule</div>
            </div>
          </div>

          {/* Timeline Milestones Progression */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Chronological Scan Milestones
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scans.map((scan, idx) => {
                const isSelected = scan.id === activeMilestoneScan.id;
                return (
                  <div
                    key={scan.id}
                    onClick={() => setSelectedMilestoneScanId(scan.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-200 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                        {scan.isBaseline ? 'Baseline Stage 0' : `Follow-up Stage ${idx}`}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {scan.scanDate}
                      </span>
                    </div>

                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {scan.id}
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1 capitalize">
                      {scan.archType} Arch · {scan.scannerModel.slice(0, 22)}...
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Fidelity Score</span>
                      <span className="font-mono font-bold text-teal-700">
                        {scan.reconstructionQualityScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Milestone Biometrics Breakdown */}
          {activeMilestoneScan && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="font-bold text-slate-900">
                  Arch Biometrics for {activeMilestoneScan.id} ({activeMilestoneScan.scanDate})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectScan(activeMilestoneScan);
                      onClose();
                      onNavigateToAnalysis();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Box className="w-3.5 h-3.5 text-teal-400" />
                    <span>Launch in 3D View</span>
                  </button>

                  {scans.length > 1 && baselineScan.id !== activeMilestoneScan.id && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToComparison(baselineScan, activeMilestoneScan);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Compare with Baseline</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Intercanine Width</div>
                  <div className="font-mono font-bold text-slate-900 text-base mt-0.5">
                    {activeMilestoneScan.measurements?.intercanineDistanceMm} mm
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Intermolar Width</div>
                  <div className="font-mono font-bold text-slate-900 text-base mt-0.5">
                    {activeMilestoneScan.measurements?.intermolarWidthMm} mm
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Arch Perimeter</div>
                  <div className="font-mono font-bold text-slate-900 text-base mt-0.5">
                    {activeMilestoneScan.measurements?.archPerimeterMm} mm
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Overbite / Overjet</div>
                  <div className="font-mono font-bold text-slate-900 text-base mt-0.5">
                    {activeMilestoneScan.measurements?.overbiteMm} / {activeMilestoneScan.measurements?.overjetMm} mm
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Digital Twin continuously synchronized with clinical scan acquisitions.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
