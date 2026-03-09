import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CAR_MODELS, CarModelType, CarConfig } from '../types';
import { Zap, Gauge, Target, ChevronRight, ChevronLeft } from 'lucide-react';

interface CarSelectProps {
  onSelect: (model: CarModelType) => void;
  currentModel: CarModelType;
}

const shadeColor = (color: string, percent: number) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
};

const drawCarIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, modelId: CarModelType) => {
  const model = CAR_MODELS[modelId];
  const colorMap: Record<CarModelType, string> = {
    apex: '#10b981',
    zenith: '#38bdf8',
    fury: '#dc2626',
    velocity: '#fbbf24',
    phantom: '#7c3aed'
  };
  const color = colorMap[modelId];
  const visuals = model.visuals;
  
  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.6 * visuals.bodyWidth, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.4 * visuals.bodyWidth, y - h * 0.15, w * 0.1, h * 0.15, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.4 * visuals.bodyWidth, y - h * 0.15, w * 0.1, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spoiler
  const spoilerY = y - h * visuals.bodyHeight - h * visuals.cabinHeight;
  const spoilerW = w * visuals.bodyWidth * 1.1;
  
  if (visuals.spoilerType === 'wing') {
    ctx.fillStyle = '#222';
    ctx.fillRect(x - spoilerW / 2, spoilerY - 10, spoilerW, 6); // Wing
    ctx.fillRect(x - spoilerW * 0.35, spoilerY - 10, 3, 10); // Left mount
    ctx.fillRect(x + spoilerW * 0.35 - 3, spoilerY - 10, 3, 10); // Right mount
  } else if (visuals.spoilerType === 'ducktail') {
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(x - spoilerW / 2, spoilerY);
    ctx.lineTo(x + spoilerW / 2, spoilerY);
    ctx.lineTo(x + spoilerW / 2, spoilerY - 8);
    ctx.lineTo(x - spoilerW / 2, spoilerY - 8);
    ctx.fill();
  } else if (visuals.spoilerType === 'integrated') {
    ctx.fillStyle = shadeColor(color, -20);
    ctx.beginPath();
    ctx.moveTo(x - spoilerW / 2, spoilerY + 5);
    ctx.lineTo(x + spoilerW / 2, spoilerY + 5);
    ctx.lineTo(x + spoilerW * 0.45, spoilerY - 5);
    ctx.lineTo(x - spoilerW * 0.45, spoilerY - 5);
    ctx.closePath();
    ctx.fill();
  }

  // Car Body - Lower
  const gradient = ctx.createLinearGradient(x, y - h * visuals.bodyHeight, x, y);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, shadeColor(color, -30));
  ctx.fillStyle = gradient;
  
  const bodyW = w * visuals.bodyWidth;
  const bodyH = h * visuals.bodyHeight;
  
  ctx.beginPath();
  ctx.moveTo(x - bodyW / 2, y - bodyH * 0.1);
  ctx.bezierCurveTo(x - bodyW / 2, y - bodyH * 0.4, x - bodyW * 0.45, y - bodyH * 0.6, x - bodyW * 0.45, y - bodyH * 0.6);
  ctx.lineTo(x + bodyW * 0.45, y - bodyH * 0.6);
  ctx.bezierCurveTo(x + bodyW * 0.45, y - bodyH * 0.6, x + bodyW / 2, y - bodyH * 0.4, x + bodyW / 2, y - bodyH * 0.1);
  ctx.closePath();
  ctx.fill();

  // Car Body - Upper (Cabin)
  ctx.fillStyle = shadeColor(color, -10);
  const cabinW = w * visuals.cabinWidth;
  const cabinH = h * visuals.cabinHeight;
  const cabinY = y - bodyH * 0.6;
  
  ctx.beginPath();
  ctx.moveTo(x - cabinW / 2, cabinY);
  ctx.bezierCurveTo(x - cabinW * 0.9, cabinY - cabinH * 0.5, x - cabinW * 0.8, cabinY - cabinH, x - cabinW * 0.8, cabinY - cabinH);
  ctx.lineTo(x + cabinW * 0.8, cabinY - cabinH);
  ctx.bezierCurveTo(x + cabinW * 0.8, cabinY - cabinH, x + cabinW * 0.9, cabinY - cabinH * 0.5, x + cabinW / 2, cabinY);
  ctx.closePath();
  ctx.fill();

  // Rear Window
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(x - cabinW * 0.6, cabinY - cabinH + 5);
  ctx.lineTo(x + cabinW * 0.6, cabinY - cabinH + 5);
  ctx.lineTo(x + cabinW * 0.7, cabinY - 5);
  ctx.lineTo(x - cabinW * 0.7, cabinY - 5);
  ctx.closePath();
  ctx.fill();

  // Tail Lights
  ctx.fillStyle = '#ef4444';
  if (visuals.tailLightType === 'bar') {
    ctx.beginPath();
    ctx.roundRect(x - bodyW * 0.45, y - bodyH * 0.5, bodyW * 0.9, bodyH / 15, 2);
    ctx.fill();
  } else if (visuals.tailLightType === 'segments') {
    ctx.beginPath();
    ctx.roundRect(x - bodyW * 0.42, y - bodyH * 0.5, bodyW / 5, bodyH / 10, 2);
    ctx.roundRect(x + bodyW * 0.42 - bodyW / 5, y - bodyH * 0.5, bodyW / 5, bodyH / 10, 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x - bodyW * 0.35, y - bodyH * 0.45, bodyH / 8, 0, Math.PI * 2);
    ctx.arc(x + bodyW * 0.35, y - bodyH * 0.45, bodyH / 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Exhausts
  ctx.fillStyle = '#333';
  if (visuals.exhaustType === 'triple') {
    ctx.beginPath();
    ctx.arc(x - 8, y - 5, 4, 0, Math.PI * 2);
    ctx.arc(x, y - 5, 4, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (visuals.exhaustType === 'dual') {
    ctx.beginPath();
    ctx.arc(x - bodyW * 0.3, y - 5, 5, 0, Math.PI * 2);
    ctx.arc(x + bodyW * 0.3, y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(x - 10, y - 8, 20, 6);
  }

  ctx.restore();
};

export const CarSelect: React.FC<CarSelectProps> = ({ onSelect, currentModel }) => {
  const models = Object.values(CAR_MODELS);
  const [currentIndex, setCurrentIndex] = useState(models.findIndex(m => m.id === currentModel));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const next = () => setCurrentIndex((prev) => (prev + 1) % models.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);
  
  const selectedModel = models[currentIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCarIllustration(ctx, canvas.width / 2, canvas.height * 0.8, 300, 180, selectedModel.id);
  }, [currentIndex, selectedModel.id]);

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
            <canvas 
              ref={canvasRef} 
              width={500} 
              height={300} 
              className="w-full h-auto max-w-[400px]"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-9xl opacity-5 font-black italic uppercase tracking-tighter text-white select-none">
                 {selectedModel.name.split(' ')[0]}
               </div>
            </div>
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
