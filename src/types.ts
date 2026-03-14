export type CarModelType = 'speedster' | 'drifter' | 'tank' | 'interceptor';

export interface CarConfig {
  model: CarModelType;
  color: string;
  spoiler: 'none' | 'small' | 'large';
  rims: string;
  decal: 'none' | 'stripes' | 'racing-number';
  engine: number;
  tires: number;
  turbo: number;
}

export type RaceMode = 'classic' | 'time-trial' | 'elimination' | 'drift';

export const CAR_MODELS: Record<CarModelType, { name: string; description: string; stats: any }> = {
  speedster: { name: 'Speedster', description: 'High top speed, lower handling.', stats: { speed: 8, accel: 6, handling: 4 } },
  drifter: { name: 'Drifter', description: 'Perfect for sliding through corners.', stats: { speed: 6, accel: 7, handling: 8 } },
  tank: { name: 'Tank', description: 'Heavy and stable, but slow acceleration.', stats: { speed: 5, accel: 4, handling: 9 } },
  interceptor: { name: 'Interceptor', description: 'Balanced performance.', stats: { speed: 7, accel: 7, handling: 7 } },
};
