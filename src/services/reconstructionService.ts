/**
 * DENT X — Reconstruction Service
 * Unified service with mode: 'simulated' | 'api'.
 * 
 * In 'simulated' mode:
 *   - Runs a 7-stage slow believable photogrammetric pipeline (60-120 seconds, >= 60s)
 *   - Advances with eased jitter and real photo facts in live logs
 *   - Generates procedural anatomical dental models matching the backend binary format
 *   - Persists completed models & analysis into IndexedDB
 * 
 * In 'api' mode:
 *   - Calls ${VITE_API_URL}/api/cases, /images, /process
 *   - Polls /api/jobs/{id}
 *   - Loads /model/upper, /model/lower, /analysis
 *   - Identical interface and types so switching is 1 config flag.
 */

import { casesDb, StoredDentalCase } from './indexedDbService';
import { generateProceduralDentalCase, FullReconstructedCaseModel } from '../utils/proceduralDentalEngine';

export type ReconstructionMode = 'simulated' | 'api';

export interface PipelineStageInfo {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage of total pipeline (sum = 100)
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progressPercent: number;
}

export interface ActivePipelineJob {
  jobId: string;
  caseId: string;
  mode: ReconstructionMode;
  status: 'running' | 'completed' | 'failed';
  startedAt: number;
  totalDurationSeconds: number;
  overallProgressPercent: number;
  currentStageIndex: number;
  stages: PipelineStageInfo[];
  logs: string[];
  metrics: {
    photoCount: number;
    matchedKeypoints: number;
    densePoints: number;
    verticesCount: number;
    facesCount: number;
    teethCount: number;
  };
  result?: FullReconstructedCaseModel;
}

export const PIPELINE_STAGES: { id: string; name: string; description: string; weight: number }[] = [
  {
    id: 'validation',
    name: 'Image Validation',
    description: 'Verifying resolution, lens sharpness, intraoral illumination and metadata completeness.',
    weight: 8,
  },
  {
    id: 'preprocessing',
    name: 'Preprocessing & Normalization',
    description: 'Polarized glare reduction, color balance calibration, and camera intrinsic compensation.',
    weight: 12,
  },
  {
    id: 'feature_matching',
    name: 'Feature Detection & Matching',
    description: 'Sub-pixel SIFT & SuperPoint extraction across multi-view camera epipolar baselines.',
    weight: 20,
  },
  {
    id: 'reconstruction',
    name: '3D Reconstruction & Meshing',
    description: 'Dense depth map fusion, volumetric Poisson triangulation, and watertight manifold synthesis.',
    weight: 28,
  },
  {
    id: 'segmentation',
    name: 'Tooth Segmentation',
    description: 'Deep 3D instance segmentation separating anatomical crowns from scalloped gingiva into FDI numbers.',
    weight: 16,
  },
  {
    id: 'measurement',
    name: 'Geometric Measurement',
    description: 'Landmark extraction, mesiodistal widths, interdental contact gaps, Bolton analysis and overbite/overjet.',
    weight: 10,
  },
  {
    id: 'results',
    name: 'Results Generation',
    description: 'Assembling digital twin coordinate buffers, diagnostic indicators, and clinical package.',
    weight: 6,
  },
];

class ReconstructionService {
  private mode: ReconstructionMode = (import.meta.env.VITE_RECONSTRUCTION_MODE as ReconstructionMode) || 'simulated';
  private apiUrl: string = import.meta.env.VITE_API_URL || '';

  getMode(): ReconstructionMode {
    return this.mode;
  }

  setMode(newMode: ReconstructionMode) {
    this.mode = newMode;
  }

  /**
   * Calculates total duration (60 - 120 seconds, guaranteed >= 60s)
   */
  calculateDuration(photoCount: number): number {
    const clamped = Math.max(10, Math.min(25, photoCount));
    // 10 photos = 65s, 25 photos = 110s
    return Math.round(65 + (clamped - 10) * 3.0);
  }

  /**
   * Calculates current state of an ongoing job from elapsed time
   */
  computeJobSnapshot(job: ActivePipelineJob, targetCase?: StoredDentalCase): ActivePipelineJob {
    const now = Date.now();
    const elapsedSeconds = (now - job.startedAt) / 1000;
    const totalDuration = job.totalDurationSeconds;

    const rawFraction = Math.min(1.0, elapsedSeconds / totalDuration);

    // Eased curve with slight irregular progress
    const easeFraction = rawFraction < 0.5
      ? 2 * rawFraction * rawFraction
      : 1 - Math.pow(-2 * rawFraction + 2, 2) / 2;

    const overallProgress = Math.min(100, Math.round(easeFraction * 100));

    // Determine current stage based on stage cumulative weights
    let cumWeight = 0;
    let stageIdx = 0;
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      cumWeight += PIPELINE_STAGES[i].weight;
      if (overallProgress <= cumWeight || i === PIPELINE_STAGES.length - 1) {
        stageIdx = i;
        break;
      }
    }

    const isFinished = elapsedSeconds >= totalDuration || overallProgress >= 100;

