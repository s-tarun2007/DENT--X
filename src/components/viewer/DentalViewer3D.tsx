/**
 * DENT X — Next-Gen 3D Dental Model Viewer (Three.js WebGL)
 * 
 * Clinical exocad / 3Shape segmentation aesthetic:
 *   - Distinct pastel colors per tooth type (Central incisor, Lateral, Canine, Premolars, Molars)
 *   - Floating FDI numbers with billboard projection
 *   - Touch-first controls: 1-finger rotate, 2-finger pinch zoom/pan, double-tap focus
 *   - View presets: Front, Top, Bottom, Left, Right, Lingual
 *   - Arch selector: Upper, Lower, Both (Occlusion)
 *   - Render modes: Segmented, Natural Enamel PBR, Wireframe Mesh (with vertices/faces HUD), Heatmap
 *   - Toggles: Gingiva, FDI labels, Exploded view slider, Arch overlay lines, Inter-tooth gap labels (red if > 0.5mm)
 *   - Tooth selection with 6 labelled anatomical landmark spheres (Mesial, Distal, Cusp, Inner, Outer, Facial)
 *   - 3D Caliper point-to-point measurement tool
 *   - Persistent Honesty Badge: "Preview reconstruction · simulated, not computed from your photos yet"
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  FullReconstructedCaseModel,
  AnalyzedTooth,
  ToothGap,
  ArchMetrics,
  ToothMorphType,
} from '../../utils/proceduralDentalEngine';
import {
  RotateCcw,
  Ruler,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Compass,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';

export type RenderMode = 'segmented' | 'natural' | 'wireframe' | 'heatmap';
export type ActiveArchSelection = 'upper' | 'lower' | 'both';

interface DentalViewer3DProps {
  model: FullReconstructedCaseModel;
  caseId: string;
  patientName: string;
  selectedToothFdi: number | null;
  onSelectToothFdi: (fdi: number | null) => void;
  activeArch: ActiveArchSelection;
  onChangeActiveArch: (arch: ActiveArchSelection) => void;
  activeTab?: string;
  onChangeTab?: (tab: string) => void;
}

// Helpers for 3D Text / Sprite Labels
function createTextSprite(text: string, color = '#ffffff', bgColor = 'rgba(15, 23, 42, 0.85)', borderColor = 'rgba(255,255,255,0.2)'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Background pill
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(8, 8, 112, 48, 24);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = color;
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 33);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.2, 1.6, 1);
  return sprite;
}

export const DentalViewer3D: React.FC<DentalViewer3DProps> = ({
  model,
  caseId,
  patientName,
  selectedToothFdi,
  onSelectToothFdi,
  activeArch,
  onChangeActiveArch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // View state
  const [renderMode, setRenderMode] = useState<RenderMode>('segmented');
  const [showGingiva, setShowGingiva] = useState<boolean>(true);
  const [showFdiLabels, setShowFdiLabels] = useState<boolean>(true);
  const [showArchOverlay, setShowArchOverlay] = useState<boolean>(false);
  const [showIntertoothGaps, setShowIntertoothGaps] = useState<boolean>(false);
  const [explodedFactor, setExplodedFactor] = useState<number>(0); // 0 to 1
  const [isCaliperActive, setIsCaliperActive] = useState<boolean>(false);
  const [caliperPoints, setCaliperPoints] = useState<THREE.Vector3[]>([]);
  const [caliperDistanceMm, setCaliperDistanceMm] = useState<number | null>(null);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [hoveredTooth, setHoveredTooth] = useState<AnalyzedTooth | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [showHonestyTooltip, setShowHonestyTooltip] = useState<boolean>(false);

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh & Overlay Groups
  const upperMeshGroupRef = useRef<THREE.Group | null>(null);
  const lowerMeshGroupRef = useRef<THREE.Group | null>(null);
  const labelsGroupRef = useRef<THREE.Group | null>(null);
  const landmarkGroupRef = useRef<THREE.Group | null>(null);
  const archOverlayGroupRef = useRef<THREE.Group | null>(null);
  const intertoothGapsGroupRef = useRef<THREE.Group | null>(null);
  const caliperLineRef = useRef<THREE.Line | null>(null);

  // Geometry references
  const upperGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const lowerGeoRef = useRef<THREE.BufferGeometry | null>(null);

  // Raycasting
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const lastTapTimeRef = useRef<number>(0);

  // Selected tooth data
  const selectedTooth = useMemo(() => {
    if (!selectedToothFdi) return null;
    return model.analysis.teeth.find((t) => t.fdi === selectedToothFdi) || null;
  }, [model.analysis.teeth, selectedToothFdi]);

  // Total stats for HUD
  const totalVertices = (model.upper.vertexCount + model.lower.vertexCount);
  const totalFaces = (model.upper.triangleCount + model.lower.triangleCount);

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // 1. Initialize Scene & Three.js Studio Pipeline
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17); // Dark clinical laboratory background
    scene.fog = new THREE.Fog(0x0a0e17, 85, 175);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 500);
    camera.position.set(0, 36, 68);
    cameraRef.current = camera;

    // Software GL Guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Reflection Room Environment
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Studio Lighting Rig for Dental Enamel
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(20, 42, 35);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 1.1);
    fillLight.position.set(-28, 20, 20);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 1.2);
    rimLight.position.set(0, -25, -35);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.75);
    scene.add(hemiLight);

    // Floor Contact Grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -18;
    scene.add(gridHelper);

    // OrbitControls (Touch First)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 140;
    controls.minDistance = 12;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Overlay sub-groups
    const labelsGroup = new THREE.Group();
    labelsGroup.name = 'FDILabels';
    scene.add(labelsGroup);
    labelsGroupRef.current = labelsGroup;

    const landmarkGroup = new THREE.Group();
    landmarkGroup.name = 'Landmarks';
    scene.add(landmarkGroup);
    landmarkGroupRef.current = landmarkGroup;

    const archOverlayGroup = new THREE.Group();
    archOverlayGroup.name = 'ArchOverlays';
    scene.add(archOverlayGroup);
    archOverlayGroupRef.current = archOverlayGroup;

    const gapsGroup = new THREE.Group();
    gapsGroup.name = 'IntertoothGaps';
    scene.add(gapsGroup);
    intertoothGapsGroupRef.current = gapsGroup;

    // Animation loop & FPS counter
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // 2. Build or Rebuild Upper & Lower BufferMeshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean previous jaw groups
    if (upperMeshGroupRef.current) {
      scene.remove(upperMeshGroupRef.current);
      upperMeshGroupRef.current.traverse((c) => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
      });
      upperMeshGroupRef.current = null;
    }
    if (lowerMeshGroupRef.current) {
      scene.remove(lowerMeshGroupRef.current);
      lowerMeshGroupRef.current.traverse((c) => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
      });
      lowerMeshGroupRef.current = null;
    }

    // Material Factory based on renderMode
    const createMaterial = (isWire = false) => {
      if (renderMode === 'segmented') {
        return new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: 0.22,
          metalness: 0.04,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
          wireframe: isWire,
        });
      } else if (renderMode === 'natural') {
        // Enamel ivory PBR
        return new THREE.MeshPhysicalMaterial({
          color: 0xfcfaf6,
          vertexColors: false,
          roughness: 0.18,
          metalness: 0.02,
          clearcoat: 0.95,
          transmission: 0.05,
          ior: 1.63,
          wireframe: isWire,
        });
      } else if (renderMode === 'wireframe') {
        return new THREE.MeshBasicMaterial({
          color: 0x00e5cc,
          wireframe: true,
          transparent: true,
          opacity: 0.7,
        });
      } else {
        // Heatmap
        return new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.25,
          wireframe: isWire,
        });
      }
    };

    // Helper to build Mesh from raw jaw model
    const buildJawMesh = (raw: typeof model.upper, isUpper: boolean) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(raw.positions.slice(), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(raw.colors.slice(), 3));
      geo.setAttribute('fdi', new THREE.BufferAttribute(raw.fdi.slice(), 1));
      geo.setIndex(new THREE.BufferAttribute(raw.indices.slice(), 1));
      geo.computeVertexNormals();

      if (isUpper) upperGeoRef.current = geo;
      else lowerGeoRef.current = geo;

      const group = new THREE.Group();
      group.name = isUpper ? 'UpperJawGroup' : 'LowerJawGroup';

      const mat = createMaterial(renderMode === 'wireframe');
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isJawMesh: true, isUpper };

      group.add(mesh);
      return group;
    };

    const upperGroup = buildJawMesh(model.upper, true);
    const lowerGroup = buildJawMesh(model.lower, false);

    upperMeshGroupRef.current = upperGroup;
    lowerMeshGroupRef.current = lowerGroup;

    scene.add(upperGroup);
    scene.add(lowerGroup);
  }, [model, renderMode]);

  // 3. Handle Active Arch Visibility
  useEffect(() => {
    if (upperMeshGroupRef.current) {
      upperMeshGroupRef.current.visible = activeArch === 'upper' || activeArch === 'both';
    }
    if (lowerMeshGroupRef.current) {
      lowerMeshGroupRef.current.visible = activeArch === 'lower' || activeArch === 'both';
    }
  }, [activeArch]);

  // 4. Handle Exploded View Slider (Separation along Y & outward radial expansion)
  useEffect(() => {
    if (upperMeshGroupRef.current && lowerMeshGroupRef.current) {
      // Upper moves up (+Y), Lower moves down (-Y)
      upperMeshGroupRef.current.position.y = explodedFactor * 14;
      lowerMeshGroupRef.current.position.y = -explodedFactor * 14;

      // Slight radial outward expansion
      const s = 1 + explodedFactor * 0.12;
      upperMeshGroupRef.current.scale.set(s, 1, s);
      lowerMeshGroupRef.current.scale.set(s, 1, s);
    }
  }, [explodedFactor]);

  // 5. Build Floating FDI Billboard Labels
  useEffect(() => {
    const group = labelsGroupRef.current;
    if (!group) return;

    // Clear existing
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Sprite).material) (child as THREE.Sprite).material.dispose();
    }

    if (!showFdiLabels) return;

    model.analysis.teeth.forEach((tooth) => {
      // Filter by arch visibility
      if (tooth.arch === 'upper' && activeArch === 'lower') return;
      if (tooth.arch === 'lower' && activeArch === 'upper') return;

      const isUpper = tooth.arch === 'upper';
      const cusp = tooth.landmarks.Cusp;

      const sprite = createTextSprite(
        String(tooth.fdi),
        selectedToothFdi === tooth.fdi ? '#00E5CC' : '#FFFFFF',
        selectedToothFdi === tooth.fdi ? 'rgba(0, 229, 204, 0.35)' : 'rgba(15, 23, 42, 0.85)',
        selectedToothFdi === tooth.fdi ? '#00E5CC' : 'rgba(255, 255, 255, 0.25)'
      );

      // Position sprite slightly occlusal to cusp
      const yOffset = isUpper ? -2.8 : 2.8;
      sprite.position.set(cusp[0], cusp[1] + yOffset, cusp[2]);
      sprite.userData = { fdi: tooth.fdi, isLabel: true };
      group.add(sprite);
    });
  }, [model.analysis.teeth, showFdiLabels, selectedToothFdi, activeArch]);

  // 6. Highlight Selected Tooth & Render 6 Anatomical Landmark Spheres
  useEffect(() => {
    const group = landmarkGroupRef.current;
    if (!group) return;

    // Clear landmark spheres
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
      if ((child as THREE.Mesh).material) ((child as THREE.Mesh).material as THREE.Material).dispose();
    }

    if (!selectedTooth) return;

    // Render the 6 anatomical landmarks as colored spheres with labels
    const landmarks = selectedTooth.landmarks;
    const items: { name: string; pos: [number, number, number]; color: number }[] = [
      { name: 'Mesial', pos: landmarks.Mesial, color: 0x00e5cc },     // Teal
      { name: 'Distal', pos: landmarks.Distal, color: 0x38bdf8 },     // Sky
      { name: 'Cusp', pos: landmarks.Cusp, color: 0xfacc15 },         // Amber
      { name: 'InnerPoint', pos: landmarks.InnerPoint, color: 0xc084fc }, // Violet
      { name: 'OuterPoint', pos: landmarks.OuterPoint, color: 0xf43f5e }, // Rose
      { name: 'FacialPoint', pos: landmarks.FacialPoint, color: 0x10b981 }, // Emerald
    ];

    const sphereGeo = new THREE.SphereGeometry(0.55, 16, 16);

    items.forEach((item) => {
      const mat = new THREE.MeshStandardMaterial({
        color: item.color,
        emissive: item.color,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeo, mat);
      sphere.position.set(...item.pos);

      // Small floating text label
      const label = createTextSprite(item.name, '#ffffff', 'rgba(15, 23, 42, 0.9)', '#00e5cc');
      label.scale.set(2.4, 1.2, 1);
      label.position.set(item.pos[0], item.pos[1] + 1.2, item.pos[2]);

      group.add(sphere);
      group.add(label);
    });
  }, [selectedTooth]);

  // 7. Render Arch Overlay Polyline & Intercanine / Intermolar Dimension Lines
  useEffect(() => {
    const group = archOverlayGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Line).geometry) (child as THREE.Line).geometry.dispose();
    }

    if (!showArchOverlay) return;

    const teethUpper = model.analysis.teeth.filter((t) => t.arch === 'upper');
    if (teethUpper.length > 0) {
      // Perimeter polyline
      const pts = teethUpper.map((t) => new THREE.Vector3(...t.centroid));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5cc, linewidth: 2 });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);

      // Intercanine line
      const canines = teethUpper.filter((t) => t.type === 'canine');
      if (canines.length >= 2) {
        const c1 = new THREE.Vector3(...canines[0].landmarks.Cusp);
        const c2 = new THREE.Vector3(...canines[1].landmarks.Cusp);
        const icGeo = new THREE.BufferGeometry().setFromPoints([c1, c2]);
        const icMat = new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 1, gapSize: 0.5 });
        const icLine = new THREE.Line(icGeo, icMat);
        icLine.computeLineDistances();
        group.add(icLine);

        const mid = c1.clone().lerp(c2, 0.5);
        const icLabel = createTextSprite(`${model.analysis.arch.intercanineWidthMm} mm`, '#facc15', 'rgba(15, 23, 42, 0.9)', '#facc15');
        icLabel.position.set(mid.x, mid.y + 1.2, mid.z);
        group.add(icLabel);
      }

      // Intermolar line
      const molars = teethUpper.filter((t) => t.fdi % 10 === 6);
      if (molars.length >= 2) {
        const m1 = new THREE.Vector3(...molars[0].landmarks.OuterPoint);
        const m2 = new THREE.Vector3(...molars[1].landmarks.OuterPoint);
        const imGeo = new THREE.BufferGeometry().setFromPoints([m1, m2]);
        const imMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 1.2, gapSize: 0.6 });
        const imLine = new THREE.Line(imGeo, imMat);
        imLine.computeLineDistances();
        group.add(imLine);

        const midM = m1.clone().lerp(m2, 0.5);
        const imLabel = createTextSprite(`${model.analysis.arch.intermolarWidthMm} mm`, '#38bdf8', 'rgba(15, 23, 42, 0.9)', '#38bdf8');
        imLabel.position.set(midM.x, midM.y + 1.2, midM.z);
        group.add(imLabel);
      }
    }
  }, [showArchOverlay, model.analysis]);

  // 8. Render Inter-tooth Contact Distance Labels
  useEffect(() => {
    const group = intertoothGapsGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Sprite).material) (child as THREE.Sprite).material.dispose();
    }

    if (!showIntertoothGaps) return;

    model.analysis.gaps.forEach((gap) => {
      const tA = model.analysis.teeth.find((t) => t.fdi === gap.between[0]);
      const tB = model.analysis.teeth.find((t) => t.fdi === gap.between[1]);
      if (!tA || !tB) return;

      const pA = new THREE.Vector3(...tA.landmarks.Distal);
      const pB = new THREE.Vector3(...tB.landmarks.Mesial);
      const mid = pA.clone().lerp(pB, 0.5);

      const isWarning = gap.isProblematic; // > 0.5mm
      const label = createTextSprite(
        `${gap.contactGapMm} mm`,
        isWarning ? '#f43f5e' : '#00e5cc',
        isWarning ? 'rgba(244, 63, 94, 0.25)' : 'rgba(15, 23, 42, 0.85)',
        isWarning ? '#f43f5e' : 'rgba(0, 229, 204, 0.3)'
      );
      label.scale.set(2.4, 1.2, 1);
      label.position.set(mid.x, mid.y + 1.6, mid.z);
      group.add(label);
    });
  }, [showIntertoothGaps, model.analysis.gaps, model.analysis.teeth]);

  // Raycasting & Pointer Handlers (Double-Tap Focus & Caliper Tool)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!container || !camera || !scene) return;

      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(scene.children, true);

      // Double tap detector
      const now = performance.now();
      const isDoubleTap = now - lastTapTimeRef.current < 300;
      lastTapTimeRef.current = now;

      // 1. Caliper Measure Tool
      if (isCaliperActive && hits.length > 0) {
        const pt = hits[0].point;
        setCaliperPoints((prev) => {
          if (prev.length === 0) {
            return [pt];
          } else if (prev.length === 1) {
            const p1 = prev[0];
            const p2 = pt;
            const dist = Number(p1.distanceTo(p2).toFixed(2));
            setCaliperDistanceMm(dist);

            if (caliperLineRef.current && sceneRef.current) {
              sceneRef.current.remove(caliperLineRef.current);
            }
            const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5cc, linewidth: 3 });
            const line = new THREE.Line(lineGeo, lineMat);
            caliperLineRef.current = line;
            sceneRef.current?.add(line);

            return [p1, p2];
          } else {
            if (caliperLineRef.current && sceneRef.current) {
              sceneRef.current.remove(caliperLineRef.current);
              caliperLineRef.current = null;
            }
            setCaliperDistanceMm(null);
            return [pt];
          }
        });
        return;
      }

      // 2. Tooth Selection & FDI Label Hit
      const labelHit = hits.find((h) => h.object.userData?.isLabel);
      if (labelHit) {
        onSelectToothFdi(labelHit.object.userData.fdi);
        return;
      }

      const jawHit = hits.find((h) => h.object.userData?.isJawMesh);
      if (jawHit && jawHit.point) {
        // Find nearest tooth centroid to hit point
        let nearestTooth: AnalyzedTooth | null = null;
        let minDist = Infinity;

        model.analysis.teeth.forEach((t) => {
          const c = new THREE.Vector3(...t.centroid);
          const d = c.distanceTo(jawHit.point);
          if (d < minDist && d < 9.0) {
            minDist = d;
            nearestTooth = t;
          }
        });

        if (nearestTooth) {
          onSelectToothFdi((nearestTooth as AnalyzedTooth).fdi);

          // Double tap to focus tooth in camera
          if (isDoubleTap && controlsRef.current && cameraRef.current) {
            const targetPos = new THREE.Vector3(...(nearestTooth as AnalyzedTooth).centroid);
            controlsRef.current.target.copy(targetPos);
            cameraRef.current.position.set(targetPos.x, targetPos.y + 12, targetPos.z + 24);
            controlsRef.current.update();
          }
        }
      } else {
        if (!isCaliperActive) {
          onSelectToothFdi(null);
        }
      }
    },
    [isCaliperActive, model.analysis.teeth, onSelectToothFdi]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!container || !camera || !scene) return;

      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(scene.children, true);

      const jawHit = hits.find((h) => h.object.userData?.isJawMesh);
      if (jawHit && jawHit.point) {
        let nearest: AnalyzedTooth | null = null;
        let minDist = Infinity;
        model.analysis.teeth.forEach((t) => {
          const c = new THREE.Vector3(...t.centroid);
          const d = c.distanceTo(jawHit.point);
          if (d < minDist && d < 8.0) {
            minDist = d;
            nearest = t;
          }
        });
        setHoveredTooth(nearest);
        container.style.cursor = nearest ? 'pointer' : isCaliperActive ? 'crosshair' : 'default';
      } else {
        setHoveredTooth(null);
        container.style.cursor = isCaliperActive ? 'crosshair' : 'default';
      }
    },
    [isCaliperActive, model.analysis.teeth]
  );

  // Camera Presets
  const setCameraPreset = (preset: 'front' | 'top' | 'bottom' | 'left' | 'right' | 'lingual' | 'default') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    controls.target.set(0, 0, 0);

    switch (preset) {
      case 'front':
        camera.position.set(0, 0, 70);
        break;
      case 'top':
        camera.position.set(0, 76, 2);
        break;
      case 'bottom':
        camera.position.set(0, -76, 2);
        break;
      case 'left':
        camera.position.set(-68, 4, 8);
        break;
      case 'right':
        camera.position.set(68, 4, 8);
        break;
      case 'lingual':
        camera.position.set(0, 10, -70);
        break;
      case 'default':
      default:
        camera.position.set(0, 36, 68);
        break;
    }
    controls.update();
  };

  const clearCaliper = () => {
    setCaliperPoints([]);
    setCaliperDistanceMm(null);
    if (caliperLineRef.current && sceneRef.current) {
      sceneRef.current.remove(caliperLineRef.current);
      caliperLineRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 shadow-xl select-none">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="w-full h-full"
      />

      {/* Top Left: Case Context & Mandatory Honesty Badge */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">{caseId}</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-medium text-slate-300">{patientName}</span>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 border border-teal-800 px-1.5 py-0.2 rounded font-semibold uppercase">
                {activeArch} ARCH
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {hoveredTooth ? (
                <span className="text-teal-300 font-medium">
                  Hover: #{hoveredTooth.fdi} ({hoveredTooth.name})
                </span>
              ) : selectedTooth ? (
                <span className="text-teal-300 font-semibold">
                  Focused: #{selectedTooth.fdi} · MD: {selectedTooth.mesiodistalWidthMm} mm
                </span>
              ) : (
                <span>Tap any tooth to inspect landmarks & metrics · Double-tap to focus</span>
              )}
            </div>
          </div>
        </div>

        {/* Persistent Honesty Badge with Tooltip */}
        <div className="relative pointer-events-auto">
          <div
            onMouseEnter={() => setShowHonestyTooltip(true)}
            onMouseLeave={() => setShowHonestyTooltip(false)}
            onClick={() => setShowHonestyTooltip((p) => !p)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium cursor-help backdrop-blur-md"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Preview reconstruction · simulated, not computed from your photos yet</span>
            <HelpCircle className="w-3 h-3 text-amber-400/70" />
          </div>

          {showHonestyTooltip && (
            <div className="absolute top-full left-0 mt-1.5 w-72 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs text-slate-300 space-y-1.5 z-30">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Simulated Geometry Mode</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This anatomical digital twin is mathematically derived in code using mm-realistic dental morphology seeded by your photo series. Cloud GPU neural photogrammetry backend integration connects via the VITE_API_URL pipeline flag.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top Right: Camera Presets & Vertices/Faces HUD */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none z-10">
        {/* Wireframe HUD Stats Badge */}
        {renderMode === 'wireframe' && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-[11px] text-slate-300 flex items-center gap-2.5">
            <span>Verts: <strong className="text-teal-400">{totalVertices.toLocaleString()}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Faces: <strong className="text-teal-400">{totalFaces.toLocaleString()}</strong></span>
            <span className="text-slate-600">|</span>
            <span>FPS: <strong className="text-teal-400">{fps}</strong></span>
          </div>
        )}

        {/* Camera Presets Bar */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg">
          {(['front', 'top', 'bottom', 'left', 'right', 'lingual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setCameraPreset(p)}
              className="px-2 py-1 text-[11px] font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors uppercase font-mono cursor-pointer"
              title={`${p} preset view`}
            >
              {p}
            </button>
          ))}

          <span className="w-[1px] h-4 bg-slate-800 mx-0.5" />

          <button
            onClick={() => setCameraPreset('default')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Perspective Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Caliper HUD when active */}
      {isCaliperActive && (
        <div className="absolute top-20 left-4 pointer-events-auto bg-slate-900/95 text-white border border-teal-500/40 rounded-xl p-3.5 shadow-2xl text-xs space-y-1.5 z-10 max-w-xs">
          <div className="flex items-center justify-between text-teal-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-teal-400" />
              <span>3D Caliper Measurement</span>
            </span>
            <button
              onClick={clearCaliper}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Reset Points
            </button>
          </div>
          <div className="text-[11px] text-slate-300 leading-relaxed">
            {caliperPoints.length === 0 && 'Click first anatomical surface point on any tooth...'}
            {caliperPoints.length === 1 && 'Point 1 placed. Click second point to measure millimeter distance...'}
            {caliperPoints.length === 2 && caliperDistanceMm !== null && (
              <div className="font-mono text-base font-bold text-teal-300 mt-1">
                Measured Distance: {caliperDistanceMm} mm
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Control Dock (100% Unobstructed Center Viewport) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl pointer-events-auto z-10">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all">
          {/* Header Bar */}
          <div className="px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>3D Segmentation & Diagnostic Dock</span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                (exocad / 3Shape Mode)
              </span>
            </div>
            <button
              onClick={() => setIsControlsCollapsed((c) => !c)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              title={isControlsCollapsed ? 'Expand Dock' : 'Collapse Dock'}
            >
              {isControlsCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!isControlsCollapsed && (
            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Col 1: Arch Selection */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Dental Arch
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl text-xs font-medium border border-slate-800">
                  {(['upper', 'lower', 'both'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => onChangeActiveArch(a)}
                      className={`py-1 rounded-lg text-center capitalize transition-colors cursor-pointer ${
                        activeArch === a
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {a === 'both' ? 'Both' : a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 2: Surface Render Mode */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Render Mode
                </label>
                <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl text-[11px] font-medium border border-slate-800">
                  {(['segmented', 'natural', 'wireframe', 'heatmap'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setRenderMode(m)}
                      className={`py-1 rounded-lg text-center capitalize transition-colors cursor-pointer ${
                        renderMode === m
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Col 3: Visual Diagnostic Toggles */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                  Anatomic Overlays
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowGingiva((g) => !g)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] border font-medium transition-colors cursor-pointer ${
                      showGingiva
                        ? 'bg-slate-800 border-teal-500/60 text-teal-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Gingiva
                  </button>

                  <button
                    onClick={() => setShowFdiLabels((l) => !l)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] border font-medium transition-colors cursor-pointer ${
                      showFdiLabels
                        ? 'bg-slate-800 border-teal-500/60 text-teal-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    FDI #
                  </button>

                  <button
                    onClick={() => setShowArchOverlay((o) => !o)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] border font-medium transition-colors cursor-pointer ${
                      showArchOverlay
                        ? 'bg-slate-800 border-teal-500/60 text-teal-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Arch Line
                  </button>

                  <button
                    onClick={() => setShowIntertoothGaps((g) => !g)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] border font-medium transition-colors cursor-pointer ${
                      showIntertoothGaps
                        ? 'bg-slate-800 border-teal-500/60 text-teal-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Gaps
                  </button>
                </div>
              </div>

              {/* Col 4: Exploded View Slider & Caliper Tool */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="uppercase">Exploded Arch</span>
                  <span className="text-teal-400">{Math.round(explodedFactor * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={explodedFactor}
                  onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />

                <button
                  onClick={() => {
                    setIsCaliperActive((prev) => {
                      if (prev) clearCaliper();
                      return !prev;
                    });
                  }}
                  className={`w-full py-1 px-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isCaliperActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{isCaliperActive ? 'Caliper Active' : '3D Caliper (mm)'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
