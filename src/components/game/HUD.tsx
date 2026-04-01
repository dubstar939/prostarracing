import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Pause, Play as PlayIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, Monitor } from 'lucide-react';
import { MiniMap } from './MiniMap';
import { RaceMode } from '../../types';

interface HUDProps {
  hud: {
    speed: number;
    position: number;
    lap: number;
    totalLaps: number;
    time: number;
    checkpointTime: number;
    turbo: number;
    damage: number;
    slipstream: boolean;
    progress: number;
    opponents: number[];
    leaderboard: any[];
    playerSP: number;
    rivalSP: number;
    rivalDistance: number;
    driftScore: number;
    bustTimer: number;
    isBusted: boolean;
  };
  mode: RaceMode;
  isPaused: boolean;
  isMuted: boolean;
  useTilt: boolean;
  aspectRatio: '4:3' | '16:9';
  isMobile: boolean;
  checkpointNotify: boolean;
  togglePause: () => void;
  toggleMute: () => void;
  toggleAspectRatio: () => void;
  setUseTilt: (val: boolean) => void;
  keysRef: React.MutableRefObject<{ [key: string]: boolean }>;
}

export const HUD: React.FC<HUDProps> = ({
  hud,
  mode,
  isPaused,
  isMuted,
  useTilt,
  aspectRatio,
  isMobile,
  checkpointNotify,
  togglePause,
  toggleMute,
  toggleAspectRatio,
  setUseTilt,
  keysRef
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between overflow-hidden font-mono">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50" 
           style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }} />

      {/* Top Section */}
      <div className="flex justify-between items-start z-10">
        {/* Left: Lap, Time, Checkpoint, MiniMap */}
        <div className="space-y-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-crt">
          <div className="flex items-baseline gap-4 bg-black/40 p-3 border-l-2 border-cyan-500 backdrop-blur-sm">
            <div className="space-y-0">
              <div className="text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.2em]">Lap</div>
              <div className="text-5xl font-black italic tracking-tighter text-white">
                {hud.lap}<span className="text-2xl text-zinc-500 not-italic ml-1">/ {hud.totalLaps === 999 ? '∞' : hud.totalLaps}</span>
              </div>
            </div>
            <div className="space-y-0">
              <div className="text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.2em]">Time</div>
              <div className="text-3xl font-black italic tracking-tighter text-white">
                {hud.time.toFixed(2)}
              </div>
            </div>
          </div>

          {mode !== 'tokyo-expressway' && (
            <motion.div 
              animate={hud.checkpointTime < 10 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className={`text-4xl font-black italic drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] ${hud.checkpointTime < 10 ? 'text-red-500' : 'text-yellow-400'}`}
            >
              <span className="text-sm not-italic font-bold mr-2 opacity-80">TIME:</span>
              {Math.ceil(hud.checkpointTime)}s
            </motion.div>
          )}

          <MiniMap 
            progress={hud.progress} 
            opponents={hud.opponents} 
            playerColor="#00ffff"
          />
        </div>

        {/* Center: 939PRO Watermark */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 animate-crt">
          <div className="text-[10px] font-black tracking-[1em] text-cyan-400 uppercase mb-1">939PRO</div>
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="text-[8px] font-bold text-white/40 mt-1 uppercase tracking-widest">Night Edition // Build 0.9.3</div>
        </div>

        {/* Center: Tokyo Expressway SP Meters */}
        {mode === 'tokyo-expressway' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-[500px]">
            <div className="flex justify-between w-full text-[10px] font-black italic uppercase tracking-[0.2em] text-white drop-shadow-md">
              <span className={hud.playerSP < 30 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}>Player SP: {Math.ceil(hud.playerSP)}</span>
              <span className="text-yellow-400">Distance: {Math.abs(Math.floor(hud.rivalDistance))}m</span>
              <span className={hud.rivalSP < 30 ? 'text-red-500 animate-pulse' : 'text-magenta-400'}>Rival SP: {Math.ceil(hud.rivalSP)}</span>
            </div>
            <div className="flex w-full h-4 bg-black/80 border border-white/20 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              {/* Player SP Bar (Left to Right) */}
              <div className="w-1/2 h-full border-r border-white/10 flex justify-end">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-200 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  style={{ width: `${hud.playerSP}%` }}
                />
              </div>
              {/* Rival SP Bar (Left to Right) */}
              <div className="w-1/2 h-full">
                <div 
                  className="h-full bg-red-500 transition-all duration-200 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  style={{ width: `${hud.rivalSP}%` }}
                />
              </div>
            </div>
            <div className="text-[9px] font-black font-mono text-white/60 uppercase tracking-widest mt-1 flex gap-4">
              <span>{hud.rivalDistance > 2000 ? 'Player Ahead - Draining Rival SP' : hud.rivalDistance < -2000 ? 'Rival Ahead - Draining Player SP' : 'Maintain Lead to Drain SP'}</span>
              {hud.bustTimer > 0 && (
                <span className="text-red-500 font-black animate-pulse">POLICE NEARBY! BUSTED IN: {(3 - hud.bustTimer).toFixed(1)}s</span>
              )}
            </div>
          </div>
        )}

        {/* Right: Leaderboard & Controls */}
        <div className="flex flex-col items-end gap-4">
          <div className="flex flex-col items-end gap-1">
            {hud.leaderboard?.map((racer: any, i: number) => (
              <motion.div 
                key={racer.id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 px-4 py-1.5 rounded-sm border skew-x-[-10deg] ${racer.isPlayer ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black/60 text-white border-white/10 backdrop-blur-sm'} transition-all w-40`}
              >
                <span className="font-black italic text-lg">{i + 1}</span>
                <span className="font-black text-[10px] uppercase tracking-widest flex-1 truncate">{racer.name}</span>
                <span className="font-mono text-[9px] opacity-60">L{racer.lap}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              onClick={() => setUseTilt(!useTilt)}
              className={`p-2.5 border rounded-sm transition-all flex items-center gap-2 ${useTilt ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'bg-black/60 border-white/20 text-white/70 hover:bg-white/10 backdrop-blur-sm'}`}
              title="Toggle Tilt Controls"
            >
              <Monitor className={`w-5 h-5 ${useTilt ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{useTilt ? 'Tilt On' : 'Tilt Off'}</span>
            </button>

            <button 
              onClick={toggleAspectRatio}
              className="p-2.5 bg-black/60 border border-white/20 rounded-sm hover:bg-white/10 transition-colors flex items-center gap-2 backdrop-blur-sm"
              title="Toggle Aspect Ratio"
            >
              <Monitor className="w-5 h-5 text-white" />
              <span className="text-[10px] font-black text-white">{aspectRatio}</span>
            </button>

            <button 
              onClick={togglePause}
              className="p-2.5 bg-black/60 border border-white/20 rounded-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              {isPaused ? <PlayIcon className="w-5 h-5 text-white" /> : <Pause className="w-5 h-5 text-white" />}
            </button>

            <button 
              onClick={toggleMute}
              className="p-2.5 bg-black/60 border border-white/20 rounded-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Center Section: Drift Score & Notifications */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {hud.driftScore > 0 && (
            <motion.div
              key="drift"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="text-5xl font-black italic text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] tracking-tighter uppercase">
                Drift Combo
              </div>
              <div className="text-7xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                {Math.floor(hud.driftScore)}
              </div>
            </motion.div>
          )}

          {checkpointNotify && (
            <motion.div
              key="checkpoint"
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="bg-yellow-400 text-black px-12 py-6 rounded-sm font-black italic text-5xl shadow-[0_0_50px_#facc15] transform skew-x-[-15deg] border-4 border-black"
            >
              TIME EXTENDED! +30s
            </motion.div>
          )}

          {hud.checkpointTime <= 0 && mode !== 'tokyo-expressway' && (
            <motion.div 
              key="timeover"
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-600 text-white px-16 py-8 rounded-sm font-black italic text-7xl shadow-[0_0_60px_rgba(220,38,38,0.8)] transform skew-x-[-15deg] border-4 border-white animate-pulse"
            >
              TIME OVER!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section: Speed, Damage, Turbo */}
      <div className="flex justify-between items-end z-10">
        {/* Left: Damage & Turbo */}
        <div className="space-y-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] bg-black/40 p-4 border-l-2 border-magenta-500 backdrop-blur-sm animate-crt">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${hud.damage > 70 ? 'text-red-500 animate-pulse' : 'text-magenta-400/60'}`}>Integrity</span>
              <span className="text-xs font-black text-white">{100 - Math.floor(hud.damage)}%</span>
            </div>
            <div className="w-48 h-2 bg-black/60 border border-white/10 p-[1px]">
              <div 
                className={`h-full transition-all duration-300 ${hud.damage > 70 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : hud.damage > 40 ? 'bg-orange-500' : 'bg-magenta-500 shadow-[0_0_10px_#d946ef]'}`}
                style={{ width: `${100 - hud.damage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${hud.turbo >= 100 ? 'text-yellow-400 animate-pulse' : 'text-cyan-400/60'}`}>
                {hud.turbo >= 100 ? 'Overdrive' : 'Turbo'}
              </span>
              <span className="text-xs font-black text-white">{Math.floor(hud.turbo)}%</span>
            </div>
            <div className="w-64 h-4 bg-black/60 border border-white/20 p-[2px] relative">
              <div 
                className={`h-full transition-all duration-100 ${hud.turbo >= 100 ? 'bg-yellow-400 shadow-[0_0_20px_#facc15]' : 'bg-cyan-500 shadow-[0_0_10px_#06b9d4]'}`} 
                style={{ width: `${hud.turbo}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right: Speed & Position */}
        <div className="text-right space-y-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] bg-black/40 p-4 border-r-2 border-cyan-500 backdrop-blur-sm animate-crt">
          {hud.slipstream && (
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-cyan-400 font-black italic text-3xl tracking-tighter flex items-center justify-end gap-2"
            >
              <Zap className="w-8 h-8 fill-cyan-400" />
              SLIPSTREAM
            </motion.div>
          )}
          
          <div className="flex flex-col items-end">
            <div className="text-9xl font-black italic tracking-tighter text-white leading-none">
              {hud.speed}
              <span className="text-3xl ml-4 not-italic font-black text-cyan-400/60">MPH</span>
            </div>
            
            <div className="flex items-baseline gap-4 mt-2">
              <div className="text-6xl font-black italic tracking-tighter text-cyan-400">
                <span className="text-xl not-italic font-black text-white/40 mr-2 uppercase">Pos</span>
                {hud.position}
                <span className="text-2xl not-italic font-black text-zinc-500 ml-2">/ {hud.leaderboard?.length || 8}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls Overlay */}
      {isMobile && (
        <div className="absolute inset-0 pointer-events-none touch-none">
          {/* Left Side: Steering */}
          <div className="absolute bottom-8 left-8 flex gap-6 pointer-events-auto">
            <button
              onPointerDown={() => keysRef.current['ArrowLeft'] = true}
              onPointerUp={() => keysRef.current['ArrowLeft'] = false}
              onPointerLeave={() => keysRef.current['ArrowLeft'] = false}
              className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center active:bg-white/30 active:scale-95 transition-all shadow-2xl"
            >
              <ChevronLeft className="w-10 h-10 text-white" />
            </button>
            <button
              onPointerDown={() => keysRef.current['ArrowRight'] = true}
              onPointerUp={() => keysRef.current['ArrowRight'] = false}
              onPointerLeave={() => keysRef.current['ArrowRight'] = false}
              className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center active:bg-white/30 active:scale-95 transition-all shadow-2xl"
            >
              <ChevronRight className="w-10 h-10 text-white" />
            </button>
          </div>

          {/* Right Side: Pedals & Turbo */}
          <div className="absolute bottom-8 right-8 flex flex-col items-end gap-6 pointer-events-auto">
            <div className="flex gap-6">
              <button
                onPointerDown={() => keysRef.current['ControlLeft'] = true}
                onPointerUp={() => keysRef.current['ControlLeft'] = false}
                onPointerLeave={() => keysRef.current['ControlLeft'] = false}
                className={`w-20 h-20 backdrop-blur-xl border rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${hud.turbo >= 100 ? 'bg-cyan-500/40 border-cyan-400 animate-pulse' : 'bg-white/10 border-white/20 opacity-50'}`}
              >
                <Zap className="w-10 h-10 text-white" />
              </button>
              <button
                onPointerDown={() => keysRef.current['ArrowDown'] = true}
                onPointerUp={() => keysRef.current['ArrowDown'] = false}
                onPointerLeave={() => keysRef.current['ArrowDown'] = false}
                className="w-20 h-20 bg-red-500/20 backdrop-blur-xl border border-red-500/40 rounded-full flex items-center justify-center active:bg-red-500/40 active:scale-95 transition-all shadow-2xl"
              >
                <ChevronDown className="w-10 h-10 text-white" />
              </button>
            </div>
            <button
              onPointerDown={() => keysRef.current['ArrowUp'] = true}
              onPointerUp={() => keysRef.current['ArrowUp'] = false}
              onPointerLeave={() => keysRef.current['ArrowUp'] = false}
              className="w-44 h-24 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/40 rounded-2xl flex items-center justify-center active:bg-emerald-500/40 active:scale-95 transition-all shadow-2xl"
            >
              <ChevronUp className="w-12 h-12 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
