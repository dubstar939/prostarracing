import React from 'react';
import { motion } from 'motion/react';

interface TrackMapProps {
  svgPath: string;
  color: string;
}

export const TrackMap: React.FC<TrackMapProps> = ({ svgPath, color }) => {
  return (
    <div className="relative w-full aspect-square max-h-[400px] flex items-center justify-center bg-black/40 rounded-xl border border-white/10 overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(${color}33 1px, transparent 1px), linear-gradient(90deg, ${color}33 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Glow effect behind map */}
      <div 
        className="absolute w-1/2 h-1/2 blur-[80px] rounded-full opacity-20"
        style={{ backgroundColor: color }}
      />

      <svg 
        viewBox="-50 -50 500 500" 
        className="w-full h-full relative z-10 drop-shadow-2xl"
        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
      >
        <motion.path
          d={svgPath}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d={svgPath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};
