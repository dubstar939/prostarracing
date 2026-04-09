/**
 * Asset Loader for 939PRO Racing Game
 * Handles loading of car sprites and other game assets
 */

import { CarConfig } from '../types';
import { loadAllAssets as loadLegacyAssets } from '../assets/assetloader.js';

// Cache for loaded images
const imageCache: Map<string, HTMLImageElement> = new Map();

/**
 * Load an image and cache it
 */
export const loadImage = (path: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (imageCache.has(path)) {
      resolve(imageCache.get(path)!);
      return;
    }

    const img = new Image();
    img.src = path;
    img.onload = () => {
      imageCache.set(path, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${path}`);
      reject(new Error(`Failed to load image: ${path}`));
    };
  });
};

/**
 * Generate a car sprite on canvas and return as image
 * This creates consistent sprites for both garage and in-game use
 */
export const generateCarSprite = (
  config: CarConfig,
  width: number = 300,
  height: number = 180,
  variant: 'neutral' | 'drift_left' | 'drift_right' | 'boost' = 'neutral'
): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      // Fallback: create empty image
      const img = new Image();
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      resolve(img);
      return;
    }

    // Import drawCar dynamically to avoid circular dependencies
    import('../utils/carRenderer').then(({ drawCar }) => {
      const x = width / 2;
      const y = height / 2 + 30;
      const w = width * 0.8;
      const h = height * 0.6;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x, y + 15, w * 0.55, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Calculate drift angle based on variant
      let driftAngle = 0;
      let isBoosting = false;

      if (variant === 'drift_left') {
        driftAngle = -0.15;
      } else if (variant === 'drift_right') {
        driftAngle = 0.15;
      } else if (variant === 'boost') {
        isBoosting = true;
      }

      // Draw the car using the shared renderer
      drawCar(ctx, x, y, w, h, config, false, 0, driftAngle, isBoosting);

      // Convert to image
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      img.onload = () => resolve(img);
    }).catch((err) => {
      console.error('Error loading carRenderer:', err);
      const img = new Image();
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      resolve(img);
    });
  });
};

/**
 * Generate all sprite variants for a car configuration
 */
export const generateCarSprites = async (config: CarConfig): Promise<{
  neutral: HTMLImageElement;
  drift_left: HTMLImageElement;
  drift_right: HTMLImageElement;
  boost: HTMLImageElement;
}> => {
  const [neutral, drift_left, drift_right, boost] = await Promise.all([
    generateCarSprite(config, 300, 180, 'neutral'),
    generateCarSprite(config, 300, 180, 'drift_left'),
    generateCarSprite(config, 300, 180, 'drift_right'),
    generateCarSprite(config, 300, 180, 'boost'),
  ]);

  return { neutral, drift_left, drift_right, boost };
};

/**
 * Sprite cache for car configurations
 * Uses a hash of the config as the key
 */
const spriteCache: Map<string, {
  neutral: HTMLImageElement;
  drift_left: HTMLImageElement;
  drift_right: HTMLImageElement;
  boost: HTMLImageElement;
}> = new Map();

/**
 * Generate a cache key from car config
 */
const getConfigHash = (config: CarConfig): string => {
  return JSON.stringify({
    model: config.model,
    color: config.color,
    spoiler: config.spoiler,
    decal: config.decal,
    bodyKit: config.bodyKit,
    engine: config.engine,
    tires: config.tires,
  });
};

/**
 * Get or generate car sprites with caching
 */
export const getCarSprites = async (config: CarConfig): Promise<{
  neutral: HTMLImageElement;
  drift_left: HTMLImageElement;
  drift_right: HTMLImageElement;
  boost: HTMLImageElement;
}> => {
  const hash = getConfigHash(config);
  
  if (spriteCache.has(hash)) {
    return spriteCache.get(hash)!;
  }

  const sprites = await generateCarSprites(config);
  spriteCache.set(hash, sprites);
  
  return sprites;
};

/**
 * Clear the sprite cache (useful when switching cars)
 */
export const clearSpriteCache = () => {
  spriteCache.clear();
  imageCache.clear();
};

/**
 * Preload car sprites for garage preview
 */
export const preloadCarSprites = async (config: CarConfig): Promise<void> => {
  await getCarSprites(config);
};

/**
 * Load all game assets including car sprites
 * Wraps the legacy asset loader and adds sprite generation
 */
export const loadAllAssets = async () => {
  try {
    const legacyAssets = await loadLegacyAssets();
    
    // Generate sprites for each car type
    const carModels = Object.keys(legacyAssets.cars || {});
    
    console.log(`Generated sprites for ${carModels.length} car models`);
    
    return legacyAssets;
  } catch (error) {
    console.warn('Legacy asset loading failed, using generated assets only:', error);
    return {
      cars: {},
      characters: { meta: {}, sprites: {} }
    };
  }
};
