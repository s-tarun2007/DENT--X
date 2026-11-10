/**
 * DENT X — Global Reconstruction & Active Case Context
 * 
 * Manages:
 *   - Persistent cases loaded from IndexedDB (Zero-state on fresh start)
 *   - Currently active case
 *   - Background 7-stage reconstruction pipeline execution
 *   - Survives browser reload (persists startedAt timestamp)
 *   - Completion toast notifications and sidebar progress indicators
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { casesDb, StoredDentalCase } from '../services/indexedDbService';
import { reconstructionService, ActivePipelineJob, PIPELINE_STAGES } from '../services/reconstructionService';
import { FullReconstructedCaseModel, generateProceduralDentalCase } from '../utils/proceduralDentalEngine';

interface ToastNotice {
  id: string;
  title: string;
  message: string;
  caseId: string;
}

interface ReconstructionContextType {
  cases: StoredDentalCase[];
  activeCase: StoredDentalCase | null;
  activeJob: ActivePipelineJob | null;
  activeModel: FullReconstructedCaseModel | null;
  toast: ToastNotice | null;
  dismissToast: () => void;
  selectCase: (caseId: string) => Promise<void>;
  startReconstruction: (newCase: StoredDentalCase) => Promise<string>;
  deleteCase: (caseId: string) => Promise<void>;
  refreshCases: () => Promise<void>;
}

const ReconstructionContext = createContext<ReconstructionContextType | undefined>(undefined);

const LOCAL_STORAGE_JOB_KEY = 'dentx_active_reconstruction_job';

export const ReconstructionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<StoredDentalCase[]>([]);
  const [activeCase, setActiveCase] = useState<StoredDentalCase | null>(null);
  const [activeJob, setActiveJob] = useState<ActivePipelineJob | null>(null);
  const [activeModel, setActiveModel] = useState<FullReconstructedCaseModel | null>(null);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const activeJobRef = useRef<ActivePipelineJob | null>(null);
  activeJobRef.current = activeJob;

  // 1. Initial Load of Cases from IndexedDB (Starts with zero cases)
  const refreshCases = useCallback(async () => {
    try {
      const all = await casesDb.getAllCases();
      setCases(all);
      // If there's an activeCase, update it from fresh DB data
      if (activeCase) {
        const found = all.find((c) => c.id === activeCase.id);
        if (found) setActiveCase(found);
      }
    } catch (err) {
      console.warn('Failed to load cases from IndexedDB:', err);
    }
  }, [activeCase]);

  // Load cases on mount & restore ongoing job
  useEffect(() => {
    refreshCases();

    // Check for saved job in localStorage (survives reload)
    try {
      const savedJobStr = localStorage.getItem(LOCAL_STORAGE_JOB_KEY);
      if (savedJobStr) {
        const parsed = JSON.parse(savedJobStr);
        if (parsed && parsed.jobId && parsed.startedAt && parsed.totalDurationSeconds) {
          const elapsed = (Date.now() - parsed.startedAt) / 1000;
          if (elapsed < parsed.totalDurationSeconds + 15) {
            // Restore active job
            const initialJob: ActivePipelineJob = {
              jobId: parsed.jobId,
              caseId: parsed.caseId,
              mode: reconstructionService.getMode(),
              status: 'running',
              startedAt: parsed.startedAt,
              totalDurationSeconds: parsed.totalDurationSeconds,
              overallProgressPercent: 0,
              currentStageIndex: 0,
              stages: PIPELINE_STAGES.map((s) => ({ ...s, status: 'pending', progressPercent: 0 })),
              logs: [`[SYSTEM] Restored ongoing pipeline for Case ${parsed.caseId}.`],
              metrics: {
                photoCount: parsed.photoCount || 12,
                matchedKeypoints: 0,
                densePoints: 0,
                verticesCount: 0,
                facesCount: 0,
                teethCount: 0,
              },
            };
            setActiveJob(initialJob);
          } else {
            localStorage.removeItem(LOCAL_STORAGE_JOB_KEY);
          }
        }
      }
    } catch {
      // ignore storage error
    }
  }, []);

  // 2. Select Case & Load its Model into Memory
  const selectCase = useCallback(async (caseId: string) => {
    const found = await casesDb.getCase(caseId);
    if (!found) {
      setActiveCase(null);
      setActiveModel(null);
      return;
    }

    setActiveCase(found);

    if (found.status === 'completed') {
      // If procedural model exists in memory or generate fresh model
      try {
        if (found.upperModel && found.lowerModel && found.analysis) {
          // Rebuild model from buffers or generate deterministically from caseId
          const model = generateProceduralDentalCase(found.id);
          setActiveModel(model);
        } else {
          const model = generateProceduralDentalCase(found.id);
          setActiveModel(model);
        }
      } catch (e) {
        console.error('Error instantiating model:', e);
      }
    } else {
      setActiveModel(null);
    }
  }, []);

  // 3. Start Reconstruction Pipeline
  const startReconstruction = useCallback(async (newCase: StoredDentalCase): Promise<string> => {
    // 1. Save case in IndexedDB with status: 'processing'
    const duration = reconstructionService.calculateDuration(newCase.images.length);
    const caseToSave: StoredDentalCase = {
      ...newCase,
      status: 'processing',
      startedAt: Date.now(),
      durationSeconds: duration,
    };
    await casesDb.saveCase(caseToSave);
    await refreshCases();
    setActiveCase(caseToSave);

    // 2. Build active job
    const jobId = `job-${newCase.id.toLowerCase()}-${Date.now().toString(36)}`;
    const job: ActivePipelineJob = {
      jobId,
      caseId: newCase.id,
      mode: reconstructionService.getMode(),
      status: 'running',
      startedAt: Date.now(),
      totalDurationSeconds: duration,
      overallProgressPercent: 0,
      currentStageIndex: 0,
      stages: PIPELINE_STAGES.map((s) => ({ ...s, status: 'pending', progressPercent: 0 })),
      logs: [`[SYSTEM] Initialized 7-stage photogrammetric pipeline for Case ${newCase.id}.`],
      metrics: {
        photoCount: newCase.images.length,
        matchedKeypoints: 0,
        densePoints: 0,
        verticesCount: 0,
        facesCount: 0,
        teethCount: 0,
      },
    };

    setActiveJob(job);
    localStorage.setItem(
      LOCAL_STORAGE_JOB_KEY,
      JSON.stringify({
        jobId,
        caseId: newCase.id,
        startedAt: job.startedAt,
        totalDurationSeconds: duration,
        photoCount: newCase.images.length,
      })
    );

    return jobId;
  }, [refreshCases]);

  // 4. Background Pipeline Ticker Loop
  useEffect(() => {
    if (!activeJob || activeJob.status !== 'running') return;

    const interval = setInterval(async () => {
      const current = activeJobRef.current;
      if (!current || current.status !== 'running') return;

      const targetCase = cases.find((c) => c.id === current.caseId) || activeCase || undefined;
      const snapshot = reconstructionService.computeJobSnapshot(current, targetCase);

      if (snapshot.status === 'completed') {
        // Pipeline just completed!
        clearInterval(interval);
        localStorage.removeItem(LOCAL_STORAGE_JOB_KEY);

        const model = await reconstructionService.finalizeJob(snapshot);
        snapshot.result = model;
        setActiveJob(snapshot);
        setActiveModel(model);

        await refreshCases();
        const updatedCase = await casesDb.getCase(snapshot.caseId);
        if (updatedCase) {
          setActiveCase(updatedCase);
        }

        // Show completion toast
        setToast({
          id: `toast-${Date.now()}`,
          title: '3D Reconstruction Complete',
          message: `Case ${snapshot.caseId} (${updatedCase?.patientName || 'Patient'}) finished 7-stage reconstruction. Watertight digital twin ready!`,
          caseId: snapshot.caseId,
        });
      } else {
        setActiveJob(snapshot);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [activeJob?.jobId, activeJob?.status, cases, activeCase, refreshCases]);

  // 5. Delete Case
  const deleteCase = useCallback(async (caseId: string) => {
    await casesDb.deleteCase(caseId);
    if (activeCase?.id === caseId) {
      setActiveCase(null);
      setActiveModel(null);
    }
    if (activeJob?.caseId === caseId) {
      setActiveJob(null);
      localStorage.removeItem(LOCAL_STORAGE_JOB_KEY);
    }
    await refreshCases();
  }, [activeCase, activeJob, refreshCases]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ReconstructionContext.Provider
      value={{
        cases,
        activeCase,
        activeJob,
        activeModel,
        toast,
        dismissToast,
        selectCase,
        startReconstruction,
        deleteCase,
        refreshCases,
      }}
    >
      {children}
    </ReconstructionContext.Provider>
  );
};

export const useReconstruction = () => {
  const context = useContext(ReconstructionContext);
  if (!context) {
    throw new Error('useReconstruction must be used within a ReconstructionProvider');
  }
  return context;
};
