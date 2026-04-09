import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Vector3 } from 'three';
import { useControls } from './useControls';

// Pre-allocate vectors to avoid garbage collection
const _vector = new Vector3();
const _camOffset = new Vector3(0, 3, 8);
const _lookAtTarget = new Vector3(0, 1, 0);

export function Car({ onFinish }: { onFinish?: () => void }) {
  const controls = useControls();
  const { camera } = useThree();
  
  // 2. Car Dynamics: Using a physics box for the vehicle body
  const [ref, api] = useBox(() => ({
    mass: 1500, // kg
    position: [0, 1, 0],
    args: [2, 1, 4.5], // Width, Height, Length
    linearDamping: 0.9, // Simulate air resistance
    angularDamping: 0.9, // Prevent infinite spinning
    collisionFilterGroup: 1,
    collisionFilterMask: 1,
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

  // Cache physics parameters
  const engineForce = 12000;
  const maxSteerVal = 2.5;

  // 7. Game Loop: useFrame runs every frame to update physics forces and camera
  useFrame((_, delta) => {
    const { forward, backward, left, right, brake } = controls;
    
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

    // 6. Camera System: Follow camera logic (optimized)
    const carPos = position.current;
    
    // Rotate offset by car's Y rotation so it stays behind the car
    _camOffset.set(0, 3, 8);
    _camOffset.applyAxisAngle(new Vector3(0, 1, 0), rotation.current[1]);
    
    const targetCamPos = _vector.set(carPos[0], carPos[1], carPos[2]).add(_camOffset);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetCamPos, 0.1);
    
    // Look slightly ahead of the car
    _lookAtTarget.set(carPos[0], carPos[1] + 1, carPos[2]);
    camera.lookAt(_lookAtTarget);

    // Simple finish line check
    if (carPos[2] < -500 && onFinish) {
      onFinish();
    }
  });

  // Memoize static lights to prevent re-creation
  const headlights = useMemo(() => (
    <>
      <spotLight
        position={[0.8, 0, -2.2]}
        angle={0.5}
        penumbra={0.5}
        intensity={200}
        distance={100}
        color="#ffffff"
        castShadow={false}
      />
      <spotLight
        position={[-0.8, 0, -2.2]}
        angle={0.5}
        penumbra={0.5}
        intensity={200}
        distance={100}
        color="#ffffff"
        castShadow={false}
      />
    </>
  ), []);

  const taillights = useMemo(() => (
    <>
      <pointLight position={[0.8, 0, 2.2]} color="#ff0000" intensity={10} distance={5} />
      <pointLight position={[-0.8, 0, 2.2]} color="#ff0000" intensity={10} distance={5} />
    </>
  ), []);

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[2, 1, 4.5]} />
      <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.7} />
      
      {headlights}
      {taillights}
    </mesh>
  );
}
