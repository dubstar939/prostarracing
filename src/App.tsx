/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { RacingGame, TrackThemeType } from './components/RacingGame';
import { Trophy, Flag, Settings, Play, Info, Loader2, Map, ShoppingBag, ChevronRight, Gauge, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { CarConfig, CAR_MODELS, CarModelType, RaceMode, Inventory } from './types';

function useCoverImage() {
  const [coverImage, setCoverImage] = useState<string | null>(() => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem('coverImage') : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (coverImage) return;

    const generateImage = async () => {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.warn("GEMINI_API_KEY is missing, skipping cover image generation");
          return;
        }
        const ai = new GoogleGenAI({ apiKey });
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

import Garage from './components/Garage';
import Store from './components/Store';

export default function App() {
  const [gameState, setGameState] = useState<'title' | 'menu' | 'playing' | 'gameover' | 'level-complete' | 'options' | 'mode-select' | 'garage' | 'store'>('title');
  const [level, setLevel] = useState(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('racing_level') : null;
      return saved ? parseInt(saved, 10) : 1;
    } catch (e) {
      return 1;
    }
  });
  const [money, setMoney] = useState(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('racing_money') : null;
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  const [carConfig, setCarConfig] = useState<CarConfig>(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('racing_car_config') : null;
      return saved ? JSON.parse(saved) : {
        model: 'speedster',
        color: '#ffffff',
        spoiler: 'small',
        rims: 'silver',
        decal: 'none',
        bodyKit: 'stock',
        engine: 1,
        tires: 1,
        turbo: 1
      };
    } catch (e) {
      return {
        model: 'speedster',
        color: '#ffffff',
        spoiler: 'small',
        rims: 'silver',
        decal: 'none',
        bodyKit: 'stock',
        engine: 1,
        tires: 1,
        turbo: 1
      };
    }
  });
  
  const [inventory, setInventory] = useState<Inventory>(() => {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('racing_inventory') : null;
      return saved ? JSON.parse(saved) : {
        engines: [1],
        tires: [1],
        turbos: [1]
      };
    } catch (e) {
      return {
        engines: [1],
        tires: [1],
        turbos: [1]
      };
    }
  });
  const [lastResult, setLastResult] = useState<{ position: number; time: string; reward: number; score?: number } | null>(null);
  const [raceMode, setRaceMode] = useState<RaceMode>('classic');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('racing_level', level.toString());
    }
  }, [level]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('racing_money', money.toString());
    }
  }, [money]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('racing_car_config', JSON.stringify(carConfig));
    }
  }, [carConfig]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('racing_inventory', JSON.stringify(inventory));
    }
  }, [inventory]);
  const [trackTheme, setTrackTheme] = useState<TrackThemeType>('neon_city');
  const coverImage = useCoverImage();

  const startGame = () => {
    setGameState('playing');
  };

  const handleRaceEnd = (position: number, time: number, score?: number) => {
    const timeStr = position === 99 ? 'BUSTED' : (time / 1000).toFixed(2) + 's';
    let reward = Math.max(0, (10 - position) * 200 + (position === 1 ? 500 : 0));
    
    if (position === 99) {
      reward = 0;
      setLastResult({ position: 99, time: 'BUSTED', reward: 0, score });
      setGameState('gameover');
      return;
    }

    if (raceMode === 'drift' && score) {
      reward += Math.floor(score / 10);
    } else if (raceMode === 'tokyo-expressway') {
      if (position === 1) {
        reward = 2000 + (level * 500); // Big reward for winning head-to-head
      } else {
        reward = 100 + (level * 50); // Consolation prize
      }
    }

    setMoney(prev => prev + reward);
    setLastResult({ position, time: timeStr, reward, score });
    
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

  const resetProgress = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('racing_level');
      localStorage.removeItem('racing_car_config');
      localStorage.removeItem('racing_money');
      localStorage.removeItem('racing_inventory');
    }
    setLevel(1);
    setMoney(0);
    setInventory({ engines: [1], tires: [1], turbos: [1] });
    window.location.reload();
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
            <div className="relative z-10 text-center space-y-8 md:space-y-12 p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="space-y-2 px-4"
              >
                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 uppercase drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] leading-tight">
                  Pro Star-Racing
                </h1>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              </motion.div>

              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-lg sm:text-2xl font-mono font-bold tracking-[0.3em] sm:tracking-[0.5em] text-cyan-400 uppercase"
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
            className="text-center space-y-8 md:space-y-12 max-w-md w-full px-6"
          >
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase">
                Main Menu
              </h1>
              <p className="text-zinc-500 font-mono text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase">Select your destination</p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 w-full">
              <button
                onClick={() => setGameState('mode-select')}
                className="group relative flex items-center justify-center gap-3 bg-white text-black font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-sm hover:bg-zinc-200 transition-all transform hover:skew-x-[-10deg] active:scale-95"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                <span className="uppercase tracking-tight text-lg sm:text-xl">Start Game</span>
                <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/20 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setGameState('garage')}
                  className="group relative flex items-center justify-center gap-3 bg-zinc-900 text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] active:scale-95"
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  <span className="uppercase tracking-tight text-base sm:text-xl">Garage</span>
                  <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/10 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
                </button>

                <button
                  onClick={() => setGameState('store')}
                  className="group relative flex items-center justify-center gap-3 bg-zinc-900 text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  <span className="uppercase tracking-tight text-base sm:text-xl">Store</span>
                  <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/10 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
                </button>
              </div>

              <button
                onClick={() => setGameState('options')}
                className="group relative flex items-center justify-center gap-3 bg-zinc-900 text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] active:scale-95"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                <span className="uppercase tracking-tight text-lg sm:text-xl">Options</span>
                <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/10 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
              </button>

              <button
                onClick={() => setGameState('title')}
                className="group relative flex items-center justify-center gap-3 bg-zinc-900 text-white font-bold py-4 sm:py-6 px-6 sm:px-8 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] active:scale-95"
              >
                <Flag className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                <span className="uppercase tracking-tight text-lg sm:text-xl">Quit</span>
                <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/10 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
              </button>
            </div>

            <div className="flex justify-between items-center px-4 pt-8 border-t border-zinc-800/50">
              <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                v2.5.0-stable
              </div>
              <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                © 2026 939PRO
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'mode-select' && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center space-y-8 max-w-md w-full px-6"
          >
            <div className="space-y-2 text-left">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Select Mode</h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Choose your racing experience</p>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full">
              {[
                { id: 'classic', name: 'Classic Race', desc: 'Standard street race with checkpoints.', icon: Trophy },
                { id: 'time-trial', name: 'Time Trial', desc: 'Beat the target time on an empty track.', icon: Gauge },
                { id: 'elimination', name: 'Elimination', desc: 'Last car is removed every 30 seconds.', icon: Flag },
                { id: 'drift', name: 'Drift King', desc: 'Score points by drifting through corners.', icon: Zap },
                { id: 'tokyo-expressway', name: 'Tokyo Expressway', desc: 'Nocturnal JDM-focused head-to-head highway battle.', icon: Zap },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setRaceMode(mode.id as RaceMode);
                    if (mode.id === 'tokyo-expressway') {
                      setTrackTheme('neon_city'); // Force neon city theme for this mode
                    }
                    startGame();
                  }}
                  className="group relative flex items-center justify-between bg-zinc-900 text-white font-bold py-4 px-6 rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <mode.icon className={`w-5 h-5 ${mode.id === 'drift' ? 'text-purple-400' : mode.id === 'elimination' ? 'text-red-500' : mode.id === 'tokyo-expressway' ? 'text-pink-500' : 'text-cyan-400'}`} />
                    <div className="text-left">
                      <div className="uppercase tracking-tight text-lg">{mode.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{mode.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}

              <button
                onClick={() => setGameState('menu')}
                className="mt-4 text-zinc-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Back to Main Menu
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'options' && (
          <motion.div
            key="options"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-8 max-w-md w-full px-6"
          >
            <div className="space-y-2 text-left">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Options</h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Configure your game settings</p>
            </div>

            <div className="space-y-6 w-full">
              <div className="bg-zinc-900/50 p-6 rounded-sm border border-zinc-800 text-left space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Map className="w-4 h-4" /> Track Theme
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['neon_city', 'coastal_highway', 'desert_canyon', 'cyber_industrial', 'mountain_pass', 'urban_downtown'] as TrackThemeType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTrackTheme(t)}
                      className={`py-3 px-1 rounded-sm border text-[10px] uppercase font-bold transition-all ${
                        trackTheme === t 
                          ? 'bg-cyan-500 border-cyan-400 text-black' 
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 p-6 rounded-sm border border-zinc-800 text-left space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Info className="w-4 h-4" /> Controls Reference
                </h3>
                <ul className="text-[10px] space-y-2 font-mono text-zinc-500">
                  <li><span className="text-zinc-300">DRIVE</span> - WASD / Arrows</li>
                  <li><span className="text-zinc-300">TURBO</span> - CTRL / Shift</li>
                  <li><span className="text-zinc-300">DRIFT</span> - Release Gas + Turn + Brake</li>
                </ul>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-4 bg-red-900/20 text-red-400 border border-red-900/50 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-red-900/40 transition-all"
                >
                  Reset All Progress
                </button>
                
                <button
                  onClick={() => setGameState('menu')}
                  className="w-full py-4 bg-white text-black font-bold rounded-sm hover:bg-zinc-200 transition-colors uppercase tracking-widest text-xs"
                >
                  Save & Back
                </button>
              </div>
            </div>
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
              trackTheme={trackTheme}
              carConfig={carConfig}
              setCarConfig={setCarConfig}
              mode={raceMode}
              onRaceEnd={handleRaceEnd} 
              onBack={() => setGameState('menu')}
            />
          </motion.div>
        )}

        {gameState === 'garage' && (
          <Garage 
            carConfig={carConfig}
            setCarConfig={setCarConfig}
            money={money}
            setMoney={setMoney}
            inventory={inventory}
            onBack={() => setGameState('menu')}
          />
        )}

        {gameState === 'store' && (
          <Store 
            money={money}
            setMoney={setMoney}
            inventory={inventory}
            setInventory={setInventory}
            onBack={() => setGameState('menu')}
          />
        )}

        {gameState === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-5xl font-black italic text-red-500 uppercase tracking-tighter">
                {lastResult?.position === 99 ? 'BUSTED!' : 'Race Failed'}
              </h2>
              <p className="text-zinc-500 font-mono">
                {lastResult?.position === 99 ? 'The police caught you.' : 
                 raceMode === 'drift' ? `Drift Score: ${lastResult?.score}` : 
                 raceMode === 'tokyo-expressway' ? 'You lost the head-to-head battle.' : 
                 `You finished in P${lastResult?.position}`}
              </p>
              {lastResult?.score && lastResult.score > 0 && (
                <p className="text-yellow-400 font-mono">Drift Bonus: +${Math.floor(lastResult.score / 10)}</p>
              )}
              <p className="text-emerald-400 font-mono">Reward: +${lastResult?.reward}</p>
            </div>
            <p className="text-zinc-400 max-w-xs mx-auto">
              {lastResult?.position === 99 ? 'Avoid the police to stay in the race.' :
               raceMode === 'time-trial' ? 'You must beat the target time to advance.' : 
               raceMode === 'tokyo-expressway' ? 'You must drain the rival\'s SP to win.' : 
               'You must finish 1st to advance to the next street.'}
            </p>
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
              <p className="text-zinc-500 font-mono">
                {raceMode === 'drift' ? `Drift Score: ${lastResult?.score}` : raceMode === 'tokyo-expressway' ? 'You defeated the rival!' : `Time: ${lastResult?.time}`}
              </p>
              {lastResult?.score && lastResult.score > 0 && (
                <p className="text-yellow-400 font-mono">Drift Bonus: +${Math.floor(lastResult.score / 10)}</p>
              )}
              <p className="text-emerald-400 font-mono">Reward: +${lastResult?.reward}</p>
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

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 max-w-sm w-full space-y-6 text-center"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">Reset Progress?</h3>
                <p className="text-zinc-400 text-sm font-mono uppercase tracking-tight">
                  This will clear your level, money, and car upgrades. This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={resetProgress}
                  className="bg-red-600 text-white font-bold py-4 rounded-sm hover:bg-red-500 transition-colors uppercase tracking-widest text-xs"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-zinc-800 text-zinc-400 font-bold py-4 rounded-sm hover:bg-zinc-700 transition-colors uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
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
