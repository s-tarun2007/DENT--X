import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Tooth3DCanvasProps {
  className?: string;
}

export const Tooth3DCanvas: React.FC<Tooth3DCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. Classy Clinical Lighting
    const keyLight = new THREE.DirectionalLight(0x00e5cc, 3.8);
    keyLight.position.set(-3, 4, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
    fillLight.position.set(3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00e5cc, 2.5);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x020a16, 1.8);
    scene.add(ambientLight);

    // 3. Tooth Object Hierarchy
    const rootGroup = new THREE.Group();
    // Clockwise initial tilt ~8 degrees (-0.14 rad)
    rootGroup.rotation.z = -0.14;
    scene.add(rootGroup);

    const floatGroup = new THREE.Group();
    rootGroup.add(floatGroup);

    const rotateGroup = new THREE.Group();
    floatGroup.add(rotateGroup);

    // Materials per prompt:
    // MeshPhysicalMaterial: teal tint, transmission 0.9, thickness 1.2, ior 1.5, clearcoat 1
    const physicalMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#98f6ea'),
      emissive: new THREE.Color('#003630'),
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.05,
      transmission: 0.9,
      thickness: 1.2,
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });

    // Faint additive wireframe overlay at 15% opacity
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00e5cc,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    // Thin dashed teal orbit ring beneath tooth
    const ringGeo = new THREE.RingGeometry(2.3, 2.34, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5cc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.position.y = -1.2;
    floatGroup.add(ringMesh);

    // 4. Load /assets/tooth.glb
    const loader = new GLTFLoader();
    let loadedModel: THREE.Group | null = null;

    loader.load(
      '/assets/tooth.glb',
      (gltf) => {
        loadedModel = gltf.scene;
        // Scale and position model
        loadedModel.scale.setScalar(1.2);
        loadedModel.position.set(0, -0.1, 0);

        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = physicalMaterial;

            // Additive wireframe clone at 15% opacity
            const wireClone = new THREE.Mesh(mesh.geometry, wireframeMaterial);
            wireClone.scale.setScalar(1.002);
            mesh.add(wireClone);
          }
        });

        rotateGroup.add(loadedModel);
      },
      undefined,
      (err) => {
        console.warn('GLTFLoader fallback to anatomical procedural mesh:', err);
        // Fallback procedural molar
        const crownGeo = new THREE.CylinderGeometry(1.3, 1.1, 1.4, 32, 16);
        const crown = new THREE.Mesh(crownGeo, physicalMaterial);
        const crownWire = new THREE.Mesh(crownGeo, wireframeMaterial);
        crownWire.scale.setScalar(1.002);
        crown.add(crownWire);
        rotateGroup.add(crown);
      }
    );

    // 5. Mouse Parallax Reaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = Math.max(-0.4, Math.min(0.4, nx * 0.3));
      targetY = Math.max(-0.3, Math.min(0.3, ny * 0.25));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop: Auto-rotate on Y at 0.4 rad/s + Float hover
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Auto-rotate on Y at 0.4 rad/s
      rotateGroup.rotation.y += 0.4 * delta;

      // Float hovering (subtle 10px vertical float)
      floatGroup.position.y = Math.sin(elapsed * 1.6) * 0.12;

      // Smooth gyro tilt from mouse
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      rootGroup.rotation.x = mouseY;
      rootGroup.rotation.y = mouseX;

      // Orbit ring slow counter-spin
      ringMesh.rotation.z -= 0.15 * delta;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      physicalMaterial.dispose();
      wireframeMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none pointer-events-none flex items-center justify-center ${className}`}
    />
  );
};
