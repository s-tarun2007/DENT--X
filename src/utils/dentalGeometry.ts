/**
 * DENT X — High-Fidelity Anatomical 3D Dental Geometry Engine
 * Generates true anatomical tooth crowns (incisors with cingula, canines with labial ridges,
 * premolars with bicuspid occlusal tables, and multi-cusped molars with central fissures)
 * paired with scalloped gingiva featuring interdental papillae and clinical PBR enamel.
 */

import * as THREE from 'three';
import { ToothData } from '../types/dental';

export interface DentalModelBuildResult {
  group: THREE.Group;
  upperArchGroup: THREE.Group;
  lowerArchGroup: THREE.Group;
  toothMeshesMap: Map<number, THREE.Mesh>; // FDI tooth number -> Mesh
  upperGingivaMesh: THREE.Mesh;
  lowerGingivaMesh: THREE.Mesh;
  dispose: () => void;
}

// Clinical PBR Enamel & Gingival Material Presets
export function createDentalMaterials() {
  // Primary Clinical Enamel Material (realistic physical clearcoat, subtle translucency & ivory tint)
  const enamelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfcfaf6,
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.95,
    clearcoatRoughness: 0.1,
    transmission: 0.06,
    ior: 1.63,
    reflectivity: 0.6,
    specularColor: new THREE.Color(0xffffff)
  });

  // Selected Tooth Highlight Material: Retains underlying anatomical geometry, applies clinical teal emissive glow
  const selectedEnamelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf0fdfa,
    emissive: 0x0d9488, // Precision teal emissive
    emissiveIntensity: 0.42,
    roughness: 0.16,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    transmission: 0.04,
    ior: 1.63
  });

  // Hover Highlight Material
  const hoverEnamelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf0f9ff,
    emissive: 0x0284c7, // Clean medical blue glow
    emissiveIntensity: 0.25,
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.95
  });

  // Natural Scalloped Gingiva (healthy clinical pink with stippled soft sheen)
  const gingivaMaterial = new THREE.MeshStandardMaterial({
    color: 0xdc7e92,
    roughness: 0.45,
    metalness: 0.02,
    bumpScale: 0.06
  });

  // Wireframe Surface Analysis Mode
  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x0d9488,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  });

  return {
    enamel: enamelMaterial,
    selected: selectedEnamelMaterial,
    hover: hoverEnamelMaterial,
    gingiva: gingivaMaterial,
    wireframe: wireframeMaterial
  };
}

// Convert deviation error in millimeters to clinical diagnostic colormap
export function getDeviationColor(deviationMm: number): THREE.Color {
  const absDev = Math.abs(deviationMm);
  if (absDev <= 0.12) {
    return new THREE.Color(0x0d9488); // Precision within tolerance
  } else if (absDev <= 0.28) {
    return new THREE.Color(0x10b981); // Acceptable clinical shift
  } else if (absDev <= 0.48) {
    return new THREE.Color(0xf59e0b); // Moderate deviation
  } else {
    return new THREE.Color(0xef4444); // Critical deviation
  }
}

/**
 * Creates true anatomical crown geometry with natural morphology, organic line angles,
 * and distinct tooth features (cingulum, developmental depressions, cusp ridges, fossae).
 */
