/**
 * DENT X — Domain Data Types & Definitions
 * AI-Assisted 3D Dental Reconstruction & Analysis Platform
 */

export type ArchType = 'upper' | 'lower' | 'both';

export type NumberingSystem = 'fdi' | 'universal' | 'palmer';

export type ScanStatus = 'completed' | 'processing' | 'queued' | 'review_required';

export interface ToothData {
  id: string; // e.g. "tooth_11"
  fdiNumber: number; // e.g. 11
  universalNumber: number; // e.g. 8
  palmerCode: string; // e.g. "1┘"
  name: string; // e.g. "Maxillary Right Central Incisor"
  arch: 'upper' | 'lower';
  quadrant: 1 | 2 | 3 | 4;
  type: 'incisor' | 'canine' | 'premolar' | 'molar';
  // Anatomical measurements (mm)
  crownHeight: number;
  mesiodistalWidth: number;
  buccolingualWidth: number;
  torqueAngleDeg: number;
  angulationDeg: number;
  surfaceDeviationMm: number; // reconstruction discrepancy in mm
  segmentationConfidence: number; // 0.0 - 1.0 (e.g. 0.98)
  clinicalCondition: 'Healthy Enamel' | 'Mild Rotation' | 'Incipient Caries' | 'Enamel Wear Facet' | 'Restoration' | 'Impacted';
  notes: string;
}

export interface ArchMeasurements {
  intercanineDistanceMm: number; // Distance between canine cusp tips
  intermolarWidthMm: number; // Distance between 1st molar buccal grooves
  archPerimeterMm: number; // Total dental arch perimeter
  archDepthMm: number; // Anterior-posterior depth
  overbiteMm: number; // Vertical overlap of incisors
  overjetMm: number; // Horizontal overlap of incisors
  crowdingSpacingIndexMm: number; // Negative = crowding, Positive = spacing
  boltonRatioAnteriorPercent: number; // Normal ~77.2%
  boltonRatioOverallPercent: number; // Normal ~91.3%
}

export interface UploadedDentalImage {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  viewAngle: 'Frontal Retracted' | 'Maxillary Occlusal' | 'Mandibular Occlusal' | 'Right Buccal' | 'Left Buccal' | 'Anterior Overjet' | 'CBCT Slice';
  resolution: string;
  timestamp: string;
}

export interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progressPercent: number;
  durationSeconds?: number;
  logMessage?: string;
}

export interface DentalScan {
  id: string; // e.g. "DX-2026-0491"
  patientId: string; // e.g. "PT-88204"
  patientName: string;
  patientAge: number;
  patientGender: 'Female' | 'Male' | 'Other';
  scanDate: string;
  archType: ArchType;
  status: ScanStatus;
  operatorName: string;
  scannerModel: string;
  images: UploadedDentalImage[];
  teeth: ToothData[];
  measurements: ArchMeasurements;
  reconstructionQualityScore: number; // e.g. 96.8%
  notes: string;
  isBaseline: boolean;
  baselineScanId?: string;
}

export interface ToothDisplacement {
  toothId: string;
  fdiNumber: number;
  universalNumber: number;
  name: string;
  dxMm: number; // Mesial / Distal shift
  dyMm: number; // Buccal / Lingual shift
  dzMm: number; // Extrusion / Intrusion
  rotationDeg: number; // Axial rotation
  netDisplacementMm: number;
  status: 'planned' | 'achieved' | 'deviating';
}

export interface FastApiConfig {
  baseUrl: string;
  apiKey: string;
  status: 'connected' | 'offline' | 'demo_mode';
  lastPingMs: number | null;
}
