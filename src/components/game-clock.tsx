'use client';

import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Clock, Calendar } from 'lucide-react';

export function GameClock() {
  const [gameDate, setGameDate] = useState(new Date(2025, 7, 26)); // Starting from August 26, 2025
  const [isPaused, setIsPaused] = useState(false);

  // Update game time - 1 real second = 1 game hour
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setGameDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setHours(newDate.getHours() + 1);
        return newDate;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <Card className="p-4 flex items-center justify-between space-x-4 bg-purple-900/20 backdrop-blur-sm border-purple-500/30">
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-purple-400" />
        <span className="text-sm text-purple-100">
          {gameDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-purple-400" />
        <span className="text-sm text-purple-100">
          {gameDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </Card>
  );
}
