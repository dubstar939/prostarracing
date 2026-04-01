import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Play as PlayIcon, Settings, Car, Palette, Zap, Shield, Gauge, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
import { CarConfig, BODY_KITS, DECALS, PERFORMANCE_PARTS, CAR_MODELS } from '../../types';

interface PauseMenuProps {
  isPaused: boolean;
  isMuted: boolean;
  togglePause: () => void;
  toggleMute: () => void;
  resetGame: () => void;
  setGameState: (state: 'menu' | 'racing' | 'customizing') => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isPaused,
  isMuted,
  togglePause,
  toggleMute,
  resetGame,
  setGameState
}) => {
  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-8"
        >
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Game Paused
              </h2>
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">Session Interrupted</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={togglePause}
                className="group relative h-16 bg-white text-black font-black italic text-2xl uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <span className="relative flex items-center justify-center gap-3">
                  <PlayIcon className="w-6 h-6 fill-current" />
                  Resume Race
                </span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={toggleMute}
                  className="h-14 bg-zinc-900 border border-white/10 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button 
                  onClick={() => setGameState('customizing')}
                  className="h-14 bg-zinc-900 border border-white/10 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                >
                  <Car className="w-5 h-5" />
                  Garage
                </button>
              </div>

              <button 
                onClick={resetGame}
                className="h-14 border-2 border-red-500/50 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all"
              >
                Restart Session
              </button>
              
              <button 
                onClick={() => setGameState('menu')}
                className="h-14 bg-zinc-900 border border-white/10 text-zinc-400 font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors"
              >
                Exit to Main Menu
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CustomizationMenuProps {
  carConfig: CarConfig;
  setCarConfig: (config: CarConfig) => void;
  onStart: () => void;
  inventory: any;
  setInventory: (inv: any) => void;
}

export const CustomizationMenu: React.FC<CustomizationMenuProps> = ({
  carConfig,
  setCarConfig,
  onStart,
  inventory,
  setInventory
}) => {
  const [activeTab, setActiveTab] = React.useState<'visual' | 'performance'>('visual');

  const updateConfig = (updates: Partial<CarConfig>) => {
    setCarConfig({ ...carConfig, ...updates });
  };

  const upgradePart = (type: 'engine' | 'tires' | 'turbo') => {
    const currentLevel = carConfig[type];
    if (currentLevel < 8) { // Max level for engine is 8, others are 5
      updateConfig({
        [type]: currentLevel + 1
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-zinc-950 flex flex-col z-[60]">
      {/* Header */}
      <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">The Garage</h2>
          <div className="flex bg-zinc-900 p-1 rounded-sm border border-white/5">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visual' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Visuals
            </button>
            <button 
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Performance
            </button>
          </div>
        </div>
        <button 
          onClick={onStart}
          className="bg-emerald-500 text-black px-12 h-12 font-black italic text-xl uppercase tracking-tighter hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          Enter Race
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Options */}
        <div className="w-96 border-r border-white/10 bg-zinc-900/50 backdrop-blur-sm p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {activeTab === 'visual' ? (
            <>
              {/* Model Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                  <Car className="w-3 h-3" /> Vehicle Model
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(CAR_MODELS).map(([id, model]) => (
                    <button
                      key={id}
                      onClick={() => updateConfig({ model: id as any })}
                      className={`w-full p-4 text-left border transition-all flex justify-between items-center ${carConfig.model === id ? 'bg-white border-white text-black shadow-lg' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'}`}
                    >
                      <span className="font-black italic uppercase tracking-tight">{model.name}</span>
                      <span className="text-[9px] font-mono opacity-60">SPEED: {model.stats.speed}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Finish & Tint
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {['#ff0055', '#00ffff', '#ffff00', '#00ff00', '#ffffff', '#222222', '#ff8800', '#8800ff', '#0000ff', '#ff00ff'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateConfig({ color })}
                      className={`aspect-square rounded-sm border-2 transition-all hover:scale-110 ${carConfig.color === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Body Kit */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                  <Settings className="w-3 h-3" /> Aero Package
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(BODY_KITS).map(([id, kit]) => (
                    <button
                      key={id}
                      onClick={() => updateConfig({ bodyKit: id as any })}
                      className={`p-3 text-[10px] font-black uppercase border transition-all ${carConfig.bodyKit === id ? 'bg-white border-white text-black' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'}`}
                    >
                      {kit.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decals */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Graphics
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(DECALS).map(([id, decal]) => (
                    <button
                      key={id}
                      onClick={() => updateConfig({ decal: id as any })}
                      className={`p-3 text-[10px] font-black uppercase border transition-all ${carConfig.decal === id ? 'bg-white border-white text-black' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'}`}
                    >
                      {decal.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Performance Upgrades */}
              <div className="space-y-8">
                {(['engine', 'tires', 'turbo'] as const).map((id) => (
                  <div key={id} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                        {id === 'engine' ? <Zap className="w-3 h-3" /> : id === 'tires' ? <Shield className="w-3 h-3" /> : <Gauge className="w-3 h-3" />}
                        {id.toUpperCase()}
                      </label>
                      <span className="text-[9px] font-mono text-zinc-600">LVL {carConfig[id]}/{PERFORMANCE_PARTS[id].length}</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      {PERFORMANCE_PARTS[id].map((p: any) => (
                        <div 
                          key={p.level}
                          className={`flex-1 rounded-full transition-all ${carConfig[id] >= p.level ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-white/5'}`}
                        />
                      ))}
                    </div>
                    <button
                      disabled={carConfig[id] >= PERFORMANCE_PARTS[id].length}
                      onClick={() => upgradePart(id)}
                      className={`w-full py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${carConfig[id] >= PERFORMANCE_PARTS[id].length ? 'border-white/5 text-zinc-700 cursor-not-allowed' : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500 hover:text-black'}`}
                    >
                      {carConfig[id] >= PERFORMANCE_PARTS[id].length ? 'Max Level' : `Upgrade - $${(PERFORMANCE_PARTS[id] as any)[carConfig[id]]?.price || 0}`}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Preview Area */}
        <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black overflow-hidden">
          {/* Grid Floor */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) translateY(200px)' }} />
          
          {/* Stats Overlay */}
          <div className="absolute bottom-12 right-12 space-y-6 text-right">
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Top Speed</div>
              <div className="text-6xl font-black italic text-white tracking-tighter">
                {CAR_MODELS[carConfig.model].stats.speed + (carConfig.engine * 2)}
                <span className="text-xl text-zinc-600 ml-2 not-italic">PTS</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Acceleration</div>
              <div className="text-4xl font-black italic text-cyan-400 tracking-tighter">
                {CAR_MODELS[carConfig.model].stats.accel + (carConfig.turbo * 0.5)}
                <span className="text-sm text-zinc-600 ml-2 not-italic">PTS</span>
              </div>
            </div>
          </div>

          {/* Underglow Preview */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 blur-[80px] opacity-40 transition-all duration-500"
            style={{ backgroundColor: carConfig.color }}
          />

          {/* Instruction */}
          <div className="absolute top-12 left-12 max-w-xs space-y-2">
            <div className="text-xs font-black text-white/40 uppercase tracking-widest">Configuration Preview</div>
            <p className="text-[10px] text-zinc-600 uppercase leading-relaxed tracking-wider">
              Real-time rendering of your selected vehicle configuration. All performance upgrades are applied immediately to the race engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