function createAnatomicalCrownGeometry(tooth: ToothData): THREE.BufferGeometry {
  const height = tooth.crownHeight * 0.92;
  const mdWidth = tooth.mesiodistalWidth * 0.92;
  const blWidth = tooth.buccolingualWidth * 0.92;

  let geometry: THREE.BufferGeometry;

  if (tooth.type === 'incisor') {
    // ANATOMICAL INCISOR:
    // - Convex labial face with gentle vertical lobes
    // - Concave lingual fossa bordered by mesial and distal marginal ridges
    // - Prominent cervical cingulum bulge
    // - Chisel incisal edge with acute mesio-incisal angle & rounded disto-incisal angle
    const widthSegs = 14;
    const heightSegs = 16;
    const depthSegs = 12;
    geometry = new THREE.BoxGeometry(mdWidth, height, blWidth, widthSegs, heightSegs, depthSegs);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // normY: 0 at cervical neck, 1 at incisal edge
      const normY = (y + height / 2) / height;
      const normX = x / (mdWidth / 2); // -1 to 1

      // 1. Incisal edge tapering faciolingually
      if (normY > 0.55) {
        const factor = (normY - 0.55) / 0.45;
        pos.setZ(i, z * (1 - factor * 0.68));
      }

      // 2. Lingual surface anatomy (z < 0):
      if (z < 0) {
        if (normY < 0.38) {
          // Cervical cingulum prominence
          pos.setZ(i, z - Math.cos((normY / 0.38) * Math.PI * 0.5) * (blWidth * 0.16));
        } else if (normY < 0.85) {
          // Concave lingual fossa in middle third
          const fossaDepth = Math.sin(((normY - 0.38) / 0.47) * Math.PI) * (blWidth * 0.14);
          // Preserve marginal ridges at edges
          const ridgeFactor = 1 - Math.pow(Math.abs(normX), 2);
          pos.setZ(i, z + fossaDepth * Math.max(0, ridgeFactor));
        }
      }

      // 3. Labial surface anatomy (z > 0):
      if (z > 0) {
        // Natural facial convex curvature and developmental depression
        const labialBulge = Math.cos(normX * Math.PI * 0.5) * (blWidth * 0.1);
        pos.setZ(i, z + labialBulge);
      }

      // 4. Cervical neck constriction (narrowing at the gumline)
      if (normY < 0.3) {
        const neckTaper = 0.82 + (normY / 0.3) * 0.18;
        pos.setX(i, x * neckTaper);
        pos.setZ(i, pos.getZ(i) * neckTaper);
      }

      // 5. Asymmetry: Round the distal-incisal corner slightly more than mesial
      if (normY > 0.85 && normX > 0.6) {
        pos.setY(i, y - (normX - 0.6) * (height * 0.12));
      }
    }
  } else if (tooth.type === 'canine') {
    // ANATOMICAL CANINE:
    // - Strong spear/pentagonal facial contour with prominent labial vertical ridge
    // - Sharp cusp tip with mesial and distal cusp slopes
    // - Convex lingual surface with distinct cingulum and lingual ridge
    const radSegs = 20;
    const heightSegs = 14;
    geometry = new THREE.CylinderGeometry(mdWidth * 0.12, mdWidth * 0.48, height, radSegs, heightSegs);
    geometry.scale(1.0, 1.0, blWidth / mdWidth);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const normY = (y + height / 2) / height;

      // Prominent facial labial ridge running down center of tooth
      if (z > 0) {
        const ridgeProfile = Math.max(0, 1 - Math.abs(x / (mdWidth * 0.38)));
        pos.setZ(i, z * (1 + ridgeProfile * 0.35));
      }

      // Lingual cingulum and dual fossae
      if (z < 0 && normY < 0.4) {
        pos.setZ(i, z * 1.25);
      }

      // Pointed cusp tip contour
      if (normY > 0.8) {
        const tipFactor = (normY - 0.8) / 0.2;
        pos.setX(i, x * (1 - tipFactor * 0.4));
        pos.setZ(i, z * (1 - tipFactor * 0.4));
      }

      // Cervical neck constriction
      if (normY < 0.25) {
        pos.setX(i, x * 0.86);
        pos.setZ(i, z * 0.86);
      }
    }
  } else if (tooth.type === 'premolar') {
    // ANATOMICAL PREMOLAR (BICUSPID):
    // - Two distinct cusps (Buccal cusp and Lingual/Palatal cusp)
    // - Central developmental groove running mesiodistally between cusps
    // - Mesial and distal marginal ridges and triangular pits
    // - Rounded, bulbous axial walls
    const widthSegs = 16;
    const heightSegs = 14;
    const depthSegs = 16;
    geometry = new THREE.BoxGeometry(mdWidth, height, blWidth, widthSegs, heightSegs, depthSegs);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const normY = (y + height / 2) / height;
      const normZ = z / (blWidth / 2); // -1 (lingual) to +1 (buccal)

      // 1. Occlusal Table Cusps (Buccal cusp elevated higher, lingual cusp rounded)
      if (normY > 0.72) {
        const occlusalFactor = (normY - 0.72) / 0.28;
        // Central groove dip in the middle
        if (Math.abs(normZ) < 0.28) {
          const grooveDepth = (1 - Math.abs(normZ) / 0.28) * (height * 0.22);
          pos.setY(i, y - grooveDepth * occlusalFactor);
        } else if (normZ > 0.35) {
          // Elevated buccal cusp peak
          const cuspRise = Math.sin(((normZ - 0.35) / 0.65) * Math.PI) * (height * 0.12);
          pos.setY(i, y + cuspRise * occlusalFactor);
        } else if (normZ < -0.35) {
          // Rounded lingual cusp peak
          const cuspRise = Math.sin(((-normZ - 0.35) / 0.65) * Math.PI) * (height * 0.08);
          pos.setY(i, y + cuspRise * occlusalFactor);
        }
      }

      // 2. Round the axial corners for organic crown curvature
      const cornerDistance = Math.sqrt(Math.pow(x / (mdWidth * 0.5), 2) + Math.pow(z / (blWidth * 0.5), 2));
      if (cornerDistance > 0.8) {
        const pull = (cornerDistance - 0.8) * 0.25;
        pos.setX(i, x * (1 - pull));
        pos.setZ(i, z * (1 - pull));
      }

      // 3. Buccal height of contour (cervical third bulge)
      if (normZ > 0 && normY > 0.25 && normY < 0.55) {
        pos.setZ(i, z * 1.08);
      }

      // 4. Cervical constriction at gumline
      if (normY < 0.22) {
        pos.setX(i, x * 0.86);
        pos.setZ(i, z * 0.88);
      }
    }
  } else {
    // ANATOMICAL MOLAR:
    // - Large rhomboid / trapezoidal occlusal table
    // - 4 to 5 distinct anatomical cusps:
    //   * Mesiobuccal cusp
    //   * Distobuccal cusp
    //   * Mesiolingual cusp
    //   * Distolingual cusp
    // - Deep central fossa with central developmental groove and buccal groove
    // - Bulbous cervical contour and rounded marginal ridges
    const widthSegs = 20;
    const heightSegs = 16;
    const depthSegs = 20;
    geometry = new THREE.BoxGeometry(mdWidth, height, blWidth, widthSegs, heightSegs, depthSegs);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const normY = (y + height / 2) / height;
      const normX = x / (mdWidth / 2); // -1 (mesial) to 1 (distal)
      const normZ = z / (blWidth / 2); // -1 (lingual) to 1 (buccal)

      // 1. Occlusal Table Anatomy & Multi-Cusp Geometry (normY > 0.68)
      if (normY > 0.68) {
        const occlusalFactor = (normY - 0.68) / 0.32;
        const distFromCenter = Math.sqrt(normX * normX + normZ * normZ);

        // Deep central fossa pit
        if (distFromCenter < 0.35) {
          const pitDepth = (1 - distFromCenter / 0.35) * (height * 0.26);
          pos.setY(i, y - pitDepth * occlusalFactor);
        }
        // Branching buccal and lingual developmental grooves
        else if (Math.abs(normX) < 0.15 || Math.abs(normZ) < 0.15) {
          pos.setY(i, y - height * 0.12 * occlusalFactor);
        }
        // 4 Multi-Cusp Elevations in the quadrants:
        else {
          const cuspProfile = Math.sin(Math.abs(normX) * Math.PI * 0.5) * Math.sin(Math.abs(normZ) * Math.PI * 0.5);
          // Mesiolingual cusp is largest, distobuccal is slightly lower
          const cuspHeightScale = normZ < 0 ? (normX < 0 ? 0.16 : 0.12) : (normX < 0 ? 0.14 : 0.10);
          pos.setY(i, y + cuspProfile * height * cuspHeightScale * occlusalFactor);
        }
      }

      // 2. Organic axial rounding (avoid any boxy corners)
      const radDist = Math.sqrt(normX * normX + normZ * normZ);
      if (radDist > 0.85) {
        const smoothing = (radDist - 0.85) * 0.28;
        pos.setX(i, x * (1 - smoothing));
        pos.setZ(i, z * (1 - smoothing));
      }

      // 3. Buccal cervical ridge bulge in cervical third
      if (normZ > 0.3 && normY > 0.2 && normY < 0.5) {
        pos.setZ(i, z * 1.1);
      }

      // 4. Cervical neck constriction
      if (normY < 0.22) {
        pos.setX(i, x * 0.88);
        pos.setZ(i, z * 0.9);
      }
    }
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Calculates coordinates along standard dental catenary curve.
 */
