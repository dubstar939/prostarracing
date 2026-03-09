export type CarModelType = 'apex' | 'zenith' | 'fury' | 'velocity' | 'phantom';

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
    spoilerType: 'wing' | 'ducktail' | 'none' | 'integrated';
    exhaustType: 'triple' | 'dual' | 'center';
    tailLightType: 'bar' | 'segments' | 'round';
  };
}

export const CAR_MODELS: Record<CarModelType, CarModel> = {
  apex: {
    id: 'apex',
    name: 'Apex Sian',
    description: 'A masterpiece of green engineering. High speed and sharp handling.',
    baseStats: {
      maxSpeed: 17000,
      accel: 5000,
      handling: 1.2,
    },
    visuals: {
      bodyWidth: 1.2,
      bodyHeight: 0.5,
      cabinWidth: 0.6,
      cabinHeight: 0.4,
      spoilerType: 'integrated',
      exhaustType: 'triple',
      tailLightType: 'bar',
    }
  },
  zenith: {
    id: 'zenith',
    name: 'Zenith Evija',
    description: 'The future of electric hypercars. Extreme top speed, wide stance.',
    baseStats: {
      maxSpeed: 19000,
      accel: 4000,
      handling: 0.9,
    },
    visuals: {
      bodyWidth: 1.3,
      bodyHeight: 0.5,
      cabinWidth: 0.7,
      cabinHeight: 0.3,
      spoilerType: 'none',
      exhaustType: 'center',
      tailLightType: 'segments',
    }
  },
  fury: {
    id: 'fury',
    name: 'Fury NSX',
    description: 'Precision balanced for the ultimate driving experience.',
    baseStats: {
      maxSpeed: 15500,
      accel: 5500,
      handling: 1.1,
    },
    visuals: {
      bodyWidth: 1.1,
      bodyHeight: 0.6,
      cabinWidth: 0.7,
      cabinHeight: 0.4,
      spoilerType: 'integrated',
      exhaustType: 'dual',
      tailLightType: 'bar',
    }
  },
  velocity: {
    id: 'velocity',
    name: 'Velocity Senna',
    description: 'Track-focused performance with massive downforce.',
    baseStats: {
      maxSpeed: 16500,
      accel: 6500,
      handling: 1.4,
    },
    visuals: {
      bodyWidth: 1.1,
      bodyHeight: 0.5,
      cabinWidth: 0.6,
      cabinHeight: 0.5,
      spoilerType: 'wing',
      exhaustType: 'triple',
      tailLightType: 'segments',
    }
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom i8',
    description: 'A hybrid ghost on the asphalt. Incredible acceleration.',
    baseStats: {
      maxSpeed: 14500,
      accel: 7500,
      handling: 1.0,
    },
    visuals: {
      bodyWidth: 1.0,
      bodyHeight: 0.6,
      cabinWidth: 0.6,
      cabinHeight: 0.5,
      spoilerType: 'integrated',
      exhaustType: 'dual',
      tailLightType: 'segments',
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
