/**
 * DENT X — 3D Reconstruction Processing Pipeline (/app/processing)
 * 
 * Features:
 *   - Slow, believable 7-stage photogrammetric pipeline (60 - 120s, scaled by photo count)
 *   - Irregular progression with eased jitter
 *   - Live log lines using real uploaded facts (filenames, resolutions, blur variance, keypoints, points, vertices)
 *   - Interactive Three.js canvas featuring a point cloud that densifies over time, then meshes into 3D arches
 *   - Connected to global ReconstructionContext (continues when navigating away, survives reload)
 *   - Launch CTA on completion to open 3D Analysis
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useReconstruction } from '../../context/ReconstructionContext';
import {
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Box,
  FastForward,
  Activity,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ProcessingPageProps {
  onComplete: () => void;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({ onComplete }) => {
  const { activeJob, activeCase } = useReconstruction();
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [activeJob?.logs]);

  // Three.js Point Cloud & Densification Canvas
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811); // Dark cinematic chamber

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(0, 24, 52);

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
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.maxDistance = 110;
    controls.minDistance = 15;

    // Atmospheric lighting
    const light1 = new THREE.PointLight(0x00e5cc, 2.5, 90);
    light1.position.set(20, 30, 25);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x38bdf8, 1.8, 90);
    light2.position.set(-25, -15, -20);
    scene.add(light2);

    // Dynamic Point Cloud
    const maxPoints = 35000;
    const positions = new Float32Array(maxPoints * 3);
    const colors = new Float32Array(maxPoints * 3);

    // Generate Catenary Dental Arch positions for the point cloud
    for (let i = 0; i < maxPoints; i++) {
      const isUpper = i % 2 === 0;
      const t = -0.9 + (i / maxPoints) * 1.8;
      const a = isUpper ? 24.5 : 22.0;
      const b = isUpper ? 32.0 : 29.5;

      // Base arch coordinate
      const x = a * Math.sin(t * (Math.PI / 2.3));
      const z = b * Math.pow(Math.abs(t), 1.76) - b * 0.44;
      const y = isUpper ? 4.8 : -4.8;

      // Random jitter dispersion
      const disp = (Math.random() - 0.5) * 3.2;
      const dispY = (Math.random() - 0.5) * 4.5;
      const dispZ = (Math.random() - 0.5) * 3.2;

      positions[i * 3] = x + disp;
      positions[i * 3 + 1] = y + dispY;
      positions[i * 3 + 2] = z + dispZ;

      // Color gradient (teal to sky blue to violet)
      if (isUpper) {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 0.8;
      } else {
        colors[i * 3] = 0.22;
        colors[i * 3 + 1] = 0.74;
        colors[i * 3 + 2] = 0.97;
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pGeo.setDrawRange(0, 1200); // starts sparse

    const pMat = new THREE.PointsMaterial({
      size: 0.48,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const pointsMesh = new THREE.Points(pGeo, pMat);
    scene.add(pointsMesh);

    // Ghost wireframe arch mesh (emerges during stage 5-7)
    const wireGeo = new THREE.TorusGeometry(20, 3.2, 12, 32, Math.PI);
    wireGeo.rotateX(Math.PI / 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e5cc,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    wireMesh.position.y = 1;
    scene.add(wireMesh);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Dynamically densify points and fade in wireframe based on progress
      const progress = activeJob?.overallProgressPercent || 5;
      const visibleCount = Math.round(Math.min(maxPoints, 1200 + (progress / 100) * (maxPoints - 1200)));
      pGeo.setDrawRange(0, visibleCount);

      if (progress >= 60) {
        wireMat.opacity = Math.min(0.45, ((progress - 60) / 40) * 0.45);
      } else {
        wireMat.opacity = 0;
      }

      renderer.render(scene, camera);
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
      pGeo.dispose();
      pMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
    };
  }, [activeJob?.overallProgressPercent]);

  // If no active job or no case
  if (!activeJob || !activeCase) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Activity className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No active reconstruction pipeline running</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Please upload intraoral photos in New Scan to initiate the photogrammetric pipeline.
        </p>
      </div>
    );
  }

  const isCompleted = activeJob.status === 'completed' || activeJob.overallProgressPercent >= 100;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto bg-slate-50 p-6 lg:p-8 space-y-6 max-w-none">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              3D Photogrammetric Pipeline · Case {activeCase.id}
            </h2>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-semibold">
              7-STAGE ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Synthesizing {activeCase.images?.length || 12} intraoral photographs into a watertight anatomical digital twin for {activeCase.patientName}.
          </p>
        </div>

        {isCompleted && (
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <span>Launch 3D Analysis Viewport</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar & Telemetry Ribbon */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-slate-800">Overall Pipeline Progression</span>
            <span className="font-mono text-teal-700 font-bold">{activeJob.overallProgressPercent}%</span>
          </div>
          <span className="font-mono text-slate-500 text-[11px]">
            {isCompleted ? 'Reconstruction Complete · Ready for Diagnostic Review' : 'Background task active (survives page navigation & reload)'}
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${activeJob.overallProgressPercent}%` }}
          />
        </div>

        {/* Live Fact Telemetry Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[9px] font-mono uppercase text-slate-400">Photos Ingested</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {activeJob.metrics.photoCount} views
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[9px] font-mono uppercase text-slate-400">Matched Keypoints</div>
            <div className="text-sm font-bold font-mono text-teal-700 mt-0.5">
              {activeJob.metrics.matchedKeypoints.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[9px] font-mono uppercase text-slate-400">Dense Point Cloud</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {activeJob.metrics.densePoints.toLocaleString()} pts
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[9px] font-mono uppercase text-slate-400">Poisson Vertices</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {activeJob.metrics.verticesCount.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[9px] font-mono uppercase text-slate-400">Mesh Triangles</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {activeJob.metrics.facesCount.toLocaleString()}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-[9px] font-mono uppercase text-slate-400">Teeth Identified</div>
            <div className="text-sm font-bold font-mono text-teal-700 mt-0.5">
              {activeJob.metrics.teethCount} crowns
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 7 Stages on Left, Interactive Point Cloud & Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[580px]">
        {/* Left 5 Cols: 7 Stages Checklist */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
            <span>Computational Stages</span>
            <span>Weight</span>
          </div>

          <div className="space-y-2.5">
            {activeJob.stages.map((stage, idx) => {
              const isCurrent = stage.status === 'in_progress';
              const isDone = stage.status === 'completed';

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-teal-50/80 border-teal-300 shadow-2xs'
                      : isDone
                      ? 'bg-white border-slate-200/90'
                      : 'bg-slate-50/70 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            0{idx + 1}.
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {stage.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold block ${
                          isDone
                            ? 'bg-teal-100 text-teal-800'
                            : isCurrent
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isDone ? 'COMPLETED' : isCurrent ? `${stage.progressPercent}%` : 'QUEUED'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                        {stage.weight}% wt
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Three.js Densifying Point Cloud Canvas + Terminal */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Interactive Three.js Densifying Canvas */}
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
            <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-teal-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Real-Time Volumetric Densification</span>
            </div>

            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              Drag to rotate · Pinch to zoom
            </div>
          </div>

          {/* Live Terminal Log Stream */}
          <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-[11px] shadow-inner min-h-[220px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>photogrammetry_worker.log</span>
              </div>
              <span className="text-[10px] text-teal-400">Live Facts Stream</span>
            </div>

            <div ref={logTerminalRef} className="space-y-1.5 flex-1 overflow-y-auto max-h-[180px]">
              {activeJob.logs.map((log, i) => (
                <div key={i} className="text-slate-300 leading-relaxed font-mono">
                  <span className="text-teal-400 mr-2">&gt;</span>
                  {log}
                </div>
              ))}
              {!isCompleted && (
                <div className="text-teal-400 animate-pulse font-mono">
                  &gt; Computing {activeJob.stages[activeJob.currentStageIndex]?.name}...
                </div>
              )}
            </div>

            {isCompleted && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <button
                  onClick={onComplete}
                  className="w-full py-2.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-sans font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Box className="w-4 h-4" />
                  <span>Launch 3D Analysis Viewport</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
