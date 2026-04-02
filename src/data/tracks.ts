import { BIOMES } from '../constants/assets';

export interface Track {
  id: string;
  name: string;
  themeColor: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  length: string;
}

export const tracks: Track[] = Object.values(BIOMES).map(biome => ({
  id: biome.id,
  name: biome.name,
  themeColor: biome.palette.neon,
  description: biome.mood,
  difficulty: biome.id === 'neon_city' ? 'Beginner' : biome.id === 'cyber_industrial' ? 'Expert' : 'Intermediate',
  length: (Math.floor(Math.random() * 5) + 3) + 'km'
}));
