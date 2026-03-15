import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Palette, 
  Layers, 
  Zap, 
  ArrowLeft,
  Check,
  Lock
} from 'lucide-react';
import { CarConfig, CAR_MODELS, BODY_KITS, DECALS, CarModelType } from '../types';

interface GarageProps {
  carConfig: CarConfig;
  setCarConfig: (config: CarConfig) => void;
  money: number;
  setMoney: (money: number) => void;
  onBack: () => void;
}

const COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ffffff', // White
  '#18181b', // Zinc
  '#facc15', // Yellow
  '#06b6d4', // Cyan
];

export default function Garage({ carConfig, setCarConfig, money, setMoney, onBack }: GarageProps) {
  const [activeTab, setActiveTab] = useState<'model' | 'paint' | 'decals' | 'bodykit'>('model');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Preview rendering logic (similar to RacingGame but larger and rotatable)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const x = canvas.width / 2;
      const y = canvas.height / 2 + 50;
      const w = 240;
      const h = 140;
      
      // Draw Floor Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(x, y + 10, w * 0.6, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Car Preview (Rear-ish view)
      drawCarPreview(ctx, x, y, w, h, carConfig);
      
      frame++;
      requestAnimationFrame(render);
    };

    const drawCarPreview = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: CarConfig) => {
      ctx.save();
      
      // Subtle hover animation
      const hoverY = Math.sin(frame * 0.05) * 5;
      ctx.translate(0, hoverY);

      // Spoiler
      if (config.spoiler !== 'none') {
        const wingHeight = config.spoiler === 'large' ? 45 : 25;
        const wingWidth = w * 0.9;
        
        ctx.fillStyle = '#111';
        ctx.fillRect(x - wingWidth / 2, y - h - wingHeight, wingWidth, 12);
        
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.3, y - h + 10);
        ctx.lineTo(x - w * 0.35, y - h - wingHeight);
        ctx.moveTo(x + w * 0.3, y - h + 10);
        ctx.lineTo(x + w * 0.35, y - h - wingHeight);
        ctx.stroke();
      }

      // Body Kit - Street/Racing/Extreme additions
      if (config.bodyKit !== 'stock') {
        ctx.fillStyle = '#0a0a0a';
        const kitWidth = config.bodyKit === 'extreme' ? w * 1.15 : w * 1.05;
        ctx.beginPath();
        ctx.roundRect(x - kitWidth / 2, y - 15, kitWidth, 25, 5);
        ctx.fill();
      }

      // Main Body
      const bodyGrad = ctx.createLinearGradient(x, y - h, x, y);
      bodyGrad.addColorStop(0, config.color);
      bodyGrad.addColorStop(1, shadeColor(config.color, -30));
      ctx.fillStyle = bodyGrad;
      
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h * 0.6, w, h * 0.6, 15);
      ctx.fill();

      // Upper Cabin
      ctx.fillStyle = shadeColor(config.color, -10);
      ctx.beginPath();
      ctx.moveTo(x - w * 0.4, y - h * 0.6);
      ctx.lineTo(x - w * 0.3, y - h);
      ctx.lineTo(x + w * 0.3, y - h);
      ctx.lineTo(x + w * 0.4, y - h * 0.6);
      ctx.closePath();
      ctx.fill();

      // Window
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(x - w * 0.35, y - h * 0.65);
      ctx.lineTo(x - w * 0.28, y - h + 10);
      ctx.lineTo(x + w * 0.28, y - h + 10);
      ctx.lineTo(x + w * 0.35, y - h * 0.65);
      ctx.closePath();
      ctx.fill();

      // Decals
      if (config.decal === 'stripes') {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x - w * 0.1, y - h, w * 0.05, h);
        ctx.fillRect(x + w * 0.05, y - h, w * 0.05, h);
      } else if (config.decal === 'racing-number') {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y - h * 0.4, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('01', x, y - h * 0.4);
      } else if (config.decal === 'flames') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.4, y - h * 0.3);
        ctx.quadraticCurveTo(x - w * 0.2, y - h * 0.5, x, y - h * 0.3);
        ctx.quadraticCurveTo(x + w * 0.2, y - h * 0.5, x + w * 0.4, y - h * 0.3);
        ctx.fill();
      }

      // Tail Lights
      ctx.fillStyle = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ef4444';
      ctx.fillRect(x - w * 0.45, y - h * 0.5, 40, 15);
      ctx.fillRect(x + w * 0.45 - 40, y - h * 0.5, 40, 15);
      ctx.shadowBlur = 0;

      ctx.restore();
    };

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

    render();
  }, [carConfig]);

  const updateConfig = (updates: Partial<CarConfig>) => {
    setCarConfig({ ...carConfig, ...updates });
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-bottom border-zinc-900 bg-black/50 backdrop-blur-md">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase font-bold tracking-widest text-sm">Main Menu</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">The Garage</h1>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Customize your ride</p>
        </div>

        <div className="bg-zinc-900 px-4 py-2 rounded-sm border border-zinc-800">
          <span className="text-emerald-400 font-mono font-bold">${money.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.5)_0%,transparent_100%)]">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            className="w-full h-full object-contain"
          />
          
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              {CAR_MODELS[carConfig.model].name}
            </h2>
            <div className="flex gap-4">
              {Object.entries(CAR_MODELS[carConfig.model].stats).map(([stat, val]) => (
                <div key={stat} className="flex flex-col items-center">
                  <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">{stat}</div>
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-3 h-1 ${i < (val as number) ? 'bg-cyan-400' : 'bg-zinc-800'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="w-full lg:w-[450px] bg-zinc-900/50 backdrop-blur-xl border-l border-zinc-800 p-8 flex flex-col gap-8 overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-black rounded-sm border border-zinc-800">
            {(['model', 'paint', 'decals', 'bodykit'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-widest transition-all rounded-sm ${
                  activeTab === tab ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'model' && (
              <motion.div 
                key="model"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Select Chassis</h3>
                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(CAR_MODELS) as CarModelType[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => updateConfig({ model: m })}
                      className={`p-4 rounded-sm border text-left transition-all ${
                        carConfig.model === m 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black italic uppercase tracking-tight text-xl">{CAR_MODELS[m].name}</span>
                        {carConfig.model === m && <Check className="w-5 h-5" />}
                      </div>
                      <p className={`text-xs mt-1 ${carConfig.model === m ? 'text-zinc-600' : 'text-zinc-500'}`}>
                        {CAR_MODELS[m].description}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'paint' && (
              <motion.div 
                key="paint"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Body Color</h3>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateConfig({ color: c })}
                      className={`aspect-square rounded-sm border-2 transition-all transform hover:scale-110 ${
                        carConfig.color === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'decals' && (
              <motion.div 
                key="decals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Livery & Decals</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(DECALS).map(([id, info]) => (
                    <button
                      key={id}
                      onClick={() => updateConfig({ decal: id as any })}
                      className={`p-4 rounded-sm border text-left transition-all ${
                        carConfig.decal === id 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold uppercase tracking-widest text-xs">{info.name}</span>
                        {carConfig.decal === id && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'bodykit' && (
              <motion.div 
                key="bodykit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Aerodynamics</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(BODY_KITS).map(([id, info]) => (
                    <button
                      key={id}
                      onClick={() => updateConfig({ bodyKit: id as any })}
                      className={`p-4 rounded-sm border text-left transition-all ${
                        carConfig.bodyKit === id 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold uppercase tracking-widest text-xs">{info.name}</span>
                        {carConfig.bodyKit === id && <Check className="w-4 h-4" />}
                      </div>
                      <p className={`text-[10px] mt-1 ${carConfig.bodyKit === id ? 'text-zinc-600' : 'text-zinc-500'}`}>
                        {info.description}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-8 border-t border-zinc-800">
            <button
              onClick={onBack}
              className="w-full bg-white text-black font-black italic uppercase tracking-tight py-4 rounded-sm hover:bg-zinc-200 transition-all transform hover:skew-x-[-10deg] active:scale-95"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
