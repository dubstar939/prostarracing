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
import { CarConfig, CAR_MODELS, BODY_KITS, DECALS, CarModelType, Inventory, PERFORMANCE_PARTS } from '../types';
import { drawCar } from '../utils/carRenderer';
import ThreeCarPreview from './ThreeCarPreview';

interface GarageProps {
  carConfig: CarConfig;
  setCarConfig: (config: CarConfig) => void;
  money: number;
  setMoney: (money: number) => void;
  inventory: Inventory;
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

export default function Garage({ carConfig, setCarConfig, money, setMoney, inventory, onBack }: GarageProps) {
  const [activeTab, setActiveTab] = useState<'model' | 'paint' | 'decals' | 'bodykit' | 'performance'>('model');
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
      drawCar(ctx, x, y, w, h, carConfig, false, 0, 0);
      
      frame++;
      requestAnimationFrame(render);
    };

    render();
  }, [carConfig]);

  const updateConfig = (updates: Partial<CarConfig>) => {
    setCarConfig({ ...carConfig, ...updates });
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-zinc-900 bg-black/50 backdrop-blur-md">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase font-bold tracking-widest text-[10px] md:text-sm">Menu</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter">The Garage</h1>
          <p className="hidden sm:block text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Customize your ride</p>
        </div>

        <div className="bg-zinc-900 px-3 py-1 md:px-4 md:py-2 rounded-sm border border-zinc-800">
          <span className="text-emerald-400 font-mono font-bold text-sm md:text-base">${money.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.5)_0%,transparent_100%)] min-h-[300px] lg:min-h-0">
          {CAR_MODELS[carConfig.model].glbUrl ? (
            <ThreeCarPreview carConfig={carConfig} glbUrl={CAR_MODELS[carConfig.model].glbUrl!} />
          ) : (
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={600} 
              className="w-full h-full object-contain"
            />
          )}
          
          <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full px-4">
            <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white text-center">
              {CAR_MODELS[carConfig.model].name}
            </h2>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {Object.entries(CAR_MODELS[carConfig.model].stats).map(([stat, val]) => (
                <div key={stat} className="flex flex-col items-center">
                  <div className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-500 mb-1">{stat}</div>
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-0.5 md:w-3 md:h-1 ${i < (val as number) ? 'bg-cyan-400' : 'bg-zinc-800'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customization Panel */}
        <div className="w-full lg:w-[450px] bg-zinc-900/50 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-zinc-800 p-4 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto max-h-[50vh] lg:max-h-full">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-black rounded-sm border border-zinc-800">
            {(['model', 'paint', 'decals', 'bodykit', 'performance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[60px] py-2 text-[8px] md:text-[10px] uppercase font-bold tracking-widest transition-all rounded-sm ${
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
                className="space-y-6"
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

            {activeTab === 'performance' && (
              <motion.div 
                key="performance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Performance Parts</h3>
                </div>
                
                {/* Engine */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Engine</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {PERFORMANCE_PARTS.engine.filter(p => inventory.engines.includes(p.level)).map((part) => (
                      <button
                        key={part.level}
                        onClick={() => updateConfig({ engine: part.level })}
                        className={`p-3 rounded-sm border text-left transition-all ${
                          carConfig.engine === part.level 
                            ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500' 
                            : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold uppercase tracking-widest text-xs">{part.name}</span>
                          {carConfig.engine === part.level && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tires */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tires</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {PERFORMANCE_PARTS.tires.filter(p => inventory.tires.includes(p.level)).map((part) => (
                      <button
                        key={part.level}
                        onClick={() => updateConfig({ tires: part.level })}
                        className={`p-3 rounded-sm border text-left transition-all ${
                          carConfig.tires === part.level 
                            ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500' 
                            : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold uppercase tracking-widest text-xs">{part.name}</span>
                          {carConfig.tires === part.level && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Turbo */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Turbo</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {PERFORMANCE_PARTS.turbo.filter(p => inventory.turbos.includes(p.level)).map((part) => (
                      <button
                        key={part.level}
                        onClick={() => updateConfig({ turbo: part.level })}
                        className={`p-3 rounded-sm border text-left transition-all ${
                          carConfig.turbo === part.level 
                            ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500' 
                            : 'bg-zinc-900 text-white border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold uppercase tracking-widest text-xs">{part.name}</span>
                          {carConfig.turbo === part.level && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    ))}
                  </div>
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
