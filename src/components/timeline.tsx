'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { TRAINING_ACTIVITIES } from '@/config/training-activities';
import { useGameTime } from '@/hooks/use-game-time';
import { 
  Dumbbell, 
  Mic2, 
  Music2, 
  Users, 
  Brain, 
  BookOpen,
  Clock
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const activityIcons: Record<string, React.ElementType> = {
  'vocal-training': Mic2,
  'stage-presence': Users,
  'songwriting-session': Music2,
  'studio-time': Dumbbell,
  'social-media-workshop': Brain,
  'business-mentoring': BookOpen,
};

export function Timeline({ events, className }: TimelineProps) {
  const currentGameTime = useGameTime();
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Calculate timeline scale
  const now = currentGameTime.getTime();
  const timelineStart = Math.min(
    now,
    ...events.map(e => new Date(e.startTime).getTime())
  );
  const timelineEnd = Math.max(
    now + (24 * 60 * 60 * 1000), // At least 24 hours ahead
    ...events.map(e => new Date(e.endTime).getTime())
  );
  const timelineRange = timelineEnd - timelineStart;

  const getEventPosition = (time: number): string => {
    const position = ((time - timelineStart) / timelineRange) * 100;
    return `${Math.max(0, Math.min(100, position))}%`;
  };

  const getEventWidth = (start: number, end: number): string => {
    const width = ((end - start) / timelineRange) * 100;
    return `${Math.max(0.5, Math.min(100, width))}%`;
  };

  const getEventColor = (status: string): string => {
    switch (status) {
      case 'in-progress':
        return 'bg-purple-600 border-purple-400';
      case 'completed':
        return 'bg-green-600 border-green-400';
      case 'cancelled':
        return 'bg-red-600 border-red-400';
      default:
        return 'bg-blue-600 border-blue-400';
    }
  };

  const TimeMarkers = () => {
    const hours = Math.ceil(timelineRange / (60 * 60 * 1000));
    const markers = Array.from({ length: hours }, (_, i) => {
      const markerTime = new Date(timelineStart + (i * 60 * 60 * 1000));
      const position = getEventPosition(markerTime.getTime());
      
      return (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-600"
          style={{ left: position }}
        >
          <div className="text-xs text-gray-400 -ml-4 mt-1">
            {markerTime.getHours()}:00
          </div>
        </div>
      );
    });

    return <div className="absolute inset-0">{markers}</div>;
  };

  const NowIndicator = () => (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
      style={{ left: getEventPosition(now) }}
    >
      <div className="bg-red-500 text-white text-xs px-1 rounded-sm -ml-4">
        Now
      </div>
    </div>
  );

  return (
    <Card className={cn("p-4", className)}>
      <h3 className="text-lg font-semibold mb-4">Training Timeline</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="relative min-h-[200px]">
          <TimeMarkers />
          <NowIndicator />
          
          <div className="space-y-2">
            {sortedEvents.map((event, index) => {
              const IconComponent = activityIcons[event.type] || Clock;
              const startPos = getEventPosition(new Date(event.startTime).getTime());
              const width = getEventWidth(
                new Date(event.startTime).getTime(),
                new Date(event.endTime).getTime()
              );

              return (
                <div key={event.id} className="relative h-12">
                  <div
                    className={cn(
                      "absolute h-8 rounded-md border-2 transition-all",
                      getEventColor(event.status)
                    )}
                    style={{
                      left: startPos,
                      width: width,
                    }}
                  >
                    <div className="flex items-center h-full px-2 space-x-2 overflow-hidden">
                      <IconComponent className="h-4 w-4 text-white flex-shrink-0" />
                      <div className="truncate text-sm text-white">
                        {event.title}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