function getArchPoint(t: number, isUpper: boolean): { x: number; y: number; z: number; tangentX: number; tangentZ: number } {
  const a = isUpper ? 25.0 : 22.4; // arch half-width
  const b = isUpper ? 34.5 : 31.2; // arch depth
  const curveOfSpee = isUpper ? 1.6 : -1.8;

  // Catenary Curve: z = b * (|t|^1.75)
  const x = a * Math.sin(t * (Math.PI / 2.32));
  const z = b * Math.pow(Math.abs(t), 1.75) - (b * 0.46);
  // Curve of Spee vertical compensation
  const y = (isUpper ? 5.6 : -5.6) + Math.cos(t * Math.PI) * curveOfSpee * 0.38;

  const dt = 0.01;
  const nextX = a * Math.sin((t + dt) * (Math.PI / 2.32));
  const nextZ = b * Math.pow(Math.abs(t + dt), 1.75) - (b * 0.46);
  const tangentX = nextX - x;
  const tangentZ = nextZ - z;

  return { x, y, z, tangentX, tangentZ };
}

/**
 * Generates natural scalloped gingiva (gum tissue) that arches along the catenary curve,
 * rises into sharp, pointed interdental papillae between each tooth crown, and hugs the cervical margin.
 */
function createAnatomicalScallopedGingiva(isUpper: boolean, material: THREE.Material): THREE.Mesh {
  const steps = 72; // High resolution for smooth scalloping
  const curvePoints: THREE.Vector3[] = [];

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const t = -0.96 + progress * 1.92;
    const pt = getArchPoint(t, isUpper);

    // Realistic anatomical gingival scalloping:
    // Wave frequency matches the 14-16 teeth along the arch so papillae rise between adjacent teeth!
    const toothFrequency = 14 * Math.PI;
    const interdentalPeak = Math.sin(progress * toothFrequency);
    
    // Gums rise between teeth (interdental papilla) and dip apically along the labial crown face
    const scallopHeight = isUpper ? -interdentalPeak * 1.4 : interdentalPeak * 1.4;
    const baseElevation = isUpper ? 4.2 : -4.2;

    curvePoints.push(new THREE.Vector3(pt.x, pt.y + baseElevation + scallopHeight, pt.z));
  }

  const path = new THREE.CatmullRomCurve3(curvePoints);
  // Tube radius varies to mimic realistic alveolar process thickness
  const tubeGeometry = new THREE.TubeGeometry(path, 80, isUpper ? 4.4 : 4.0, 16, false);
  tubeGeometry.computeVertexNormals();

  const mesh = new THREE.Mesh(tubeGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = isUpper ? 'MaxillaryScallopedGingiva' : 'MandibularScallopedGingiva';
  return mesh;
}

