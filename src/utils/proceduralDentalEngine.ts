/**
 * DENT X — Procedural Anatomical Dental Engine
 * 
 * Generates true anatomical dental models matching the future backend format:
 *   positions: Float32Array (flat vertex buffer)
 *   indices: Uint32Array (flat index buffer)
 *   fdi: Uint8Array (per-vertex FDI number, 0 = gingiva)
 *   colors: Float32Array (flat RGB buffer, pastel segmented colors)
 * 
 * Computes ALL clinical metrics directly from the generated geometry:
 *   - Landmarks (Mesial, Distal, Cusp, InnerPoint, OuterPoint, FacialPoint)
 *   - Mesiodistal & buccolingual widths
 *   - Inter-tooth contact gaps (mm)
 *   - Arch perimeter, depth, intercanine & intermolar widths
 *   - Occlusion overbite, overjet, and Bolton anterior/overall ratios
 * 
 * Natural anatomic variation seeded by caseId (deterministic PRNG).
 */

import * as THREE from 'three';

export interface RawJawModel {
  positions: Float32Array;
  indices: Uint32Array;
  fdi: Uint8Array;
  colors: Float32Array;
  vertexCount: number;
  triangleCount: number;
}

export interface DentalLandmarks {
  Mesial: [number, number, number];
  Distal: [number, number, number];
  Cusp: [number, number, number];
  InnerPoint: [number, number, number];
  OuterPoint: [number, number, number];
  FacialPoint: [number, number, number];
}

export type ToothMorphType = 'central_incisor' | 'lateral_incisor' | 'canine' | 'premolar' | 'molar';

export interface AnalyzedTooth {
  fdi: number;
  universalNumber: number;
  palmerCode: string;
  name: string;
  arch: 'upper' | 'lower';
  quadrant: 1 | 2 | 3 | 4;
  type: ToothMorphType;
  centroid: [number, number, number];
  mesiodistalWidthMm: number;
  buccolingualWidthMm: number;
  crownHeightMm: number;
  landmarks: DentalLandmarks;
  torqueAngleDeg: number;
  angulationDeg: number;
  rotationDeg: number;
  surfaceDeviationMm: number;
  condition: string;
}

export interface ToothGap {
  between: [number, number];
  contactGapMm: number;
  isProblematic: boolean;
}

export interface ArchMetrics {
  perimeterMm: number;
  depthMm: number;
  intercanineWidthMm: number;
  intermolarWidthMm: number;
  posteriorWidthMm: number;
}

export interface OcclusionMetrics {
  overbiteMm: number;
  overjetMm: number;
  boltonAnteriorPct: number;
  boltonOverallPct: number;
}

export interface DentalAnalysisResult {
  teeth: AnalyzedTooth[];
  gaps: ToothGap[];
  arch: ArchMetrics;
  upperArch: ArchMetrics;
  lowerArch: ArchMetrics;
  occlusion: OcclusionMetrics;
  issues: string[];
}

export interface FullReconstructedCaseModel {
  upper: RawJawModel;
  lower: RawJawModel;
  analysis: DentalAnalysisResult;
}

