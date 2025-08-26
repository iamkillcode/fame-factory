'use client';

import { useState, useEffect } from 'react';
import { gameTimeManager } from '@/lib/game-time-manager';

export function useGameTime() {
  const [currentDate, setCurrentDate] = useState(gameTimeManager.getCurrentDate());

  useEffect(() => {
    // Initialize the game time manager
    gameTimeManager.initialize();

    // Subscribe to time updates
    const unsubscribe = gameTimeManager.subscribe((date) => {
      setCurrentDate(date);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return currentDate;
}
