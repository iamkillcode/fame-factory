import { Artist } from '@/types';
import { TrainingActivity } from '@/config/training-activities';

export interface ArtistStats {
  energy: number;
  maxEnergy: number;
  skills: {
    vocals: number;
    performance: number;
    songwriting: number;
    production: number;
    social: number;
    business: number;
  };
  lastTrainingTime?: Date;
  activeTraining?: {
    activityId: string;
    startTime: Date;
    duration: number;
    completionTime: Date;
  };
  completedTrainings: {
    activityId: string;
    completedAt: Date;
  }[];
}

export const calculateTrainingResult = (
  activity: TrainingActivity,
  duration: 'short' | 'medium' | 'long',
  currentStats: ArtistStats
): {
  skillGain: number;
  energyCost: number;
  timeRequired: number;
  canPerform: boolean;
  reason?: string;
} => {
  const durationConfig = activity.durationOptions[duration];
  const skillGain = activity.baseSkillGain * durationConfig.multiplier;
  const energyCost = Math.floor(activity.energyCost * durationConfig.multiplier);
  
  // Check if artist can perform the activity
  if (currentStats.energy < energyCost) {
    return {
      skillGain: 0,
      energyCost,
      timeRequired: durationConfig.hours,
      canPerform: false,
      reason: 'Not enough energy'
    };
  }

  // Check cooldown
  const lastTraining = currentStats.completedTrainings.find(t => t.activityId === activity.id);
  if (lastTraining) {
    const hoursSinceLastTraining = (new Date().getTime() - new Date(lastTraining.completedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastTraining < activity.cooldownHours) {
      return {
        skillGain: 0,
        energyCost,
        timeRequired: durationConfig.hours,
        canPerform: false,
        reason: `Activity on cooldown for ${Math.ceil(activity.cooldownHours - hoursSinceLastTraining)} more hours`
      };
    }
  }

  return {
    skillGain,
    energyCost,
    timeRequired: durationConfig.hours,
    canPerform: true
  };
};

export const calculateEnergyRegeneration = (lastUpdate: Date): number => {
  const hoursSinceLastUpdate = (new Date().getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60);
  // Regenerate 5 energy per hour
  return Math.floor(hoursSinceLastUpdate * 5);
};

export const updateArtistStats = (
  artist: Artist,
  activity: TrainingActivity,
  duration: 'short' | 'medium' | 'long'
): Artist => {
  const stats = artist.stats as ArtistStats;
  const result = calculateTrainingResult(activity, duration, stats);
  
  if (!result.canPerform) {
    throw new Error(result.reason);
  }

  const currentTime = new Date();
  const completionTime = new Date(currentTime.getTime() + (result.timeRequired * 60 * 60 * 1000));

  return {
    ...artist,
    stats: {
      ...stats,
      energy: stats.energy - result.energyCost,
      activeTraining: {
        activityId: activity.id,
        startTime: currentTime,
        duration: result.timeRequired,
        completionTime
      }
    }
  };
};