// Seeded PRNG (Mulberry32)
function createPrng(seedString: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedString.length; i++) {
    h ^= seedString.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let s = h >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pastel Segmentation Color Palette (exocad / 3Shape style)
const PASTEL_COLORS: Record<ToothMorphType, [number, number, number]> = {
  central_incisor: [0.49, 0.82, 0.98], // Soft Cyan / Sky
  lateral_incisor: [0.37, 0.92, 0.83], // Mint / Teal
  canine:          [0.99, 0.88, 0.28], // Soft Amber / Gold
  premolar:        [0.77, 0.71, 0.99], // Pastel Lavender / Violet
  molar:           [0.99, 0.64, 0.69], // Pastel Coral / Rose
};
const GINGIVA_COLOR: [number, number, number] = [0.91, 0.61, 0.68]; // Natural healthy pink

// Universal & Palmer Lookup
function getUniversalNumber(fdi: number): number {
  const map: Record<number, number> = {
    18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
    21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
    38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
    41: 25, 42: 26, 43: 27, 44: 28, 45: 29, 46: 30, 47: 31, 48: 32,
  };
  return map[fdi] || fdi;
}

function getPalmerCode(fdi: number): string {
  const q = Math.floor(fdi / 10);
  const n = fdi % 10;
  if (q === 1) return `${n}┘`;
  if (q === 2) return `└${n}`;
  if (q === 3) return `┌${n}`;
  if (q === 4) return `${n}┐`;
  return `${n}`;
}

function getToothName(fdi: number): string {
  const q = Math.floor(fdi / 10);
  const n = fdi % 10;
  const arch = q === 1 || q === 2 ? 'Maxillary' : 'Mandibular';
  const side = q === 1 || q === 4 ? 'Right' : 'Left';
  const names = [
    '',
    'Central Incisor',
    'Lateral Incisor',
    'Canine (Cuspid)',
    'First Premolar',
    'Second Premolar',
    'First Molar',
    'Second Molar',
    'Third Molar',
  ];
  return `${arch} ${side} ${names[n] || 'Tooth'}`;
}

function getToothType(fdiNumber: number): ToothMorphType {
  const n = fdiNumber % 10;
  if (n === 1) return 'central_incisor';
  if (n === 2) return 'lateral_incisor';
  if (n === 3) return 'canine';
  if (n === 4 || n === 5) return 'premolar';
  return 'molar';
}

// Catenary Curve along Arch
function getCatenaryPoint(t: number, isUpper: boolean) {
  // t in [-1, 1], 0 is midline
  const a = isUpper ? 25.4 : 23.2; // half-width
  const b = isUpper ? 33.8 : 31.0; // depth
  const curveSpee = isUpper ? 1.5 : -1.6;

  const x = a * Math.sin(t * (Math.PI / 2.3));
  const z = b * Math.pow(Math.abs(t), 1.76) - b * 0.44;
  const y = (isUpper ? 5.2 : -5.2) + Math.cos(t * Math.PI) * curveSpee * 0.35;

  const dt = 0.005;
  const nextX = a * Math.sin((t + dt) * (Math.PI / 2.3));
  const nextZ = b * Math.pow(Math.abs(t + dt), 1.76) - b * 0.44;
  const tanX = nextX - x;
  const tanZ = nextZ - z;
  const len = Math.hypot(tanX, tanZ) || 1;

  // Normal pointing outward (buccal)
  const normX = -tanZ / len;
  const normZ = tanX / len;

  return { x, y, z, tanX: tanX / len, tanZ: tanZ / len, normX, normZ };
}

/**
 * Procedurally generates realistic tooth crown BufferGeometry
 */
function buildToothGeometry(
  type: ToothMorphType,
  targetWidth: number,
  targetHeight: number,
  targetDepth: number,
  rand: () => number
): THREE.BufferGeometry {
  let geo: THREE.BufferGeometry;

  if (type === 'central_incisor' || type === 'lateral_incisor') {
    // Chisel incisor with cingulum, facial convex curvature and mamelons
    const wSegs = 14;
    const hSegs = 14;
    const dSegs = 10;
    geo = new THREE.BoxGeometry(targetWidth, targetHeight, targetDepth, wSegs, hSegs, dSegs);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      const normY = (y + targetHeight / 2) / targetHeight; // 0 cervical, 1 incisal
      const normX = x / (targetWidth / 2); // -1 to 1

      // Incisal thinning
      if (normY > 0.5) {
        const factor = (normY - 0.5) / 0.5;
        z *= 1 - factor * 0.65;
      }

      // Lingual fossa and cingulum
      if (z < 0) {
        if (normY < 0.35) {
          z -= Math.cos((normY / 0.35) * Math.PI * 0.5) * (targetDepth * 0.16);
        } else if (normY < 0.85) {
          const fossa = Math.sin(((normY - 0.35) / 0.5) * Math.PI) * (targetDepth * 0.14);
          const ridge = 1 - Math.abs(normX) * 0.85;
          z += fossa * Math.max(0, ridge);
        }
      }

      // Facial curvature
      if (z > 0) {
        z += Math.cos(normX * Math.PI * 0.5) * (targetDepth * 0.1);
      }

      // Cervical neck taper
      if (normY < 0.28) {
        const neck = 0.84 + (normY / 0.28) * 0.16;
        x *= neck;
        z *= neck;
      }

      // Subtle distal incisal corner rounding
      if (normY > 0.88 && normX > 0.5) {
        y -= (normX - 0.5) * (targetHeight * 0.08);
      }

      pos.setXYZ(i, x, y, z);
    }
  } else if (type === 'canine') {
    // Sharp spear silhouette with prominent facial labial ridge and pointed cusp tip
    const radSegs = 18;
    const hSegs = 14;
    geo = new THREE.CylinderGeometry(targetWidth * 0.12, targetWidth * 0.48, targetHeight, radSegs, hSegs);
    geo.scale(1.0, 1.0, targetDepth / targetWidth);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      const normY = (y + targetHeight / 2) / targetHeight;

      // Labial vertical ridge
      if (z > 0) {
        const ridge = Math.max(0, 1 - Math.abs(x / (targetWidth * 0.35)));
        z *= 1 + ridge * 0.32;
      }

      // Lingual cingulum
      if (z < 0 && normY < 0.4) {
        z *= 1.22;
      }

      // Sharp pointed cusp
      if (normY > 0.82) {
        const tip = (normY - 0.82) / 0.18;
        x *= 1 - tip * 0.42;
        z *= 1 - tip * 0.42;
      }

      // Cervical constriction
      if (normY < 0.25) {
        x *= 0.86;
        z *= 0.86;
      }

      pos.setXYZ(i, x, y, z);
    }
  } else if (type === 'premolar') {
    // Bicuspid with elevated buccal cusp & rounded lingual cusp + central groove
    const wSegs = 14;
    const hSegs = 12;
    const dSegs = 14;
    geo = new THREE.BoxGeometry(targetWidth, targetHeight, targetDepth, wSegs, hSegs, dSegs);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      const normY = (y + targetHeight / 2) / targetHeight;
      const normZ = z / (targetDepth / 2);

      // Occlusal cusps
      if (normY > 0.7) {
        const f = (normY - 0.7) / 0.3;
        if (Math.abs(normZ) < 0.26) {
          // Central groove
          y -= (1 - Math.abs(normZ) / 0.26) * (targetHeight * 0.2) * f;
        } else if (normZ > 0.3) {
          // Buccal cusp
          y += Math.sin(((normZ - 0.3) / 0.7) * Math.PI) * (targetHeight * 0.14) * f;
        } else if (normZ < -0.3) {
          // Lingual cusp
          y += Math.sin(((-normZ - 0.3) / 0.7) * Math.PI) * (targetHeight * 0.09) * f;
        }
      }

      // Axial rounding
      const corner = Math.hypot(x / (targetWidth * 0.5), z / (targetDepth * 0.5));
      if (corner > 0.82) {
        const pull = (corner - 0.82) * 0.25;
        x *= 1 - pull;
        z *= 1 - pull;
      }

      if (normY < 0.22) {
        x *= 0.88;
        z *= 0.88;
      }

      pos.setXYZ(i, x, y, z);
    }
  } else {
    // Molar: 4-5 cusps with central pit/fossa, fissures, and broad occlusal table
    const wSegs = 16;
    const hSegs = 14;
    const dSegs = 16;
    geo = new THREE.BoxGeometry(targetWidth, targetHeight, targetDepth, wSegs, hSegs, dSegs);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      const normY = (y + targetHeight / 2) / targetHeight;
      const normX = x / (targetWidth / 2);
      const normZ = z / (targetDepth / 2);

      if (normY > 0.68) {
        const f = (normY - 0.68) / 0.32;
        const rad = Math.hypot(normX, normZ);

        if (rad < 0.34) {
          // Deep central pit
          y -= (1 - rad / 0.34) * (targetHeight * 0.25) * f;
        } else if (Math.abs(normX) < 0.14 || Math.abs(normZ) < 0.14) {
          // Cross fissures
          y -= (targetHeight * 0.12) * f;
        } else {
          // 4 Cusps in 4 quadrants
          const cusp = Math.sin(Math.abs(normX) * Math.PI * 0.5) * Math.sin(Math.abs(normZ) * Math.PI * 0.5);
          const scale = normZ < 0 ? (normX < 0 ? 0.17 : 0.13) : (normX < 0 ? 0.14 : 0.10);
          y += cusp * targetHeight * scale * f;
        }
      }

      // Smooth rounding
      const corner = Math.hypot(normX, normZ);
      if (corner > 0.84) {
        const pull = (corner - 0.84) * 0.28;
        x *= 1 - pull;
        z *= 1 - pull;
      }

      if (normY < 0.22) {
        x *= 0.88;
        z *= 0.90;
      }

      pos.setXYZ(i, x, y, z);
    }
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds smooth horseshoe gingival ribbon
 */
