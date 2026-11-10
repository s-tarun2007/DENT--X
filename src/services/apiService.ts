/**
 * DENT X — Clinical API Service Client
 * Connects frontend UI components to the persistent Express backend APIs (/api/*)
 * with graceful fallback to cached memory records when offline.
 */

import { DentalScan, ProcessingStage, ToothDisplacement, FastApiConfig } from '../types/dental';
import { INITIAL_SCANS, DEFAULT_PROCESSING_STAGES, SAMPLE_DISPLACEMENTS } from '../data/sampleScans';
import { PatientRecord, ProcessingJob, ClinicalReportRecord } from '../server/db';
import { AiDentalAnalysisResult } from '../server/geminiService';

export class DentalApiService {
  private config: FastApiConfig = {
    baseUrl: '/api',
    apiKey: '',
    status: 'connected',
    lastPingMs: 12,
  };

  public getConfig(): FastApiConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<FastApiConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public async pingBackend(): Promise<{ success: boolean; latencyMs: number; message: string; data?: any }> {
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health');
      const elapsed = Math.round(performance.now() - startTime);
      if (res.ok) {
        const data = await res.json();
        this.updateConfig({ status: 'connected', lastPingMs: elapsed });
        return {
          success: true,
          latencyMs: elapsed,
          message: `DENT X Clinical Engine Healthy. ${data.database?.patients || 0} Patients, ${data.database?.scans || 0} Scans stored. AI: ${data.aiEngine?.geminiConfigured ? 'Gemini 3.8 Flash Online' : 'Clinical Heuristic Fallback'}.`,
          data,
        };
      }
    } catch {
      // offline fallback
    }

    const elapsed = Math.round(performance.now() - startTime);
    this.updateConfig({ status: 'demo_mode', lastPingMs: elapsed || 15 });
    return {
      success: true,
      latencyMs: elapsed || 15,
      message: 'Local Cache Mode Active (In-Memory Synchronization).',
    };
  }

  // Patients
  public async listPatients(): Promise<PatientRecord[]> {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to fetch patients from /api/patients:', e);
    }
    return [
      {
        id: 'PT-88204',
        name: 'Marcus Vance',
        age: 29,
        gender: 'Male',
        baselineScanId: 'DX-2026-0490',
        notes: 'Undergoing clear aligner orthodontic therapy.',
        createdAt: '2026-05-14T09:00:00Z',
        updatedAt: '2026-11-08T10:30:00Z',
      },
      {
        id: 'PT-74190',
        name: 'Elena Rostova',
        age: 34,
        gender: 'Female',
        baselineScanId: 'DX-2026-0382',
        notes: 'Mandibular anterior crowding with impacted lower 3rd molars.',
        createdAt: '2026-11-04T11:15:00Z',
        updatedAt: '2026-11-04T11:45:00Z',
      },
      {
        id: 'PT-63012',
        name: 'David Chen',
        age: 46,
        gender: 'Male',
        baselineScanId: 'DX-2026-0315',
        notes: 'Prosthodontic crown preparation scan.',
        createdAt: '2026-10-28T14:20:00Z',
        updatedAt: '2026-10-28T15:00:00Z',
      },
    ];
  }

  public async getPatient(id: string): Promise<{ patient: PatientRecord; scans: DentalScan[]; digitalTwinTimeline: any[] } | null> {
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch patient ${id}:`, e);
    }
    return null;
  }

  public async createPatient(patient: Partial<PatientRecord>): Promise<PatientRecord | null> {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Error creating patient:', e);
    }
    return null;
  }

  // Scans
  public async listScans(filters?: { patientId?: string; status?: string; arch?: string }): Promise<DentalScan[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.patientId) params.append('patientId', filters.patientId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.arch) params.append('arch', filters.arch);

      const res = await fetch(`/api/scans?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to fetch scans from /api/scans, using fallback:', e);
    }
    return [...INITIAL_SCANS];
  }

  public async getScanById(id: string): Promise<DentalScan | null> {
    try {
      const res = await fetch(`/api/scans/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch scan ${id}:`, e);
    }
    return INITIAL_SCANS.find((s) => s.id === id) || null;
  }

  public async createScan(scan: DentalScan): Promise<DentalScan> {
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scan),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Failed to create scan via /api/scans:', e);
    }
    return scan;
  }

  public async updateScan(id: string, updates: Partial<DentalScan>): Promise<DentalScan | null> {
    try {
      const res = await fetch(`/api/scans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Failed to update scan:', e);
    }
    return null;
  }

  public async deleteScan(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // AI Vision Analysis
  public async analyzeDentalImagesWithAi(
    images: Array<{ name: string; viewAngle: string; dataUrl?: string; sizeBytes?: number }>,
    patientContext: { name: string; age: number; gender: string; notes?: string }
  ): Promise<AiDentalAnalysisResult | null> {
    try {
      const res = await fetch('/api/ai/analyze-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, patientContext }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('AI image analysis call failed:', e);
    }
    return null;
  }

  // Background Processing Jobs
  public async createProcessingJob(payload: {
    scanId?: string;
    patientId: string;
    patientName: string;
    patientAge: number;
    patientGender: 'Female' | 'Male' | 'Other';
    archType: 'upper' | 'lower' | 'both';
    notes?: string;
    images: any[];
    isBaseline?: boolean;
  }): Promise<{ jobId: string; scanId: string; status: string } | null> {
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Failed to create processing job:', e);
    }
    return null;
  }

  public async getJobStatus(jobId: string): Promise<ProcessingJob | null> {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) return await res.json();
    } catch {
      return null;
    }
    return null;
  }

  public async retryJob(jobId: string): Promise<ProcessingJob | null> {
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      return null;
    }
    return null;
  }

  // Comparison
  public async getComparison(
    baselineScanId: string,
    currentScanId: string
  ): Promise<{
    baselineScan: DentalScan;
    currentScan: DentalScan;
    archDeltas: any;
    displacements: ToothDisplacement[];
  } | null> {
    try {
      const res = await fetch(`/api/comparison/${baselineScanId}/${currentScanId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to fetch geometric comparison from API:', e);
    }
    const b = INITIAL_SCANS.find((s) => s.id === baselineScanId) || INITIAL_SCANS[1];
    const c = INITIAL_SCANS.find((s) => s.id === currentScanId) || INITIAL_SCANS[0];
    return {
      baselineScan: b,
      currentScan: c,
      archDeltas: {
        intercanineDeltaMm: 1.4,
        intermolarDeltaMm: 1.7,
        archPerimeterDeltaMm: 2.2,
        archDepthDeltaMm: -1.2,
        overbiteDeltaMm: -1.4,
        overjetDeltaMm: -1.4,
        crowdingDeltaMm: 2.2,
      },
      displacements: [...SAMPLE_DISPLACEMENTS],
    };
  }

  // Reports
  public async getReport(scanId: string): Promise<{ scan: DentalScan; report: ClinicalReportRecord } | null> {
    try {
      const res = await fetch(`/api/reports/${scanId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch report for ${scanId}:`, e);
    }
    return null;
  }

  public async saveReport(
    scanId: string,
    data: { clinicianName?: string; clinicalNotes?: string; treatmentRecommendation?: string; isSigned?: boolean }
  ): Promise<ClinicalReportRecord | null> {
    try {
      const res = await fetch(`/api/reports/${scanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Failed to save clinical report:', e);
    }
    return null;
  }
}

export const apiService = new DentalApiService();
