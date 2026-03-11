import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CarConfig, CAR_MODELS, CarModelType } from '../types';

interface Car3DProps {
  config: CarConfig;
  autoRotate?: boolean;
  className?: string;
}

export const Car3D: React.FC<Car3DProps> = ({ config, autoRotate = true, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(4, 2, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const spotLight = new THREE.SpotLight(0xffffff, 0.5);
    spotLight.position.set(-5, 5, -5);
    scene.add(spotLight);

    // Car Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);
    carGroupRef.current = carGroup;

    // Ground Shadow Plane
    const shadowPlaneGeometry = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeometry, shadowPlaneMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      if (autoRotate && carGroupRef.current) {
        carGroupRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Car Geometry when config changes
  useEffect(() => {
    if (!carGroupRef.current) return;

    // Clear existing car parts
    while (carGroupRef.current.children.length > 0) {
      carGroupRef.current.remove(carGroupRef.current.children[0]);
    }

    const model = CAR_MODELS[config.model];
    const carColor = new THREE.Color(config.color);

    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: carColor, 
      roughness: 0.1, 
      metalness: 0.8 
    });
    const glassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0, 
      metalness: 1,
      transparent: true,
      opacity: 0.8
    });
    const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 1 });
    const detailMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });

    // Body Construction based on Model Type
    const bodyWidth = model.visuals.bodyWidth;
    const bodyHeight = model.visuals.bodyHeight;
    const bodyLength = 2.5;

    // Main Body
    const bodyGeom = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
    const body = new THREE.Mesh(bodyGeom, bodyMaterial);
    body.position.y = bodyHeight / 2 + 0.2;
    body.castShadow = true;
    carGroupRef.current.add(body);

    // Cabin
    const cabinWidth = bodyWidth * model.visuals.cabinWidth;
    const cabinHeight = model.visuals.cabinHeight;
    const cabinLength = bodyLength * 0.4;
    const cabinGeom = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
    const cabin = new THREE.Mesh(cabinGeom, bodyMaterial);
    cabin.position.y = bodyHeight + cabinHeight / 2 + 0.2;
    cabin.position.z = -0.2; // Slightly towards the back
    cabin.castShadow = true;
    carGroupRef.current.add(cabin);

    // Windows
    const windowGeom = new THREE.BoxGeometry(cabinWidth + 0.02, cabinHeight * 0.8, cabinLength * 0.8);
    const windows = new THREE.Mesh(windowGeom, glassMaterial);
    windows.position.copy(cabin.position);
    carGroupRef.current.add(windows);

    // Wheels
    const wheelRadius = 0.35;
    const wheelWidth = 0.2;
    const wheelGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
    wheelGeom.rotateZ(Math.PI / 2);

    const wheelPositions = [
      { x: bodyWidth / 2, z: bodyLength / 2 - 0.5 }, // Front Left
      { x: -bodyWidth / 2, z: bodyLength / 2 - 0.5 }, // Front Right
      { x: bodyWidth / 2, z: -bodyLength / 2 + 0.5 }, // Rear Left
      { x: -bodyWidth / 2, z: -bodyLength / 2 + 0.5 }, // Rear Right
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, tireMaterial);
      wheel.position.set(pos.x, wheelRadius, pos.z);
      wheel.castShadow = true;
      carGroupRef.current.add(wheel);

      // Rims
      const rimGeom = new THREE.CylinderGeometry(wheelRadius * 0.7, wheelRadius * 0.7, wheelWidth + 0.01, 32);
      rimGeom.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeom, rimMaterial);
      rim.position.copy(wheel.position);
      carGroupRef.current.add(rim);
    });

    // Spoiler
    if (config.spoiler !== 'none') {
      const spoilerW = bodyWidth * 1.1;
      const spoilerH = config.spoiler === 'large' ? 0.4 : 0.15;
      const spoilerL = 0.2;
      
      const spoilerGeom = new THREE.BoxGeometry(spoilerW, 0.05, spoilerL);
      const spoiler = new THREE.Mesh(spoilerGeom, bodyMaterial);
      spoiler.position.set(0, bodyHeight + spoilerH + 0.2, -bodyLength / 2 + 0.2);
      spoiler.castShadow = true;
      carGroupRef.current.add(spoiler);

      // Spoiler Mounts
      if (config.spoiler === 'large') {
        const mountGeom = new THREE.BoxGeometry(0.05, spoilerH, 0.05);
        const mountL = new THREE.Mesh(mountGeom, detailMaterial);
        mountL.position.set(spoilerW * 0.3, bodyHeight + spoilerH / 2 + 0.2, -bodyLength / 2 + 0.2);
        carGroupRef.current.add(mountL);

        const mountR = new THREE.Mesh(mountGeom, detailMaterial);
        mountR.position.set(-spoilerW * 0.3, bodyHeight + spoilerH / 2 + 0.2, -bodyLength / 2 + 0.2);
        carGroupRef.current.add(mountR);
      }
    }

    // Headlights
    const lightGeom = new THREE.BoxGeometry(0.3, 0.1, 0.05);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 });
    
    const lightL = new THREE.Mesh(lightGeom, lightMat);
    lightL.position.set(bodyWidth * 0.3, bodyHeight / 2 + 0.2, bodyLength / 2);
    carGroupRef.current.add(lightL);

    const lightR = new THREE.Mesh(lightGeom, lightMat);
    lightR.position.set(-bodyWidth * 0.3, bodyHeight / 2 + 0.2, bodyLength / 2);
    carGroupRef.current.add(lightR);

    // Tail lights
    const tailLightGeom = new THREE.BoxGeometry(0.4, 0.1, 0.05);
    const tailLightMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 });
    
    const tailL = new THREE.Mesh(tailLightGeom, tailLightMat);
    tailL.position.set(bodyWidth * 0.3, bodyHeight / 2 + 0.2, -bodyLength / 2);
    carGroupRef.current.add(tailL);

    const tailR = new THREE.Mesh(tailLightGeom, tailLightMat);
    tailR.position.set(-bodyWidth * 0.3, bodyHeight / 2 + 0.2, -bodyLength / 2);
    carGroupRef.current.add(tailR);

    // Turbo Upgrade Visual (Hood Scoop)
    if (config.turbo > 1) {
      const scoopGeom = new THREE.BoxGeometry(0.4, 0.1, 0.3);
      const scoop = new THREE.Mesh(scoopGeom, bodyMaterial);
      scoop.position.set(0, bodyHeight + 0.25, bodyLength / 4);
      carGroupRef.current.add(scoop);
    }

    // Engine Upgrade Visual (Exhaust)
    const exhaustGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16);
    exhaustGeom.rotateX(Math.PI / 2);
    const exhaustMat = new THREE.MeshStandardMaterial({ 
      color: config.engine > 3 ? 0xffaa00 : 0x333333, 
      emissive: config.engine > 3 ? 0xff5500 : 0x000000,
      emissiveIntensity: config.engine > 3 ? 2 : 0
    });
    
    const exhaustL = new THREE.Mesh(exhaustGeom, exhaustMat);
    exhaustL.position.set(bodyWidth * 0.2, 0.2, -bodyLength / 2 - 0.1);
    carGroupRef.current.add(exhaustL);

    const exhaustR = new THREE.Mesh(exhaustGeom, exhaustMat);
    exhaustR.position.set(-bodyWidth * 0.2, 0.2, -bodyLength / 2 - 0.1);
    carGroupRef.current.add(exhaustR);

    // Decals (Stripes)
    if (config.decal === 'stripes') {
      const stripeGeom = new THREE.PlaneGeometry(bodyWidth * 0.4, bodyLength + cabinLength);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const stripe = new THREE.Mesh(stripeGeom, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.y = bodyHeight + cabinHeight + 0.21;
      stripe.position.z = -0.2;
      carGroupRef.current.add(stripe);
    }

    // Decals (Racing Number)
    if (config.decal === 'racing-number') {
      const numGeom = new THREE.CircleGeometry(0.3, 32);
      const numMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const num = new THREE.Mesh(numGeom, numMat);
      num.rotation.y = Math.PI / 2;
      num.position.set(bodyWidth / 2 + 0.01, bodyHeight / 2 + 0.2, 0);
      carGroupRef.current.add(num);
    }

  }, [config]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
};
