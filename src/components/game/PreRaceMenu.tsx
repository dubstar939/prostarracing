import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Map, Cloud, Sun, CloudRain, CloudFog, ChevronRight } from 'lucide-react';
import { BiomeType, RaceMode } from '../../types';
import { BIOMES } from '../../constants/assets';

interface PreRaceMenuProps {
  mode: RaceMode;
  setMode: (mode: RaceMode) => void;
  biome: BiomeType;
  setBiome: (biome: BiomeType) => void;
  weather: 'clear' | 'rain' | 'fog';
  setWeather: (weather: 'clear' | 'rain' | 'fog') => void;
  onStart: () => void;
}

export const PreRaceMenu: React.FC<PreRaceMenuProps> = ({
  mode,
  setMode,
  biome,
  setBiome,
  weather,
  setWeather,
  onStart
}) => {
  return (
    <div className="absolute inset-0 bg-zinc-950 flex flex-col z-[70] p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Race Setup
          </h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-sm">Configure your session parameters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Mode Selection */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Race Mode
            </label>
            <div className="space-y-3">
              {[
                { id: 'circuit', name: 'Grand Prix', desc: '3 Laps of pure speed and precision.' },
                { id: 'time-attack', name: 'Time Attack', desc: 'Beat the clock on an infinite loop.' },
                { id: 'tokyo-expressway', name: 'Tokyo Expressway', desc: 'SP Battle & Police Chases in the city.' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as RaceMode)}
                  className={`w-full p-6 text-left border transition-all group ${mode === m.id ? 'bg-white border-white text-black shadow-2xl scale-105' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20'}`}
                >
                  <div className="font-black italic text-2xl uppercase tracking-tighter mb-1">{m.name}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest opacity-60">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Environment Selection */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
              <Map className="w-4 h-4" /> Environment
            </label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(BIOMES).map(([key, b]) => (
                <button
                  key={key}
                  onClick={() => setBiome(b.id as BiomeType)}
                  className={`w-full p-6 text-left border transition-all flex items-center justify-between group ${biome === b.id ? 'bg-white border-white text-black shadow-2xl scale-105' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20'}`}
                >
                  <div className="space-y-1">
                    <div className="font-black italic text-2xl uppercase tracking-tighter">{b.name}</div>
                    <div className="flex gap-1">
                      {b.palette.env.map((c, i) => (
                        <div key={i} className="w-3 h-1" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={`w-6 h-6 transition-transform ${biome === b.id ? 'translate-x-2' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Weather Selection */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Weather Conditions
            </label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'clear', name: 'Clear Sky', icon: Sun, desc: 'Optimal grip and visibility.' },
                { id: 'rain', name: 'Heavy Rain', icon: CloudRain, desc: 'Reduced grip, dynamic reflections.' },
                { id: 'fog', name: 'Dense Fog', icon: CloudFog, desc: 'Extremely low visibility.' }
              ].map(w => (
                <button
                  key={w.id}
                  onClick={() => setWeather(w.id as any)}
                  className={`w-full p-6 text-left border transition-all flex items-center gap-6 group ${weather === w.id ? 'bg-white border-white text-black shadow-2xl scale-105' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20'}`}
                >
                  <w.icon className={`w-10 h-10 ${weather === w.id ? 'text-black' : 'text-zinc-600'}`} />
                  <div className="space-y-1">
                    <div className="font-black italic text-2xl uppercase tracking-tighter">{w.name}</div>
                    <div className="text-[10px] uppercase font-black tracking-widest opacity-60">{w.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-12 border-t border-white/10 flex justify-end">
          <button 
            onClick={onStart}
            className="group relative bg-emerald-500 text-black px-24 h-20 font-black italic text-4xl uppercase tracking-tighter hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(16,185,129,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-45deg]" />
            <span className="relative flex items-center gap-4">
              Initialize Race
              <ChevronRight className="w-10 h-10" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
