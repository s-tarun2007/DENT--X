/**
 * DENT X — IndexedDB Persistent Case & Digital Twin Storage
 * Provides zero-dependency client-side persistence for dental cases,
 * uploaded intraoral image metadata, processing states, analysis metrics,
 * and reconstructed 3D geometry buffers.
 */

export interface StoredCaseImage {
  id: string;
  name: string;
  viewAngle: string;
  resolution: string;
  sizeBytes: number;
  dataUrl?: string;
  timestamp: string;
  blurVariance: number;
  isSharp: boolean;
  brightness: number;
  isGoodExposure: boolean;
}

export interface StoredDentalCase {
  id: string;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: 'Female' | 'Male' | 'Other';
  scanDate: string;
  archType: 'upper' | 'lower' | 'both';
  status: 'completed' | 'processing' | 'queued' | 'failed';
  notes: string;
  images: StoredCaseImage[];
  qualityScore: number;
  startedAt?: number;
  completedAt?: number;
  durationSeconds?: number;
  // Raw geometry buffers stored as ArrayBuffers for fast zero-copy loading
  upperModel?: {
    positions: ArrayBuffer;
    indices: ArrayBuffer;
    fdi: ArrayBuffer;
    colors: ArrayBuffer;
  };
  lowerModel?: {
    positions: ArrayBuffer;
    indices: ArrayBuffer;
    fdi: ArrayBuffer;
    colors: ArrayBuffer;
  };
  analysis?: any;
}

const DB_NAME = 'dentx_clinical_db';
const DB_VERSION = 1;
const STORE_CASES = 'cases';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CASES)) {
        db.createObjectStore(STORE_CASES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const casesDb = {
  async getAllCases(): Promise<StoredDentalCase[]> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CASES, 'readonly');
        const store = tx.objectStore(STORE_CASES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB not accessible, returning empty cases', e);
      return [];
    }
  },

  async getCase(id: string): Promise<StoredDentalCase | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CASES, 'readonly');
        const store = tx.objectStore(STORE_CASES);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  async saveCase(c: StoredDentalCase): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CASES, 'readwrite');
      const store = tx.objectStore(STORE_CASES);
      const req = store.put(c);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async updateCase(id: string, partial: Partial<StoredDentalCase>): Promise<void> {
    const existing = await this.getCase(id);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    await this.saveCase(updated);
  },

  async deleteCase(id: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CASES, 'readwrite');
      const store = tx.objectStore(STORE_CASES);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async clearAllCases(): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CASES, 'readwrite');
      const store = tx.objectStore(STORE_CASES);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
};
