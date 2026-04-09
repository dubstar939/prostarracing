import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3, MathUtils } from 'three';
import { useControls } from './useControls';

export function Car({ onFinish }: { onFinish?: () => void }) {
  const controls = useControls();
  
  // 2. Car Dynamics: Using a physics box for the vehicle body
  const [ref, api] = useBox(() => ({
    mass: 1500, // kg
    position: [0, 1, 0],
    args: [2, 1, 4.5], // Width, Height, Length
    linearDamping: 0.9, // Simulate air resistance
    angularDamping: 0.9, // Prevent infinite spinning
  }));

  const velocity = useRef([0, 0, 0]);
  const position = useRef([0, 0, 0]);
  const rotation = useRef([0, 0, 0]);

  useEffect(() => {
    const unsubVel = api.velocity.subscribe((v) => (velocity.current = v));
    const unsubPos = api.position.subscribe((p) => (position.current = p));
    const unsubRot = api.rotation.subscribe((r) => (rotation.current = r));
    return () => {
      unsubVel();
      unsubPos();
      unsubRot();
    };
  }, [api]);

  // 7. Game Loop: useFrame runs every frame to update physics forces and camera
  useFrame((state) => {
    const { forward, backward, left, right, brake } = controls;
    
    // Basic Arcade Physics Parameters
    const engineForce = 12000;
    const maxSteerVal = 2.5;

    // Acceleration & Braking
    if (forward) {
      api.applyLocalForce([0, 0, -engineForce], [0, 0, 0]);
    }
    if (backward) {
      api.applyLocalForce([0, 0, engineForce / 2], [0, 0, 0]);
    }

    // Steering (only effective if moving)
    const speed = Math.sqrt(velocity.current[0]**2 + velocity.current[2]**2);
    if (speed > 1) {
      // Determine direction of travel to invert steering when reversing
      const steerDir = forward ? 1 : (backward ? -1 : Math.sign(velocity.current[2]));
      if (left) api.angularVelocity.set(0, maxSteerVal * steerDir, 0);
      if (right) api.angularVelocity.set(0, -maxSteerVal * steerDir, 0);
    }

    // Handbrake
    if (brake) {
      api.velocity.set(velocity.current[0] * 0.95, velocity.current[1], velocity.current[2] * 0.95);
    }

    // 6. Camera System: Follow camera logic
    const carPos = new Vector3(...position.current);
    
    // Calculate camera position behind and above the car
    const camOffset = new Vector3(0, 3, 8);
    // Rotate offset by car's Y rotation so it stays behind the car
    camOffset.applyAxisAngle(new Vector3(0, 1, 0), rotation.current[1]);
    
    const targetCamPos = carPos.clone().add(camOffset);
    
    // Smoothly interpolate camera position
    state.camera.position.lerp(targetCamPos, 0.1);
    
    // Look slightly ahead of the car
    const lookAtTarget = carPos.clone().add(new Vector3(0, 1, 0));
    state.camera.lookAt(lookAtTarget);

    // Simple finish line check
    if (position.current[2] < -500 && onFinish) {
      onFinish();
    }
  });

  return (
    <mesh ref={ref as any} castShadow>
      <boxGeometry args={[2, 1, 4.5]} />
      <meshStandardMaterial color="#06b6d4" />
      
      {/* 3. 3D Model Import Placeholder:
          To use a real 3D model, you would do:
          import { useGLTF } from '@react-three/drei';
          const { scene } = useGLTF('/models/car.glb');
          return <primitive object={scene} />
      */}
      
      {/* Headlights */}
      <spotLight
        position={[0.8, 0, -2.2]}
        angle={0.5}
        penumbra={0.5}
        intensity={200}
        distance={100}
        color="#ffffff"
        castShadow
      />
      <spotLight
        position={[-0.8, 0, -2.2]}
        angle={0.5}
        penumbra={0.5}
        intensity={200}
        distance={100}
        color="#ffffff"
        castShadow
      />
      
      {/* Taillights */}
      <pointLight position={[0.8, 0, 2.2]} color="#ff0000" intensity={10} distance={5} />
      <pointLight position={[-0.8, 0, 2.2]} color="#ff0000" intensity={10} distance={5} />
    </mesh>
  );
}
