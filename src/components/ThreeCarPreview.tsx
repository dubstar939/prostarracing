import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CarConfig } from '../types';

interface ThreeCarPreviewProps {
  carConfig: CarConfig;
  glbUrl: string;
}

export default function ThreeCarPreview({ carConfig, glbUrl }: ThreeCarPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(-5, 10, -5);
    scene.add(spotLight);

    // Loader
    const loader = new GLTFLoader();
    // Try using allorigins proxy instead, or fallback to raw URL if that fails
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(glbUrl)}`;
    loader.load(proxyUrl, (gltf) => {
      const model = gltf.scene;
      
      // User request: Place it at (0,0,0) and scale it to 0.5
      model.position.set(0, 0, 0);
      model.scale.set(0.5, 0.5, 0.5);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.y -= center.y;
      model.position.z -= center.z;
      
      // Reset to (0,0,0) as requested after centering
      model.position.set(0, 0, 0);

      scene.add(model);
      carRef.current = model;

      // Apply car color to materials that look like body paint
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material && (material.name.toLowerCase().includes('body') || material.name.toLowerCase().includes('paint'))) {
            material.color.set(carConfig.color);
          }
        }
      });
    }, undefined, (error) => {
      console.error('Error loading GLB:', error);
      // Fallback to a simple car-like shape
      const carGroup = new THREE.Group();
      
      // Body
      const bodyGeo = new THREE.BoxGeometry(2, 0.5, 4);
      const material = new THREE.MeshStandardMaterial({ color: carConfig.color });
      const body = new THREE.Mesh(bodyGeo, material);
      body.position.y = 0.5;
      carGroup.add(body);

      // Cabin
      const cabinGeo = new THREE.BoxGeometry(1.5, 0.5, 2);
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.y = 1;
      cabin.position.z = -0.5;
      carGroup.add(cabin);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
      
      const positions = [
        [-1, 0.4, 1.2], [1, 0.4, 1.2],
        [-1, 0.4, -1.2], [1, 0.4, -1.2]
      ];
      
      positions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(pos[0], pos[1], pos[2]);
        carGroup.add(wheel);
      });

      carGroup.position.set(0, 0, 0);
      scene.add(carGroup);
      carRef.current = carGroup;
    });

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (carRef.current) {
        carRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [glbUrl]);

  // Update color when carConfig changes
  useEffect(() => {
    if (carRef.current) {
      carRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;
          if (material && (material.name.toLowerCase().includes('body') || material.name.toLowerCase().includes('paint'))) {
            material.color.set(carConfig.color);
          }
        }
      });
    }
  }, [carConfig.color]);

  return <div ref={containerRef} className="w-full h-full" />;
}
