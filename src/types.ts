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
    name: 'Red Fury',
    description: 'Classic red supercar with high top speed.',
    color: '#ef4444',
    baseStats: {
      maxSpeed: 16500,
      accel: 4800,
      handling: 1.0,
    },
    visuals: {
      bodyWidth: 1.1,
      bodyHeight: 0.55,
      cabinWidth: 0.7,
      cabinHeight: 0.35,
      spoilerType: 'wing',
    }
  },
  muscle: {
    id: 'muscle',
    name: 'Yellow Beast',
    description: 'Aggressive yellow supercar with massive acceleration.',
    color: '#facc15',
    baseStats: {
      maxSpeed: 14500,
      accel: 6500,
      handling: 0.85,
    },
    visuals: {
      bodyWidth: 1.2,
      bodyHeight: 0.65,
      cabinWidth: 0.75,
      cabinHeight: 0.3,
      spoilerType: 'ducktail',
    }
  },
  tuner: {
    id: 'tuner',
    name: 'Blue Storm',
    description: 'Sleek blue supercar with superior handling.',
    color: '#3b82f6',
    baseStats: {
      maxSpeed: 15500,
      accel: 5200,
      handling: 1.4,
    },
    visuals: {
      bodyWidth: 1.0,
      bodyHeight: 0.55,
      cabinWidth: 0.65,
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
