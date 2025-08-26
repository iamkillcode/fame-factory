'use client';

import { useState, useEffect } from 'react';
import { trainingQueue, QueuedTraining } from '@/lib/training-queue';
import { useGameTime } from './use-game-time';
import { useToast } from './use-toast';
import { TRAINING_ACTIVITIES } from '@/config/training-activities';

export function useTrainingQueueWithTimeline(artistId: string) {
  const [queuedTrainings, setQueuedTrainings] = useState<QueuedTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentGameTime = useGameTime();
  const { toast } = useToast();

  // Load and watch the queue
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const queue = await trainingQueue.getArtistQueue(artistId);
        setQueuedTrainings(queue);
      } catch (error) {
        console.error('Failed to load training queue:', error);
        toast({
          title: 'Error',
          description: 'Failed to load training queue',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQueue();
    // Set up periodic queue progress check
    const interval = setInterval(() => {
      trainingQueue.checkQueueProgress(artistId);
    }, 5000);

    return () => clearInterval(interval);
  }, [artistId, toast]);

  const addToQueue = async (
    activityId: string,
    duration: 'short' | 'medium' | 'long',
    startTime: Date
  ) => {
    try {
      const activity = TRAINING_ACTIVITIES.find(a => a.id === activityId);
      if (!activity) throw new Error('Activity not found');

      const endTime = new Date(startTime.getTime() + 
        (activity.durationOptions[duration].hours * 60 * 60 * 1000));

      const newTraining = await trainingQueue.addToQueue(artistId, {
        artistId,
        activityId,
        duration,
        scheduledStartTime: startTime,
        scheduledEndTime: endTime,
      });

      setQueuedTrainings(prev => [...prev, newTraining]);
      
      toast({
        title: 'Training Queued',
        description: `${activity.name} queued for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`,
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

  const removeFromQueue = async (trainingId: string) => {
    try {
      await trainingQueue.removeFromQueue(trainingId);
      setQueuedTrainings(prev => prev.filter(t => t.id !== trainingId));
      
      toast({
        title: 'Training Removed',
        description: 'The training has been removed from the queue',
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

  const reorderQueue = async (orderedTrainingIds: string[]) => {
    try {
      await trainingQueue.reorderQueue(artistId, orderedTrainingIds);
      
      // Reorder local state
      const newQueue = [...queuedTrainings];
      newQueue.sort((a, b) => 
        orderedTrainingIds.indexOf(a.id) - orderedTrainingIds.indexOf(b.id)
      );
      setQueuedTrainings(newQueue);

      toast({
        title: 'Queue Reordered',
        description: 'Training queue has been reordered successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getTimelineEvents = () => {
    return queuedTrainings.map(training => {
      const activity = TRAINING_ACTIVITIES.find(a => a.id === training.activityId);
      return {
        id: training.id,
        title: activity?.name || 'Unknown Activity',
        startTime: new Date(training.scheduledStartTime),
        endTime: new Date(training.scheduledEndTime),
        type: training.activityId,
        status: training.status
      };
    });
  };

  return {
    queuedTrainings,
    isLoading,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    getTimelineEvents,
  };
}
