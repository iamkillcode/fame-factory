import { WORLD_CONFIG } from './world-config';

export const RECORD_LABELS = {
  major: [
    {
      id: 'gl-1',
      name: 'Global Groove Records',
      marketShare: 32,
      subsidiaries: ['Star Power', 'Rhythm Republic', 'Future Sounds'],
      artistCapacity: 500,
      minFameRequired: 75,
      advanceRange: { min: 500000, max: 5000000 },
      royaltyRate: { min: 12, max: 18 }
    },
    {
      id: 'sm-1',
      name: 'SoundMatrix Entertainment',
      marketShare: 28,
      subsidiaries: ['Beat Brigade', 'Melody Masters', 'Urban Wave'],
      artistCapacity: 450,
      minFameRequired: 70,
      advanceRange: { min: 400000, max: 4000000 },
      royaltyRate: { min: 12, max: 16 }
    },
    {
      id: 'wm-1',
      name: 'WorldBeat Music Group',
      marketShare: 20,
      subsidiaries: ['Global Beats', 'Pulse Records', 'Echo Elite'],
      artistCapacity: 400,
      minFameRequired: 72,
      advanceRange: { min: 450000, max: 4500000 },
      royaltyRate: { min: 11, max: 17 }
    },
    {
      id: 'sr-1',
      name: 'Sonic Revolution Records',
      marketShare: 15,
      subsidiaries: ['Next Level', 'Bass Nation', 'Harmony Hub'],
      artistCapacity: 350,
      minFameRequired: 68,
      advanceRange: { min: 300000, max: 3500000 },
      royaltyRate: { min: 10, max: 15 }
    },
    {
      id: 'vm-1',
      name: 'Vibe Masters International',
      marketShare: 5,
      subsidiaries: ['Fresh Talent', 'Rhythm Labs', 'Digital Dynasty'],
      artistCapacity: 300,
      minFameRequired: 65,
      advanceRange: { min: 250000, max: 3000000 },
      royaltyRate: { min: 10, max: 15 }
    }
  ],
  independent: [
    {
      id: 'indie-nexus',
      name: 'Nexus Sounds',
      marketShare: 0.8,
      focus: ['Alternative', 'Indie Pop'],
      artistCapacity: 50,
      minFameRequired: 35,
      advanceRange: { min: 10000, max: 100000 },
      royaltyRate: { min: 15, max: 25 }
    },
    {
      id: 'indie-pulse',
      name: 'Pulse Wave Records',
      marketShare: 0.6,
      focus: ['Electronic', 'Dance'],
      artistCapacity: 40,
      minFameRequired: 30,
      advanceRange: { min: 8000, max: 80000 },
      royaltyRate: { min: 20, max: 30 }
    }
    // More indie labels can be dynamically generated based on demand
  ]
};