/**
 * Builds complete 3D Upper and Lower dental arch scene graph with individual anatomical tooth meshes.
 */
export function buildDentalArchModel(
  teeth: ToothData[],
  materials: ReturnType<typeof createDentalMaterials>,
  viewMode: 'solid' | 'wireframe' | 'curvature' = 'solid'
): DentalModelBuildResult {
  const group = new THREE.Group();
  group.name = 'DentalArchFullModel';

  const upperArchGroup = new THREE.Group();
  upperArchGroup.name = 'UpperMaxillaryArch';

  const lowerArchGroup = new THREE.Group();
  lowerArchGroup.name = 'LowerMandibularArch';

  const toothMeshesMap = new Map<number, THREE.Mesh>();
  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  // 1. Build Anatomical Scalloped Gingival Bases
  const upperGingiva = createAnatomicalScallopedGingiva(true, materials.gingiva);
  const lowerGingiva = createAnatomicalScallopedGingiva(false, materials.gingiva);
  upperArchGroup.add(upperGingiva);
  lowerArchGroup.add(lowerGingiva);
  geometriesToDispose.push(upperGingiva.geometry, lowerGingiva.geometry);

  // 2. Position individual anatomical teeth along the dental arch
  teeth.forEach(tooth => {
    const isUpper = tooth.arch === 'upper';
    const isRightQuadrant = tooth.quadrant === 1 || tooth.quadrant === 4;
    const toothOrderInQuadrant = tooth.fdiNumber % 10; // 1 to 8 (Central Incisor -> 3rd Molar)
    
    // Normalized position along catenary arch: Central Incisor at t ~ 0, 3rd Molar at t ~ 1
    const tMagnitude = (toothOrderInQuadrant - 0.52) / 8.1;
    const t = isRightQuadrant ? -tMagnitude : tMagnitude;

    const pt = getArchPoint(t, isUpper);
    const crownGeo = createAnatomicalCrownGeometry(tooth);
    geometriesToDispose.push(crownGeo);

    // Apply view mode material
    let toothMaterial: THREE.Material = materials.enamel;
    if (viewMode === 'wireframe') {
      toothMaterial = materials.wireframe;
    } else if (viewMode === 'curvature') {
      const devColor = getDeviationColor(tooth.surfaceDeviationMm);
      const heatmapMat = new THREE.MeshStandardMaterial({
        color: devColor,
        roughness: 0.28,
        metalness: 0.08
      });
      materialsToDispose.push(heatmapMat);
      toothMaterial = heatmapMat;
    }

    const toothMesh = new THREE.Mesh(crownGeo, toothMaterial);
    toothMesh.name = `Tooth_${tooth.fdiNumber}`;
    toothMesh.castShadow = true;
    toothMesh.receiveShadow = true;

    // Position tooth so cervical margin sits cleanly inside the scalloped gingival sulcus
    const yShift = isUpper ? 0.75 : -0.75;
    toothMesh.position.set(pt.x, pt.y + yShift, pt.z);

    // Orient tooth tangent to the dental arch curve
    const angle = Math.atan2(pt.tangentX, pt.tangentZ);
    toothMesh.rotation.y = angle + Math.PI / 2;

    // Apply anatomical torque and clinical angulation
    toothMesh.rotation.x = THREE.MathUtils.degToRad(tooth.torqueAngleDeg * 0.45);
    toothMesh.rotation.z = THREE.MathUtils.degToRad(tooth.angulationDeg * 0.5);

    // Upper teeth incisal edges face downward toward occlusal plane
    if (isUpper) {
      toothMesh.rotation.z += Math.PI;
    }

    // Attach metadata for raycasting & selection
    toothMesh.userData = {
      isTooth: true,
      fdiNumber: tooth.fdiNumber,
      universalNumber: tooth.universalNumber,
      name: tooth.name,
      toothData: tooth,
      originalMaterial: toothMaterial,
      arch: tooth.arch
    };

    toothMeshesMap.set(tooth.fdiNumber, toothMesh);

    if (isUpper) {
      upperArchGroup.add(toothMesh);
    } else {
      lowerArchGroup.add(toothMesh);
    }
  });

  group.add(upperArchGroup);
  group.add(lowerArchGroup);

  return {
    group,
    upperArchGroup,
    lowerArchGroup,
    toothMeshesMap,
    upperGingivaMesh: upperGingiva,
    lowerGingivaMesh: lowerGingiva,
    dispose: () => {
      geometriesToDispose.forEach(g => g.dispose());
      materialsToDispose.forEach(m => m.dispose());
    }
  };
}

