import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Car } from './Car';
import { Track } from './Track';

// 1. Game Framework: React Three Fiber + Cannon Physics
export default function GameEngine({ onExit }: { onExit: () => void }) {
  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 150]} />
        
        {/* Physics Engine Initialization */}
        <Physics broadphase="SAP" gravity={[0, -9.81, 0]}>
          <Track />
          <Car onFinish={onExit} />
        </Physics>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white font-mono pointer-events-none z-10">
        <h1 className="text-3xl font-black text-cyan-400 italic uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          TOKYO NIGHTS
        </h1>
        <p className="mt-2 text-zinc-400">WASD / Arrows to Drive</p>
        <p className="text-zinc-400">SPACE to Brake</p>
        <p className="text-zinc-500 mt-4 text-xs">Drive forward to finish</p>
      </div>

      <button 
        onClick={onExit}
        className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 text-white px-4 py-2 font-mono text-xs uppercase hover:bg-zinc-800 z-10"
      >
        Exit to Menu
      </button>
    </div>
  );
}