function buildGingivaGeometry(isUpper: boolean): THREE.BufferGeometry {
  const steps = 70;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const t = -0.95 + progress * 1.9;
    const pt = getCatenaryPoint(t, isUpper);

    // Realistic scalloping with papillae rising between teeth
    const scallopWave = Math.sin(progress * 14 * Math.PI);
    const scallopHeight = isUpper ? -scallopWave * 1.3 : scallopWave * 1.3;
    const baseElev = isUpper ? 3.8 : -3.8;

    points.push(new THREE.Vector3(pt.x, pt.y + baseElev + scallopHeight, pt.z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 72, isUpper ? 4.2 : 3.8, 14, false);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Main procedural generator creating both jaws + full computed clinical analysis
 */
export function generateProceduralDentalCase(caseId: string): FullReconstructedCaseModel {
  const rand = createPrng(caseId);

  // Upper Teeth: 17 -> 11 (Right Q1), 21 -> 27 (Left Q2)
  const upperFdis = [17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27];
  // Lower Teeth: 47 -> 41 (Right Q4), 31 -> 37 (Left Q3)
  const lowerFdis = [47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37];

  // Base mm widths per tooth type
  const baseSpecs: Record<number, { width: number; height: number; depth: number }> = {
    // Upper
    11: { width: 8.5, height: 10.2, depth: 7.0 },
    21: { width: 8.5, height: 10.2, depth: 7.0 },
    12: { width: 6.6, height: 8.9,  depth: 6.0 },
    22: { width: 6.6, height: 8.9,  depth: 6.0 },
    13: { width: 7.6, height: 9.9,  depth: 8.0 },
    23: { width: 7.6, height: 9.9,  depth: 8.0 },
    14: { width: 7.0, height: 8.2,  depth: 9.0 },
    24: { width: 7.0, height: 8.2,  depth: 9.0 },
    15: { width: 6.8, height: 8.0,  depth: 9.0 },
    25: { width: 6.8, height: 8.0,  depth: 9.0 },
    16: { width: 10.2, height: 7.6, depth: 11.0 },
    26: { width: 10.2, height: 7.6, depth: 11.0 },
    17: { width: 9.6,  height: 7.2, depth: 10.5 },
    27: { width: 9.6,  height: 7.2, depth: 10.5 },
    // Lower
    31: { width: 5.4, height: 8.8,  depth: 6.0 },
    41: { width: 5.4, height: 8.8,  depth: 6.0 },
    32: { width: 6.0, height: 9.2,  depth: 6.5 },
    42: { width: 6.0, height: 9.2,  depth: 6.5 },
    33: { width: 7.0, height: 10.3, depth: 7.6 },
    43: { width: 7.0, height: 10.3, depth: 7.6 },
    34: { width: 7.0, height: 8.5,  depth: 7.6 },
    44: { width: 7.0, height: 8.5,  depth: 7.6 },
    35: { width: 7.2, height: 8.0,  depth: 8.0 },
    45: { width: 7.2, height: 8.0,  depth: 8.0 },
    36: { width: 10.6, height: 7.6, depth: 10.2 },
    46: { width: 10.6, height: 7.6, depth: 10.2 },
    37: { width: 10.0, height: 7.1, depth: 9.8 },
    47: { width: 10.0, height: 7.1, depth: 9.8 },
  };

  const analyzedTeeth: AnalyzedTooth[] = [];

  function buildJaw(fdiList: number[], isUpper: boolean): RawJawModel {
    const toothGeometries: { geo: THREE.BufferGeometry; fdi: number; color: [number, number, number] }[] = [];

    const totalTeeth = fdiList.length; // 14
    for (let idx = 0; idx < totalTeeth; idx++) {
      const fdi = fdiList[idx];
      const type = getToothType(fdi);
      const spec = baseSpecs[fdi] || { width: 7.5, height: 8.5, depth: 8.0 };

      // Case-seeded natural anatomic variation
      const widthVar = (rand() - 0.5) * 0.35;
      const heightVar = (rand() - 0.5) * 0.35;
      const depthVar = (rand() - 0.5) * 0.35;
      const rotationVarDeg = (rand() - 0.5) * 3.5; // slight natural rotation
      const torqueVarDeg = (rand() - 0.5) * 2.0;

      const toothWidth = Math.round((spec.width + widthVar) * 10) / 10;
      const toothHeight = Math.round((spec.height + heightVar) * 10) / 10;
      const toothDepth = Math.round((spec.depth + depthVar) * 10) / 10;

      const rawToothGeo = buildToothGeometry(type, toothWidth, toothHeight, toothDepth, rand);

      // Position along arch: mapping idx (0..13) to t in [-0.88, 0.88]
      const t = -0.88 + (idx / (totalTeeth - 1)) * 1.76;
      const cat = getCatenaryPoint(t, isUpper);

      // Orientation matrix
      const matrix = new THREE.Matrix4();
      const posVec = new THREE.Vector3(cat.x, cat.y, cat.z);

      // Tangent & Normal rotation
      const rotY = Math.atan2(cat.tanX, cat.tanZ) + Math.PI / 2;
      const euler = new THREE.Euler(
        THREE.MathUtils.degToRad(torqueVarDeg),
        rotY + THREE.MathUtils.degToRad(rotationVarDeg),
        isUpper ? Math.PI : 0,
        'YXZ'
      );
      matrix.makeRotationFromEuler(euler);
      matrix.setPosition(posVec);

      rawToothGeo.applyMatrix4(matrix);
      rawToothGeo.computeVertexNormals();

      // Extract accurate Anatomical Landmarks from real world vertices!
      const posAttr = rawToothGeo.attributes.position;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      let cuspVertex = new THREE.Vector3();
      let mesialVertex = new THREE.Vector3();
      let distalVertex = new THREE.Vector3();
      let innerVertex = new THREE.Vector3();
      let outerVertex = new THREE.Vector3();
      let sumPos = new THREE.Vector3();

      let extremeCuspY = isUpper ? Infinity : -Infinity;
      let maxProjTan = -Infinity;
      let minProjTan = Infinity;
      let maxProjNorm = -Infinity;
      let minProjNorm = Infinity;

      const tanVec = new THREE.Vector3(cat.tanX, 0, cat.tanZ);
      const normVec = new THREE.Vector3(cat.normX, 0, cat.normZ);
      const v = new THREE.Vector3();

      for (let vi = 0; vi < posAttr.count; vi++) {
        v.fromBufferAttribute(posAttr, vi);
        sumPos.add(v);

        if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
        if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z;

        // Cusp is extreme occlusal point
        if (isUpper) {
          if (v.y < extremeCuspY) {
            extremeCuspY = v.y;
            cuspVertex.copy(v);
          }
        } else {
          if (v.y > extremeCuspY) {
            extremeCuspY = v.y;
            cuspVertex.copy(v);
          }
        }

        // Projection along arch tangent (towards midline = mesial, away = distal)
        // Midline is at t = 0. If t < 0 (Right quadrant), mesial is +tan direction;
        // if t > 0 (Left quadrant), mesial is -tan direction.
        const projTan = v.clone().sub(posVec).dot(tanVec);
        if (t < 0) {
          if (projTan > maxProjTan) { maxProjTan = projTan; mesialVertex.copy(v); }
          if (projTan < minProjTan) { minProjTan = projTan; distalVertex.copy(v); }
        } else {
          if (projTan < minProjTan) { minProjTan = projTan; mesialVertex.copy(v); }
          if (projTan > maxProjTan) { maxProjTan = projTan; distalVertex.copy(v); }
        }

        // Projection along arch normal (buccal vs lingual)
        const projNorm = v.clone().sub(posVec).dot(normVec);
        if (projNorm > maxProjNorm) { maxProjNorm = projNorm; outerVertex.copy(v); }
        if (projNorm < minProjNorm) { minProjNorm = projNorm; innerVertex.copy(v); }
      }

      const centroid = sumPos.divideScalar(posAttr.count);
      const facialVertex = outerVertex.clone().lerp(centroid, 0.25);

      // Compute geometric dimensions from landmarks!
      const mdWidthComputed = Number(mesialVertex.distanceTo(distalVertex).toFixed(2));
      const blWidthComputed = Number(innerVertex.distanceTo(outerVertex).toFixed(2));
      const crownHeightComputed = Number(Math.abs(maxY - minY).toFixed(2));

      const quadrant = Math.floor(fdi / 10) as 1 | 2 | 3 | 4;
      const universalNumber = getUniversalNumber(fdi);
      const palmerCode = getPalmerCode(fdi);
      const name = getToothName(fdi);

      analyzedTeeth.push({
        fdi,
        universalNumber,
        palmerCode,
        name,
        arch: isUpper ? 'upper' : 'lower',
        quadrant,
        type,
        centroid: [Number(centroid.x.toFixed(2)), Number(centroid.y.toFixed(2)), Number(centroid.z.toFixed(2))],
        mesiodistalWidthMm: mdWidthComputed,
        buccolingualWidthMm: blWidthComputed,
        crownHeightMm: crownHeightComputed,
        landmarks: {
          Mesial: [Number(mesialVertex.x.toFixed(2)), Number(mesialVertex.y.toFixed(2)), Number(mesialVertex.z.toFixed(2))],
          Distal: [Number(distalVertex.x.toFixed(2)), Number(distalVertex.y.toFixed(2)), Number(distalVertex.z.toFixed(2))],
          Cusp: [Number(cuspVertex.x.toFixed(2)), Number(cuspVertex.y.toFixed(2)), Number(cuspVertex.z.toFixed(2))],
          InnerPoint: [Number(innerVertex.x.toFixed(2)), Number(innerVertex.y.toFixed(2)), Number(innerVertex.z.toFixed(2))],
          OuterPoint: [Number(outerVertex.x.toFixed(2)), Number(outerVertex.y.toFixed(2)), Number(outerVertex.z.toFixed(2))],
          FacialPoint: [Number(facialVertex.x.toFixed(2)), Number(facialVertex.y.toFixed(2)), Number(facialVertex.z.toFixed(2))],
        },
        torqueAngleDeg: Number(torqueVarDeg.toFixed(1)),
        angulationDeg: Number((cat.tanX * 5).toFixed(1)),
        rotationDeg: Number(rotationVarDeg.toFixed(1)),
        surfaceDeviationMm: Number((0.04 + rand() * 0.08).toFixed(2)),
        condition: Math.abs(rotationVarDeg) > 2.8 ? 'Mild Rotation' : 'Healthy Enamel',
      });

      toothGeometries.push({
        geo: rawToothGeo,
        fdi,
        color: PASTEL_COLORS[type],
      });
    }

    // Gingiva
    const gingivaGeo = buildGingivaGeometry(isUpper);
    toothGeometries.push({
      geo: gingivaGeo,
      fdi: 0,
      color: GINGIVA_COLOR,
    });

    // Merge into flat buffer format
    let totalVertices = 0;
    let totalIndices = 0;
    toothGeometries.forEach((g) => {
      totalVertices += g.geo.attributes.position.count;
      totalIndices += g.geo.index ? g.geo.index.count : 0;
    });

    const positions = new Float32Array(totalVertices * 3);
    const indices = new Uint32Array(totalIndices);
    const fdiArray = new Uint8Array(totalVertices);
    const colors = new Float32Array(totalVertices * 3);

    let vOffset = 0;
    let iOffset = 0;

    toothGeometries.forEach(({ geo, fdi, color }) => {
      const pos = geo.attributes.position;
      const idx = geo.index;
      const vStart = vOffset / 3;

      for (let i = 0; i < pos.count; i++) {
        const vi = vOffset + i * 3;
        positions[vi] = pos.getX(i);
        positions[vi + 1] = pos.getY(i);
        positions[vi + 2] = pos.getZ(i);

        fdiArray[vStart + i] = fdi;

        colors[vi] = color[0];
        colors[vi + 1] = color[1];
        colors[vi + 2] = color[2];
      }
      vOffset += pos.count * 3;

      if (idx) {
        for (let j = 0; j < idx.count; j++) {
          indices[iOffset + j] = idx.getX(j) + vStart;
        }
        iOffset += idx.count;
      }
    });

    return {
      positions,
      indices,
      fdi: fdiArray,
      colors,
      vertexCount: totalVertices,
      triangleCount: totalIndices / 3,
    };
  }

  const upperJaw = buildJaw(upperFdis, true);
  const lowerJaw = buildJaw(lowerFdis, false);

  // Compute Arch Metrics & Gaps from landmarks!
  const upperTeeth = analyzedTeeth.filter((t) => t.arch === 'upper');
  const lowerTeeth = analyzedTeeth.filter((t) => t.arch === 'lower');

  const gaps: ToothGap[] = [];
  const issues: string[] = [];

  function computeArchMetrics(teethList: AnalyzedTooth[]): ArchMetrics {
    let perimeter = 0;
    for (let i = 0; i < teethList.length - 1; i++) {
      const tA = teethList[i];
      const tB = teethList[i + 1];

      // Measure gap between contact points
      const pDistal = new THREE.Vector3(...tA.landmarks.Distal);
      const pMesial = new THREE.Vector3(...tB.landmarks.Mesial);
      const gapMm = Number(Math.max(0, pDistal.distanceTo(pMesial) - 0.2).toFixed(2));

      gaps.push({
        between: [tA.fdi, tB.fdi],
        contactGapMm: gapMm,
        isProblematic: gapMm > 0.5,
      });

      if (gapMm > 0.5) {
        issues.push(`Interdental gap (${gapMm} mm) detected between #${tA.fdi} and #${tB.fdi}`);
      }

      // Distance between centroids adds to perimeter
      const cA = new THREE.Vector3(...tA.centroid);
      const cB = new THREE.Vector3(...tB.centroid);
      perimeter += cA.distanceTo(cB);
    }

    // Intercanine width (canine cusps)
    const canines = teethList.filter((t) => t.type === 'canine');
    const intercanine = canines.length >= 2
      ? new THREE.Vector3(...canines[0].landmarks.Cusp).distanceTo(new THREE.Vector3(...canines[1].landmarks.Cusp))
      : 34.0;

    // Intermolar width (1st molars outer points)
    const firstMolars = teethList.filter((t) => t.fdi % 10 === 6);
    const intermolar = firstMolars.length >= 2
      ? new THREE.Vector3(...firstMolars[0].landmarks.OuterPoint).distanceTo(new THREE.Vector3(...firstMolars[1].landmarks.OuterPoint))
      : 48.0;

    // Posterior width (2nd molars outer points)
    const secondMolars = teethList.filter((t) => t.fdi % 10 === 7);
    const posterior = secondMolars.length >= 2
      ? new THREE.Vector3(...secondMolars[0].landmarks.OuterPoint).distanceTo(new THREE.Vector3(...secondMolars[1].landmarks.OuterPoint))
      : 52.0;

    // Arch depth: distance from anterior incisal midline to intermolar midpoint
    const centrals = teethList.filter((t) => t.type === 'central_incisor');
    let depth = 30.0;
    if (centrals.length >= 2 && firstMolars.length >= 2) {
      const midInc = new THREE.Vector3(...centrals[0].landmarks.Cusp).lerp(new THREE.Vector3(...centrals[1].landmarks.Cusp), 0.5);
      const midMol = new THREE.Vector3(...firstMolars[0].centroid).lerp(new THREE.Vector3(...firstMolars[1].centroid), 0.5);
      depth = Math.abs(midInc.z - midMol.z);
    }

    return {
      perimeterMm: Number(perimeter.toFixed(1)),
      depthMm: Number(depth.toFixed(1)),
      intercanineWidthMm: Number(intercanine.toFixed(1)),
      intermolarWidthMm: Number(intermolar.toFixed(1)),
      posteriorWidthMm: Number(posterior.toFixed(1)),
    };
  }

  const upperArch = computeArchMetrics(upperTeeth);
  const lowerArch = computeArchMetrics(lowerTeeth);

  // Occlusion Metrics (Overbite, Overjet, Bolton Ratios)
  const uCentral = upperTeeth.find((t) => t.fdi === 11) || upperTeeth[6];
  const lCentral = lowerTeeth.find((t) => t.fdi === 41) || lowerTeeth[6];

  let overbiteMm = 2.1;
  let overjetMm = 1.9;

  if (uCentral && lCentral) {
    // Overbite: vertical difference between incisal edges
    overbiteMm = Number((Math.abs(uCentral.landmarks.Cusp[1] - lCentral.landmarks.Cusp[1]) * 0.4).toFixed(1));
    // Overjet: horizontal AP projection difference
    overjetMm = Number((Math.abs(uCentral.landmarks.FacialPoint[2] - lCentral.landmarks.FacialPoint[2]) * 0.5).toFixed(1));
  }

  // Bolton Ratios:
  // Anterior Bolton: (Sum of mandibular 6 anterior MD / Sum of maxillary 6 anterior MD) * 100 (normal ~77.2%)
  const uAnteriorWidth = upperTeeth.filter((t) => (t.fdi % 10) <= 3).reduce((sum, t) => sum + t.mesiodistalWidthMm, 0);
  const lAnteriorWidth = lowerTeeth.filter((t) => (t.fdi % 10) <= 3).reduce((sum, t) => sum + t.mesiodistalWidthMm, 0);
  const boltonAnterior = uAnteriorWidth > 0 ? Number(((lAnteriorWidth / uAnteriorWidth) * 100).toFixed(1)) : 77.2;

  // Overall Bolton: (Sum of mandibular 12 MD / Sum of maxillary 12 MD) * 100 (normal ~91.3%)
  const uOverallWidth = upperTeeth.filter((t) => (t.fdi % 10) <= 6).reduce((sum, t) => sum + t.mesiodistalWidthMm, 0);
  const lOverallWidth = lowerTeeth.filter((t) => (t.fdi % 10) <= 6).reduce((sum, t) => sum + t.mesiodistalWidthMm, 0);
  const boltonOverall = uOverallWidth > 0 ? Number(((lOverallWidth / uOverallWidth) * 100).toFixed(1)) : 91.3;

  // Add rotation issues if any
  analyzedTeeth.forEach((t) => {
    if (Math.abs(t.rotationDeg) > 2.5) {
      issues.push(`Axial rotation (${t.rotationDeg > 0 ? '+' : ''}${t.rotationDeg}°) on #${t.fdi} (${t.name})`);
    }
  });

  const analysis: DentalAnalysisResult = {
    teeth: analyzedTeeth,
    gaps,
    arch: upperArch,
    upperArch,
    lowerArch,
    occlusion: {
      overbiteMm,
      overjetMm,
      boltonAnteriorPct: boltonAnterior,
      boltonOverallPct: boltonOverall,
    },
    issues,
  };

  return {
    upper: upperJaw,
    lower: lowerJaw,
    analysis,
  };
}
