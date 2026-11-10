import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface FloatingToothCanvasProps {
  onResetOrientation?: () => void;
  className?: string;
}

export const FloatingToothCanvas: React.FC<FloatingToothCanvasProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 10.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Cinematic 3-Point Studio Lighting
    // Soft Key Light (Ice White)
    const keyLight = new THREE.DirectionalLight(0xf5f8ff, 2.8);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    // Electric Teal Rim Light (highlights left contour & cusps)
    const tealRimLight = new THREE.DirectionalLight(0x00e5cc, 4.5);
    tealRimLight.position.set(-6, 3, -4);
    scene.add(tealRimLight);

    // Soft Violet Secondary Light (highlights right contour & roots)
    const violetRimLight = new THREE.DirectionalLight(0x9b82ff, 3.8);
    violetRimLight.position.set(6, -2, -3);
    scene.add(violetRimLight);

    // Subtle Electric Blue Fill Light
    const blueFillLight = new THREE.DirectionalLight(0x528bff, 1.6);
    blueFillLight.position.set(0, -6, 5);
    scene.add(blueFillLight);

    // Ambient Chamber Illumination
    const ambientLight = new THREE.AmbientLight(0x0d121d, 1.2);
    scene.add(ambientLight);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 6;
    controls.maxDistance = 16;
    controls.autoRotate = false;
    controls.rotateSpeed = 0.7;
    let isUserInteracting = false;
    controls.addEventListener('start', () => {
      isUserInteracting = true;
      setIsInteracting(true);
    });
    controls.addEventListener('end', () => {
      isUserInteracting = false;
      setIsInteracting(false);
    });

    // 4. Build Realistic Anatomical Human Molar 3D Geometry
    const toothGroup = new THREE.Group();
    scene.add(toothGroup);

    // Clinical Enamel Material (Physical PBR with clearcoat, transmission, and ceramic luster)
    const enamelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfcfdfe,
      roughness: 0.13,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transmission: 0.16,
      ior: 1.63,
      reflectivity: 0.85,
      specularColor: new THREE.Color(0xffffff),
      specularIntensity: 1.0,
    });

    // Anatomical Root Material (slightly warmer ivory tone with natural matte texture)
    const rootMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf3f5f7,
      roughness: 0.28,
      metalness: 0.02,
      clearcoat: 0.45,
      clearcoatRoughness: 0.18,
      transmission: 0.08,
      ior: 1.58,
    });

    // A. Sculpted Molar Crown (Parametric Quad-Cusp Enamel Shell)
    const crownGeo = new THREE.CylinderGeometry(1.65, 1.45, 1.7, 48, 28, false);
    const crownPos = crownGeo.attributes.position;

    // Sculpt anatomical molar features directly on the vertices
    for (let i = 0; i < crownPos.count; i++) {
      let x = crownPos.getX(i);
      let y = crownPos.getY(i);
      let z = crownPos.getZ(i);

      const radius = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x);

      // Occlusal Surface Sculpting (top of crown: y > 0.4)
      if (y > 0.35) {
        // 4 Distinct Anatomical Cusps:
        // Mesiobuccal, Distobuccal, Mesiolingual, Distolingual
        const cuspWave = Math.sin(angle * 2) * 0.22 + Math.cos(angle * 4) * 0.08;
        // Central developmental fossa / groove depression
        const centralPit = Math.exp(-radius * radius * 3.5) * 0.32;

        y += cuspWave - centralPit;

        // Slight natural molar bulges along the buccal & lingual surfaces
        const bulge = Math.sin(angle * 2 + Math.PI / 4) * 0.12;
        x += (x / (radius || 1)) * bulge;
        z += (z / (radius || 1)) * bulge;
      } else {
        // Cervical margin constriction (cementoenamel junction)
        const taper = Math.sin((y / 1.7 + 0.5) * Math.PI) * 0.12;
        x *= 1.0 + taper;
        z *= 1.0 + taper;
      }

      crownPos.setXYZ(i, x, y, z);
    }
    crownGeo.computeVertexNormals();

    const crownMesh = new THREE.Mesh(crownGeo, enamelMaterial);
    crownMesh.position.y = 0.85;
    crownMesh.castShadow = true;
    crownMesh.receiveShadow = true;
    toothGroup.add(crownMesh);

    // B. Anatomical Occlusal Cap (Detailed Pit and Fissure Anatomy)
    const occlusalCapGeo = new THREE.RingGeometry(0.1, 1.55, 36, 16);
    const capPos = occlusalCapGeo.attributes.position;
    for (let i = 0; i < capPos.count; i++) {
      const x = capPos.getX(i);
      const y = capPos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      const a = Math.atan2(y, x);

      // Sculpt fissure grooves
      const grooveDepth = -Math.sin(r * Math.PI) * (0.28 - Math.abs(Math.sin(a * 2)) * 0.14);
      capPos.setZ(i, grooveDepth);
    }
    occlusalCapGeo.computeVertexNormals();
    const occlusalMesh = new THREE.Mesh(occlusalCapGeo, enamelMaterial);
    occlusalMesh.rotation.x = -Math.PI / 2;
    occlusalMesh.position.y = 1.72;
    toothGroup.add(occlusalMesh);

    // C. Bifurcated Double Root Anatomy (Mesial & Distal Roots)
    // Mesial Root (Left/anterior root with realistic anatomical taper and curvature)
    const mesialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 0.05, 0.0),
      new THREE.Vector3(-0.95, -0.9, -0.05),
      new THREE.Vector3(-1.15, -1.8, 0.1),
      new THREE.Vector3(-1.05, -2.4, 0.22), // Tapered apex
    ]);
    const mesialRootGeo = new THREE.TubeGeometry(mesialCurve, 28, 0.58, 20, false);
    // Taper root toward apex
    const mesialPos = mesialRootGeo.attributes.position;
    for (let i = 0; i < mesialPos.count; i++) {
      const py = mesialPos.getY(i);
      if (py < 0) {
        const factor = Math.max(0.2, 1.0 + py * 0.35);
        mesialPos.setX(i, mesialPos.getX(i) * factor - (1 - factor) * 0.65);
        mesialPos.setZ(i, mesialPos.getZ(i) * factor);
      }
    }
    mesialRootGeo.computeVertexNormals();
    const mesialRootMesh = new THREE.Mesh(mesialRootGeo, rootMaterial);
    toothGroup.add(mesialRootMesh);

    // Distal Root (Right/posterior root)
    const distalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.65, 0.05, 0.0),
      new THREE.Vector3(0.9, -0.85, 0.05),
      new THREE.Vector3(1.1, -1.75, -0.1),
      new THREE.Vector3(1.0, -2.35, -0.18), // Apex
    ]);
    const distalRootGeo = new THREE.TubeGeometry(distalCurve, 28, 0.54, 20, false);
    const distalPos = distalRootGeo.attributes.position;
    for (let i = 0; i < distalPos.count; i++) {
      const py = distalPos.getY(i);
      if (py < 0) {
        const factor = Math.max(0.22, 1.0 + py * 0.34);
        distalPos.setX(i, distalPos.getX(i) * factor + (1 - factor) * 0.65);
        distalPos.setZ(i, distalPos.getZ(i) * factor);
      }
    }
    distalRootGeo.computeVertexNormals();
    const distalRootMesh = new THREE.Mesh(distalRootGeo, rootMaterial);
    toothGroup.add(distalRootMesh);

    // Root Trunk Furcation Arch (Smooth bridge connecting roots at the furcation)
    const furcationGeo = new THREE.SphereGeometry(0.72, 24, 16);
    furcationGeo.scale(1.2, 0.6, 0.9);
    const furcationMesh = new THREE.Mesh(furcationGeo, rootMaterial);
    furcationMesh.position.set(0, 0.05, 0);
    toothGroup.add(furcationMesh);

    // 5. Orbital Scanning Rings Around the Tooth
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);

    // Orbital Ring 1: Thin Electric Teal Scanning Halo
    const ring1Geo = new THREE.RingGeometry(3.2, 3.22, 96);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x00e5cc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.3;
    ring1.rotation.y = 0.25;
    ringsGroup.add(ring1);

    // Orbital Ring 2: Secondary Violet-Blue Slanted Halo
    const ring2Geo = new THREE.RingGeometry(4.1, 4.12, 96);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x9b82ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 2.6;
    ring2.rotation.y = -0.35;
    ringsGroup.add(ring2);

    // Orbital Ring 3: Segmented Data Track Halo
    const ring3Geo = new THREE.RingGeometry(4.8, 4.815, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x528bff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 2;
    ringsGroup.add(ring3);

    // 6. Suspended Floating Dust / Medical Photogrammetry Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const tealColor = new THREE.Color(0x00e5cc);
    const violetColor = new THREE.Color(0x9b82ff);
    const whiteColor = new THREE.Color(0xf5f8ff);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) + (Math.random() - 0.5) * 1.5;
      particlePositions[i * 3 + 2] = radius * Math.cos(phi) * Math.cos(theta);

      // Randomly pick teal, violet, or ice white
      const rPick = Math.random();
      const col = rPick < 0.45 ? tealColor : rPick < 0.8 ? violetColor : whiteColor;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse Parallax Responsiveness
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = nx * 0.35;
      targetY = ny * 0.25;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Mouse Parallax Smooth Lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Zero-Gravity Floating & Bobbing
      // Harmonic floating: vertical sine wave + subtle side-to-side drift
      const floatY = Math.sin(time * 0.95) * 0.22;
      const floatX = Math.cos(time * 0.75) * 0.08;
      toothGroup.position.y = floatY + mouseY * 0.4;
      toothGroup.position.x = floatX + mouseX * 0.4;

      // Gentle continuous rotation on Y axis
      if (!isUserInteracting) {
        toothGroup.rotation.y += 0.0055;
        // Subtle tilt
        toothGroup.rotation.x = Math.sin(time * 0.6) * 0.04 + mouseY * 0.2;
        toothGroup.rotation.z = Math.cos(time * 0.5) * 0.03 + mouseX * 0.15;
      }

      // Orbital Rings Rotation (each at its own speed and axis)
      ring1.rotation.z += 0.004;
      ring2.rotation.z -= 0.003;
      ring3.rotation.z += 0.0015;

      // Particles slow drift
      particles.rotation.y += 0.0008;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      crownGeo.dispose();
      occlusalCapGeo.dispose();
      mesialRootGeo.dispose();
      distalRootGeo.dispose();
      furcationGeo.dispose();
      enamelMaterial.dispose();
      rootMaterial.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {!webglSupported && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-400 text-xs">
          <div className="liquid-glass rounded-2xl p-6 max-w-sm">
            <span className="font-mono text-teal-400 font-bold block mb-1">
              WebGL Hardware Acceleration Disabled
            </span>
            <span>Falling back to high-resolution procedural raster preview.</span>
          </div>
        </div>
      )}

      {/* Floating Interactive Badge (Indicates Drag & Orbit) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-pill px-4 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-2 pointer-events-none opacity-80 hover:opacity-100 transition-opacity z-20 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC] animate-ping" />
        <span>Drag to rotate · Scroll to zoom</span>
      </div>
    </div>
  );
};