/**
 * Standard Wavefront OBJ 3D Model Exporter
 */
export function exportDentalArchToObj(scanId: string, teeth: ToothData[]): string {
  let obj = `# DENT X Dental Reconstruction Platform - Clinical 3D Model Export\n`;
  obj += `# Scan ID: ${scanId}\n`;
  obj += `# Units: Millimeters (mm)\n\n`;

  let vertexOffset = 1;

  teeth.forEach((tooth) => {
    const isUpper = tooth.arch === 'upper';
    const isRightQuadrant = tooth.quadrant === 1 || tooth.quadrant === 4;
    const toothOrderInQuadrant = tooth.fdiNumber % 10;
    const tMagnitude = (toothOrderInQuadrant - 0.5) / 8.2;
    const t = isRightQuadrant ? -tMagnitude : tMagnitude;
    const pt = getArchPoint(t, isUpper);

    obj += `o Tooth_${tooth.fdiNumber}_${tooth.name.replace(/\s+/g, '_')}\n`;
    
    const r = (tooth.mesiodistalWidth + tooth.buccolingualWidth) * 0.25;
    const h = tooth.crownHeight;
    const numPts = 12; // High resolution polygon ring
    const baseIndex = vertexOffset;

    for (let i = 0; i < numPts; i++) {
      const angle = (i / numPts) * Math.PI * 2;
      const vx = (pt.x + Math.cos(angle) * r).toFixed(4);
      const vy = (pt.y).toFixed(4);
      const vz = (pt.z + Math.sin(angle) * r).toFixed(4);
      obj += `v ${vx} ${vy} ${vz}\n`;
    }
    for (let i = 0; i < numPts; i++) {
      const angle = (i / numPts) * Math.PI * 2;
      const vx = (pt.x + Math.cos(angle) * r * 0.82).toFixed(4);
      const vy = (pt.y + (isUpper ? -h : h)).toFixed(4);
      const vz = (pt.z + Math.sin(angle) * r * 0.82).toFixed(4);
      obj += `v ${vx} ${vy} ${vz}\n`;
    }

    for (let i = 0; i < numPts; i++) {
      const next = (i + 1) % numPts;
      const b1 = baseIndex + i;
      const b2 = baseIndex + next;
      const t1 = baseIndex + numPts + i;
      const t2 = baseIndex + numPts + next;
      obj += `f ${b1} ${b2} ${t2}\n`;
      obj += `f ${b1} ${t2} ${t1}\n`;
    }

    vertexOffset += numPts * 2;
    obj += `\n`;
  });

  return obj;
}

