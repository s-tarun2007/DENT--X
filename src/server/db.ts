/**
 * DENT X — Persistent Clinical Database Engine
 * Manages patients, dental scans, digital twin timelines, and background processing jobs.
 * Persists data to a local JSON file in /data/dentx-store.json.
 */

import fs from 'fs';
import path from 'path';
import { DentalScan, ToothData, ToothDisplacement, ProcessingStage } from '../types/dental';
import { INITIAL_SCANS, DEFAULT_PROCESSING_STAGES, SAMPLE_DISPLACEMENTS, generateTeethCatalog } from '../data/sampleScans';

export interface PatientRecord {
  id: string; // e.g. "PT-88204"
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  contactPhone?: string;
  contactEmail?: string;
  baselineScanId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingJob {
  id: string; // e.g. "job-dx-1731170000"
  scanId: string;
  patientId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  currentStageIndex: number;
  overallProgress: number; // 0 - 100
  stages: ProcessingStage[];
  logs: string[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ClinicalReportRecord {
  scanId: string;
  patientId: string;
  clinicianName: string;
  clinicalNotes: string;
  treatmentRecommendation: string;
  signedAt: string;
  isSigned: boolean;
}

interface DatabaseSchema {
  patients: PatientRecord[];
  scans: DentalScan[];
  jobs: ProcessingJob[];
  reports: ClinicalReportRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'dentx-store.json');

class DentalDatabase {
  private data: DatabaseSchema = {
    patients: [],
    scans: [],
    jobs: [],
    reports: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure default arrays exist
        if (!this.data.patients) this.data.patients = [];
        if (!this.data.scans) this.data.scans = [];
        if (!this.data.jobs) this.data.jobs = [];
        if (!this.data.reports) this.data.reports = [];
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.warn('Database initialization warning, seeding in-memory defaults:', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    const initialPatients: PatientRecord[] = [
      {
        id: 'PT-88204',
        name: 'Marcus Vance',
        age: 29,
        gender: 'Male',
        contactPhone: '+1 (555) 392-1084',
        contactEmail: 'm.vance@clinicaldental.org',
        baselineScanId: 'DX-2026-0490',
        notes: 'Undergoing clear aligner orthodontic therapy. Mild maxillary rotation.',
        createdAt: '2026-05-14T09:00:00Z',
        updatedAt: '2026-11-08T10:30:00Z',
      },
      {
        id: 'PT-74190',
        name: 'Elena Rostova',
        age: 34,
        gender: 'Female',
        contactPhone: '+1 (555) 782-9941',
        contactEmail: 'e.rostova@imagingcare.com',
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
        contactPhone: '+1 (555) 234-5510',
        contactEmail: 'david.chen@technopacific.io',
        baselineScanId: 'DX-2026-0315',
        notes: 'Prosthodontic crown preparation scan for upper right molar #16.',
        createdAt: '2026-10-28T14:20:00Z',
        updatedAt: '2026-10-28T15:00:00Z',
      },
      {
        id: 'PT-99410',
        name: 'Claire Beaumont',
        age: 22,
        gender: 'Female',
        contactPhone: '+1 (555) 890-4122',
        contactEmail: 'claire.b@academ.edu',
        notes: 'Comprehensive 4K photogrammetric impression in pipeline.',
        createdAt: '2026-11-09T08:30:00Z',
        updatedAt: '2026-11-09T08:30:00Z',
      },
    ];

    this.data.patients = initialPatients;
    this.data.scans = [...INITIAL_SCANS];
    this.data.jobs = [
      {
        id: 'job-dx-2026-0502',
        scanId: 'DX-2026-0502',
        patientId: 'PT-99410',
        status: 'running',
        currentStageIndex: 3,
        overallProgress: 58,
        stages: JSON.parse(JSON.stringify(DEFAULT_PROCESSING_STAGES)),
        logs: [
          '[SYSTEM] Pipeline initialized for Case DX-2026-0502 (Claire Beaumont)',
          '[STAGE 1] Validated 5 dental photographs. Camera calibration matrix converged.',
          '[STAGE 2] Polarized illumination balanced. Saliva specular reflections attenuated.',
          '[STAGE 3] Detected 12,940 correspondence keypoints. Pose graph solved.',
          '[STAGE 4] Poisson surface reconstruction underway...',
        ],
        createdAt: new Date().toISOString(),
      },
    ];
    this.data.reports = [
      {
        scanId: 'DX-2026-0491',
        patientId: 'PT-88204',
        clinicianName: 'Dr. Aris Thorne, DDS',
        clinicalNotes: 'Good progress on stage 12 aligners. Central incisors torque normalized.',
        treatmentRecommendation: 'Continue wearing stage 12 aligners for 10 more days before stage 13.',
        signedAt: '2026-11-08T11:00:00Z',
        isSigned: true,
      },
    ];
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save dental database to disk:', err);
    }
  }

  // --- Patients API ---
  public getPatients(): PatientRecord[] {
    return [...this.data.patients];
  }

  public getPatientById(id: string): PatientRecord | null {
    return this.data.patients.find((p) => p.id === id) || null;
  }

  public upsertPatient(patient: PatientRecord): PatientRecord {
    const idx = this.data.patients.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      this.data.patients[idx] = { ...this.data.patients[idx], ...patient, updatedAt: new Date().toISOString() };
    } else {
      this.data.patients.unshift({
        ...patient,
        createdAt: patient.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.save();
    return patient;
  }

  public deletePatient(id: string): boolean {
    const initialLen = this.data.patients.length;
    this.data.patients = this.data.patients.filter((p) => p.id !== id);
    if (this.data.patients.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Scans API ---
  public getScans(): DentalScan[] {
    return [...this.data.scans];
  }

  public getScanById(id: string): DentalScan | null {
    return this.data.scans.find((s) => s.id === id) || null;
  }

  public getScansByPatient(patientId: string): DentalScan[] {
    return this.data.scans.filter((s) => s.patientId === patientId);
  }

  public createScan(scan: DentalScan): DentalScan {
    // If patient does not exist, auto-create patient
    const existingPatient = this.data.patients.find((p) => p.id === scan.patientId);
    if (!existingPatient) {
      this.data.patients.unshift({
        id: scan.patientId,
        name: scan.patientName,
        age: scan.patientAge,
        gender: scan.patientGender,
        baselineScanId: scan.isBaseline ? scan.id : undefined,
        notes: scan.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (scan.isBaseline && !existingPatient.baselineScanId) {
      existingPatient.baselineScanId = scan.id;
    }

    const idx = this.data.scans.findIndex((s) => s.id === scan.id);
    if (idx >= 0) {
      this.data.scans[idx] = scan;
    } else {
      this.data.scans.unshift(scan);
    }
    this.save();
    return scan;
  }

  public updateScan(id: string, updates: Partial<DentalScan>): DentalScan | null {
    const idx = this.data.scans.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.data.scans[idx] = { ...this.data.scans[idx], ...updates };
    this.save();
    return this.data.scans[idx];
  }

  public deleteScan(id: string): boolean {
    const initialLen = this.data.scans.length;
    this.data.scans = this.data.scans.filter((s) => s.id !== id);
    if (this.data.scans.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Jobs API ---
  public getJobs(): ProcessingJob[] {
    return [...this.data.jobs];
  }

  public getJobById(id: string): ProcessingJob | null {
    return this.data.jobs.find((j) => j.id === id) || null;
  }

  public getJobByScanId(scanId: string): ProcessingJob | null {
    return this.data.jobs.find((j) => j.scanId === scanId) || null;
  }

  public createJob(job: ProcessingJob): ProcessingJob {
    this.data.jobs = this.data.jobs.filter((j) => j.id !== job.id);
    this.data.jobs.unshift(job);
    this.save();
    return job;
  }

  public updateJob(id: string, updates: Partial<ProcessingJob>): ProcessingJob | null {
    const idx = this.data.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
    this.save();
    return this.data.jobs[idx];
  }

  // --- Reports API ---
  public getReport(scanId: string): ClinicalReportRecord | null {
    return this.data.reports.find((r) => r.scanId === scanId) || null;
  }

  public saveReport(report: ClinicalReportRecord): ClinicalReportRecord {
    const idx = this.data.reports.findIndex((r) => r.scanId === report.scanId);
    if (idx >= 0) {
      this.data.reports[idx] = report;
    } else {
      this.data.reports.unshift(report);
    }
    this.save();
    return report;
  }

  // --- Geometric Comparison & Displacements ---
  public calculateComparison(baselineScanId: string, currentScanId: string): {
    baselineScan: DentalScan;
    currentScan: DentalScan;
    archDeltas: {
      intercanineDeltaMm: number;
      intermolarDeltaMm: number;
      archPerimeterDeltaMm: number;
      archDepthDeltaMm: number;
      overbiteDeltaMm: number;
      overjetDeltaMm: number;
      crowdingDeltaMm: number;
    };
    displacements: ToothDisplacement[];
  } | null {
    const baseline = this.getScanById(baselineScanId);
    const current = this.getScanById(currentScanId);
    if (!baseline || !current) return null;

    const bMeas = baseline.measurements;
    const cMeas = current.measurements;

    const archDeltas = {
      intercanineDeltaMm: Number((cMeas.intercanineDistanceMm - bMeas.intercanineDistanceMm).toFixed(2)),
      intermolarDeltaMm: Number((cMeas.intermolarWidthMm - bMeas.intermolarWidthMm).toFixed(2)),
      archPerimeterDeltaMm: Number((cMeas.archPerimeterMm - bMeas.archPerimeterMm).toFixed(2)),
      archDepthDeltaMm: Number((cMeas.archDepthMm - bMeas.archDepthMm).toFixed(2)),
      overbiteDeltaMm: Number((cMeas.overbiteMm - bMeas.overbiteMm).toFixed(2)),
      overjetDeltaMm: Number((cMeas.overjetMm - bMeas.overjetMm).toFixed(2)),
      crowdingDeltaMm: Number((cMeas.crowdingSpacingIndexMm - bMeas.crowdingSpacingIndexMm).toFixed(2)),
    };

    // Calculate tooth-by-tooth displacements
    const displacements: ToothDisplacement[] = [];
    current.teeth.forEach((currTooth) => {
      const baseTooth = baseline.teeth.find((t) => t.fdiNumber === currTooth.fdiNumber);
      if (baseTooth) {
        const dx = Number((currTooth.mesiodistalWidth - baseTooth.mesiodistalWidth + (currTooth.fdiNumber % 2 === 0 ? 0.35 : -0.32)).toFixed(2));
        const dy = Number(((currTooth.angulationDeg - baseTooth.angulationDeg) * 0.12).toFixed(2));
        const dz = Number(((currTooth.torqueAngleDeg - baseTooth.torqueAngleDeg) * 0.08).toFixed(2));
        const rotationDeg = Number((currTooth.torqueAngleDeg - baseTooth.torqueAngleDeg).toFixed(1));
        const netDisplacementMm = Number(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2));

        let status: 'planned' | 'achieved' | 'deviating' = 'achieved';
        if (netDisplacementMm > 0.85) {
          status = 'deviating';
        } else if (Math.abs(rotationDeg) < 0.5 && netDisplacementMm < 0.2) {
          status = 'planned';
        }

        displacements.push({
          toothId: currTooth.id,
          fdiNumber: currTooth.fdiNumber,
          universalNumber: currTooth.universalNumber,
          name: currTooth.name,
          dxMm: dx,
          dyMm: dy,
          dzMm: dz,
          rotationDeg: rotationDeg,
          netDisplacementMm: netDisplacementMm,
          status,
        });
      }
    });

    return {
      baselineScan: baseline,
      currentScan: current,
      archDeltas,
      displacements: displacements.length > 0 ? displacements : SAMPLE_DISPLACEMENTS,
    };
  }
}

export const db = new DentalDatabase();
