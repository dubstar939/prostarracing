/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { RacingGame } from './components/RacingGame';
import { Trophy, Flag, Settings, Play, Info, Users, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { socketService } from './services/socketService';
import { GoogleGenAI } from '@google/genai';

function useCoverImage() {
  const [coverImage, setCoverImage] = useState<string | null>(localStorage.getItem('coverImage'));

  useEffect(() => {
    if (coverImage) return;

    const generateImage = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: '1980s arcade racing video game cover art, synthwave aesthetic, outrun style, neon grid floor, glowing sunset, retro sports car driving towards the horizon, vibrant magenta cyan and purple colors, airbrushed retro style, no text',
          config: {
            imageConfig: {
              aspectRatio: "9:16"
            }
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64EncodeString}`;
            setCoverImage(imageUrl);
            try {
              localStorage.setItem('coverImage', imageUrl);
            } catch (e) {
              console.warn("Could not save to localStorage (quota exceeded?)");
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error generating cover image:", error);
      }
    };

    generateImage();
  }, [coverImage]);

  return coverImage;
}

export default function App() {
  const [gameState, setGameState] = useState<'title' | 'menu' | 'playing' | 'gameover' | 'level-complete' | 'lobby'>('title');
  const [level, setLevel] = useState(1);
  const [lastResult, setLastResult] = useState<{ position: number; time: string } | null>(null);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomId, setRoomId] = useState('');
  const coverImage = useCoverImage();

  const startGame = () => {
    setIsMultiplayer(false);
    setGameState('playing');
  };

  const startMultiplayer = () => {
    setGameState('lobby');
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    setIsMultiplayer(true);
    socketService.connect();
    setGameState('playing');
  };

  const handleRaceEnd = (position: number, time: number) => {
    const timeStr = (time / 1000).toFixed(2) + 's';
    setLastResult({ position, time: timeStr });
    if (position === 1) {
      setGameState('level-complete');
    } else {
      setGameState('gameover');
    }
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    setGameState('playing');
  };

  const retryLevel = () => {
    setGameState('playing');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans overflow-x-hidden overflow-y-auto flex flex-col items-center justify-center py-8">
      <AnimatePresence mode="wait">
        {gameState === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGameState('menu')}
            className="fixed inset-0 z-50 cursor-pointer bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Title Image */}
            {coverImage ? (
              <img 
                src={coverImage} 
                alt="Pro Star-Racing Title"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-900 opacity-60">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              </div>
            )}
            
            {/* Overlay Content */}
            <div className="relative z-10 text-center space-y-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="space-y-2 px-4"
              >
                <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 uppercase drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  Pro Star-Racing
                </h1>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              </motion.div>

              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl font-mono font-bold tracking-[0.5em] text-cyan-400 uppercase"
              >
                Press Start
              </motion.div>
            </div>

            {/* Retro Grid Floor Effect */}
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-purple-900/40 to-transparent">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d422_1px,transparent_1px),linear-gradient(to_bottom,#06b6d422_1px,transparent_1px)] bg-[size:60px_60px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom"></div>
            </div>
          </motion.div>
        )}

        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 max-w-md px-6"
          >
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase">
                Pro Star-Racing
              </h1>
              <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">939PRO Arcade Racing</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
              <button
                onClick={startGame}
                className="group relative flex items-center justify-center gap-3 bg-white text-black font-bold py-6 px-8 rounded-sm hover:bg-zinc-200 transition-all transform hover:skew-x-[-10deg] active:scale-95"
              >
                <Play className="w-6 h-6 fill-current" />
                <span className="uppercase tracking-tight text-lg">Start Race</span>
                <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/20 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
              </button>

              <button
                onClick={startMultiplayer}
                className="group relative flex items-center justify-center gap-3 bg-zinc-900 text-white font-bold py-6 px-8 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] active:scale-95"
              >
                <Users className="w-6 h-6" />
                <span className="uppercase tracking-tight text-lg">Multiplayer</span>
                <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/10 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
              </button>

              <div className="bg-zinc-900/50 p-6 rounded-sm border border-zinc-800 text-left space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Info className="w-4 h-4" /> Controls
                </h3>
                <ul className="text-xs space-y-2 font-mono text-zinc-500">
                  <li><span className="text-zinc-300">DRIVE</span> - WASD / Arrows or Touch Buttons</li>
                  <li><span className="text-zinc-300">TURBO</span> - CTRL / Shift or Zap Button</li>
                  <li><span className="text-zinc-300">DRIFT</span> - Release Gas + Turn + Brake</li>
                  <li><span className="text-zinc-300">SLIPSTREAM</span> - Stay behind opponents</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 max-w-md w-full px-6"
          >
            <div className="space-y-2 text-left">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Multiplayer</h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Enter room ID to join or create</p>
            </div>

            <form onSubmit={joinRoom} className="space-y-4">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ROOM_ID"
                  className="w-full bg-zinc-900 border border-zinc-800 py-4 pl-12 pr-4 rounded-sm font-mono text-lg tracking-widest focus:outline-none focus:border-white/40 transition-colors uppercase"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setGameState('menu')}
                  className="bg-zinc-900 text-zinc-400 font-bold py-4 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-colors uppercase"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-white text-black font-bold py-4 rounded-sm hover:bg-zinc-200 transition-colors uppercase"
                >
                  Join Room
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex items-center justify-center p-2 md:p-4"
          >
            <RacingGame 
              level={level} 
              onRaceEnd={handleRaceEnd} 
              onBack={() => setGameState('menu')}
              isMultiplayer={isMultiplayer}
              roomId={roomId}
            />
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-5xl font-black italic text-red-500 uppercase tracking-tighter">Race Failed</h2>
              <p className="text-zinc-500 font-mono">You finished in P{lastResult?.position}</p>
            </div>
            <p className="text-zinc-400 max-w-xs mx-auto">You must finish 1st to advance to the next street.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={retryLevel}
                className="bg-white text-black font-bold py-3 px-10 rounded-sm hover:bg-zinc-200 transition-all transform hover:skew-x-[-10deg] uppercase"
              >
                Retry Race
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="bg-zinc-900 text-zinc-400 font-bold py-3 px-10 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] uppercase"
              >
                Back to Menu
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'level-complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-5xl font-black italic text-emerald-500 uppercase tracking-tighter">Victory</h2>
              <p className="text-zinc-500 font-mono">Time: {lastResult?.time}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={nextLevel}
                className="bg-white text-black font-bold py-3 px-10 rounded-sm hover:bg-zinc-200 transition-all transform hover:skew-x-[-10deg] uppercase"
              >
                Next Street
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="bg-zinc-900 text-zinc-400 font-bold py-3 px-10 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] uppercase"
              >
                Back to Menu
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Grid/Atmosphere */}
      <div className="fixed inset-0 -z-20 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,#0a0a0c_100%)"></div>
      </div>
    </div>
  );
}
