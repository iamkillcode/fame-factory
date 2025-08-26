'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { TRAINING_ACTIVITIES } from '@/config/training-activities';
import { useTrainingSchedule } from '@/hooks/use-training-schedule';
import { useGameTime } from '@/hooks/use-game-time';

interface TrainingSchedulerProps {
  artist: any; // Replace with proper Artist type
  onScheduleUpdate: () => void;
}

export function TrainingScheduler({ artist, onScheduleUpdate }: TrainingSchedulerProps) {
  const currentGameTime = useGameTime();
  const { scheduleTraining, getUpcomingTrainings, cancelTraining } = useTrainingSchedule(artist.uid);
  const [selectedActivity, setSelectedActivity] = useState(TRAINING_ACTIVITIES[0]);
  const [selectedDuration, setSelectedDuration] = useState<'short' | 'medium' | 'long'>('short');
  const [selectedDate, setSelectedDate] = useState<Date>(currentGameTime);
  const [selectedHour, setSelectedHour] = useState<number>(currentGameTime.getHours());

  const upcomingTrainings = getUpcomingTrainings();

  const handleScheduleTraining = async () => {
    const scheduledTime = new Date(selectedDate);
    scheduledTime.setHours(selectedHour);
    
    await scheduleTraining(selectedActivity.id, selectedDuration, scheduledTime);
    onScheduleUpdate();
  };

  const availableHours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Schedule Training</h3>

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
                  disabled={activity.requiredFame ? artist.fame < activity.requiredFame : false}
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => date < currentGameTime}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hour</label>
          <Select
            onValueChange={(value) => setSelectedHour(parseInt(value))}
            defaultValue={selectedHour.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hour" />
            </SelectTrigger>
            <SelectContent>
              {availableHours.map((hour) => (
                <SelectItem key={hour} value={hour.toString()}>
                  {hour.toString().padStart(2, '0')}:00
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleScheduleTraining}
          className="w-full"
        >
          Schedule Training
        </Button>
      </div>

      {/* <div className="mt-6 space-y-6">
        {/* Timeline View */}
        {/* <Timeline 
          events={getTimelineEvents()}
          className="w-full"
        /> */}
      <div className="mt-6 space-y-6">

        {/* Queue View */}
        {upcomingTrainings.length > 0 && (
          <div>
            <h4 className="text-md font-semibold mb-3">Training Queue</h4>
            <div className="space-y-2">
              {upcomingTrainings.map((training, index) => {
                const activity = TRAINING_ACTIVITIES.find(a => a.id === training.activityId);
                if (!activity) return null;

                return (
                  <div 
                    key={training.id} 
                    className="flex justify-between items-center p-2 border rounded-md bg-card"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', training.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      const newOrder = [...upcomingTrainings];
                      const draggedIndex = newOrder.findIndex(t => t.id === draggedId);
                      const [draggedItem] = newOrder.splice(draggedIndex, 1);
                      newOrder.splice(index, 0, draggedItem);
                      // TODO: Implement queue reordering logic if needed
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">{index + 1}</div>
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(training.scheduledStartTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-move"
                      >
                        ⋮⋮
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelTraining(training.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