/**
 * Standard Stereolithography (STL) 3D Model Exporter
 */
export function exportDentalArchToStl(scanId: string, teeth: ToothData[]): string {
  let stl = `solid DENT_X_${scanId.replace(/[^a-zA-Z0-9]/g, '_')}\n`;

  teeth.forEach((tooth) => {
    const isUpper = tooth.arch === 'upper';
    const isRightQuadrant = tooth.quadrant === 1 || tooth.quadrant === 4;
    const toothOrderInQuadrant = tooth.fdiNumber % 10;
    const tMagnitude = (toothOrderInQuadrant - 0.5) / 8.2;
    const t = isRightQuadrant ? -tMagnitude : tMagnitude;
    const pt = getArchPoint(t, isUpper);

    const r = (tooth.mesiodistalWidth + tooth.buccolingualWidth) * 0.25;
    const h = tooth.crownHeight;
    const numPts = 12;

    const basePts: [number, number, number][] = [];
    const topPts: [number, number, number][] = [];

    for (let i = 0; i < numPts; i++) {
      const angle = (i / numPts) * Math.PI * 2;
      basePts.push([
        Number((pt.x + Math.cos(angle) * r).toFixed(4)),
        Number((pt.y).toFixed(4)),
        Number((pt.z + Math.sin(angle) * r).toFixed(4)),
      ]);
      topPts.push([
        Number((pt.x + Math.cos(angle) * r * 0.82).toFixed(4)),
        Number((pt.y + (isUpper ? -h : h)).toFixed(4)),
        Number((pt.z + Math.sin(angle) * r * 0.82).toFixed(4)),
      ]);
    }

    for (let i = 0; i < numPts; i++) {
      const next = (i + 1) % numPts;
      const b1 = basePts[i];
      const b2 = basePts[next];
      const t1 = topPts[i];
      const t2 = topPts[next];

      // Tri 1
      stl += `  facet normal 0 0 0\n    outer loop\n`;
      stl += `      vertex ${b1[0]} ${b1[1]} ${b1[2]}\n`;
      stl += `      vertex ${b2[0]} ${b2[1]} ${b2[2]}\n`;
      stl += `      vertex ${t2[0]} ${t2[1]} ${t2[2]}\n`;
      stl += `    endloop\n  endfacet\n`;

      // Tri 2
      stl += `  facet normal 0 0 0\n    outer loop\n`;
      stl += `      vertex ${b1[0]} ${b1[1]} ${b1[2]}\n`;
      stl += `      vertex ${t2[0]} ${t2[1]} ${t2[2]}\n`;
      stl += `      vertex ${t1[0]} ${t1[1]} ${t1[2]}\n`;
      stl += `    endloop\n  endfacet\n`;
    }
  });

  stl += `endsolid DENT_X_${scanId.replace(/[^a-zA-Z0-9]/g, '_')}\n`;
  return stl;
}

