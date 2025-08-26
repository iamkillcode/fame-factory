'use client';

import { useState, useEffect } from 'react';
import { trainingScheduler, ScheduledTraining } from '@/lib/training-scheduler';
import { TRAINING_ACTIVITIES } from '@/config/training-activities';
import { useGameTime } from './use-game-time';
import { useToast } from './use-toast';

export function useTrainingSchedule(artistId: string) {
  const [schedule, setSchedule] = useState<ScheduledTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentGameTime = useGameTime();
  const { toast } = useToast();

  // Load the artist's training schedule
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const artistSchedule = await trainingScheduler.getArtistSchedule(artistId);
        setSchedule(artistSchedule);
      } catch (error) {
        console.error('Failed to load training schedule:', error);
        toast({
          title: 'Error',
          description: 'Failed to load training schedule',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, [artistId, toast]);

  const scheduleTraining = async (
    activityId: string,
    duration: 'short' | 'medium' | 'long',
    startTime: Date
  ) => {
    try {
      const activity = TRAINING_ACTIVITIES.find(a => a.id === activityId);
      if (!activity) throw new Error('Activity not found');

      const newTraining = await trainingScheduler.scheduleTraining(
        artistId,
        activity,
        duration,
        startTime
      );

      setSchedule(prev => [...prev, newTraining]);
      
      toast({
        title: 'Training Scheduled',
        description: `${activity.name} scheduled for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`,
      });

      return newTraining;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const cancelTraining = async (trainingId: string) => {
    try {
      await trainingScheduler.cancelTraining(trainingId);
      setSchedule(prev => prev.filter(t => t.id !== trainingId));
      
      toast({
        title: 'Training Cancelled',
        description: 'The scheduled training has been cancelled',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getUpcomingTrainings = () => {
    return schedule.filter(training => 
      new Date(training.scheduledStartTime) > currentGameTime &&
      training.status === 'scheduled'
    ).sort((a, b) => 
      new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()
    );
  };

  const getCurrentTraining = () => {
    return schedule.find(training => 
      training.status === 'in-progress' ||
      (new Date(training.scheduledStartTime) <= currentGameTime &&
       new Date(training.scheduledEndTime) > currentGameTime)
    );
  };

  return {
    schedule,
    isLoading,
    scheduleTraining,
    cancelTraining,
    getUpcomingTrainings,
    getCurrentTraining,
  };
}
