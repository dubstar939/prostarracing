import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { audioManager } from '../services/audioService';
import { Volume2, VolumeX, Pause, Play as PlayIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, Monitor } from 'lucide-react';

import { socketService } from '../services/socketService';

import { CarConfig, RaceMode } from '../types';

export type TrackThemeType = 'city' | 'desert' | 'mountain';

interface RacingGameProps {
  level: number;
  trackTheme: TrackThemeType;
  carConfig: CarConfig;
  setCarConfig: React.Dispatch<React.SetStateAction<CarConfig>>;
  mode: RaceMode;
  onRaceEnd: (position: number, time: number, score?: number) => void;
  onBack: () => void;
  isMultiplayer?: boolean;
  roomId?: string;
}

// Pseudo-3D Road Constants
const ROAD_WIDTH = 2000;
const CAR_WIDTH = 400;
const SEGMENT_LENGTH = 200;
const RUMBLE_LENGTH = 3;
const FIELD_OF_VIEW = 100;
const CAMERA_HEIGHT = 1000;
const CAMERA_DEPTH = 1 / Math.tan((FIELD_OF_VIEW / 2) * Math.PI / 180);
const DRAW_DISTANCE = 300;

interface Segment {
  index: number;
  p1: { world: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number } };
  p2: { world: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number } };
  curve: number;
  sprites: Sprite[];
  color: { road: string; grass: string; rumble: string; lane?: string };
  checkpoint?: boolean;
  passed?: boolean;
}

interface Sprite {
  source: string;
  offset: number;
  scale: number;
}

