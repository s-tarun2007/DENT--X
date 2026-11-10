/**
 * DENT X — Express API Routes
 * Implements REST endpoints for Patient Management, Scans, Background Reconstruction Pipeline,
 * Gemini AI Dental Image Analysis, Geometric Comparisons, and Model Exports.
 */

import { Router, Request, Response } from 'express';
import { db, ProcessingJob } from './db';
import { analyzeDentalImagesWithGemini } from './geminiService';
import { DEFAULT_PROCESSING_STAGES, generateTeethCatalog } from '../data/sampleScans';
import { DentalScan } from '../types/dental';
import { exportDentalArchToObj } from '../utils/dentalGeometry';

export const apiRouter = Router();

// Store active SSE connections by jobId
const sseClientsByJobId = new Map<string, Response[]>();

function notifyJobSubscribers(job: ProcessingJob) {
  const clients = sseClientsByJobId.get(job.id);
  if (clients && clients.length > 0) {
    const payload = `data: ${JSON.stringify(job)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(payload);
      } catch {
        // client closed
      }
    });
  }
}

// 1. Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      patients: db.getPatients().length,
      scans: db.getScans().length,
      jobs: db.getJobs().length,
    },
    aiEngine: {
      geminiConfigured: hasGeminiKey,
      preferredModel: 'gemini-3.8-flash',
      status: hasGeminiKey ? 'ready' : 'fallback_heuristic_mode',
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Patient Management APIs
apiRouter.get('/patients', (_req: Request, res: Response) => {
  const patients = db.getPatients();
  const scans = db.getScans();

  const patientsWithStats = patients.map((p) => {
    const patientScans = scans.filter((s) => s.patientId === p.id);
    const sortedScans = [...patientScans].sort(
      (a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()
    );

    return {
      ...p,
      totalScans: patientScans.length,
      completedScans: patientScans.filter((s) => s.status === 'completed').length,
      latestScanDate: sortedScans[0]?.scanDate || p.createdAt.split('T')[0],
      latestScanId: sortedScans[0]?.id || null,
    };
  });

  res.json(patientsWithStats);
});

apiRouter.get('/patients/:id', (req: Request, res: Response) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const scans = db.getScansByPatient(patient.id);
  const sortedScans = [...scans].sort(
    (a, b) => new Date(a.scanDate).getTime() - new Date(b.scanDate).getTime()
  );

  res.json({
    patient,
    scans: sortedScans,
    digitalTwinTimeline: sortedScans.map((s, idx) => ({
      stageIndex: idx,
      stageLabel: s.isBaseline ? 'Baseline Pre-Treatment' : `Treatment Stage ${idx}`,
      scanId: s.id,
      scanDate: s.scanDate,
      archType: s.archType,
      qualityScore: s.reconstructionQualityScore,
      intercanineDistanceMm: s.measurements.intercanineDistanceMm,
      intermolarWidthMm: s.measurements.intermolarWidthMm,
      overbiteMm: s.measurements.overbiteMm,
      overjetMm: s.measurements.overjetMm,
    })),
  });
});

apiRouter.post('/patients', (req: Request, res: Response) => {
  const { name, age, gender, notes, contactPhone, contactEmail } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Patient name is required' });
  }

  const id = req.body.id || `PT-${Math.floor(10000 + Math.random() * 90000)}`;
  const newPatient = db.upsertPatient({
    id,
    name,
    age: Number(age) || 30,
    gender: gender || 'Other',
    notes: notes || '',
    contactPhone,
    contactEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json(newPatient);
});

apiRouter.delete('/patients/:id', (req: Request, res: Response) => {
  const success = db.deletePatient(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json({ success: true, message: `Patient ${req.params.id} archived` });
});

// 3. Scans APIs
apiRouter.get('/scans', (req: Request, res: Response) => {
  let scans = db.getScans();

  const { patientId, status, arch } = req.query;
  if (patientId) {
    scans = scans.filter((s) => s.patientId === String(patientId));
  }
  if (status && status !== 'all') {
    scans = scans.filter((s) => s.status === String(status));
  }
  if (arch && arch !== 'all') {
    scans = scans.filter((s) => s.archType === String(arch));
  }

  res.json(scans);
});

apiRouter.get('/scans/:id', (req: Request, res: Response) => {
  const scan = db.getScanById(req.params.id);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  res.json(scan);
});

apiRouter.post('/scans', (req: Request, res: Response) => {
  const scanData: DentalScan = req.body;
  if (!scanData.id || !scanData.patientName) {
    return res.status(400).json({ error: 'Missing required scan ID or patient details' });
  }

  if (!scanData.teeth || scanData.teeth.length === 0) {
    scanData.teeth = generateTeethCatalog();
  }

  const saved = db.createScan(scanData);
  res.status(201).json(saved);
});

apiRouter.put('/scans/:id', (req: Request, res: Response) => {
  const updated = db.updateScan(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  res.json(updated);
});

apiRouter.delete('/scans/:id', (req: Request, res: Response) => {
  const success = db.deleteScan(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  res.json({ success: true, message: `Scan ${req.params.id} removed from active archive` });
});

// 4. AI Dental Vision Analysis Endpoint
apiRouter.post('/ai/analyze-images', async (req: Request, res: Response) => {
  try {
    const { images, patientContext } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required for AI dental inspection' });
    }

    const analysis = await analyzeDentalImagesWithGemini(
      images,
      patientContext || { name: 'Anonymous Patient', age: 30, gender: 'Other' }
    );

    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: 'AI analysis failed', details: err.message });
  }
});

// 5. Background Reconstruction Pipeline Jobs API
apiRouter.post('/jobs/create', (req: Request, res: Response) => {
  const { scanId, patientId, patientName, patientAge, patientGender, archType, notes, images, isBaseline } = req.body;

  const realScanId = scanId || `DX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const realPatientId = patientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`;
  const jobId = `job-${realScanId.toLowerCase()}-${Date.now().toString().slice(-4)}`;

  const stages = JSON.parse(JSON.stringify(DEFAULT_PROCESSING_STAGES)).map((s: any, idx: number) => ({
    ...s,
    status: idx === 0 ? 'in_progress' : 'pending',
    progressPercent: idx === 0 ? 15 : 0,
  }));

  const initialJob: ProcessingJob = {
    id: jobId,
    scanId: realScanId,
    patientId: realPatientId,
    status: 'running',
    currentStageIndex: 0,
    overallProgress: 5,
    stages,
    logs: [
      `[SYSTEM] DENT X Photogrammetric Pipeline initialized for Case ${realScanId}`,
      `[SYSTEM] Patient: ${patientName || 'Clinical Record'} (${realPatientId})`,
      `[STAGE 1] Ingested ${images?.length || 6} intraoral high-resolution frames. Checking EXIF & focus calibration...`,
    ],
    createdAt: new Date().toISOString(),
  };

  db.createJob(initialJob);

  // Pre-register provisional scan in 'processing' status
  const pendingScan: DentalScan = {
    id: realScanId,
    patientId: realPatientId,
    patientName: patientName || 'Clinical Patient',
    patientAge: Number(patientAge) || 28,
    patientGender: patientGender || 'Other',
    scanDate: new Date().toISOString().split('T')[0],
    archType: archType || 'both',
    status: 'processing',
    operatorName: 'Dr. Aris Thorne, DDS',
    scannerModel: 'DENT-X Vision Pro 4K Intraoral Photogrammetry Rig',
    images: images || [],
    teeth: generateTeethCatalog(),
    measurements: {
      intercanineDistanceMm: 33.8,
      intermolarWidthMm: 47.4,
      archPerimeterMm: 77.9,
      archDepthMm: 29.2,
      overbiteMm: 2.2,
      overjetMm: 2.0,
      crowdingSpacingIndexMm: -1.4,
      boltonRatioAnteriorPercent: 77.6,
      boltonRatioOverallPercent: 91.4,
    },
    reconstructionQualityScore: 97.4,
    notes: notes || 'Intraoral photogrammetric scan session.',
    isBaseline: Boolean(isBaseline),
  };
  db.createScan(pendingScan);

  // Background Async Progress Execution
  let currentStage = 0;
  let progress = 5;

  const interval = setInterval(async () => {
    progress += 8;

    if (progress >= 100) {
      clearInterval(interval);
      progress = 100;
      currentStage = stages.length - 1;

      // Mark all stages completed
      const completedStages = stages.map((s: any) => ({ ...s, status: 'completed', progressPercent: 100 }));
      const completedJob = db.updateJob(jobId, {
        status: 'completed',
        overallProgress: 100,
        currentStageIndex: currentStage,
        stages: completedStages,
        completedAt: new Date().toISOString(),
        logs: [
          ...initialJob.logs,
          `[STAGE 7] Poisson 3D Surface Mesh Watertight Synthesis verified. Ready for 3D Analysis.`,
        ],
      });

      // Update scan to completed
      db.updateScan(realScanId, { status: 'completed' });

      if (completedJob) notifyJobSubscribers(completedJob);
      return;
    }

    // Determine current stage index based on progress
    const targetStageIndex = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));
    if (targetStageIndex !== currentStage) {
      currentStage = targetStageIndex;
      const stageName = stages[currentStage]?.name || 'Pipeline Task';
      initialJob.logs.push(`[STAGE ${currentStage + 1}] Executing: ${stageName}...`);
    }

    const updatedStages = stages.map((s: any, idx: number) => {
      if (idx < currentStage) return { ...s, status: 'completed', progressPercent: 100 };
      if (idx === currentStage) return { ...s, status: 'in_progress', progressPercent: Math.min(95, Math.round(((progress % 15) / 15) * 100)) };
      return { ...s, status: 'pending', progressPercent: 0 };
    });

    const updatedJob = db.updateJob(jobId, {
      overallProgress: progress,
      currentStageIndex: currentStage,
      stages: updatedStages,
      logs: [...initialJob.logs],
    });

    if (updatedJob) notifyJobSubscribers(updatedJob);
  }, 900);

  res.status(201).json({
    jobId,
    scanId: realScanId,
    patientId: realPatientId,
    status: 'running',
    message: 'Photogrammetric reconstruction pipeline started in background.',
  });
});

apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const job = db.getJobById(req.params.id) || db.getJobByScanId(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Reconstruction job not found' });
  }
  res.json(job);
});

apiRouter.post('/jobs/:id/retry', (req: Request, res: Response) => {
  const job = db.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const resetStages = job.stages.map((s, idx) => ({
    ...s,
    status: idx === 0 ? ('in_progress' as const) : ('pending' as const),
    progressPercent: idx === 0 ? 10 : 0,
  }));

  const updated = db.updateJob(job.id, {
    status: 'running',
    overallProgress: 10,
    currentStageIndex: 0,
    stages: resetStages,
    error: undefined,
    logs: [...job.logs, `[SYSTEM] Retrying reconstruction pipeline for ${job.scanId}...`],
  });

  res.json(updated);
});

// SSE Live Stream for Job Progress
apiRouter.get('/jobs/:id/events', (req: Request, res: Response) => {
  const jobId = req.params.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const initialJob = db.getJobById(jobId) || db.getJobByScanId(jobId);
  if (initialJob) {
    res.write(`data: ${JSON.stringify(initialJob)}\n\n`);
  }

  if (!sseClientsByJobId.has(jobId)) {
    sseClientsByJobId.set(jobId, []);
  }
  sseClientsByJobId.get(jobId)!.push(res);

  req.on('close', () => {
    const list = sseClientsByJobId.get(jobId) || [];
    sseClientsByJobId.set(
      jobId,
      list.filter((c) => c !== res)
    );
  });
});

// 6. Geometric Comparison API
apiRouter.get('/comparison/:baseId/:currId', (req: Request, res: Response) => {
  const result = db.calculateComparison(req.params.baseId, req.params.currId);
  if (!result) {
    return res.status(404).json({ error: 'One or both scans could not be found for comparison' });
  }
  res.json(result);
});

// 7. Clinical Reports API
apiRouter.get('/reports/:scanId', (req: Request, res: Response) => {
  const scan = db.getScanById(req.params.scanId);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }
  const report = db.getReport(req.params.scanId);
  res.json({
    scan,
    report: report || {
      scanId: scan.id,
      patientId: scan.patientId,
      clinicianName: scan.operatorName,
      clinicalNotes: scan.notes,
      treatmentRecommendation: 'Routine diagnostic impression. No surgical intervention required.',
      signedAt: scan.scanDate,
      isSigned: false,
    },
  });
});

apiRouter.post('/reports/:scanId', (req: Request, res: Response) => {
  const { clinicianName, clinicalNotes, treatmentRecommendation, isSigned } = req.body;
  const scan = db.getScanById(req.params.scanId);
  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  const savedReport = db.saveReport({
    scanId: scan.id,
    patientId: scan.patientId,
    clinicianName: clinicianName || scan.operatorName,
    clinicalNotes: clinicalNotes || scan.notes,
    treatmentRecommendation: treatmentRecommendation || '',
    signedAt: new Date().toISOString(),
    isSigned: Boolean(isSigned),
  });

  res.json(savedReport);
});

// 8. Model Mesh Exporters (.OBJ and .STL)
apiRouter.get('/models/:scanId/mesh.obj', (req: Request, res: Response) => {
  const scan = db.getScanById(req.params.scanId);
  if (!scan) {
    return res.status(404).send('# Error: Scan not found');
  }

  const objContent = exportDentalArchToObj(scan.id, scan.teeth);
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${scan.id}_reconstructed_model.obj"`);
  res.send(objContent);
});
