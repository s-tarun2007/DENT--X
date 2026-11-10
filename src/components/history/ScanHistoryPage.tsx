/**
 * DENT X — Scan History & Case Archive Page (/app/history)
 * 
 * Features:
 *   - Zero state: Empty archive message when no scans exist
 *   - Searchable, filterable by status and arch
 *   - Directly bound to ReconstructionContext & IndexedDB
 *   - Direct 3D launch and delete actions
 */

import React, { useState } from 'react';
import { useReconstruction } from '../../context/ReconstructionContext';
import { AppPage } from '../layout/Sidebar';
import {
  Search,
  Box,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  History,
  ArrowRight,
} from 'lucide-react';

interface ScanHistoryPageProps {
  onNavigate: (page: AppPage) => void;
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({ onNavigate }) => {
  const { cases, selectCase, deleteCase } = useReconstruction();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [archFilter, setArchFilter] = useState<string>('all');
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredCases = cases.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = c.patientName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesArch = archFilter === 'all' || c.archType === archFilter;
    return matchesSearch && matchesStatus && matchesArch;
  });

  const confirmDelete = async (id: string) => {
    await deleteCase(id);
    setCaseToDelete(null);
    setNotice(`Case record ${id} removed.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-slate-50 p-6 lg:p-8 space-y-6 max-w-none">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Case Archive & Patient Scan History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Persistent archive of patient intraoral impressions, reconstructed 3D meshes, and digital twin records.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new_scan')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Acquisition</span>
        </button>
      </div>

      {notice && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-xs text-rose-900 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Are you sure you want to permanently delete case record <strong>{caseToDelete}</strong>?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCaseToDelete(null)}
              className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmDelete(caseToDelete)}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name, case number…"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
          </select>

          <select
            value={archFilter}
            onChange={(e) => setArchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          >
            <option value="all">All Arches</option>
            <option value="both">Both Arches</option>
            <option value="upper">Upper Only</option>
            <option value="lower">Lower Only</option>
          </select>
        </div>
      </div>

      {/* Scans Table / Zero State */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        {cases.length === 0 ? (
          <div className="py-16 text-center space-y-3 p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No scan archives yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan records and reconstructed 3D digital twins will appear here once acquired and processed.
            </p>
            <button
              onClick={() => onNavigate('new_scan')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Acquire First Scan</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-50">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Scan Date</th>
                  <th className="py-3 px-4">Arch</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Quality Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No scan records match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{c.patientName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {c.patientAge}y · {c.patientGender}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{c.scanDate}</td>
                      <td className="py-3.5 px-4 capitalize font-medium text-slate-700">{c.archType} Arch</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{c.images?.length || 0} views</td>
                      <td className="py-3.5 px-4 font-mono text-teal-700 font-bold">
                        {c.status === 'completed' ? `${c.qualityScore}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-medium">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            COMPLETED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                            <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                            PROCESSING
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={async () => {
                              await selectCase(c.id);
                              onNavigate('analysis');
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                            title="Open in 3D Analysis"
                          >
                            <Box className="w-3 h-3 text-teal-600" />
                            <span>3D</span>
                          </button>

                          <button
                            onClick={async () => {
                              await selectCase(c.id);
                              onNavigate('reports');
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="View Clinical Report"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setCaseToDelete(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete / Archive Scan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
