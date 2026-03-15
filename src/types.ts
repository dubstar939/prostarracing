export type CarModelType = 'speedster' | 'drifter' | 'tank' | 'interceptor';

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

export type RaceMode = 'classic' | 'time-trial' | 'elimination' | 'drift';

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

export const CAR_MODELS: Record<CarModelType, { name: string; description: string; stats: any }> = {
  speedster: { name: 'Speedster', description: 'High top speed, lower handling.', stats: { speed: 8, accel: 6, handling: 4 } },
  drifter: { name: 'Drifter', description: 'Perfect for sliding through corners.', stats: { speed: 6, accel: 7, handling: 8 } },
  tank: { name: 'Tank', description: 'Heavy and stable, but slow acceleration.', stats: { speed: 5, accel: 4, handling: 9 } },
  interceptor: { name: 'Interceptor', description: 'Balanced performance.', stats: { speed: 7, accel: 7, handling: 7 } },
};
