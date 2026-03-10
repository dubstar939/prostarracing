export type CarModelType = 'speedster' | 'muscle' | 'tuner' | 'hyper' | 'gt';

export interface CarModel {
  id: CarModelType;
  name: string;
  description: string;
  color: string;
  baseStats: {
    maxSpeed: number;
    accel: number;
    handling: number;
  };
  visuals: {
    bodyWidth: number;
    bodyHeight: number;
    cabinWidth: number;
    cabinHeight: number;
    spoilerType: 'wing' | 'ducktail' | 'none';
  };
}

export const CAR_MODELS: Record<CarModelType, CarModel> = {
  speedster: {
    id: 'speedster',
    name: 'Red Muscle',
    description: 'Classic 1960s muscle car, red with silver racing stripes.',
    color: '#ef4444',
    baseStats: {
      maxSpeed: 16000,
      accel: 6200,
      handling: 0.8,
    },
    visuals: {
      bodyWidth: 1.25,
      bodyHeight: 0.6,
      cabinWidth: 0.7,
      cabinHeight: 0.35,
      spoilerType: 'ducktail',
    }
  },
  muscle: {
    id: 'muscle',
    name: 'Silver Muscle',
    description: 'Powerful silver muscle car with a classic silhouette.',
    color: '#94a3b8',
    baseStats: {
      maxSpeed: 15500,
      accel: 6800,
      handling: 0.75,
    },
    visuals: {
      bodyWidth: 1.25,
      bodyHeight: 0.65,
      cabinWidth: 0.75,
      cabinHeight: 0.3,
      spoilerType: 'ducktail',
    }
  },
  tuner: {
    id: 'tuner',
    name: 'Blue Supercar',
    description: 'Modern blue supercar inspired by the Audi R8.',
    color: '#3b82f6',
    baseStats: {
      maxSpeed: 18000,
      accel: 5800,
      handling: 1.35,
    },
    visuals: {
      bodyWidth: 1.15,
      bodyHeight: 0.5,
      cabinWidth: 0.6,
      cabinHeight: 0.45,
      spoilerType: 'wing',
    }
  },
  hyper: {
    id: 'hyper',
    name: 'Purple Phantom',
    description: 'Elite purple hypercar with balanced performance.',
    color: '#a855f7',
    baseStats: {
      maxSpeed: 17000,
      accel: 5500,
      handling: 1.1,
    },
    visuals: {
      bodyWidth: 1.15,
      bodyHeight: 0.5,
      cabinWidth: 0.6,
      cabinHeight: 0.4,
      spoilerType: 'wing',
    }
  },
  gt: {
    id: 'gt',
    name: 'Green Ghost',
    description: 'Sturdy green GT car with great stability.',
    color: '#22c55e',
    baseStats: {
      maxSpeed: 15000,
      accel: 5800,
      handling: 1.2,
    },
    visuals: {
      bodyWidth: 1.05,
      bodyHeight: 0.6,
      cabinWidth: 0.7,
      cabinHeight: 0.4,
      spoilerType: 'ducktail',
    }
  }
};

export type RaceMode = 'classic' | 'time-trial' | 'elimination' | 'drift';

export interface CarConfig {
  model: CarModelType;
  color: string;
  spoiler: 'none' | 'small' | 'large';
  rims: string;
  decal: 'none' | 'stripes' | 'racing-number';
  engine: number; // 1-5
  tires: number; // 1-5
  turbo: number; // 1-5
}

export const UPGRADE_COSTS = [0, 500, 1200, 2500, 5000]; // Cost for level 1, 2, 3, 4, 5
