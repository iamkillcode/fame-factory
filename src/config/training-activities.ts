import { WORLD_CONFIG } from './world-config';

export type SkillType = 'vocals' | 'performance' | 'songwriting' | 'production' | 'social' | 'business';

export interface TrainingActivity {
  id: string;
  name: string;
  description: string;
  skillType: SkillType;
  baseSkillGain: number;
  durationOptions: {
    short: { hours: number; multiplier: number };
    medium: { hours: number; multiplier: number };
    long: { hours: number; multiplier: number };
  };
  energyCost: number;
  moneyCost: number;
  cooldownHours: number;
  requiredFame?: number;
  unlockRequirements?: {
    minLevel?: number;
    skills?: Partial<Record<SkillType, number>>;
  };
}

export const TRAINING_ACTIVITIES: TrainingActivity[] = [
  {
    id: 'vocal-training',
    name: 'Vocal Training',
    description: 'Work with a vocal coach to improve your singing technique',
    skillType: 'vocals',
    baseSkillGain: 2,
    durationOptions: {
      short: { hours: 1, multiplier: 1 },
      medium: { hours: 3, multiplier: 2.5 },
      long: { hours: 6, multiplier: 4.5 }
    },
    energyCost: 15,
    moneyCost: 100,
    cooldownHours: 12
  },
  {
    id: 'stage-presence',
    name: 'Stage Presence Workshop',
    description: 'Learn to command the stage and engage with your audience',
    skillType: 'performance',
    baseSkillGain: 2,
    durationOptions: {
      short: { hours: 2, multiplier: 1 },
      medium: { hours: 4, multiplier: 2.2 },
      long: { hours: 8, multiplier: 4 }
    },
    energyCost: 20,
    moneyCost: 150,
    cooldownHours: 24
  },
  {
    id: 'songwriting-session',
    name: 'Songwriting Session',
    description: 'Develop your songwriting skills with professional writers',
    skillType: 'songwriting',
    baseSkillGain: 3,
    durationOptions: {
      short: { hours: 2, multiplier: 1 },
      medium: { hours: 4, multiplier: 2.3 },
      long: { hours: 6, multiplier: 3.8 }
    },
    energyCost: 25,
    moneyCost: 200,
    cooldownHours: 16
  },
  {
    id: 'studio-time',
    name: 'Studio Production',
    description: 'Learn music production techniques in a professional studio',
    skillType: 'production',
    baseSkillGain: 2,
    durationOptions: {
      short: { hours: 3, multiplier: 1 },
      medium: { hours: 6, multiplier: 2.4 },
      long: { hours: 12, multiplier: 4.2 }
    },
    energyCost: 30,
    moneyCost: 300,
    cooldownHours: 48
  },
  {
    id: 'social-media-workshop',
    name: 'Social Media Workshop',
    description: 'Master the art of social media engagement',
    skillType: 'social',
    baseSkillGain: 2,
    durationOptions: {
      short: { hours: 1, multiplier: 1 },
      medium: { hours: 2, multiplier: 2 },
      long: { hours: 4, multiplier: 3.5 }
    },
    energyCost: 10,
    moneyCost: 75,
    cooldownHours: 8
  },
  {
    id: 'business-mentoring',
    name: 'Industry Mentoring',
    description: 'Learn about the business side of music from industry veterans',
    skillType: 'business',
    baseSkillGain: 2,
    durationOptions: {
      short: { hours: 2, multiplier: 1 },
      medium: { hours: 4, multiplier: 2.2 },
      long: { hours: 8, multiplier: 4 }
    },
    energyCost: 20,
    moneyCost: 250,
    cooldownHours: 36,
    requiredFame: 20
  }
];
