import { usePlane, useBox } from '@react-three/cannon';

export function Track() {
  // 5. Environment Setup: Ground plane
  const [groundRef] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.1 }
  }));

  // 8. Collision Detection: Static physics bodies for walls
  // Left barrier
  const [leftWallRef] = useBox(() => ({
    type: 'Static',
    position: [-12, 1, -250],
    args: [1, 2, 1000],
  }));

  // Right barrier
  const [rightWallRef] = useBox(() => ({
    type: 'Static',
    position: [12, 1, -250],
    args: [1, 2, 1000],
  }));

  // Obstacle
  const [obstacleRef] = useBox(() => ({
    mass: 500,
    position: [0, 1, -50],
    args: [2, 2, 2],
  }));

  return (
    <group>
      {/* Road */}
      <mesh ref={groundRef as any} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>
      
      {/* Left Wall */}
      <mesh ref={leftWallRef as any} receiveShadow castShadow>
        <boxGeometry args={[1, 2, 1000]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Right Wall */}
      <mesh ref={rightWallRef as any} receiveShadow castShadow>
        <boxGeometry args={[1, 2, 1000]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Dynamic Obstacle to demonstrate collisions */}
      <mesh ref={obstacleRef as any} receiveShadow castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ff0055" />
      </mesh>

      {/* Scenery / Street Lights */}
      {Array.from({ length: 20 }).map((_, i) => (
        <group key={i} position={[14, 0, -i * 50]}>
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 10]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <pointLight position={[-2, 9, 0]} color="#facc15" intensity={50} distance={40} />
        </group>
      ))}

      {/* Ambient environment lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 10]} intensity={0.2} castShadow />
      
      {/* Distant city neon glow */}
      <pointLight position={[0, 50, -500]} color="#a855f7" intensity={5000} distance={1000} />
      <pointLight position={[-100, 50, -400]} color="#06b6d4" intensity={5000} distance={1000} />
    </group>
  );
}
