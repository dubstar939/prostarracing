import { TrackThemeType } from '../components/RacingGame';

/**
 * 939PRO Sprite Renderer & Cache
 * Pre-renders procedural assets to offscreen canvases for performance.
 */

interface SpriteCacheEntry {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

const cache: Record<string, SpriteCacheEntry> = {};

/**
 * Generates a unique key for a sprite based on its type and theme.
 */
const getCacheKey = (type: string, theme: TrackThemeType, w: number, h: number) => {
  return `${type}_${theme}_${Math.round(w)}_${Math.round(h)}`;
};

/**
 * Draws a standard tree.
 */
export const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  // Trunk
  ctx.fillStyle = '#4527a0';
  ctx.fillRect(x - w * 0.1, y - h * 0.3, w * 0.2, h * 0.3);
  
  // Leaves (Low-poly triangles)
  ctx.fillStyle = '#1a237e';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y - h * 0.3);
  ctx.lineTo(x, y - h);
  ctx.lineTo(x + w * 0.5, y - h * 0.3);
  ctx.fill();
  
  ctx.fillStyle = '#283593';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.4, y - h * 0.5);
  ctx.lineTo(x, y - h * 1.1);
  ctx.lineTo(x + w * 0.4, y - h * 0.5);
  ctx.fill();
};

/**
 * Draws a palm tree for coastal themes.
 */
export const drawPalmTree = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  // Trunk
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(x - w * 0.1, y);
  ctx.lineTo(x - w * 0.05, y - h);
  ctx.lineTo(x + w * 0.05, y - h);
  ctx.lineTo(x + w * 0.1, y);
  ctx.fill();
  
  // Fronds
  ctx.fillStyle = '#166534';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    ctx.save();
    ctx.translate(x, y - h);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(w * 0.3, 0, w * 0.4, w * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

/**
 * Draws a pine tree for mountain themes.
 */
export const drawPine = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#2d3748';
  ctx.fillRect(x - w * 0.05, y - h * 0.2, w * 0.1, h * 0.2);
  
  ctx.fillStyle = '#1a202c';
  for (let i = 0; i < 3; i++) {
    const levelY = y - h * 0.2 - (i * h * 0.3);
    const levelW = w * (1 - i * 0.2);
    ctx.beginPath();
    ctx.moveTo(x - levelW / 2, levelY);
    ctx.lineTo(x, levelY - h * 0.4);
    ctx.lineTo(x + levelW / 2, levelY);
    ctx.fill();
  }
};

/**
 * Draws a cactus for desert themes.
 */
export const drawCactus = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#1b5e20';
  // Main stem
  ctx.fillRect(x - w * 0.15, y - h, w * 0.3, h);
  // Arms
  ctx.fillRect(x - w * 0.4, y - h * 0.7, w * 0.3, h * 0.1);
  ctx.fillRect(x - w * 0.4, y - h * 0.9, w * 0.1, h * 0.2);
  ctx.fillRect(x + w * 0.1, y - h * 0.5, w * 0.3, h * 0.1);
  ctx.fillRect(x + w * 0.3, y - h * 0.7, w * 0.1, h * 0.2);
};

/**
 * Draws a building for urban/neon themes.
 */
export const drawBuilding = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - w / 2, y - h, w, h);
  
  // Windows
  ctx.fillStyle = Math.random() > 0.5 ? '#fef08a' : '#334155';
  const rows = 5;
  const cols = 3;
  const winW = w / (cols * 2);
  const winH = h / (rows * 2);
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.3) {
        ctx.fillRect(
          x - w / 2 + winW + c * winW * 2,
          y - h + winH + r * winH * 2,
          winW,
          winH
        );
      }
    }
  }
  
  // Neon trim
  ctx.strokeStyle = '#00f6ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y - h, w, h);
};

/**
 * Draws a street lamp.
 */
export const drawLamp = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - w * 0.05, y - h, w * 0.1, h);
  ctx.fillRect(x - w * 0.05, y - h, w * 0.4, h * 0.05);
  
  ctx.fillStyle = '#fef08a';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#fef08a';
  ctx.fillRect(x + w * 0.25, y - h, w * 0.15, h * 0.1);
  ctx.shadowBlur = 0;
};

/**
 * Draws a rock/boulder.
 */
export const drawRock = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x - w * 0.3, y - h * 0.8);
  ctx.lineTo(x + w * 0.2, y - h);
  ctx.lineTo(x + w / 2, y - h * 0.4);
  ctx.lineTo(x + w * 0.4, y);
  ctx.fill();
};

/**
 * Main entry point for drawing cached sprites.
 */
export const drawCachedSprite = (
  ctx: CanvasRenderingContext2D,
  type: string,
  theme: TrackThemeType,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  const key = getCacheKey(type, theme, w, h);
  
  if (!cache[key]) {
    const canvas = document.createElement('canvas');
    canvas.width = w * 2; // Padding for glow/shadows
    canvas.height = h * 1.2;
    const tempCtx = canvas.getContext('2d');
    if (tempCtx) {
      tempCtx.translate(w, h); // Center horizontally at bottom
      
      switch (type) {
        case 'tree':
          if (theme === 'coastal_highway') drawPalmTree(tempCtx, 0, 0, w, h);
          else drawTree(tempCtx, 0, 0, w, h);
          break;
        case 'pine': drawPine(tempCtx, 0, 0, w, h); break;
        case 'cactus': drawCactus(tempCtx, 0, 0, w, h); break;
        case 'building': drawBuilding(tempCtx, 0, 0, w, h); break;
        case 'lamp': drawLamp(tempCtx, 0, 0, w, h); break;
        case 'rock': drawRock(tempCtx, 0, 0, w, h); break;
      }
      
      cache[key] = { canvas, width: canvas.width, height: canvas.height };
    }
  }
  
  const entry = cache[key];
  if (entry) {
    ctx.drawImage(entry.canvas, x - w, y - h);
  }
};

/**
 * Clears the sprite cache.
 */
export const clearSpriteCache = () => {
  Object.keys(cache).forEach(key => delete cache[key]);
};