export const RacingGame: React.FC<RacingGameProps> = ({ level, trackTheme, carConfig, setCarConfig, mode, onRaceEnd, onBack, isMultiplayer, roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLocalReady, setIsLocalReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<{ [key: string]: any }>({});
  const otherPlayersRef = useRef<{ [key: string]: any }>({});
  const [weather, setWeather] = useState<'clear' | 'rain' | 'fog'>('clear');

  const [hud, setHud] = useState({
    speed: 0,
    position: 8,
    lap: 1,
    totalLaps: 2,
    time: 0,
    checkpointTime: 40,
    turbo: 100,
    damage: 0,
    slipstream: false,
    progress: 0,
    opponents: [] as number[],
    leaderboard: [] as any[]
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '16:9'>('4:3');
  const isPausedRef = useRef(false);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const tiltRef = useRef<number>(0);
  const [useTilt, setUseTilt] = useState(false);
  const cityscapeRef = useRef<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [checkpointNotify, setCheckpointNotify] = useState(false);

  const SCREEN_WIDTH = aspectRatio === '4:3' ? 800 : 1066;
  const SCREEN_HEIGHT = 600;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMultiplayer && roomId) {
      socketService.onRoomUpdate((players) => {
        const others = { ...players };
        delete others[socketService.id!];
        setOtherPlayers(others);
        otherPlayersRef.current = others;
      });

      socketService.onPlayerMoved((player) => {
        if (player.id !== socketService.id) {
          otherPlayersRef.current[player.id] = player;
          setOtherPlayers({ ...otherPlayersRef.current });
        }
      });

      socketService.onStartCountdown(() => {
        let count = 3;
        setCountdown(count);
        const timer = setInterval(() => {
          count--;
          if (count === 0) {
            clearInterval(timer);
            setCountdown(null);
            setIsReady(true);
          } else {
            setCountdown(count);
          }
        }, 1000);
      });

      socketService.joinRoom(roomId, { carConfig });
    }
  }, [isMultiplayer, roomId, carConfig]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!isReady) {
      // Showroom view
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      
      // Draw a simple floor
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(SCREEN_WIDTH / 2, SCREEN_HEIGHT - 100, 300, 100, 0, 0, Math.PI * 2);
      ctx.fill();

      drawPlayerCar(ctx, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 150, 300, 180, carConfig, false, 0, 0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Track state
    let segments: Segment[] = [];
    let trackLength = 0;
    let playerX = 0;
    let position = 0;
    let speed = 0;
    let damage = 0;
    let playerZ = CAMERA_HEIGHT * CAMERA_DEPTH;
    let lap = 1;
    let driftAngle = 0;
    const totalLaps = 2;
    
    const maxSpeed = 15000 + (carConfig.engine - 1) * 2000;
    const accel = maxSpeed / 4; // Faster acceleration
    const breaking = -maxSpeed * 2.5; // Stronger braking
    const decel = -maxSpeed / 4;
    const offRoadDecel = -maxSpeed / 1.5;
    const offRoadLimit = maxSpeed / 3;

    // Opponents
    const generatePlate = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      return chars[Math.floor(Math.random() * chars.length)] + 
             chars[Math.floor(Math.random() * chars.length)] + 
             chars[Math.floor(Math.random() * chars.length)] + 
             '-' + 
             nums[Math.floor(Math.random() * nums.length)] + 
             nums[Math.floor(Math.random() * nums.length)] + 
             nums[Math.floor(Math.random() * nums.length)];
    };

    let opponents = Array.from({ length: 7 }, (_, i) => ({
      name: `CPU ${i + 1}`,
      offset: (i % 2 === 0 ? 0.5 : -0.5) + (Math.random() - 0.5) * 0.2,
      z: 2000 + i * 3000,
      speed: 8000 + Math.random() * 2000,
      percent: 0,
      lap: 1,
      color: ['#ef4444', '#3b82f6', '#facc15', '#a855f7', '#ec4899', '#f97316', '#06b6d4', '#8b5cf6'][Math.floor(Math.random() * 8)],
      plate: generatePlate()
    }));

    // Input
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        togglePause();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.code] = false;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!useTilt) return;
      // gamma is the left-to-right tilt in degrees, where right is positive
      let tilt = e.gamma || 0;
      // Clamp tilt to -30 to 30 degrees and normalize to -1 to 1
      tilt = Math.max(-30, Math.min(30, tilt)) / 30;
      tiltRef.current = tilt;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('deviceorientation', handleOrientation);

    // Track Generation
    const addSegment = (curve: number, y: number) => {
      const n = segments.length;
      segments.push({
        index: n,
        p1: { world: { x: 0, y: lastY(), z: n * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
        p2: { world: { x: 0, y: y, z: (n + 1) * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
        curve: curve,
        sprites: [],
        color: Math.floor(n / RUMBLE_LENGTH) % 2 ? 
          { road: '#333', grass: '#10b981', rumble: '#fff', lane: '#fff' } : 
          { road: '#3a3a3a', grass: '#059669', rumble: '#000' }
      });
    };

    const lastY = () => (segments.length > 0 ? segments[segments.length - 1].p2.world.y : 0);

    const addRoad = (enter: number, hold: number, leave: number, curve: number, y: number) => {
      const startY = lastY();
      const endY = startY + (y * SEGMENT_LENGTH);
      const total = enter + hold + leave;
      for (let n = 0; n < enter; n++) addSegment(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total));
      for (let n = 0; n < hold; n++) addSegment(curve, easeInOut(startY, endY, (enter + n) / total));
      for (let n = 0; n < leave; n++) addSegment(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total));
    };

    const easeIn = (a: number, b: number, percent: number) => a + (b - a) * Math.pow(percent, 2);
    const easeInOut = (a: number, b: number, percent: number) => a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);

    const resetTrack = () => {
      segments = [];
      cityscapeRef.current = [];
      
      // Simple seeded random for consistent tracks per level
      let seed = level * 12345;
      const random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      const addStraight = (length: number) => addRoad(length, length, length, 0, 0);
      const addCurve = (enter: number, hold: number, leave: number, curve: number, hill: number) => addRoad(enter, hold, leave, curve, hill);
      const addHill = (enter: number, hold: number, leave: number, hill: number) => addRoad(enter, hold, leave, 0, hill);
      const addBumps = () => {
        const numBumps = 4 + Math.floor(random() * 6);
        for (let i = 0; i < numBumps; i++) {
          addRoad(10, 10, 10, 0, 5);
          addRoad(10, 10, 10, 0, -5);
        }
      };
      const addSCurves = () => {
        const dir = random() > 0.5 ? 1 : -1;
        const severity = 1 + level * 0.3;
        addRoad(40, 40, 40, -2 * dir * severity, 15);
        addRoad(40, 40, 40, 3 * dir * severity, -30);
        addRoad(40, 40, 40, -4 * dir * severity, 15);
        addRoad(40, 40, 40, 2 * dir * severity, 0);
      };

      // Starting straight
      addStraight(100);

      // Procedural sections
      const numSections = 12 + Math.min(30, level * 3);
      for (let i = 0; i < numSections; i++) {
        const sectionType = random();
        
        if (sectionType < 0.15) {
          // Long Straight
          addStraight(40 + Math.floor(random() * 80));
        } else if (sectionType < 0.3) {
          // Hill/Dip
          const hill = (random() - 0.5) * (40 + level * 15);
          addHill(40, 60, 40, hill);
        } else if (sectionType < 0.4) {
          // Bumps
          addBumps();
        } else if (sectionType < 0.55) {
          // S-Curves
          addSCurves();
        } else {
          // Standard Curve
          const curve = (random() - 0.5) * (3 + level * 0.8);
          const hill = (random() - 0.5) * (30 + level * 10);
          const length = 20 + Math.floor(random() * 60);
          addCurve(length, length, length, curve, hill);
        }
      }

      // Ending straight
      addStraight(100);

      // Add Checkpoints
      const checkpointInterval = Math.floor(segments.length / 4);
      for (let n = checkpointInterval; n < segments.length; n += checkpointInterval) {
        segments[n].checkpoint = true;
      }

      // Add scenery (trees/props)
      for (let n = 0; n < segments.length; n += 6) {
        if (random() > 0.4) {
          const side = random() > 0.5 ? 1 : -1;
          const offset = (1.5 + random() * 3) * side;
          segments[n].sprites.push({ 
            source: 'tree', 
            offset: offset, 
            scale: 1.5 + random() * 2 
          });
        }
      }

      trackLength = segments.length * SEGMENT_LENGTH;
    };

    resetTrack();

    // Projection
    const project = (p: { world: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number } }, cameraX: number, cameraY: number, cameraZ: number) => {
      const worldX = p.world.x - cameraX;
      const worldY = p.world.y - cameraY;
      const worldZ = p.world.z - cameraZ;
      const scale = CAMERA_DEPTH / worldZ;
      p.screen.x = Math.round((SCREEN_WIDTH / 2) + (scale * worldX * SCREEN_WIDTH / 2));
      p.screen.y = Math.round((SCREEN_HEIGHT / 2) - (scale * worldY * SCREEN_HEIGHT / 2));
      p.screen.w = Math.round(scale * ROAD_WIDTH * SCREEN_WIDTH / 2);
    };

    const findSegment = (z: number) => segments[Math.floor(z / SEGMENT_LENGTH) % segments.length];

    // Main Loop
    let lastTime = Date.now();
    let animationFrameId: number;
    let startTime = Date.now();
    let finished = false;

    let turboMeter = 0;
    let turboActive = false;
    let turboDuration = 0;
    const TURBO_BOOST_ACCEL = 15000 + (carConfig.turbo - 1) * 2000;
    const TURBO_MAX_SPEED = 18000 + (carConfig.engine - 1) * 1000;
    const TURBO_CHARGE_RATE = 25 + (carConfig.turbo - 1) * 10; // Percent per second
    const TURBO_BOOST_DURATION = 3 + (carConfig.turbo - 1) * 0.5; // Seconds
    let checkpointTime = 40;

    // Weather State
    let rainParticles: { x: number; y: number; speed: number; length: number }[] = [];
    if (weather === 'rain') {
      rainParticles = Array.from({ length: 150 }, () => ({
        x: Math.random() * SCREEN_WIDTH,
        y: Math.random() * SCREEN_HEIGHT,
        speed: 15 + Math.random() * 20,
        length: 10 + Math.random() * 20
      }));
    }

    // Smoke State
    let smokeParticles: { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }[] = [];
    
    // Slipstream State
    let slipstreamParticles: { x: number; z: number; life: number; opacity: number }[] = [];
    let isSlipstreaming = false;

    const update = (dt: number) => {
      if (finished) {
        audioManager.stopMusic();
        return;
      }

      if (isPausedRef.current) {
        audioManager.update(0, false, false);
        return;
      }

      // Checkpoint Timer Update
      checkpointTime -= dt;
      if (checkpointTime <= 0) {
        checkpointTime = 0;
        // Penalties for running out of time
        speed = Math.max(0, speed - 5000 * dt);
        damage = Math.min(100, damage + 5 * dt);
      }

      // Weather Updates
      if (weather === 'rain') {
        rainParticles.forEach(p => {
          p.y += p.speed;
          p.x += (speed / maxSpeed) * 5; // Wind effect based on speed
          if (p.y > SCREEN_HEIGHT) {
            p.y = -20;
            p.x = Math.random() * SCREEN_WIDTH;
          }
        });
      }

      const playerSegment = findSegment(position + playerZ);
      const speedPercent = speed / maxSpeed;

      // Checkpoint Passing Detection
      if (playerSegment.checkpoint && !playerSegment.passed) {
        playerSegment.passed = true;
        checkpointTime = Math.min(99, checkpointTime + 30);
        audioManager.playTurbo(); // Reuse sound for feedback
        setCheckpointNotify(true);
        setTimeout(() => setCheckpointNotify(false), 2000);
      }

      // Smoke Updates
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        p.size += dt * 30;
        if (p.life <= 0) smokeParticles.splice(i, 1);
      }

      // Slipstream Updates
      for (let i = slipstreamParticles.length - 1; i >= 0; i--) {
        const p = slipstreamParticles[i];
        p.life -= dt;
        p.opacity = p.life * 0.5;
        if (p.life <= 0) slipstreamParticles.splice(i, 1);
      }

      // Trigger Smoke & Drift Mechanic
      const isBraking = keysRef.current['ArrowDown'] || keysRef.current['KeyS'];
      const isSteering = keysRef.current['ArrowLeft'] || keysRef.current['KeyA'] || keysRef.current['ArrowRight'] || keysRef.current['KeyD'];
      const isDrifting = isBraking && isSteering && speed > maxSpeed * 0.2;

      // Visual Drift Angle
      const targetDriftAngle = isDrifting ? (keysRef.current['ArrowLeft'] || keysRef.current['KeyA'] ? -0.4 : 0.4) : 0;
      driftAngle = driftAngle + (targetDriftAngle - driftAngle) * 0.1;

      // Haptic Feedback
      if (isDrifting && Math.random() > 0.85) {
        navigator.vibrate?.(15);
      }

      // Audio Update
      audioManager.update(speedPercent, isDrifting, isBraking);

      if ((isBraking && speed > 1000) || isDrifting) {
        const smokeCount = isDrifting ? 4 : 2;
        const smokeColor = damage > 70 ? 'rgba(80, 80, 80, 0.4)' : damage > 40 ? 'rgba(150, 150, 150, 0.4)' : 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < smokeCount; i++) {
          smokeParticles.push({
            x: SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 140 + (isDrifting ? driftAngle * 100 : 0),
            y: SCREEN_HEIGHT - 50 + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 4 + (isDrifting ? -playerSegment.curve * 5 : 0),
            vy: -Math.random() * 2 - 1,
            life: 0.4 + Math.random() * 0.6,
            size: 15 + Math.random() * 15,
            color: smokeColor
          });
        }
      }

      // Turbo Logic
      const shiftKey = keysRef.current['ShiftLeft'] || keysRef.current['ShiftRight'];
      const ctrlKey = keysRef.current['ControlLeft'] || keysRef.current['ControlRight'];

      if (turboActive) {
        turboDuration -= dt;
        turboMeter = (turboDuration / TURBO_BOOST_DURATION) * 100;
        speed += TURBO_BOOST_ACCEL * dt;
        if (turboDuration <= 0) {
          turboActive = false;
          turboMeter = 0;
        }
      } else {
        if (shiftKey || isDrifting) {
          const chargeMultiplier = isDrifting ? 2.5 : 1.0;
          turboMeter = Math.min(100, turboMeter + TURBO_CHARGE_RATE * chargeMultiplier * dt);
        }
        if (ctrlKey && turboMeter >= 100) {
          turboActive = true;
          turboDuration = TURBO_BOOST_DURATION;
          audioManager.playTurbo();
        }
      }

      const oldPosition = position;
      position = (position + dt * speed);
      
      if (position >= trackLength) {
        position -= trackLength;
        lap++;
        if (lap > totalLaps) {
          finished = true;
          const pos = opponents.filter(o => o.z > position).length + 1;
          onRaceEnd(pos, Date.now() - startTime);
          return;
        }
      }

      // Controls
      const grip = (weather === 'rain' ? 0.65 : 1.0) + (carConfig.tires - 1) * 0.12;
      const slipstreamBoost = isSlipstreaming ? 1.25 : 1.0;
      const driftFactor = isDrifting ? 3.2 : 1.0;
      const driftSlowdown = isDrifting ? 0.985 : 1.0;

      // Handling response: more sensitive at low speeds, stable at high speeds
      const handlingResponse = 4.5 * (1 - (speedPercent * 0.3));

      if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) speed += accel * dt * grip * slipstreamBoost;
      else if (isBraking) speed += breaking * dt;
      else speed += decel * dt;

      speed *= driftSlowdown;

      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) playerX -= dt * handlingResponse * driftFactor * speedPercent * grip;
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) playerX += dt * handlingResponse * driftFactor * speedPercent * grip;
      
      if (useTilt && Math.abs(tiltRef.current) > 0.1) {
        playerX += dt * handlingResponse * driftFactor * speedPercent * grip * tiltRef.current * 2.5;
      }

      // Off-road penalty
      if ((playerX < -1) || (playerX > 1)) {
        if (speed > offRoadLimit) speed += offRoadDecel * dt;
        // Off-road damage
        if (speed > offRoadLimit * 2) {
          damage = Math.min(100, damage + dt * 5);
        }
      }

      playerX = Math.max(-2, Math.min(2, playerX));
      
      // Speed limits
      const damageFactor = 1 - (damage / 100) * 0.5; // Max 50% speed reduction
      const currentMax = (turboActive ? TURBO_MAX_SPEED : maxSpeed) * damageFactor;
      speed = Math.max(0, Math.min(currentMax, speed));

      // Curve centrifugal force
      playerX -= (dt * speedPercent * playerSegment.curve * 1.5);

      // Update Opponents (Reactive AI)
      isSlipstreaming = false;

      const checkSlipstream = (otherZ: number, otherX: number) => {
        let zDiff = otherZ - position;
        if (zDiff < -trackLength / 2) zDiff += trackLength;
        if (zDiff > trackLength / 2) zDiff -= trackLength;

        if (zDiff > 500 && zDiff < 4000 && Math.abs(otherX - playerX) < 0.35) {
          isSlipstreaming = true;
          // Add slipstream particles
          if (Math.random() > 0.4) {
            slipstreamParticles.push({
              x: otherX + (Math.random() - 0.5) * 0.2,
              z: otherZ - 100 - Math.random() * 500,
              life: 0.6,
              opacity: 0.6
            });
          }
        }
      };

      opponents.forEach(opp => {
        const oppSegment = findSegment(opp.z);
        const oppSpeedPercent = opp.speed / maxSpeed;

        // 1. Follow the curve (centrifugal force simulation for AI)
        opp.offset -= (dt * oppSpeedPercent * oppSegment.curve * 0.8);

        // 2. Player Awareness & Overtaking
        // Calculate distance to player in Z space, accounting for track looping
        let zDiff = opp.z - position;
        if (zDiff < -trackLength / 2) zDiff += trackLength;
        if (zDiff > trackLength / 2) zDiff -= trackLength;

        // Slipstream Detection
        checkSlipstream(opp.z, opp.offset);

        // Collision Detection
        if (Math.abs(zDiff) < 400 && Math.abs(opp.offset - playerX) < 0.3) {
          // Collision!
          const impact = Math.abs(speed - opp.speed) / 1000;
          damage = Math.min(100, damage + impact + 2);
          audioManager.playCollision(impact / 10);
          
          // Bounce
          if (speed > opp.speed) speed *= 0.8;
          else opp.speed *= 0.8;
          
          playerX += (playerX > opp.offset ? 0.2 : -0.2);
        }

        // If player is close (within 2500 units)
        if (Math.abs(zDiff) < 2500) {
          if (zDiff > 0) { 
            // AI is ahead of player: Blocking logic
            // If player is close laterally, move slightly to block their path
            if (Math.abs(opp.offset - playerX) < 0.6) {
              const blockStrength = 0.8;
              opp.offset += (playerX - opp.offset) * blockStrength * dt;
            }
          } else { 
            // AI is behind player: Overtake logic
            // If in the same lane, move to the side to pass
            if (Math.abs(opp.offset - playerX) < 0.4) {
              const overtakeDir = opp.offset > 0 ? -1.5 : 1.5;
              opp.offset += overtakeDir * dt;
            }
          }
        }

        // 3. Lane Keeping & Natural Wandering
        // Keep them within road bounds
        if (opp.offset > 0.9) opp.offset -= dt * 3;
        else if (opp.offset < -0.9) opp.offset += dt * 3;
        
        // Add a tiny bit of natural "human" wandering
        opp.offset += Math.sin(Date.now() / 500 + opp.z) * 0.02 * dt;

        // 4. Update Z position
        opp.z = (opp.z + dt * opp.speed);
        if (opp.z >= trackLength) {
          opp.z -= trackLength;
          opp.lap++;
        }
      });

      // Calculate Leaderboard
      const allRacers = [
        { name: 'You', distance: (lap - 1) * trackLength + position, lap: lap, isPlayer: true, id: 'local' },
        ...opponents.map(o => ({ name: o.name, distance: (o.lap - 1) * trackLength + o.z, lap: o.lap, isPlayer: false, id: o.name })),
        ...Object.values(otherPlayersRef.current).map((p: any) => ({ 
          name: p.id.substring(0, 4), 
          distance: (p.lap - 1) * trackLength + p.z, 
          lap: p.lap,
          isPlayer: false, 
          id: p.id 
        }))
      ];
      
      allRacers.sort((a, b) => b.distance - a.distance);
      const playerRank = allRacers.findIndex(r => r.isPlayer) + 1;

      // Check slipstream for other players too
      Object.values(otherPlayersRef.current).forEach((p: any) => {
        checkSlipstream(p.z, p.x);
      });

      setHud(prev => ({
        ...prev,
        speed: Math.floor(speed / 100),
        time: (Date.now() - startTime) / 1000,
        lap: Math.min(totalLaps, lap),
        position: playerRank,
        leaderboard: allRacers.slice(0, 5),
        turbo: turboMeter,
        damage: damage,
        slipstream: isSlipstreaming,
        checkpointTime: checkpointTime,
        progress: position / trackLength,
        opponents: [
          ...opponents.map(o => o.z / trackLength),
          ...Object.values(otherPlayersRef.current).map((p: any) => (p.z || 0) / trackLength)
        ]
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

      // Sky (Gradient)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT / 2);
    if (weather === 'fog') {
      skyGrad.addColorStop(0, '#1e293b');
      skyGrad.addColorStop(1, '#475569');
    } else if (weather === 'rain') {
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(1, '#1e293b');
    } else {
      skyGrad.addColorStop(0, '#0c4a6e'); // Deep midnight blue
      skyGrad.addColorStop(0.5, '#0369a1'); // Ocean blue
      skyGrad.addColorStop(1, '#38bdf8'); // Sky blue
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

    // Sun / Horizon Glow (More atmospheric)
    if (weather === 'clear') {
      const sunGrad = ctx.createRadialGradient(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 300);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      sunGrad.addColorStop(0.2, 'rgba(255, 255, 150, 0.1)');
      sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
    }

    // Mountains (More realistic silhouettes)
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.moveTo(0, SCREEN_HEIGHT / 2);
    ctx.lineTo(100, 150);
    ctx.lineTo(200, 250);
    ctx.lineTo(350, 100);
    ctx.lineTo(500, 280);
    ctx.lineTo(650, 120);
    ctx.lineTo(800, 300);
    ctx.lineTo(1066, SCREEN_HEIGHT / 2);
    ctx.fill();

    // Cityscape (More detailed buildings)
    if (cityscapeRef.current.length === 0) {
      for (let i = 0; i < 20; i++) {
        cityscapeRef.current.push({ 
          x: i * 60, 
          h: 40 + Math.random() * 180, 
          w: 30 + Math.random() * 40,
          windows: Array.from({ length: 10 }, () => Math.random() > 0.7)
        });
      }
    }
    
    cityscapeRef.current.forEach(b => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(b.x, SCREEN_HEIGHT / 2 - b.h, b.w, b.h);
      // Windows
      ctx.fillStyle = '#fef08a';
      b.windows.forEach((on, i) => {
        if (on) {
          const wx = b.x + (i % 2) * (b.w / 2) + 5;
          const wy = SCREEN_HEIGHT / 2 - b.h + Math.floor(i / 2) * 20 + 5;
          if (wy < SCREEN_HEIGHT / 2 - 10) {
            ctx.fillRect(wx, wy, 4, 4);
          }
        }
      });
    });

      // Mountain Shading
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(150, 120);
      ctx.lineTo(300, 300);
      ctx.lineTo(150, 300);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(450, 80);
      ctx.lineTo(600, 250);
      ctx.lineTo(450, 250);
      ctx.fill();

      // Snow Peaks
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(150, 120);
      ctx.lineTo(120, 160);
      ctx.lineTo(180, 160);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(450, 80);
      ctx.lineTo(420, 120);
      ctx.lineTo(480, 120);
      ctx.fill();

      const baseSegment = findSegment(position);
      const basePercent = (position % SEGMENT_LENGTH) / SEGMENT_LENGTH;
      const playerPercent = ((position + playerZ) % SEGMENT_LENGTH) / SEGMENT_LENGTH;
      const playerY = easeInOut(baseSegment.p1.world.y, baseSegment.p2.world.y, playerPercent);

      let x = 0;
      let dx = -(baseSegment.curve * basePercent);

      // Render Road
      for (let n = 0; n < DRAW_DISTANCE; n++) {
        const segment = segments[(baseSegment.index + n) % segments.length];
        const looped = segment.index < baseSegment.index;
        project(segment.p1, playerX * ROAD_WIDTH - x, playerY + CAMERA_HEIGHT, position - (looped ? trackLength : 0));
        project(segment.p2, playerX * ROAD_WIDTH - x - dx, playerY + CAMERA_HEIGHT, position - (looped ? trackLength : 0));

        x += dx;
        dx += segment.curve;

        if (segment.p1.screen.y <= segment.p2.screen.y || segment.p2.screen.y >= SCREEN_HEIGHT) continue;

        // Draw Grass (with gradient)
        const grassGrad = ctx.createLinearGradient(0, segment.p2.screen.y, 0, segment.p1.screen.y);
        let grassColor = segment.color.grass;
        if (weather === 'fog') grassColor = shadeColor(grassColor, -40);
        if (weather === 'rain') grassColor = shadeColor(grassColor, -20);
        
        grassGrad.addColorStop(0, grassColor);
        grassGrad.addColorStop(1, shadeColor(grassColor, -20));
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, segment.p2.screen.y, SCREEN_WIDTH, segment.p1.screen.y - segment.p2.screen.y);

        // Draw Road (with texture)
        let roadColor = segment.color.road;
        if (weather === 'rain') roadColor = shadeColor(roadColor, -50); // Wet road
        drawPolygon(ctx, segment.p1.screen.x, segment.p1.screen.y, segment.p1.screen.w, segment.p2.screen.x, segment.p2.screen.y, segment.p2.screen.w, roadColor, true);

        // Specular highlight on road
        if (n < 50) {
          const highlightAlpha = weather === 'rain' ? '0.15' : '0.05';
          ctx.fillStyle = `rgba(255, 255, 255, ${highlightAlpha})`;
          ctx.beginPath();
          ctx.moveTo(segment.p1.screen.x - segment.p1.screen.w * 0.5, segment.p1.screen.y);
          ctx.lineTo(segment.p2.screen.x - segment.p2.screen.w * 0.5, segment.p2.screen.y);
          ctx.lineTo(segment.p2.screen.x + segment.p2.screen.w * 0.5, segment.p2.screen.y);
          ctx.lineTo(segment.p1.screen.x + segment.p1.screen.w * 0.5, segment.p1.screen.y);
          ctx.fill();
        }

        // Fog Overlay per segment
        if (weather === 'fog') {
          const fogAlpha = Math.min(1, n / (DRAW_DISTANCE * 0.8));
          ctx.fillStyle = `rgba(100, 116, 139, ${fogAlpha})`;
          ctx.fillRect(0, segment.p2.screen.y, SCREEN_WIDTH, segment.p1.screen.y - segment.p2.screen.y + 1);
        }

        // Slipstream Particles Rendering (Wind Trails)
        slipstreamParticles.forEach(p => {
          if (Math.floor(p.z / SEGMENT_LENGTH) % segments.length === segment.index) {
            const pX = segment.p1.screen.x + (segment.p1.screen.w * p.x);
            const pY = segment.p1.screen.y;
            const pW = segment.p1.screen.w * 0.15;
            
            ctx.strokeStyle = `rgba(147, 197, 253, ${p.opacity})`; // Light blue wind
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pX - pW, pY);
            ctx.lineTo(pX + pW, pY);
            ctx.stroke();
            
            // Vertical streaks for motion
            ctx.beginPath();
            ctx.moveTo(pX, pY);
            ctx.lineTo(pX + (Math.random() - 0.5) * 10, pY - 20);
            ctx.stroke();
          }
        });

        // Rumble
        const r1 = segment.p1.screen.w / 10;
        const r2 = segment.p2.screen.w / 10;
        drawPolygon(ctx, segment.p1.screen.x - segment.p1.screen.w - r1, segment.p1.screen.y, r1, segment.p2.screen.x - segment.p2.screen.w - r2, segment.p2.screen.y, r2, segment.color.rumble);
        drawPolygon(ctx, segment.p1.screen.x + segment.p1.screen.w + r1, segment.p1.screen.y, r1, segment.p2.screen.x + segment.p2.screen.w + r2, segment.p2.screen.y, r2, segment.color.rumble);

        // Lanes
        if (segment.color.lane) {
          const l1 = segment.p1.screen.w / 40;
          const l2 = segment.p2.screen.w / 40;
          drawPolygon(ctx, segment.p1.screen.x, segment.p1.screen.y, l1, segment.p2.screen.x, segment.p2.screen.y, l2, segment.color.lane);
        }
      }

      // Render Sprites (Trees and Opponents)
      for (let n = DRAW_DISTANCE - 1; n > 0; n--) {
        const segment = segments[(baseSegment.index + n) % segments.length];
        
        // Checkpoints
        if (segment.checkpoint) {
          const archX = segment.p1.screen.x;
          const archY = segment.p1.screen.y;
          const archW = segment.p1.screen.w;
          const archH = archW * 0.6;
          drawCheckpoint(ctx, archX, archY, archW, archH, segment.passed || false);
        }

        // Trees
        segment.sprites.forEach(sprite => {
          const spriteX = segment.p1.screen.x + (segment.p1.screen.w * sprite.offset);
          const spriteY = segment.p1.screen.y;
          const spriteW = (sprite.scale * segment.p1.screen.w / 2);
          const spriteH = spriteW * 1.5;
          drawTree(ctx, spriteX, spriteY, spriteW, spriteH);
        });

        // Other Players
        Object.values(otherPlayersRef.current).forEach((player: any) => {
          const playerSegment = findSegment(player.z);
          // Only render if in view
          if (playerSegment.index >= baseSegment.index && playerSegment.index < baseSegment.index + DRAW_DISTANCE) {
            const relativeZ = player.z - position;
            if (relativeZ > 0) {
              const scale = CAMERA_DEPTH / (relativeZ / SEGMENT_LENGTH);
              const screenX = Math.round((SCREEN_WIDTH / 2) + (scale * player.x * SCREEN_WIDTH / 2));
              const screenY = Math.round((SCREEN_HEIGHT / 2) - (scale * (playerSegment.p1.world.y - CAMERA_HEIGHT) * SCREEN_HEIGHT / 2));
              const screenW = Math.round(scale * CAR_WIDTH * SCREEN_WIDTH / 2);
              const screenH = screenW * 0.6;
              
              drawOpponentCar(ctx, screenX, screenY, screenW, screenH, player.carConfig.color, player.id.substring(0, 4));
            }
          }
        });

        // Opponents
        opponents.forEach(opp => {
          if (findSegment(opp.z).index === segment.index) {
            const oppX = segment.p1.screen.x + (segment.p1.screen.w * opp.offset);
            const oppY = segment.p1.screen.y;
            const oppW = (segment.p1.screen.w * (CAR_WIDTH / ROAD_WIDTH));
            const oppH = oppW * 0.6;
            drawOpponentCar(ctx, oppX, oppY, oppW, oppH, opp.color, opp.plate);
          }
        });
      }

      // Render Player Car (Rear View)
      const isBraking = keysRef.current['ArrowDown'] || keysRef.current['KeyS'];

      // Slipstream Screen Effect
      if (isSlipstreaming) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          const lineX = SCREEN_WIDTH / 2 + (side * (200 + Math.random() * 200));
          const lineY = Math.random() * SCREEN_HEIGHT;
          ctx.beginPath();
          ctx.moveTo(lineX, lineY);
          ctx.lineTo(lineX + (Math.random() - 0.5) * 20, lineY + 50 + Math.random() * 100);
          ctx.stroke();
        }
      }

      // Tire Smoke Rendering (Behind car)
      smokeParticles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      drawPlayerCar(ctx, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 60, 180, 110, carConfig, isBraking, damage, driftAngle);

      // Rain Rendering
      if (weather === 'rain') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        rainParticles.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + (speed / maxSpeed) * 2, p.y + p.length);
          ctx.stroke();
        });
      }

      // Vignette Effect
      const vignette = ctx.createRadialGradient(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH / 0.8);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    };

    const loop = () => {
      const now = Date.now();
      const dt = Math.min(1, (now - lastTime) / 1000);
      lastTime = now;
      update(dt);
      draw();

      if (isMultiplayer && roomId) {
        socketService.updateState(roomId, {
          z: position,
          x: playerX,
          speed,
          lap,
          carConfig
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      audioManager.stopMusic();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (isMultiplayer) {
        socketService.disconnect();
      }
    };
  }, [level, onRaceEnd, isReady, carConfig, aspectRatio]);

  const handleStartRace = () => {
    audioManager.init();
    audioManager.startMusic();
    
    if (isMultiplayer && roomId) {
      setIsLocalReady(true);
      socketService.setReady(roomId);
    } else {
      let count = 3;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        if (count === 0) {
          clearInterval(timer);
          setCountdown(null);
          setIsReady(true);
        } else {
          setCountdown(count);
        }
      }, 1000);
    }
  };

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  const togglePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      if (next) {
        audioManager.stopMusic();
      } else {
        audioManager.startMusic();
      }
      return next;
    });
  };

  const toggleAspectRatio = () => {
    setAspectRatio(prev => prev === '4:3' ? '16:9' : '4:3');
  };

  const drawCheckpoint = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, passed: boolean) => {
    const archW = w * 2.5;
    const archH = h * 3;
    
    // Pillars
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - archW/2, y - archH, archW/12, archH);
    ctx.fillRect(x + archW/2 - archW/12, y - archH, archW/12, archH);
    
    // Banner
    ctx.fillStyle = passed ? '#059669' : '#d97706';
    ctx.fillRect(x - archW/2, y - archH, archW, archH/3);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.max(10, archH/6)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CHECKPOINT', x, y - archH + archH/6);

    // Glow
    if (!passed) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#fbbf24';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.strokeRect(x - archW/2, y - archH, archW, archH/3);
      ctx.shadowBlur = 0;
    }
  };

  const drawPolygon = (ctx: CanvasRenderingContext2D, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: string, withTexture: boolean = false) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1);
    ctx.lineTo(x2 - w2, y2);
    ctx.lineTo(x2 + w2, y2);
    ctx.lineTo(x1 + w1, y1);
    ctx.fill();

    if (withTexture) {
      // Add more realistic road texture: asphalt grain and cracks
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let i = 0; i < 8; i++) {
        const rx = x1 - w1 + Math.random() * (w1 * 2);
        const ry = y2 + Math.random() * (y1 - y2);
        const rw = 1 + Math.random() * 3;
        ctx.fillRect(rx, ry, rw, 1);
      }
      
      // Subtle dark patches
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let i = 0; i < 3; i++) {
        const rx = x1 - w1 + Math.random() * (w1 * 2);
        const ry = y2 + Math.random() * (y1 - y2);
        const rw = 10 + Math.random() * 20;
        ctx.fillRect(rx, ry, rw, 2);
      }
    }
  };

  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // Trunk with shading
    const trunkGrad = ctx.createLinearGradient(x - w/10, y, x + w/10, y);
    trunkGrad.addColorStop(0, '#2d1b0f');
    trunkGrad.addColorStop(1, '#4d3b2f');
    ctx.fillStyle = trunkGrad;
    ctx.fillRect(x - w / 10, y - h * 0.4, w / 5, h * 0.4);

    // Detailed Foliage (Multiple layers for depth)
    const drawFoliage = (fx: number, fy: number, fw: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(fx, fy, fw, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.arc(fx - fw/3, fy - fw/3, fw/2, 0, Math.PI * 2);
      ctx.fill();
    };

    drawFoliage(x, y - h * 0.7, w * 0.8, '#166534');
    drawFoliage(x - w * 0.4, y - h * 0.5, w * 0.6, '#15803d');
    drawFoliage(x + w * 0.4, y - h * 0.5, w * 0.6, '#15803d');
    drawFoliage(x, y - h * 0.9, w * 0.5, '#22c55e');
  };

  const drawOpponentCar = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, plate: string) => {
    ctx.save();
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.6, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels (Ellipses for 3D look)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(x - w * 0.4, y - h * 0.15, w * 0.1, h * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.4, y - h * 0.15, w * 0.1, h * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side Mirrors
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(x - w * 0.48, y - h * 0.65, w * 0.08, h * 0.1);
    ctx.fillRect(x + w * 0.4, y - h * 0.65, w * 0.08, h * 0.1);

    // Spoiler
    ctx.fillStyle = '#222';
    ctx.fillRect(x - w / 2, y - h - 10, w, 6); // Wing
    ctx.fillRect(x - w * 0.35, y - h - 10, 3, 10); // Left mount
    ctx.fillRect(x + w * 0.35 - 3, y - h - 10, 3, 10); // Right mount

    // Car Body - Lower (Flared)
    const gradient = ctx.createLinearGradient(x, y - h, x, y);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, shadeColor(color, -30));
    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h * 0.1);
    ctx.bezierCurveTo(x - w / 2, y - h * 0.4, x - w * 0.45, y - h * 0.6, x - w * 0.45, y - h * 0.6);
    ctx.lineTo(x + w * 0.45, y - h * 0.6);
    ctx.bezierCurveTo(x + w * 0.45, y - h * 0.6, x + w / 2, y - h * 0.4, x + w / 2, y - h * 0.1);
    ctx.closePath();
    ctx.fill();

    // Car Body - Upper (Tapered Cabin)
    ctx.fillStyle = shadeColor(color, -10);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.4, y - h * 0.6);
    ctx.bezierCurveTo(x - w * 0.35, y - h * 0.8, x - w * 0.3, y - h, x - w * 0.3, y - h);
    ctx.lineTo(x + w * 0.3, y - h);
    ctx.bezierCurveTo(x + w * 0.3, y - h, x + w * 0.35, y - h * 0.8, x + w * 0.4, y - h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Rear Window
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.25, y - h + 5);
    ctx.lineTo(x + w * 0.25, y - h + 5);
    ctx.lineTo(x + w * 0.35, y - h * 0.6 - 5);
    ctx.lineTo(x - w * 0.35, y - h * 0.6 - 5);
    ctx.closePath();
    ctx.fill();

    // Tail Lights
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(x - w * 0.42, y - h * 0.5, w / 5, h / 10, 2);
    ctx.roundRect(x + w * 0.42 - w / 5, y - h * 0.5, w / 5, h / 10, 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // License Plate
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 12, y - h * 0.2, 24, 10);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(plate, x, y - h * 0.2 + 8);

    ctx.restore();
  };

  const drawPlayerCar = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, config: any, isBraking: boolean, damage: number = 0, driftAngle: number = 0) => {
    ctx.save();

    // Apply Drift Tilt
    ctx.translate(x, y);
    ctx.rotate(driftAngle);
    ctx.translate(-x, -y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 5, w * 0.7, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smoke if damaged
    if (damage > 50) {
      ctx.fillStyle = `rgba(100, 100, 100, ${(damage - 50) / 100})`;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + (Math.random() - 0.5) * 40, y - h + Math.random() * 20, 10 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wheels (Flared Arches with 3D Ellipses)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x - w * 0.45, y - h * 0.2, w * 0.12, h * 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.45, y - h * 0.2, w * 0.12, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Rims
    ctx.fillStyle = config.rims;
    ctx.beginPath();
    ctx.ellipse(x - w * 0.45, y - h * 0.2, w * 0.06, h * 0.1, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.45, y - h * 0.2, w * 0.06, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Side Mirrors
    ctx.fillStyle = shadeColor(config.color, -30);
    ctx.beginPath();
    ctx.roundRect(x - w * 0.52, y - h * 0.65, w * 0.1, h * 0.12, 3);
    ctx.roundRect(x + w * 0.42, y - h * 0.65, w * 0.1, h * 0.12, 3);
    ctx.fill();

    // Spoiler
    if (config.spoiler !== 'none') {
      ctx.fillStyle = '#111';
      
      if (config.spoiler === 'small') {
        // Low-profile Lip / Ducktail Spoiler
        const wingWidth = w * 0.9;
        const wingHeight = 8;
        ctx.beginPath();
        ctx.moveTo(x - wingWidth / 2, y - h);
        ctx.lineTo(x + wingWidth / 2, y - h);
        ctx.lineTo(x + wingWidth / 2 + 5, y - h - wingHeight);
        ctx.lineTo(x - wingWidth / 2 - 5, y - h - wingHeight);
        ctx.closePath();
        ctx.fill();
        
        // Subtle shading
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x - wingWidth / 2, y - h - wingHeight, wingWidth, 2);
      } else if (config.spoiler === 'large') {
        // Aggressive GT Wing with Swan-neck mounts
        const wingWidth = w + 50;
        const wingHeight = 32;
        
        // Wing Main (Aerodynamic Curve)
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.moveTo(x - wingWidth / 2, y - h - wingHeight);
        ctx.quadraticCurveTo(x, y - h - wingHeight - 5, x + wingWidth / 2, y - h - wingHeight);
        ctx.lineTo(x + wingWidth / 2, y - h - wingHeight + 6);
        ctx.quadraticCurveTo(x, y - h - wingHeight + 1, x - wingWidth / 2, y - h - wingHeight + 6);
        ctx.closePath();
        ctx.fill();
        
        // End Plates (Aerodynamic Shape)
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.roundRect(x - wingWidth / 2 - 2, y - h - wingHeight - 8, 6, 20, 2);
        ctx.roundRect(x + wingWidth / 2 - 4, y - h - wingHeight - 8, 6, 20, 2);
        ctx.fill();

        // Swan-neck Mounts (More realistic)
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Left mount
        ctx.moveTo(x - w * 0.2, y - h + 5);
        ctx.quadraticCurveTo(x - w * 0.25, y - h - wingHeight / 2, x - w * 0.15, y - h - wingHeight);
        // Right mount
        ctx.moveTo(x + w * 0.2, y - h + 5);
        ctx.quadraticCurveTo(x + w * 0.25, y - h - wingHeight / 2, x + w * 0.15, y - h - wingHeight);
        ctx.stroke();
      }
    }

    // Car Body - Lower (Aggressive Widebody Curves)
    const bodyGrad = ctx.createLinearGradient(x, y - h, x, y);
    bodyGrad.addColorStop(0, config.color);
    bodyGrad.addColorStop(1, shadeColor(config.color, -40));
    ctx.fillStyle = bodyGrad;
    
    // Body Kit Modifications
    let bodyWidthMultiplier = 1;
    if (config.bodyKit === 'racing') bodyWidthMultiplier = 1.1;
    if (config.bodyKit === 'extreme') bodyWidthMultiplier = 1.2;

    const currentW = w * bodyWidthMultiplier;

    ctx.beginPath();
    ctx.moveTo(x - currentW / 2, y - h * 0.1);
    ctx.bezierCurveTo(x - currentW / 2, y - h * 0.4, x - currentW * 0.48, y - h * 0.6, x - currentW * 0.48, y - h * 0.6);
    ctx.lineTo(x + currentW * 0.48, y - h * 0.6);
    ctx.bezierCurveTo(x + currentW * 0.48, y - h * 0.6, x + currentW / 2, y - h * 0.4, x + currentW / 2, y - h * 0.1);
    ctx.closePath();
    ctx.fill();

    // Side Skirts (Body Kit)
    if (config.bodyKit !== 'stock') {
      ctx.fillStyle = '#111';
      ctx.fillRect(x - currentW / 2 - 5, y - h * 0.15, 10, h * 0.1);
      ctx.fillRect(x + currentW / 2 - 5, y - h * 0.15, 10, h * 0.1);
    }

    // Body Highlight (Top edge of widebody)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rear Diffuser / Bumper
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.roundRect(x - currentW / 2, y - h * 0.18, currentW, h * 0.18, 5);
    ctx.fill();

    // Car Body - Upper (Tapered Sports Cabin with Curves)
    ctx.fillStyle = shadeColor(config.color, -15);
    ctx.beginPath();
    ctx.moveTo(x - currentW * 0.42, y - h * 0.6);
    ctx.bezierCurveTo(x - currentW * 0.38, y - h * 0.85, x - currentW * 0.32, y - h, x - currentW * 0.32, y - h);
    ctx.lineTo(x + currentW * 0.32, y - h);
    ctx.bezierCurveTo(x + currentW * 0.32, y - h, x + currentW * 0.38, y - h * 0.85, x + currentW * 0.42, y - h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Roof Highlight
    const roofGrad = ctx.createLinearGradient(x, y - h, x, y - h + 10);
    roofGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
    roofGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = roofGrad;
    ctx.fill();

    // Decals
    if (config.decal === 'stripes') {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x - currentW / 10, y - h, currentW / 20, h);
      ctx.fillRect(x + currentW / 20, y - h, currentW / 20, h);
    } else if (config.decal === 'racing-number') {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y - h * 0.45, currentW / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = `bold ${h / 5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('86', x, y - h * 0.45);
    } else if (config.decal === 'flames') {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(x - currentW * 0.4, y - h * 0.3);
      ctx.quadraticCurveTo(x - currentW * 0.2, y - h * 0.5, x, y - h * 0.3);
      ctx.quadraticCurveTo(x + currentW * 0.2, y - h * 0.5, x + currentW * 0.4, y - h * 0.3);
      ctx.fill();
    } else if (config.decal === 'tribal') {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - currentW * 0.3, y - h * 0.4);
      ctx.lineTo(x - currentW * 0.1, y - h * 0.2);
      ctx.lineTo(x + currentW * 0.1, y - h * 0.4);
      ctx.lineTo(x + currentW * 0.3, y - h * 0.2);
      ctx.stroke();
    }

    // Rear Window (Blue Reflection)
    const winGrad = ctx.createLinearGradient(x, y - h + 15, x, y - h + 15 + h / 2.5);
    winGrad.addColorStop(0, '#3b82f6');
    winGrad.addColorStop(0.5, '#60a5fa');
    winGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = winGrad;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.28, y - h + 12);
    ctx.lineTo(x + w * 0.28, y - h + 12);
    ctx.lineTo(x + w * 0.38, y - h * 0.6 - 8);
    ctx.lineTo(x - w * 0.38, y - h * 0.6 - 8);
    ctx.closePath();
    ctx.fill();

    // Damage Cracks on window
    if (damage > 20) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.1, y - h + 20);
      ctx.lineTo(x + w * 0.1, y - h + 40);
      ctx.moveTo(x + w * 0.05, y - h + 25);
      ctx.lineTo(x - w * 0.05, y - h + 45);
      ctx.stroke();
    }
    
    if (damage > 60) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(x - w * 0.2, y - h + 15);
      ctx.lineTo(x - w * 0.1, y - h + 35);
      ctx.stroke();
    }

    // Tail Lights (Vibrant Red with Bloom)
    ctx.fillStyle = isBraking ? '#ff0000' : '#880000';
    ctx.shadowBlur = isBraking ? 45 : 25;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.roundRect(x - w * 0.44, y - h * 0.52, w / 4, h / 10, 3);
    ctx.roundRect(x + w * 0.44 - w / 4, y - h * 0.52, w / 4, h / 10, 3);
    ctx.fill();
    
    // Inner light glow
    ctx.fillStyle = isBraking ? '#ffffff' : '#ffcccc';
    ctx.shadowBlur = isBraking ? 25 : 10;
    ctx.beginPath();
    ctx.roundRect(x - w * 0.38, y - h * 0.5 + 1, w / 15, h / 20, 1);
    ctx.roundRect(x + w * 0.38 - w / 15, y - h * 0.5 + 1, w / 15, h / 20, 1);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Third Brake Light
    if (isBraking) {
      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      ctx.fillRect(x - 15, y - h + 5, 30, 4);
      ctx.shadowBlur = 0;
    }

    // Exhaust Pipes
    ctx.fillStyle = '#71717a';
    ctx.beginPath();
    ctx.arc(x - w / 4, y - 8, 12, 0, Math.PI * 2);
    ctx.arc(x + w / 4, y - 8, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(x - w / 4, y - 8, 8, 0, Math.PI * 2);
    ctx.arc(x + w / 4, y - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // License Plate
    ctx.fillStyle = '#facc15'; // Yellow plate
    ctx.beginPath();
    ctx.roundRect(x - 22, y - h * 0.28, 44, 16, 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DRIFT', x, y - h * 0.28 + 12);

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

  return (
    <div className={`relative group w-full mx-auto ${aspectRatio === '4:3' ? 'max-w-[800px] aspect-[4/3]' : 'max-w-[1066px] aspect-[16/9]'}`}>
      <canvas
        ref={canvasRef}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        className="w-full h-full rounded-sm border-4 border-zinc-800 shadow-2xl bg-black"
      />
      
      {/* HUD Overlay - Matching Image Style */}
      {isReady ? (
        <div className="absolute inset-0 pointer-events-none p-6 text-white font-sans">
          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-50 pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <h2 className="text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  Paused
                </h2>
                <div className="flex flex-col gap-4 w-72 mx-auto">
                  <button 
                    onClick={togglePause}
                    className="group relative bg-white text-black font-bold py-5 rounded-sm hover:bg-zinc-200 transition-all transform hover:skew-x-[-10deg] active:scale-95 uppercase tracking-widest text-lg"
                  >
                    Resume Race
                    <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/20 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
                  </button>
                  <button 
                    onClick={onBack}
                    className="group relative bg-zinc-900 text-white font-bold py-5 rounded-sm border border-zinc-700 hover:bg-zinc-800 transition-all transform hover:skew-x-[-10deg] active:scale-95 uppercase tracking-widest text-lg"
                  >
                    Return to Menu
                    <div className="absolute -bottom-1 -right-1 w-full h-full border border-white/10 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          <div className="flex justify-between items-start">
            <div className="space-y-0 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Lap</div>
              <div className="text-4xl font-black italic tracking-tighter">
                {hud.lap}<span className="text-xl text-zinc-500 not-italic ml-1">/ {hud.totalLaps}</span>
              </div>
              <div className="text-2xl font-black mt-2">Time: {hud.time.toFixed(2)}</div>
              
              <div className={`text-3xl font-black mt-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${hud.checkpointTime < 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                TIME: {Math.ceil(hud.checkpointTime)}s
              </div>
              
              {isMultiplayer && roomId && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Room: {roomId}</div>
                </div>
              )}
              
              {/* Mini Map */}
              <div className="mt-4 w-40 h-28 border-2 border-white/80 rounded-xl relative overflow-hidden bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-2">
                <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest mb-1">Track Map</div>
                <div className="w-32 h-16 border-2 border-white/10 rounded-full relative">
                  {/* Player Dot */}
                  <div 
                    className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red] z-20"
                    style={{
                      left: `${50 + 42 * Math.cos(hud.progress * Math.PI * 2 - Math.PI / 2)}%`,
                      top: `${50 + 42 * Math.sin(hud.progress * Math.PI * 2 - Math.PI / 2)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                  {/* Opponent Dots */}
                  {hud.opponents.map((oppProgress, i) => (
                    <div 
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 z-10"
                      style={{
                        left: `${50 + 42 * Math.cos(oppProgress * Math.PI * 2 - Math.PI / 2)}%`,
                        top: `${50 + 42 * Math.sin(oppProgress * Math.PI * 2 - Math.PI / 2)}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
              {hud.leaderboard?.map((racer: any, i: number) => (
                <div 
                  key={racer.id}
                  className={`flex items-center gap-3 px-3 py-1 rounded-sm border ${racer.isPlayer ? 'bg-white text-black border-white' : 'bg-black/40 text-white border-white/20'} transition-all w-32`}
                >
                  <span className="font-black italic text-sm">{i + 1}</span>
                  <span className="font-mono text-[10px] uppercase tracking-tighter flex-1 truncate">{racer.name}</span>
                  <span className="font-mono text-[9px] opacity-60">L{racer.lap}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              <button 
                onClick={() => setUseTilt(!useTilt)}
                className={`p-2 border rounded-sm transition-all pointer-events-auto flex items-center gap-2 ${useTilt ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-black/50 border-white/40 text-white/70 hover:bg-white/10'}`}
                title="Toggle Tilt Controls"
              >
                <Monitor className={`w-5 h-5 ${useTilt ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{useTilt ? 'Tilt On' : 'Tilt Off'}</span>
              </button>

              <button 
                onClick={toggleAspectRatio}
                className="p-2 bg-black/50 border border-white/40 rounded-sm hover:bg-white/10 transition-colors pointer-events-auto flex items-center gap-2"
                title="Toggle Aspect Ratio"
              >
                <Monitor className="w-5 h-5" />
                <span className="text-[10px] font-bold">{aspectRatio}</span>
              </button>

              <button 
                onClick={togglePause}
                className="p-2 bg-black/50 border border-white/40 rounded-sm hover:bg-white/10 transition-colors pointer-events-auto"
              >
                {isPaused ? <PlayIcon className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>

              <button 
                onClick={toggleMute}
                className="p-2 bg-black/50 border border-white/40 rounded-sm hover:bg-white/10 transition-colors pointer-events-auto"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <div className="flex flex-col items-end">
                <span className={`text-xs font-bold uppercase tracking-widest ${hud.damage > 70 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>Damage</span>
                <div className="w-32 h-2 bg-black/50 border border-white/40 mt-1">
                  <div 
                    className={`h-full transition-all duration-300 ${hud.damage > 70 ? 'bg-red-500' : hud.damage > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${hud.damage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black uppercase italic tracking-tighter transition-colors ${hud.turbo >= 100 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                  {hud.turbo >= 100 ? 'Turbo Ready' : 'Turbo'}
                </span>
                <div className="w-56 h-6 bg-black/50 border-2 border-white/80 p-0.5 relative">
                  <div 
                    className={`h-full transition-all duration-100 ${hud.turbo >= 100 ? 'bg-yellow-400 shadow-[0_0_15px_#facc15]' : 'bg-white shadow-[0_0_10px_white]'}`} 
                    style={{ width: `${hud.turbo}%` }}
                  ></div>
                  {/* Charge Indicator */}
                  {hud.turbo < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter opacity-50">
                      Hold Shift to Charge
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 right-12 text-right drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            {hud.slipstream && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-blue-400 font-black italic text-2xl mb-2 tracking-tighter flex items-center justify-end gap-2"
              >
                <Zap className="w-6 h-6 fill-blue-400" />
                SLIPSTREAMING
              </motion.div>
            )}
            <div className="text-8xl font-black italic tracking-tighter">
              {hud.speed}
              <span className="text-2xl ml-3 not-italic font-bold opacity-90">MPH</span>
            </div>
            {hud.leaderboard && hud.leaderboard.length > 0 && (
              <div className="text-6xl font-black italic tracking-tighter mt-2 text-emerald-400">
                <span className="text-2xl not-italic font-bold opacity-90 mr-2">POS</span>
                {hud.leaderboard.findIndex((r: any) => r.isPlayer) + 1}
                <span className="text-2xl not-italic font-bold opacity-90 ml-1">/ {hud.leaderboard.length}</span>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          {isMobile && (
            <div className="absolute inset-0 pointer-events-none touch-none">
              {/* Left Side: Steering */}
              <div className="absolute bottom-8 left-8 flex gap-4 pointer-events-auto">
                <button
                  onPointerDown={() => keysRef.current['ArrowLeft'] = true}
                  onPointerUp={() => keysRef.current['ArrowLeft'] = false}
                  onPointerLeave={() => keysRef.current['ArrowLeft'] = false}
                  className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center active:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onPointerDown={() => keysRef.current['ArrowRight'] = true}
                  onPointerUp={() => keysRef.current['ArrowRight'] = false}
                  onPointerLeave={() => keysRef.current['ArrowRight'] = false}
                  className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center active:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Right Side: Pedals & Turbo */}
              <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-auto">
                <div className="flex gap-4">
                  <button
                    onPointerDown={() => keysRef.current['ControlLeft'] = true}
                    onPointerUp={() => keysRef.current['ControlLeft'] = false}
                    onPointerLeave={() => keysRef.current['ControlLeft'] = false}
                    className={`w-16 h-16 backdrop-blur-md border rounded-full flex items-center justify-center transition-all ${hud.turbo >= 100 ? 'bg-blue-500/40 border-blue-400 animate-pulse' : 'bg-white/10 border-white/20 opacity-50'}`}
                  >
                    <Zap className="w-8 h-8" />
                  </button>
                  <button
                    onPointerDown={() => keysRef.current['ArrowDown'] = true}
                    onPointerUp={() => keysRef.current['ArrowDown'] = false}
                    onPointerLeave={() => keysRef.current['ArrowDown'] = false}
                    className="w-16 h-16 bg-red-500/20 backdrop-blur-md border border-red-500/40 rounded-full flex items-center justify-center active:bg-red-500/40 transition-colors"
                  >
                    <ChevronDown className="w-8 h-8" />
                  </button>
                </div>
                <button
                  onPointerDown={() => keysRef.current['ArrowUp'] = true}
                  onPointerUp={() => keysRef.current['ArrowUp'] = false}
                  onPointerLeave={() => keysRef.current['ArrowUp'] = false}
                  className="w-36 h-20 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 rounded-2xl flex items-center justify-center active:bg-emerald-500/40 transition-colors"
                >
                  <ChevronUp className="w-10 h-10" />
                </button>
              </div>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <h2 className="text-6xl font-black italic tracking-tighter uppercase">Paused</h2>
                <button
                  onClick={togglePause}
                  className="bg-white text-black font-bold py-3 px-12 rounded-sm hover:bg-zinc-200 transition-all transform hover:skew-x-[-10deg] uppercase"
                >
                  Resume
                </button>
              </motion.div>
            </div>
          )}
          {checkpointNotify && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-yellow-400 text-black px-8 py-4 rounded-sm font-black italic text-4xl shadow-[0_0_30px_#facc15] transform skew-x-[-10deg]">
                TIME EXTENDED! +30s
              </div>
            </motion.div>
          )}
          {hud.checkpointTime <= 0 && (
            <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center pointer-events-none">
              <div className="text-white font-black italic text-6xl animate-pulse drop-shadow-2xl">
                TIME OVER!
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-end p-12">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-zinc-900 border border-zinc-800 p-6 space-y-8 shadow-2xl"
          >
            <div className="space-y-1">
              <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">Customize</h2>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Build your machine</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Settings</h3>
                {isMultiplayer && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">Players: {Object.keys(otherPlayers).length + 1}</span>
                  </div>
                )}
                <button 
                  onClick={toggleAspectRatio}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors"
                >
                  <Monitor className="w-3 h-3 text-zinc-400" />
                  <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-300">{aspectRatio}</span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weather</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['clear', 'rain', 'fog'] as const).map(w => (
                    <button
                      key={w}
                      onClick={() => setWeather(w)}
                      className={`py-2 text-[10px] font-bold uppercase border transition-colors ${weather === w ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Body Color</label>
                <div className="flex gap-2">
                  {['#4ade80', '#ef4444', '#3b82f6', '#facc15', '#ffffff', '#18181b'].map(c => (
                    <button
                      key={c}
                      onClick={() => setCarConfig(prev => ({ ...prev, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${carConfig.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Spoiler</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['none', 'small', 'large'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setCarConfig(prev => ({ ...prev, spoiler: s }))}
                      className={`py-2 text-[10px] font-bold uppercase border transition-colors ${carConfig.spoiler === s ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Decals</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['none', 'stripes', 'racing-number'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setCarConfig(prev => ({ ...prev, decal: d }))}
                      className={`py-2 text-[10px] font-bold uppercase border transition-colors ${carConfig.decal === d ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                    >
                      {d.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Rims</label>
                <div className="flex gap-2">
                  {['#ffffff', '#000000', '#facc15', '#ef4444'].map(c => (
                    <button
                      key={c}
                      onClick={() => setCarConfig(prev => ({ ...prev, rims: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${carConfig.rims === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Performance Upgrades</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Engine Stage</label>
                    <span className="text-[10px] font-mono text-emerald-500">S{carConfig.engine}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setCarConfig(prev => ({ ...prev, engine: lvl }))}
                        className={`h-1 transition-colors ${carConfig.engine >= lvl ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Tire Compound</label>
                    <span className="text-[10px] font-mono text-emerald-500">S{carConfig.tires}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setCarConfig(prev => ({ ...prev, tires: lvl }))}
                        className={`h-1 transition-colors ${carConfig.tires >= lvl ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Turbo System</label>
                    <span className="text-[10px] font-mono text-emerald-500">S{carConfig.turbo}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setCarConfig(prev => ({ ...prev, turbo: lvl }))}
                        className={`h-1 transition-colors ${carConfig.turbo >= lvl ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onBack}
                disabled={isLocalReady}
                className="bg-zinc-800 text-zinc-400 font-black py-4 uppercase italic tracking-tighter hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleStartRace}
                disabled={isLocalReady}
                className={`bg-white text-black font-black py-4 uppercase italic tracking-tighter hover:bg-zinc-200 transition-colors disabled:bg-zinc-500 disabled:text-zinc-300`}
              >
                {isLocalReady ? 'Waiting...' : 'Start Race'}
              </button>
            </div>
            
            {isMultiplayer && (
              <div className="mt-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Lobby Status</div>
                <div className="flex flex-wrap gap-2">
                  <div className={`px-2 py-1 text-[9px] font-mono border ${isLocalReady ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                    YOU: {isLocalReady ? 'READY' : 'WAITING'}
                  </div>
                  {Object.values(otherPlayers).map((p: any) => (
                    <div key={p.id} className={`px-2 py-1 text-[9px] font-mono border ${p.ready ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                      {p.id.substring(0, 4)}: {p.ready ? 'READY' : 'WAITING'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {/* Retro Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]"></div>
    </div>
  );
};
