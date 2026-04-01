import React from 'react';
import { motion } from 'motion/react';

interface MiniMapProps {
  progress: number;
  opponents: number[];
  playerColor?: string;
  className?: string;
}

export const MiniMap: React.FC<MiniMapProps> = ({ 
  progress, 
  opponents, 
  playerColor = '#00ffff',
  className = ''
}) => {
  // Track shape constants
  const RADIUS = 42;
  const CENTER = 50;

  return (
    <div className={`w-40 h-28 border-2 border-white/20 rounded-xl relative overflow-hidden bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${className}`}>
      <div className="text-[8px] font-black font-mono text-white/40 uppercase tracking-[0.2em] mb-2">Track Position</div>
      
      <div className="w-32 h-16 border-2 border-white/5 rounded-full relative">
        {/* Track Path Glow */}
        <div className="absolute inset-[-2px] border-2 border-white/10 rounded-full blur-[1px]" />
        
        {/* Opponent Dots */}
        {opponents.map((oppProgress, i) => {
          const angle = oppProgress * Math.PI * 2 - Math.PI / 2;
          const x = CENTER + RADIUS * Math.cos(angle);
          const y = CENTER + RADIUS * Math.sin(angle);
          
          return (
            <motion.div 
              key={i}
              initial={false}
              animate={{ left: `${x}%`, top: `${y}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="absolute w-2 h-2 bg-white/60 rounded-full z-10 border border-black/50"
              style={{ transform: 'translate(-50%, -50%)' }}
            />
          );
        })}

        {/* Player Indicator */}
        {(() => {
          const angle = progress * Math.PI * 2 - Math.PI / 2;
          const x = CENTER + RADIUS * Math.cos(angle);
          const y = CENTER + RADIUS * Math.sin(angle);
          
          return (
            <motion.div 
              initial={false}
              animate={{ left: `${x}%`, top: `${y}%` }}
              transition={{ type: 'spring', stiffness: 150, damping: 25 }}
              className="absolute w-4 h-4 z-20"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              {/* Outer Glow */}
              <div 
                className="absolute inset-0 rounded-full blur-[4px] animate-pulse"
                style={{ backgroundColor: playerColor }}
              />
              {/* Core */}
              <div 
                className="absolute inset-[2px] rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: playerColor }}
              />
              {/* Directional Arrow (Simplified) */}
              <div 
                className="absolute top-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-white"
                style={{ transform: `rotate(${progress * 360}deg)` }}
              />
            </motion.div>
          );
        })()}
      </div>

      {/* Progress Bar Alternative (Bottom) */}
      <div className="absolute bottom-1 left-4 right-4 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white/40 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};
