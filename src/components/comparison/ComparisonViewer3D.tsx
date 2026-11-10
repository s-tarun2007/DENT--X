/**
 * DENT X — Dual-Viewport 3D Comparison Viewer
 * Side-by-side 3D model viewing with optional synchronized camera controls
 * and displacement deviation heatmaps.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ToothData } from '../../types/dental';
import { buildDentalArchModel, createDentalMaterials } from '../../utils/dentalGeometry';
import { Lock, Unlock, RotateCcw, Layers } from 'lucide-react';

interface ComparisonViewer3DProps {
  baselineTeeth: ToothData[];
  currentTeeth: ToothData[];
  baselineLabel: string;
  currentLabel: string;
}

export const ComparisonViewer3D: React.FC<ComparisonViewer3DProps> = ({
  baselineTeeth,
  currentTeeth,
  baselineLabel,
  currentLabel,
}) => {
  const containerBaseRef = useRef<HTMLDivElement>(null);
  const containerCurrRef = useRef<HTMLDivElement>(null);
  const [isCameraSynced, setIsCameraSynced] = useState<boolean>(true);
  const [showDeviationHeatmap, setShowDeviationHeatmap] = useState<boolean>(true);

  // References
  const baseControlsRef = useRef<OrbitControls | null>(null);
  const currControlsRef = useRef<OrbitControls | null>(null);
  const baseCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const baseModelRef = useRef<ReturnType<typeof buildDentalArchModel> | null>(null);
  const currModelRef = useRef<ReturnType<typeof buildDentalArchModel> | null>(null);

  // Initialize both viewports
  useEffect(() => {
    const cBase = containerBaseRef.current;
    const cCurr = containerCurrRef.current;
    if (!cBase || !cCurr) return;

    const setupViewport = (container: HTMLDivElement, teeth: ToothData[], isCurrent: boolean) => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf1f5f9);
      scene.fog = new THREE.Fog(0xf1f5f9, 80, 160);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
      camera.position.set(0, 42, 60);

      const isSoftwareGl = (() => {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      })();

      const renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGl, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = !isSoftwareGl;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();

      // Lighting
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
      keyLight.position.set(20, 40, 30);
      keyLight.castShadow = !isSoftwareGl;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xecfeff, 1.0);
      fillLight.position.set(-25, 20, 20);
      scene.add(fillLight);

      const hemi = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 0.7);
      scene.add(hemi);

      // Model
      const materials = createDentalMaterials();
      const model = buildDentalArchModel(
        teeth,
        materials,
        isCurrent && showDeviationHeatmap ? 'curvature' : 'solid'
      );
      scene.add(model.group);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.target.set(0, 0, 0);

      return { scene, camera, renderer, controls, model };
    };

    const baseSetup = setupViewport(cBase, baselineTeeth, false);
    const currSetup = setupViewport(cCurr, currentTeeth, true);

    baseControlsRef.current = baseSetup.controls;
    currControlsRef.current = currSetup.controls;
    baseCameraRef.current = baseSetup.camera;
    currCameraRef.current = currSetup.camera;
    baseModelRef.current = baseSetup.model;
    currModelRef.current = currSetup.model;

    // Camera sync listener
    const syncCamera = (source: OrbitControls, target: OrbitControls, sCam: THREE.Camera, tCam: THREE.Camera) => {
      if (!isCameraSynced) return;
      tCam.position.copy(sCam.position);
      tCam.rotation.copy(sCam.rotation);
      target.target.copy(source.target);
    };

    baseSetup.controls.addEventListener('change', () => {
      syncCamera(baseSetup.controls, currSetup.controls, baseSetup.camera, currSetup.camera);
    });

    currSetup.controls.addEventListener('change', () => {
      syncCamera(currSetup.controls, baseSetup.controls, currSetup.camera, baseSetup.camera);
    });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      baseSetup.controls.update();
      currSetup.controls.update();
      baseSetup.renderer.render(baseSetup.scene, baseSetup.camera);
      currSetup.renderer.render(currSetup.scene, currSetup.camera);
    };
    animate();

    const handleResize = () => {
      if (!cBase || !cCurr) return;
      const wBase = cBase.clientWidth;
      const hBase = cBase.clientHeight;
      baseSetup.camera.aspect = wBase / hBase;
      baseSetup.camera.updateProjectionMatrix();
      baseSetup.renderer.setSize(wBase, hBase);

      const wCurr = cCurr.clientWidth;
      const hCurr = cCurr.clientHeight;
      currSetup.camera.aspect = wCurr / hCurr;
      currSetup.camera.updateProjectionMatrix();
      currSetup.renderer.setSize(wCurr, hCurr);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      baseSetup.controls.dispose();
      currSetup.controls.dispose();
      baseSetup.renderer.dispose();
      currSetup.renderer.dispose();
      baseSetup.model.dispose();
      currSetup.model.dispose();
    };
  }, [baselineTeeth, currentTeeth, showDeviationHeatmap, isCameraSynced]);

  const resetBothCameras = () => {
    if (baseCameraRef.current && baseControlsRef.current && currCameraRef.current && currControlsRef.current) {
      baseCameraRef.current.position.set(0, 42, 60);
      currCameraRef.current.position.set(0, 42, 60);
      baseControlsRef.current.target.set(0, 0, 0);
      currControlsRef.current.target.set(0, 0, 0);
      baseControlsRef.current.update();
      currControlsRef.current.update();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Synchronization Toolbar */}
      <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCameraSynced(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isCameraSynced ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isCameraSynced ? <Lock className="w-3.5 h-3.5 text-teal-600" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isCameraSynced ? 'Synchronized Cameras (Active)' : 'Independent Cameras'}</span>
          </button>

          <button
            onClick={() => setShowDeviationHeatmap(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showDeviationHeatmap ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Displacement Heatmap</span>
          </button>
        </div>

        <button
          onClick={resetBothCameras}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Views</span>
        </button>
      </div>

      {/* Side-by-Side Dual 3D Viewports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[460px]">
        {/* Baseline Original Scan Viewport */}
        <div className="relative bg-slate-100 rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col">
          <div className="absolute top-3 left-3 z-10 bg-white/95 border border-slate-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-semibold text-slate-800">Original Baseline</span>
            <span className="text-slate-400 font-mono text-[11px]">{baselineLabel}</span>
          </div>
          <div ref={containerBaseRef} className="w-full h-full flex-1" />
        </div>

        {/* Current Scan Viewport */}
        <div className="relative bg-slate-100 rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col">
          <div className="absolute top-3 left-3 z-10 bg-white/95 border border-slate-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-semibold text-slate-800">Current Scan</span>
            <span className="text-teal-700 font-mono text-[11px]">{currentLabel}</span>
          </div>

          {/* Color Scale Legend */}
          {showDeviationHeatmap && (
            <div className="absolute top-3 right-3 z-10 bg-white/95 border border-slate-200 rounded-lg p-2 text-[10px] shadow-2xs space-y-1">
              <div className="font-semibold text-slate-700 mb-1">Displacement Scale</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-teal-600" />
                <span>&lt; 0.15 mm (Stable)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>0.15 – 0.45 mm (Moderate)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                <span>&gt; 0.45 mm (High Shift)</span>
              </div>
            </div>
          )}

          <div ref={containerCurrRef} className="w-full h-full flex-1" />
        </div>
      </div>
    </div>
  );
};
