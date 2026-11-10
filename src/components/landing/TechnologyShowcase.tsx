import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildDentalArchModel, createDentalMaterials } from '../../utils/dentalGeometry';
import { INITIAL_SCANS } from '../../data/sampleScans';
import {
  Sparkles,
  Maximize2,
  Eye,
  RotateCw,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface TechnologyShowcaseProps {
  onEnterPlatform: () => void;
}

export const TechnologyShowcase: React.FC<TechnologyShowcaseProps> = ({
  onEnterPlatform,
}) => {
  const { config } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe'>('solid');
  const [activeToothNumber, setActiveToothNumber] = useState<number>(11); // Maxillary Central Incisor
  const [activeArch, setActiveArch] = useState<'upper' | 'lower' | 'both'>('upper');
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b16);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 40, 68);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x091428, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf5f8ff, 2.5);
    keyLight.position.set(25, 45, 35);
    scene.add(keyLight);

    const tealFill = new THREE.DirectionalLight(new THREE.Color(config.accent), 3.2);
    tealFill.position.set(-25, 20, 25);
    scene.add(tealFill);

    const violetRim = new THREE.DirectionalLight(0xc084fc, 3.0);
    violetRim.position.set(0, -30, -30);
    scene.add(violetRim);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 140;
    controls.minDistance = 25;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 0, 0);

    // 4. Build Anatomical Dentition Geometry
    const scanData = INITIAL_SCANS[0];
    const materials = createDentalMaterials();
    const modelBuild = buildDentalArchModel(
      scanData.teeth,
      materials,
      renderMode === 'wireframe' ? 'wireframe' : 'solid'
    );

    modelBuild.upperArchGroup.visible = activeArch === 'both' || activeArch === 'upper';
    modelBuild.lowerArchGroup.visible = activeArch === 'both' || activeArch === 'lower';

    const selectedMesh = modelBuild.toothMeshesMap.get(activeToothNumber);
    if (selectedMesh) {
      selectedMesh.material = materials.selected;
    }

    scene.add(modelBuild.group);

    // Dynamic scanning laser circle
    const scanRingGeo = new THREE.RingGeometry(24, 24.3, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.accent),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    scanRing.position.y = -2;
    scene.add(scanRing);

    // 5. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Laser scanning elevation oscillation
      scanRing.position.y = Math.sin(elapsed * 1.4) * 5;

      controls.autoRotate = isRotating;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 6. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      modelBuild.dispose();
      renderer.dispose();
      scanRingGeo.dispose();
      scanRingMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeToothNumber, activeArch, renderMode, isRotating, config.accent]);

  return (
    <section className="py-28 px-6 lg:px-12 relative bg-[#030816] border-t border-white/06 text-white select-none">
      {/* Background Volumetric Glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] rounded-full blur-[160px] pointer-events-none"
        style={{ backgroundColor: `rgba(${config.rgb}, 0.08)` }}
      />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Section Header with exact prompt wording */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-pill px-4 py-1.5 inline-flex items-center gap-2 mb-5 border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: config.accent }} />
            <span
              className="text-[10px] font-mono tracking-widest font-semibold uppercase"
              style={{ color: config.accent }}
            >
              GENUINE THREE.JS DENTAL ARCH
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.08] mb-4"
          >
            See Every Detail.
            <br />
            <span className="italic accent-gradient-text">
              Understand Every Dimension.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal"
          >
            Interact directly with complete anatomical dentition. Rotate, isolate arches, and inspect biometrics in real time.
          </motion.p>
        </div>

        {/* 3D Workspace Card */}
        <div className="rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl bg-[#070F1E]/80 backdrop-blur-2xl">
          {/* Top Control Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/08">
            {/* Arch Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white/05 border border-white/10 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveArch('upper')}
                style={{
                  backgroundColor: activeArch === 'upper' ? config.accent : undefined,
                  color: activeArch === 'upper' ? '#000000' : undefined,
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeArch === 'upper' ? 'font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Maxillary (Upper)
              </button>
              <button
                onClick={() => setActiveArch('lower')}
                style={{
                  backgroundColor: activeArch === 'lower' ? config.accent : undefined,
                  color: activeArch === 'lower' ? '#000000' : undefined,
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeArch === 'lower' ? 'font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Mandibular (Lower)
              </button>
              <button
                onClick={() => setActiveArch('both')}
                style={{
                  backgroundColor: activeArch === 'both' ? config.accent : undefined,
                  color: activeArch === 'both' ? '#000000' : undefined,
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeArch === 'both' ? 'font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Both Arches
              </button>
            </div>

            {/* Shading & Orbit Controls */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <button
                onClick={() => setRenderMode(renderMode === 'solid' ? 'wireframe' : 'solid')}
                style={{
                  backgroundColor: renderMode === 'wireframe' ? `rgba(${config.rgb}, 0.2)` : undefined,
                  borderColor: renderMode === 'wireframe' ? config.accent : undefined,
                  color: renderMode === 'wireframe' ? config.accent : undefined,
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {renderMode === 'solid' ? 'Shaded Enamel' : 'Wireframe Lattice'}
              </button>

              <button
                onClick={() => setIsRotating(!isRotating)}
                style={{
                  backgroundColor: isRotating ? `rgba(${config.rgb}, 0.2)` : undefined,
                  borderColor: isRotating ? config.accent : undefined,
                  color: isRotating ? config.accent : undefined,
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                <span>Auto-Rotate</span>
              </button>

              <button
                onClick={onEnterPlatform}
                style={{
                  backgroundColor: config.accent,
                  boxShadow: `0 0 15px ${config.glowColor}`,
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-black font-bold rounded-lg text-xs cursor-pointer hover:opacity-90 transition-all ml-2"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Launch Workstation</span>
              </button>
            </div>
          </div>

          {/* Interactive Three.js Container */}
          <div className="relative w-full h-[450px] sm:h-[520px] bg-[#020610] rounded-2xl overflow-hidden mt-4 border border-white/05">
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Viewport Interaction Prompt */}
            <div className="absolute bottom-4 left-4 glass-pill px-3.5 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-2 pointer-events-none shadow-xs border border-white/10">
              <Eye className="w-3.5 h-3.5" style={{ color: config.accent }} />
              <span>Click & Drag to Orbit · Scroll to Zoom</span>
            </div>

            {/* FDI Landmark Overlay Tag */}
            <div className="absolute top-4 right-4 rounded-xl p-3 border border-white/10 text-xs shadow-xl max-w-[220px] pointer-events-none bg-[#090D14]/90 backdrop-blur-xl">
              <div className="text-[10px] font-mono uppercase font-bold" style={{ color: config.accent }}>
                FDI Landmark #{activeToothNumber}
              </div>
              <div className="font-bold text-white mt-0.5">
                Maxillary Central Incisor
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Crown: 10.8mm · Width: 8.6mm
              </div>
            </div>
          </div>

          {/* Biometrics Strip under Viewer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-white/03 border border-white/06">
              <div className="text-[10px] font-mono uppercase text-slate-400">Intercanine Width</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">34.2 mm</div>
              <div className="text-[11px] font-medium" style={{ color: config.accent }}>Orthodontic Norm</div>
            </div>

            <div className="p-4 rounded-xl bg-white/03 border border-white/06">
              <div className="text-[10px] font-mono uppercase text-slate-400">Intermolar Distance</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">47.8 mm</div>
              <div className="text-[11px] text-slate-400">Transpalatal Arch</div>
            </div>

            <div className="p-4 rounded-xl bg-white/03 border border-white/06">
              <div className="text-[10px] font-mono uppercase text-slate-400">Overbite / Overjet</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">2.4 / 2.1 mm</div>
              <div className="text-[11px] text-[#4FA3FF] font-medium">Class I Occlusion</div>
            </div>

            <div className="p-4 rounded-xl bg-white/03 border border-white/06">
              <div className="text-[10px] font-mono uppercase text-slate-400">Surface Manifold</div>
              <div className="text-base font-bold font-mono mt-0.5" style={{ color: config.accent }}>100% Watertight</div>
              <div className="text-[11px] text-slate-400">CAD/CAM Printable</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
