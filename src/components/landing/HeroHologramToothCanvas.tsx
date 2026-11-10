import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HeroHologramToothCanvasProps {
  className?: string;
}

export const HeroHologramToothCanvas: React.FC<HeroHologramToothCanvasProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Verify WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 580;

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 9.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 3. Cinematic Holographic Lighting Setup
    // Intense Cyan Rim / Key Light
    const cyanKeyLight = new THREE.DirectionalLight(0x00e5cc, 4.8);
    cyanKeyLight.position.set(-4, 5, 5);
    scene.add(cyanKeyLight);

    // Electric Blue Fill Light
    const blueFillLight = new THREE.DirectionalLight(0x4fa3ff, 3.2);
    blueFillLight.position.set(5, 3, 4);
    scene.add(blueFillLight);

    // Deep Violet / Purple Back Rim Light
    const violetRimLight = new THREE.DirectionalLight(0xc084fc, 4.2);
    violetRimLight.position.set(3, -3, -4);
    scene.add(violetRimLight);

    // Soft Ambient Chamber Light
    const ambientLight = new THREE.AmbientLight(0x051329, 1.6);
    scene.add(ambientLight);

    // 4. Primary Realistic Holographic Tooth Group
    const toothAnchorGroup = new THREE.Group();
    // Clockwise tilt of approximately 14 degrees (-0.24 rad)
    toothAnchorGroup.rotation.z = -0.24;
    toothAnchorGroup.position.set(0, 0.35, 0);
    scene.add(toothAnchorGroup);

    // Dynamic hovering group (animates up and down 8-12px)
    const hoverGroup = new THREE.Group();
    toothAnchorGroup.add(hoverGroup);

    // Interactive mouse rotation + 360 auto rotation group
    const rotateGroup = new THREE.Group();
    hoverGroup.add(rotateGroup);

    // Translucent Cyan Holographic Glass Enamel Material (Physical PBR)
    const holographicEnamelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x98f6ea,
      emissive: 0x00554c,
      emissiveIntensity: 0.65,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transmission: 0.85,
      ior: 1.62,
      reflectivity: 0.9,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });

    // Subtle fine cyan holographic contour lines (refined, non-oversized)
    const fineWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e5cc,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });

    // A. Sculpt Anatomical Molar Crown
    const crownGeo = new THREE.CylinderGeometry(1.55, 1.35, 1.6, 44, 20, false);
    const crownPos = crownGeo.attributes.position;
    for (let i = 0; i < crownPos.count; i++) {
      let x = crownPos.getX(i);
      let y = crownPos.getY(i);
      let z = crownPos.getZ(i);

      const r = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x);

      if (y > 0.3) {
        // Sculpt 4 anatomical cusps: MB, DB, ML, DL
        const cuspWave = Math.sin(angle * 2) * 0.2 + Math.cos(angle * 4) * 0.06;
        const centralFossa = Math.exp(-r * r * 3.8) * 0.32;
        y += cuspWave - centralFossa;

        const bulge = Math.sin(angle * 2 + Math.PI / 4) * 0.1;
        x += (x / (r || 1)) * bulge;
        z += (z / (r || 1)) * bulge;
      } else {
        const neckTaper = Math.sin((y / 1.6 + 0.5) * Math.PI) * 0.12;
        x *= 1.0 + neckTaper;
        z *= 1.0 + neckTaper;
      }
      crownPos.setXYZ(i, x, y, z);
    }
    crownGeo.computeVertexNormals();

    const crownMesh = new THREE.Mesh(crownGeo, holographicEnamelMaterial);
    crownMesh.position.y = 0.78;
    rotateGroup.add(crownMesh);

    const crownWire = new THREE.Mesh(crownGeo, fineWireMaterial);
    crownWire.position.y = 0.78;
    crownWire.scale.setScalar(1.001);
    rotateGroup.add(crownWire);

    // B. Sculpt Anatomical Roots (3 Roots: Mesiobuccal, Distobuccal, Lingual)
    // 1. Mesial Root
    const mesialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 0.05, 0.18),
      new THREE.Vector3(-0.9, -0.85, 0.12),
      new THREE.Vector3(-1.08, -1.8, 0.04),
      new THREE.Vector3(-0.95, -2.4, 0.0),
    ]);
    const mesialGeo = new THREE.TubeGeometry(mesialCurve, 24, 0.48, 16, false);
    const mPos = mesialGeo.attributes.position;
    for (let i = 0; i < mPos.count; i++) {
      const py = mPos.getY(i);
      if (py < 0) {
        const factor = Math.max(0.22, 1.0 + py * 0.35);
        mPos.setX(i, mPos.getX(i) * factor - (1 - factor) * 0.58);
        mPos.setZ(i, mPos.getZ(i) * factor);
      }
    }
    mesialGeo.computeVertexNormals();
    const mesialMesh = new THREE.Mesh(mesialGeo, holographicEnamelMaterial);
    rotateGroup.add(mesialMesh);
    const mesialWire = new THREE.Mesh(mesialGeo, fineWireMaterial);
    mesialWire.scale.setScalar(1.001);
    rotateGroup.add(mesialWire);

    // 2. Distal Root
    const distalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, 0.05, 0.18),
      new THREE.Vector3(0.88, -0.82, 0.12),
      new THREE.Vector3(1.05, -1.75, 0.04),
      new THREE.Vector3(0.92, -2.35, 0.0),
    ]);
    const distalGeo = new THREE.TubeGeometry(distalCurve, 24, 0.46, 16, false);
    const dPos = distalGeo.attributes.position;
    for (let i = 0; i < dPos.count; i++) {
      const py = dPos.getY(i);
      if (py < 0) {
        const factor = Math.max(0.24, 1.0 + py * 0.35);
        dPos.setX(i, dPos.getX(i) * factor + (1 - factor) * 0.58);
        dPos.setZ(i, dPos.getZ(i) * factor);
      }
    }
    distalGeo.computeVertexNormals();
    const distalMesh = new THREE.Mesh(distalGeo, holographicEnamelMaterial);
    rotateGroup.add(distalMesh);
    const distalWire = new THREE.Mesh(distalGeo, fineWireMaterial);
    distalWire.scale.setScalar(1.001);
    rotateGroup.add(distalWire);

    // 3. Lingual Root
    const lingualCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.05, -0.55),
      new THREE.Vector3(0.0, -0.88, -0.88),
      new THREE.Vector3(0.0, -1.8, -1.0),
      new THREE.Vector3(0.0, -2.4, -0.9),
    ]);
    const lingualGeo = new THREE.TubeGeometry(lingualCurve, 24, 0.5, 16, false);
    const lPos = lingualGeo.attributes.position;
    for (let i = 0; i < lPos.count; i++) {
      const py = lPos.getY(i);
      if (py < 0) {
        const factor = Math.max(0.22, 1.0 + py * 0.35);
        lPos.setZ(i, lPos.getZ(i) * factor - (1 - factor) * 0.55);
        lPos.setX(i, lPos.getX(i) * factor);
      }
    }
    lingualGeo.computeVertexNormals();
    const lingualMesh = new THREE.Mesh(lingualGeo, holographicEnamelMaterial);
    rotateGroup.add(lingualMesh);
    const lingualWire = new THREE.Mesh(lingualGeo, fineWireMaterial);
    lingualWire.scale.setScalar(1.001);
    rotateGroup.add(lingualWire);

    // Furcation Dome
    const furcationGeo = new THREE.SphereGeometry(0.7, 20, 14);
    furcationGeo.scale(1.15, 0.52, 0.95);
    const furcationMesh = new THREE.Mesh(furcationGeo, holographicEnamelMaterial);
    furcationMesh.position.set(0, 0.02, 0);
    rotateGroup.add(furcationMesh);

    // C. Tilted Orbital Particle Ring circling the tooth waist
    const orbitCount = 90;
    const orbitGeo = new THREE.BufferGeometry();
    const orbitPos = new Float32Array(orbitCount * 3);
    const orbitCol = new Float32Array(orbitCount * 3);
    const cyanCol = new THREE.Color(0x00e5cc);
    const violetCol = new THREE.Color(0xc084fc);

    for (let i = 0; i < orbitCount; i++) {
      const angle = (i / orbitCount) * Math.PI * 2;
      const r = 2.4 + (Math.random() - 0.5) * 0.2;
      orbitPos[i * 3] = Math.cos(angle) * r;
      orbitPos[i * 3 + 1] = (Math.random() - 0.5) * 0.12;
      orbitPos[i * 3 + 2] = Math.sin(angle) * r;

      const col = Math.random() > 0.4 ? cyanCol : violetCol;
      orbitCol[i * 3] = col.r;
      orbitCol[i * 3 + 1] = col.g;
      orbitCol[i * 3 + 2] = col.b;
    }
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
    orbitGeo.setAttribute('color', new THREE.BufferAttribute(orbitCol, 3));

    const orbitMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const orbitPoints = new THREE.Points(orbitGeo, orbitMat);
    orbitPoints.rotation.x = Math.PI / 4.2;
    orbitPoints.position.set(0, 0.4, 0);
    rotateGroup.add(orbitPoints);

    // 5. Interactive Mouse-based Gyroscope Parallax Listener
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isMouseOver = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const inBounds =
        e.clientX >= rect.left - 100 &&
        e.clientX <= rect.right + 100 &&
        e.clientY >= rect.top - 100 &&
        e.clientY <= rect.bottom + 100;

      if (inBounds) {
        isMouseOver = true;
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetX = Math.max(-0.6, Math.min(0.6, nx * 0.35));
        targetY = Math.max(-0.5, Math.min(0.5, ny * 0.25));
      } else {
        isMouseOver = false;
        targetX = 0;
        targetY = 0;
      }
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
      targetX = 0;
      targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // 6. 60 FPS Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.06;
      mouseY += (targetY - mouseY) * 0.06;

      // 1. Continuous smooth vertical hovering (8–12px movement)
      // 0.16 units in camera view ≈ 10 pixels
      const hoverY = Math.sin(time * 1.5) * 0.15;
      hoverGroup.position.y = hoverY;

      // 2. Slow clockwise 360-degree rotation around vertical axis (fluid, continuous)
      rotateGroup.rotation.y += 0.0045;

      // 3. Interactive mouse-based 3D rotation parallax (gentle tilt, returns to neutral)
      toothAnchorGroup.rotation.x = mouseY * 0.3;
      toothAnchorGroup.rotation.y = mouseX * 0.4;
      // Maintain base ~14° clockwise tilt plus subtle mouse tilt reaction
      toothAnchorGroup.rotation.z = -0.24 + mouseX * 0.15;

      // 4. Subtle cyan light pulse & shimmering wireframe
      const pulse = 0.6 + 0.2 * Math.sin(time * 2.0);
      holographicEnamelMaterial.emissiveIntensity = pulse;
      fineWireMaterial.opacity = 0.25 + 0.12 * Math.sin(time * 2.4);

      // Orbit particles spin
      orbitPoints.rotation.y += 0.006;

      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 550;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      crownGeo.dispose();
      mesialGeo.dispose();
      distalGeo.dispose();
      lingualGeo.dispose();
      furcationGeo.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      holographicEnamelMaterial.dispose();
      fineWireMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-auto select-none flex items-center justify-center ${className}`}
    />
  );
};
