'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { TRAINING_ACTIVITIES } from '@/config/training-activities';
import { calculateTrainingResult, updateArtistStats } from '@/lib/training-utils';
import { useToast } from '@/hooks/use-toast';

interface TrainingCardProps {
  artist: any; // Replace with proper Artist type
  onStartTraining: (updatedArtist: any) => void;
}

export function TrainingCard({ artist, onStartTraining }: TrainingCardProps) {
  const [selectedActivity, setSelectedActivity] = useState(TRAINING_ACTIVITIES[0]);
  const [selectedDuration, setSelectedDuration] = useState<'short' | 'medium' | 'long'>('short');
  const { toast } = useToast();

  const handleStartTraining = () => {
    try {
      const result = calculateTrainingResult(selectedActivity, selectedDuration, artist.stats);
      
      if (!result.canPerform) {
        toast({
          title: "Cannot Start Training",
          description: result.reason,
          variant: "destructive",
        });
        return;
      }

      if (artist.money < selectedActivity.moneyCost) {
        toast({
          title: "Insufficient Funds",
          description: `You need ${selectedActivity.moneyCost}$ for this training`,
          variant: "destructive",
        });
        return;
      }

      const updatedArtist = updateArtistStats(artist, selectedActivity, selectedDuration);
      onStartTraining(updatedArtist);

      toast({
        title: "Training Started",
        description: `You'll gain ${result.skillGain} ${selectedActivity.skillType} skill points in ${result.timeRequired} hours`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const activeTraining = artist.stats.activeTraining;
  const currentActivity = activeTraining 
    ? TRAINING_ACTIVITIES.find(a => a.id === activeTraining.activityId)
    : null;

  if (activeTraining && currentActivity) {
    const now = new Date().getTime();
    const completion = new Date(activeTraining.completionTime).getTime();
    const start = new Date(activeTraining.startTime).getTime();
    const progress = ((now - start) / (completion - start)) * 100;

    return (
      <Card className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Current Training</h3>
        <div className="space-y-2">
          <p>{currentActivity.name}</p>
          <Progress value={Math.min(progress, 100)} />
          <p className="text-sm text-muted-foreground">
            {progress >= 100 
              ? "Complete! Start a new training session." 
              : `${Math.floor((completion - now) / (1000 * 60 * 60))} hours remaining`}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Start Training</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Activity</label>
          <Select
            onValueChange={(value) => setSelectedActivity(
              TRAINING_ACTIVITIES.find(a => a.id === value) || TRAINING_ACTIVITIES[0]
            )}
            defaultValue={selectedActivity.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent>
              {TRAINING_ACTIVITIES.map((activity) => (
                <SelectItem
                  key={activity.id}
                  value={activity.id}
                  disabled={!!(activity.requiredFame && artist.fame < activity.requiredFame)}
                >
                  {activity.name} - ${activity.moneyCost}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duration</label>
          <Select
            onValueChange={(value) => setSelectedDuration(value as 'short' | 'medium' | 'long')}
            defaultValue={selectedDuration}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">
                Short ({selectedActivity.durationOptions.short.hours}h) - 
                Base Gain
              </SelectItem>
              <SelectItem value="medium">
                Medium ({selectedActivity.durationOptions.medium.hours}h) - 
                {selectedActivity.durationOptions.medium.multiplier}x Gain
              </SelectItem>
              <SelectItem value="long">
                Long ({selectedActivity.durationOptions.long.hours}h) - 
                {selectedActivity.durationOptions.long.multiplier}x Gain
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2">
          <Button 
            onClick={handleStartTraining}
            className="w-full"
            disabled={!!artist.stats.activeTraining}
          >
            Start Training
          </Button>
        </div>
      </div>
    </Card>
  );
}
