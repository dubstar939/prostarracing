/**
 * 939PRO Game Utilities
 * Common math and helper functions for the racing engine.
 */

export const easeIn = (a: number, b: number, percent: number) => a + (b - a) * Math.pow(percent, 2);
export const easeOut = (a: number, b: number, percent: number) => a + (b - a) * (1 - Math.pow(1 - percent, 2));
export const easeInOut = (a: number, b: number, percent: number) => a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);

export const project = (
  p: { world: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number } },
  cameraX: number,
  cameraY: number,
  cameraZ: number,
  width: number,
  height: number,
  cameraDepth: number,
  roadWidth: number
) => {
  const worldX = p.world.x - cameraX;
  const worldY = p.world.y - cameraY;
  const worldZ = p.world.z - cameraZ;
  
  const scale = cameraDepth / worldZ;
  
  p.screen.x = Math.round((width / 2) + (scale * worldX * width / 2));
  p.screen.y = Math.round((height / 2) - (scale * worldY * height / 2));
  p.screen.w = Math.round(scale * roadWidth * width / 2);
};

export const overlap = (x1: number, w1: number, x2: number, w2: number, percent: number = 1) => {
  const halfW1 = (w1 * percent) / 2;
  const halfW2 = (w2 * percent) / 2;
  return !((x1 + halfW1 < x2 - halfW2) || (x1 - halfW1 > x2 + halfW2));
};

/**
 * Seeded random number generator for consistent track generation.
 */
export const createSeededRandom = (seed: number) => {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
};

/**
 * Pre-calculates a road texture pattern to avoid Math.random in the loop.
 */
const ROAD_TEXTURE_SIZE = 512;
const roadTextureCanvas = document.createElement('canvas');
roadTextureCanvas.width = ROAD_TEXTURE_SIZE;
roadTextureCanvas.height = ROAD_TEXTURE_SIZE;
const rtCtx = roadTextureCanvas.getContext('2d');

if (rtCtx) {
  // Asphalt grain
  rtCtx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 2000; i++) {
    rtCtx.fillRect(
      Math.random() * ROAD_TEXTURE_SIZE,
      Math.random() * ROAD_TEXTURE_SIZE,
      1, 1
    );
  }
  // Cracks and patches
  rtCtx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 50; i++) {
    rtCtx.fillRect(
      Math.random() * ROAD_TEXTURE_SIZE,
      Math.random() * ROAD_TEXTURE_SIZE,
      Math.random() * 20, 2
    );
  }
}

export const getRoadTexture = () => roadTextureCanvas;
