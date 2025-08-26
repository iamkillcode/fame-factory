import { WORLD_CONFIG } from './world-config';

export type ArtistTier = 'legend' | 'superstar' | 'established' | 'rising' | 'indie' | 'new';

export interface NPCArtist {
  id: string;
  name: string;
  genre: string[];
  tier: ArtistTier;
  fame: number;
  monthlyListeners: number;
  labelId?: string;
  yearStarted: number;
  isPlayer?: boolean;
}

// Function to generate a pool of NPC artists
export function generateNPCArtists(count: number, tier: ArtistTier): NPCArtist[] {
  // Implementation will dynamically generate artists based on tier
  // This is just a placeholder structure
  return [];
}

// Function to add a new player artist to the ecosystem
export function addPlayerArtist(artistData: Omit<NPCArtist, 'tier' | 'fame' | 'monthlyListeners'>) {
  const newArtist: NPCArtist = {
    ...artistData,
    tier: 'new',
    fame: 1,
    monthlyListeners: 0,
    isPlayer: true
  };
  
  // Update the world stats
  WORLD_CONFIG.musicIndustry.artists.players++;
  
  return newArtist;
}

// Function to get artist rank in the world
export function getArtistWorldRank(fame: number): number {
  const totalArtists = 
    WORLD_CONFIG.musicIndustry.artists.established +
    WORLD_CONFIG.musicIndustry.artists.midTier +
    WORLD_CONFIG.musicIndustry.artists.emerging +
    WORLD_CONFIG.musicIndustry.artists.amateur +
    WORLD_CONFIG.musicIndustry.artists.players;
    
  // Calculate rank based on fame score
  return Math.floor((1 - (fame / 100)) * totalArtists);
}

// Function to determine artist tier based on fame
export function getArtistTier(fame: number): ArtistTier {
  if (fame >= 90) return 'legend';
  if (fame >= 75) return 'superstar';
  if (fame >= 60) return 'established';
  if (fame >= 40) return 'rising';
  if (fame >= 20) return 'indie';
  return 'new';
}
