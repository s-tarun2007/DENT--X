/**
 * DENT X — Tooth Morphometric & Landmark Panel
 * Displays individual segmented crown biometrics, FDI/Universal/Palmer notation,
 * and exact 3D coordinates for all 6 anatomical landmarks.
 */

import React from 'react';
import { AnalyzedTooth, ArchMetrics } from '../../utils/proceduralDentalEngine';
import { ShieldCheck, Crosshair, MapPin, Sparkles, Info, X } from 'lucide-react';

interface ToothInfoPanelProps {
  tooth: AnalyzedTooth | null;
  archMetrics?: ArchMetrics;
  onClearSelection: () => void;
}

export const ToothInfoPanel: React.FC<ToothInfoPanelProps> = ({
  tooth,
  archMetrics,
  onClearSelection,
}) => {
  if (!tooth) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              Tooth Anatomy Inspector
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Idle Selection</span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tap any segmented tooth crown in the 3D viewport or odontogram chart to inspect its 6 anatomical landmarks, mesiodistal widths, and clinical torque.
        </p>

        {archMetrics && (
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-mono uppercase text-slate-400">Intercanine Width</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {archMetrics.intercanineWidthMm} mm
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-mono uppercase text-slate-400">Intermolar Width</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {archMetrics.intermolarWidthMm} mm
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-mono uppercase text-slate-400">Arch Perimeter</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {archMetrics.perimeterMm} mm
              </div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[10px] font-mono uppercase text-slate-400">Arch Depth</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {archMetrics.depthMm} mm
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const landmarksList = [
    { name: 'Mesial Point', key: 'Mesial', color: 'text-teal-600', coord: tooth.landmarks.Mesial },
    { name: 'Distal Point', key: 'Distal', color: 'text-sky-600', coord: tooth.landmarks.Distal },
    { name: 'Cusp Tip / Incisal', key: 'Cusp', color: 'text-amber-600', coord: tooth.landmarks.Cusp },
    { name: 'Inner Point (Lingual)', key: 'InnerPoint', color: 'text-purple-600', coord: tooth.landmarks.InnerPoint },
    { name: 'Outer Point (Buccal)', key: 'OuterPoint', color: 'text-rose-600', coord: tooth.landmarks.OuterPoint },
    { name: 'Facial Point', key: 'FacialPoint', color: 'text-emerald-600', coord: tooth.landmarks.FacialPoint },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[11px] font-mono font-bold">
              FDI #{tooth.fdi}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
              Univ #{tooth.universalNumber}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
              Palmer {tooth.palmerCode}
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 mt-1.5">
            {tooth.name}
          </h3>
          <div className="text-[10px] text-slate-400 font-mono capitalize">
            {tooth.arch} Arch · Quadrant {tooth.quadrant} · {tooth.type.replace('_', ' ')}
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="Deselect tooth"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Dimensions */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="text-[10px] font-mono uppercase text-slate-400">MD Width</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            {tooth.mesiodistalWidthMm} <span className="text-[10px] font-normal text-slate-500">mm</span>
          </div>
        </div>

        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="text-[10px] font-mono uppercase text-slate-400">BL Width</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            {tooth.buccolingualWidthMm} <span className="text-[10px] font-normal text-slate-500">mm</span>
          </div>
        </div>

        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
          <div className="text-[10px] font-mono uppercase text-slate-400">Height</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
            {tooth.crownHeightMm} <span className="text-[10px] font-normal text-slate-500">mm</span>
          </div>
        </div>
      </div>

      {/* Torque & Angulation */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-slate-500">Torque:</span>
          <span className="font-semibold text-slate-800">
            {tooth.torqueAngleDeg > 0 ? `+${tooth.torqueAngleDeg}°` : `${tooth.torqueAngleDeg}°`}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-slate-500">Angulation:</span>
          <span className="font-semibold text-slate-800">
            {tooth.angulationDeg > 0 ? `+${tooth.angulationDeg}°` : `${tooth.angulationDeg}°`}
          </span>
        </div>
      </div>

      {/* 6 Anatomical Landmarks Table */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
          <span>6 Anatomical Landmarks</span>
          <span>X, Y, Z (mm)</span>
        </div>

        <div className="space-y-1 text-[11px] font-mono bg-slate-50 rounded-lg p-2 border border-slate-100">
          {landmarksList.map((lm) => (
            <div key={lm.key} className="flex items-center justify-between py-0.5 border-b border-slate-100/80 last:border-0">
              <span className={`font-semibold ${lm.color}`}>{lm.name}</span>
              <span className="text-slate-600 text-[10px]">
                [{lm.coord[0]}, {lm.coord[1]}, {lm.coord[2]}]
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Condition */}
      <div className="p-2.5 bg-teal-50/60 border border-teal-100 rounded-lg flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium text-[11px]">Diagnostic Morphology:</span>
        <span className="font-bold text-teal-800 text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-teal-200">
          {tooth.condition}
        </span>
      </div>
    </div>
  );
};
