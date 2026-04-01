export type CarModelType = 'speedster' | 'drifter' | 'tank' | 'interceptor';

export type BiomeType = 'neon_city' | 'coastal_highway' | 'desert_canyon' | 'cyber_industrial' | 'mountain_pass' | 'urban_downtown';

export interface CarConfig {
  model: CarModelType;
  color: string;
  spoiler: 'none' | 'small' | 'large';
  rims: string;
  decal: 'none' | 'stripes' | 'racing-number' | 'flames' | 'tribal';
  bodyKit: 'stock' | 'street' | 'racing' | 'extreme';
  engine: number;
  tires: number;
  turbo: number;
}

export interface Inventory {
  engines: number[];
  tires: number[];
  turbos: number[];
}

export type RaceMode = 'classic' | 'time-trial' | 'elimination' | 'drift' | 'tokyo-expressway';

export const BODY_KITS = {
  stock: { name: 'Stock', description: 'Factory original body.' },
  street: { name: 'Street', description: 'Lowered suspension and side skirts.' },
  racing: { name: 'Racing', description: 'Wide body and aggressive front splitter.' },
  extreme: { name: 'Extreme', description: 'Full aero package with massive diffuser.' },
};

export const DECALS = {
  none: { name: 'None' },
  stripes: { name: 'Racing Stripes' },
  'racing-number': { name: 'Pro Number' },
  flames: { name: 'Hot Flames' },
  tribal: { name: 'Tribal Art' },
};

export const PERFORMANCE_PARTS = {
  engine: [
    { level: 1, name: 'Stock V6', price: 0, boost: 0 },
    { level: 2, name: 'Tuned V6', price: 2500, boost: 10 },
    { level: 3, name: 'V8 Swap', price: 6000, boost: 25 },
    { level: 4, name: 'Racing V8', price: 12000, boost: 45 },
    { level: 5, name: 'Hypercar V12', price: 25000, boost: 70 },
    { level: 6, name: 'Supercharged V12', price: 45000, boost: 100 },
    { level: 7, name: 'Electric Hybrid', price: 75000, boost: 140 },
    { level: 8, name: 'Rocket Engine', price: 120000, boost: 200 },
  ],
  tires: [
    { level: 1, name: 'Street Tires', price: 0, grip: 0 },
    { level: 2, name: 'Sport Tires', price: 1500, grip: 15 },
    { level: 3, name: 'Track Slicks', price: 4000, grip: 35 },
    { level: 4, name: 'Racing Slicks', price: 8500, grip: 60 },
    { level: 5, name: 'F1 Compounds', price: 18000, grip: 90 },
  ],
  turbo: [
    { level: 1, name: 'Naturally Aspirated', price: 0, accel: 0 },
    { level: 2, name: 'Street Turbo', price: 3000, accel: 15 },
    { level: 3, name: 'Twin Turbo', price: 7500, accel: 35 },
    { level: 4, name: 'Big Single Turbo', price: 15000, accel: 65 },
    { level: 5, name: 'Quad Turbo', price: 30000, accel: 100 },
  ]
} as const;

export const CAR_MODELS: Record<CarModelType, { name: string; description: string; stats: any; glbUrl?: string }> = {
  speedster: { 
    name: 'Speedster', 
    description: 'High top speed, lower handling.', 
    stats: { speed: 8, accel: 6, handling: 4 }
  },
  drifter: { 
    name: 'Drifter', 
    description: 'Perfect for sliding through corners.', 
    stats: { speed: 6, accel: 7, handling: 8 }
  },
  tank: { 
    name: 'Tank', 
    description: 'Heavy and stable, but slow acceleration.', 
    stats: { speed: 5, accel: 4, handling: 9 }
  },
  interceptor: { 
    name: 'Interceptor', 
    description: 'Balanced performance.', 
    stats: { speed: 7, accel: 7, handling: 7 }
  },
};
