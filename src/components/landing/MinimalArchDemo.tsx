import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildDentalArchModel, createDentalMaterials } from '../../utils/dentalGeometry';
import { INITIAL_SCANS } from '../../data/sampleScans';
import { Eye, RotateCw } from 'lucide-react';

export const MinimalArchDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [activeArch, setActiveArch] = useState<'upper' | 'lower' | 'both'>('upper');
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe'>('solid');
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020610);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 38, 64);

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

    // Subtle clinical lights
    const ambientLight = new THREE.AmbientLight(0x091428, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(20, 40, 30);
    scene.add(keyLight);

    const tealLight = new THREE.DirectionalLight(0x00e5cc, 3.0);
    tealLight.position.set(-20, 15, 20);
    scene.add(tealLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 120;
    controls.minDistance = 20;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 0.7;
    controls.target.set(0, 0, 0);

    // Build Dentition
    const scanData = INITIAL_SCANS[0];
    const materials = createDentalMaterials();
    const modelBuild = buildDentalArchModel(
      scanData.teeth,
      materials,
      renderMode === 'wireframe' ? 'wireframe' : 'solid'
    );

    modelBuild.upperArchGroup.visible = activeArch === 'both' || activeArch === 'upper';
    modelBuild.lowerArchGroup.visible = activeArch === 'both' || activeArch === 'lower';
    scene.add(modelBuild.group);

    // Subtle scan elevation laser ring
    const ringGeo = new THREE.RingGeometry(24, 24.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5cc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      ring.position.y = Math.sin(elapsed * 1.2) * 4;
      controls.autoRotate = isRotating;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 520;
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
      ringGeo.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeArch, renderMode, isRotating]);

  return (
    <section
      id="arch-demo"
      className="relative py-28 sm:py-36 px-6 lg:px-12 bg-[#020610] text-white border-t border-white/[0.06] select-none overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Curiosity Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5CC]" />
          <span className="text-[11px] font-mono tracking-widest text-[#00E5CC] uppercase">
            04 · Occlusal Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] text-white tracking-tight"
            >
              What happens when you can{' '}
              <span className="italic text-[#00E5CC]">touch the occlusion?</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-400 text-sm sm:text-base max-w-sm font-normal"
          >
            Direct tactile inspection of maxillary and mandibular arches with continuous contact detection.
          </motion.p>
        </div>

        {/* Minimal Full-Width 3D Canvas Container */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#020610] overflow-hidden">
          {/* Hairline Control Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setActiveArch('upper')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeArch === 'upper'
                    ? 'bg-[#00E5CC] text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Maxillary (Upper)
              </button>
              <button
                onClick={() => setActiveArch('lower')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeArch === 'lower'
                    ? 'bg-[#00E5CC] text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mandibular (Lower)
              </button>
              <button
                onClick={() => setActiveArch('both')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeArch === 'both'
                    ? 'bg-[#00E5CC] text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Both Arches
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setRenderMode(renderMode === 'solid' ? 'wireframe' : 'solid')}
                className="px-3 py-1.5 rounded-md border border-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {renderMode === 'solid' ? 'Solid Enamel' : 'Wireframe'}
              </button>
              <button
                onClick={() => setIsRotating(!isRotating)}
                className="px-3 py-1.5 rounded-md border border-white/[0.1] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                <span>Rotate</span>
              </button>
            </div>
          </div>

          {/* Interactive Three.js Arch Viewport */}
          <div className="relative w-full h-[440px] sm:h-[540px]">
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Instruction Callout */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[11px] font-mono text-slate-400 pointer-events-none">
              <Eye className="w-3.5 h-3.5 text-[#00E5CC]" />
              <span>Drag to rotate · Scroll to zoom</span>
            </div>
          </div>

          {/* Minimal Biometric Hairline Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] border-t border-white/[0.08] text-left">
            <div className="p-4 sm:p-5">
              <div className="text-[10px] font-mono uppercase text-slate-500">Intercanine Width</div>
              <div className="text-sm sm:text-base font-mono text-white font-medium mt-1">34.2 mm</div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="text-[10px] font-mono uppercase text-slate-500">Intermolar Span</div>
              <div className="text-sm sm:text-base font-mono text-white font-medium mt-1">47.8 mm</div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="text-[10px] font-mono uppercase text-slate-500">Overjet / Overbite</div>
              <div className="text-sm sm:text-base font-mono text-white font-medium mt-1">2.4 / 2.1 mm</div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="text-[10px] font-mono uppercase text-slate-500">Mesh Closure</div>
              <div className="text-sm sm:text-base font-mono text-[#00E5CC] font-medium mt-1">100% Watertight</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
