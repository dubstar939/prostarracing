import { useEffect, useRef } from 'react';
import { Car } from './Car';
import spritesheetData from './spritesheet.json';

export default function GameEngine({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const carRef = useRef<Car | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Load spritesheet image
    const spritesheet = new Image();
    const assetPath = '/assets/cars.png';
    spritesheet.src = assetPath;
    
    // Initialize car
    carRef.current = new Car('rx7_fd', spritesheet, spritesheetData);

    const animate = (time: number) => {
      // Clear canvas
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw some "road" lines for effect
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const y = (time / 5 + i * 100) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 100, y);
        ctx.lineTo(canvas.width / 2 - 100, y + 50);
        ctx.moveTo(canvas.width / 2 + 100, y);
        ctx.lineTo(canvas.width / 2 + 100, y + 50);
        ctx.stroke();
      }

      // Update and Draw Car
      if (carRef.current) {
        carRef.current.update();
        carRef.current.draw(ctx, canvas.width / 2, canvas.height / 2);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    spritesheet.onload = () => {
      console.log(`[GameEngine] Spritesheet loaded successfully from: ${assetPath}`);
      requestRef.current = requestAnimationFrame(animate);
    };

    spritesheet.onerror = () => {
      console.warn(`[GameEngine] Failed to load spritesheet from: ${assetPath}. Falling back to placeholder.`);
      if (spritesheet.src !== 'https://picsum.photos/seed/car-sprites/340/816') {
        spritesheet.src = 'https://picsum.photos/seed/car-sprites/340/816';
      }
    };

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white font-mono pointer-events-none z-10">
        <h1 className="text-3xl font-black text-cyan-400 italic uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          TOKYO NIGHTS 2D
        </h1>
        <p className="mt-2 text-zinc-400">Left / Right Arrows to Drift</p>
        <p className="text-zinc-500 mt-4 text-xs">Beginner-Friendly 2D Edition</p>
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
