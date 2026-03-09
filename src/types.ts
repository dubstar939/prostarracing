export type CarModelType = 'speedster' | 'muscle' | 'tuner';

export interface CarModel {
  id: CarModelType;
  name: string;
  description: string;
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
    name: 'Aero-X',
    description: 'High top speed, but slower acceleration.',
    baseStats: {
      maxSpeed: 16000,
      accel: 4500,
      handling: 1.0,
    },
    visuals: {
      bodyWidth: 1.0,
      bodyHeight: 0.6,
      cabinWidth: 0.7,
      cabinHeight: 0.4,
      spoilerType: 'wing',
    }
  },
  muscle: {
    id: 'muscle',
    name: 'V8 Crusher',
    description: 'Incredible acceleration, lower top speed.',
    baseStats: {
      maxSpeed: 14000,
      accel: 6000,
      handling: 0.8,
    },
    visuals: {
      bodyWidth: 1.1,
      bodyHeight: 0.7,
      cabinWidth: 0.8,
      cabinHeight: 0.3,
      spoilerType: 'ducktail',
    }
  },
  tuner: {
    id: 'tuner',
    name: 'Drift King',
    description: 'Superior handling and balanced stats.',
    baseStats: {
      maxSpeed: 15000,
      accel: 5000,
      handling: 1.3,
    },
    visuals: {
      bodyWidth: 0.9,
      bodyHeight: 0.6,
      cabinWidth: 0.6,
      cabinHeight: 0.5,
      spoilerType: 'wing',
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