    // Build stages with progress
    let prevCum = 0;
    const stages: PipelineStageInfo[] = PIPELINE_STAGES.map((s, idx) => {
      const stageStart = prevCum;
      const stageEnd = prevCum + s.weight;
      prevCum = stageEnd;

      let status: PipelineStageInfo['status'] = 'pending';
      let progressPercent = 0;

      if (overallProgress >= stageEnd || isFinished) {
        status = 'completed';
        progressPercent = 100;
      } else if (overallProgress >= stageStart) {
        status = 'in_progress';
        progressPercent = Math.min(100, Math.max(0, Math.round(((overallProgress - stageStart) / s.weight) * 100)));
      }

      return {
        ...s,
        status,
        progressPercent,
      };
    });

    // Dynamic telemetry numbers that grow believably
    const photoCount = targetCase?.images?.length || job.metrics.photoCount || 12;
    const keypoints = Math.round(Math.min(38500, Math.max(1200, (overallProgress / 40) * 38500)));
    const densePoints = overallProgress >= 40
      ? Math.round(Math.min(145000, 15000 + ((overallProgress - 40) / 40) * 130000))
      : 0;
    const verticesCount = overallProgress >= 65
      ? Math.round(Math.min(84500, 22000 + ((overallProgress - 65) / 25) * 62500))
      : 0;
    const facesCount = verticesCount > 0 ? Math.round(verticesCount * 1.94) : 0;
    const teethCount = overallProgress >= 75 ? 28 : (overallProgress >= 60 ? Math.round((overallProgress - 60) * 1.8) : 0);

    // Generate informative live logs using real case facts
    const sampleImageNames = targetCase?.images?.slice(0, 4).map((img) => img.name).join(', ') || 'IMG_01.jpg, IMG_02.jpg...';
    const firstImg = targetCase?.images?.[0];
    const resolution = firstImg?.resolution || '3840 x 2160 (4K)';

    const logs: string[] = [
      `[SYSTEM] DENT X Reconstruction Pipeline worker initialized for Case ${job.caseId}.`,
      `[IMAGE VALIDATION] Ingested ${photoCount} multi-view exposures (${sampleImageNames}).`,
      `[IMAGE VALIDATION] Verified camera resolution (${resolution}) and Laplacian sharpness variance: optimal.`,
    ];

    if (overallProgress >= 15) {
      logs.push(`[PREPROCESSING] Calibrated intraoral exposure & vignetting across ${photoCount} perspective frames.`);
    }
    if (overallProgress >= 30) {
      logs.push(`[FEATURE MATCHING] SIFT & SuperPoint detector extracted keypoints across camera baselines.`);
      logs.push(`[FEATURE MATCHING] Keypoint correspondences converged: ${keypoints.toLocaleString()} tie points.`);
    }
    if (overallProgress >= 50) {
      logs.push(`[3D RECONSTRUCTION] Dense multi-view stereo fusion active. Point cloud size: ${densePoints.toLocaleString()} points.`);
    }
    if (overallProgress >= 68) {
      logs.push(`[3D RECONSTRUCTION] Triangulating screened Poisson surface mesh: ${verticesCount.toLocaleString()} vertices, ${facesCount.toLocaleString()} faces.`);
    }
    if (overallProgress >= 82) {
      logs.push(`[TOOTH SEGMENTATION] 3D Instance Segmentation active. Identified 28 anatomical crowns in FDI notation.`);
    }
    if (overallProgress >= 92) {
      logs.push(`[GEOMETRIC MEASUREMENT] Extracted 168 anatomical landmarks, contact gaps, Bolton ratios and dental arch depth.`);
    }
    if (isFinished) {
      logs.push(`[RESULTS GENERATION] Watertight dual-arch anatomical digital twin compiled successfully.`);
      logs.push(`[SYSTEM] Pipeline complete for Case ${job.caseId}. Ready for interactive 3D analysis.`);
    }

    return {
      ...job,
      status: isFinished ? 'completed' : 'running',
      overallProgressPercent: isFinished ? 100 : overallProgress,
      currentStageIndex: stageIdx,
      stages,
      logs,
      metrics: {
        photoCount,
        matchedKeypoints: keypoints,
        densePoints,
        verticesCount,
        facesCount,
        teethCount,
      },
    };
  }

  /**
   * Finalizes the case when pipeline finishes: generates model & analysis and persists to IndexedDB
   */
  async finalizeJob(job: ActivePipelineJob): Promise<FullReconstructedCaseModel> {
    const existing = await casesDb.getCase(job.caseId);
    
    // Generate the procedural model with real landmarks and metrics
    const result = generateProceduralDentalCase(job.caseId);

    if (existing) {
      const updatedCase: StoredDentalCase = {
        ...existing,
        status: 'completed',
        completedAt: Date.now(),
        durationSeconds: Math.round((Date.now() - job.startedAt) / 1000),
        qualityScore: Math.round(96.0 + Math.random() * 2.8 * 10) / 10,
        upperModel: {
          positions: result.upper.positions.buffer as ArrayBuffer,
          indices: result.upper.indices.buffer as ArrayBuffer,
          fdi: result.upper.fdi.buffer as ArrayBuffer,
          colors: result.upper.colors.buffer as ArrayBuffer,
        },
        lowerModel: {
          positions: result.lower.positions.buffer as ArrayBuffer,
          indices: result.lower.indices.buffer as ArrayBuffer,
          fdi: result.lower.fdi.buffer as ArrayBuffer,
          colors: result.lower.colors.buffer as ArrayBuffer,
        },
        analysis: result.analysis,
      };

      await casesDb.saveCase(updatedCase);
    }

    return result;
  }
}

export const reconstructionService = new ReconstructionService();
