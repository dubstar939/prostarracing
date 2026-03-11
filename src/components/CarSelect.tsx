import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CAR_MODELS, CarModelType, CarConfig } from '../types';
import { Zap, Gauge, Target, ChevronRight, ChevronLeft } from 'lucide-react';
import { Car3D } from './Car3D';

interface CarSelectProps {
  onSelect: (model: CarModelType) => void;
  currentModel: CarModelType;
  carSprites?: Record<string, string>;
}

export const CarSelect: React.FC<CarSelectProps> = ({ onSelect, currentModel, carSprites }) => {
  const models = Object.values(CAR_MODELS);
  const initialIndex = models.findIndex(m => m.id === currentModel);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  
  const next = () => setCurrentIndex((prev) => (prev + 1) % models.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);
  
  const selectedModel = models[currentIndex] || models[0];

  // Create a temporary config for the 3D preview
  const previewConfig: CarConfig = {
    model: selectedModel.id,
    color: selectedModel.color,
    spoiler: selectedModel.visuals.spoilerType === 'none' ? 'none' : 'small',
    rims: '#fff',
    decal: 'none',
    engine: 1,
    tires: 1,
    turbo: 1
  };

  const StatBar = ({ label, value, max, icon: Icon, color }: { label: string, value: number, max: number, icon: any, color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <span className={color}>{Math.round((value / max) * 100)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          className={`h-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-2">
          Select Your Machine
        </h2>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em]">Choose your starting performance profile</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Car Preview Area */}
        <div className="relative aspect-video bg-zinc-900/50 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-purple-500/5" />
          
          <button 
            onClick={prev}
            className="absolute left-4 z-10 p-3 bg-black/50 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={next}
            className="absolute right-4 z-10 p-3 bg-black/50 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

            <motion.div
              key={selectedModel.id}
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -100, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative z-0 w-full h-full flex items-center justify-center"
            >
              <Car3D config={previewConfig} className="w-full h-full" />
            </motion.div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Model Type</div>
              <div className="text-2xl font-black italic uppercase text-white">{selectedModel.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Class</div>
              <div className="text-xl font-bold text-zinc-300 uppercase italic">Arcade-S</div>
            </div>
          </div>
        </div>

        {/* Stats & Info Area */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 border-b border-white/10 pb-2">Performance Profile</h3>
            <p className="text-zinc-400 font-medium leading-relaxed italic">
              "{selectedModel.description}"
            </p>
          </div>

          <div className="space-y-6">
            <StatBar 
              label="Top Speed" 
              value={selectedModel.baseStats.maxSpeed} 
              max={20000} 
              icon={Gauge} 
              color="text-cyan-400" 
            />
            <StatBar 
              label="Acceleration" 
              value={selectedModel.baseStats.accel} 
              max={8000} 
              icon={Zap} 
              color="text-purple-400" 
            />
            <StatBar 
              label="Handling" 
              value={selectedModel.baseStats.handling * 100} 
              max={150} 
              icon={Target} 
              color="text-emerald-400" 
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, skewX: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(selectedModel.id)}
            className="w-full py-6 bg-white text-black font-black uppercase italic tracking-tighter text-xl rounded-sm hover:bg-cyan-400 transition-colors flex items-center justify-center gap-3 group"
          >
            Confirm Selection
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      <div className="mt-12 flex gap-3">
        {models.map((m, i) => (
          <div 
            key={m.id}
            className={`h-1 w-12 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-cyan-400 w-24' : 'bg-zinc-800'}`}
          />
        ))}
      </div>
    </div>
  );
};
