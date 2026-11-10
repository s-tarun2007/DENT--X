/**
 * DENT X — Synchronized 2D Dental Odontogram Chart
 * 
 * Interactive anatomical dental arch diagram supporting FDI, Universal, and Palmer numbering.
 * Strictly synchronized with the 3D WebGL viewport selection.
 */

import React from 'react';
import { AnalyzedTooth } from '../../utils/proceduralDentalEngine';
import { NumberingSystem } from '../../types/dental';

interface ToothChartProps {
  teeth: AnalyzedTooth[];
  selectedToothFdi: number | null;
  onSelectToothFdi: (fdi: number | null) => void;
  numberingSystem: NumberingSystem;
  onToggleNumberingSystem: (sys: NumberingSystem) => void;
}

export const ToothChart: React.FC<ToothChartProps> = ({
  teeth,
  selectedToothFdi,
  onSelectToothFdi,
  numberingSystem,
  onToggleNumberingSystem,
}) => {
  // Sort into 4 anatomical quadrants
  // Q1 (Upper Right: 17 -> 11), Q2 (Upper Left: 21 -> 27)
  // Q4 (Lower Right: 47 -> 41), Q3 (Lower Left: 31 -> 37)
  const q1 = teeth.filter((t) => t.quadrant === 1).sort((a, b) => b.fdi - a.fdi);
  const q2 = teeth.filter((t) => t.quadrant === 2).sort((a, b) => a.fdi - b.fdi);
  const q4 = teeth.filter((t) => t.quadrant === 4).sort((a, b) => b.fdi - a.fdi);
  const q3 = teeth.filter((t) => t.quadrant === 3).sort((a, b) => a.fdi - b.fdi);

  const getLabel = (t: AnalyzedTooth) => {
    if (numberingSystem === 'universal') return String(t.universalNumber);
    if (numberingSystem === 'palmer') return t.palmerCode;
    return String(t.fdi);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
      {/* Header and Numbering Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            Anatomical Odontogram Chart
          </h3>
          <p className="text-[11px] text-slate-500">
            Click any tooth to synchronize 3D camera & landmark inspection
          </p>
        </div>

        {/* Numbering Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px] font-medium font-mono">
          {(['fdi', 'universal', 'palmer'] as const).map((sys) => (
            <button
              key={sys}
              onClick={() => onToggleNumberingSystem(sys)}
              className={`px-2 py-0.5 rounded uppercase transition-colors cursor-pointer ${
                numberingSystem === sys
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </div>

      {/* Arch Grid */}
      <div className="space-y-3">
        {/* Upper Arch (Maxillary) */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 px-1">
            <span>Right (Q1)</span>
            <span className="font-semibold text-slate-600">Maxillary Arch (Upper)</span>
            <span>Left (Q2)</span>
          </div>

          <div className="flex items-center justify-center gap-1 overflow-x-auto pb-1">
            {/* Q1 */}
            <div className="flex items-center gap-1">
              {q1.map((tooth) => {
                const isSelected = selectedToothFdi === tooth.fdi;
                return (
                  <button
                    key={tooth.fdi}
                    onClick={() => onSelectToothFdi(isSelected ? null : tooth.fdi)}
                    className={`w-7 h-9 rounded flex flex-col items-center justify-center border text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white font-bold ring-2 ring-teal-200 scale-105'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                    title={`${tooth.name} (FDI #${tooth.fdi})`}
                  >
                    <span>{getLabel(tooth)}</span>
                    <span className="text-[8px] opacity-75 font-sans capitalize">
                      {tooth.type.slice(0, 1)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dental Midline */}
            <div className="w-[1.5px] h-9 bg-teal-500 mx-0.5 rounded-full opacity-60" title="Dental Midline" />

            {/* Q2 */}
            <div className="flex items-center gap-1">
              {q2.map((tooth) => {
                const isSelected = selectedToothFdi === tooth.fdi;
                return (
                  <button
                    key={tooth.fdi}
                    onClick={() => onSelectToothFdi(isSelected ? null : tooth.fdi)}
                    className={`w-7 h-9 rounded flex flex-col items-center justify-center border text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white font-bold ring-2 ring-teal-200 scale-105'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                    title={`${tooth.name} (FDI #${tooth.fdi})`}
                  >
                    <span>{getLabel(tooth)}</span>
                    <span className="text-[8px] opacity-75 font-sans capitalize">
                      {tooth.type.slice(0, 1)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lower Arch (Mandibular) */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 px-1">
            <span>Right (Q4)</span>
            <span className="font-semibold text-slate-600">Mandibular Arch (Lower)</span>
            <span>Left (Q3)</span>
          </div>

          <div className="flex items-center justify-center gap-1 overflow-x-auto pb-1">
            {/* Q4 */}
            <div className="flex items-center gap-1">
              {q4.map((tooth) => {
                const isSelected = selectedToothFdi === tooth.fdi;
                return (
                  <button
                    key={tooth.fdi}
                    onClick={() => onSelectToothFdi(isSelected ? null : tooth.fdi)}
                    className={`w-7 h-9 rounded flex flex-col items-center justify-center border text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white font-bold ring-2 ring-teal-200 scale-105'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                    title={`${tooth.name} (FDI #${tooth.fdi})`}
                  >
                    <span>{getLabel(tooth)}</span>
                    <span className="text-[8px] opacity-75 font-sans capitalize">
                      {tooth.type.slice(0, 1)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dental Midline */}
            <div className="w-[1.5px] h-9 bg-teal-500 mx-0.5 rounded-full opacity-60" title="Dental Midline" />

            {/* Q3 */}
            <div className="flex items-center gap-1">
              {q3.map((tooth) => {
                const isSelected = selectedToothFdi === tooth.fdi;
                return (
                  <button
                    key={tooth.fdi}
                    onClick={() => onSelectToothFdi(isSelected ? null : tooth.fdi)}
                    className={`w-7 h-9 rounded flex flex-col items-center justify-center border text-[11px] font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white font-bold ring-2 ring-teal-200 scale-105'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                    title={`${tooth.name} (FDI #${tooth.fdi})`}
                  >
                    <span>{getLabel(tooth)}</span>
                    <span className="text-[8px] opacity-75 font-sans capitalize">
                      {tooth.type.slice(0, 1)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
