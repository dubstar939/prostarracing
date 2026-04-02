import React from 'react';
import { Track } from '../data/tracks';
import { MapPin, Timer, TrendingUp, Info } from 'lucide-react';

interface TrackViewerProps {
  track: Track;
}

export function TrackViewer({ track }: TrackViewerProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-8 border-b border-zinc-800 relative">
        <div 
          className="absolute top-0 left-0 w-full h-1 opacity-50"
          style={{ backgroundColor: track.themeColor, boxShadow: `0 0 20px ${track.themeColor}` }}
        />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em] mb-2">
              Blueprint ID: {track.id.toUpperCase()}
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
              {track.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
            <TrendingUp size={14} className="text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              {track.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-800">
        <div className="p-6 border-r border-zinc-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <MapPin size={20} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Distance</div>
            <div className="text-lg font-bold text-white">{track.length}</div>
          </div>
        </div>
        <div className="p-6 border-r border-zinc-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Timer size={20} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Est. Time</div>
            <div className="text-lg font-bold text-white">02:45.00</div>
          </div>
        </div>
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Info size={20} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Atmosphere</div>
            <div className="text-lg font-bold text-white">{track.description}</div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="p-8">
        <div className="aspect-video bg-black rounded-xl border border-zinc-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-zinc-700 font-black text-6xl uppercase italic tracking-tighter opacity-20 select-none">
              939PRO VISUALIZER
            </div>
          </div>
          
          {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: `radial-gradient(${track.themeColor} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
          
          {/* Bottom Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
            <div className="text-[10px] font-mono text-zinc-500 bg-black/80 px-2 py-1 rounded border border-zinc-800">
              SYSTEM STATUS: CALIBRATED // RENDER_MODE: WIREFRAME_OVERLAY
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-full h-full animate-pulse" style={{ backgroundColor: track.themeColor, animationDelay: `${i * 100}ms` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
