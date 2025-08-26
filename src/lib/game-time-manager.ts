import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface GameTimeState {
  currentDate: Date;
  lastUpdateTimestamp: number;
  timeScale: number; // How many game hours pass per real second
  isPaused: boolean;
}

class GameTimeManager {
  private static instance: GameTimeManager;
  private listeners: Set<(date: Date) => void> = new Set();
  private gameState: GameTimeState | null = null;
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    // Initialize with default values
    this.gameState = {
      currentDate: new Date(2024, 0, 1), // Start at January 1, 2024
      lastUpdateTimestamp: Date.now(),
      timeScale: 1, // 1 real second = 1 game hour
      isPaused: false
    };
  }

  public static getInstance(): GameTimeManager {
    if (!GameTimeManager.instance) {
      GameTimeManager.instance = new GameTimeManager();
    }
    return GameTimeManager.instance;
  }

  public async initialize() {
    try {
      // Set up real-time listener for game time state
      const timeStateRef = doc(db, 'system', 'timeState');
      
      this.unsubscribe = onSnapshot(timeStateRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GameTimeState;
          this.gameState = {
            ...data,
            currentDate: new Date(data.currentDate)
          };
          this.notifyListeners();
        } else {
          // Initialize the time state if it doesn't exist
          this.resetTimeState();
        }
      });

      // Start the time progression
      this.startTimeProgression();
    } catch (error) {
      console.error('Failed to initialize game time:', error);
    }
  }

  private async resetTimeState() {
    const timeStateRef = doc(db, 'system', 'timeState');
    await updateDoc(timeStateRef, {
      currentDate: new Date(2024, 0, 1).toISOString(),
      lastUpdateTimestamp: Date.now(),
      timeScale: 1,
      isPaused: false
    });
  }

  private startTimeProgression() {
    setInterval(async () => {
      if (!this.gameState || this.gameState.isPaused) return;

      const now = Date.now();
      const elapsedRealSeconds = (now - this.gameState.lastUpdateTimestamp) / 1000;
      const elapsedGameHours = elapsedRealSeconds * this.gameState.timeScale;

      const newDate = new Date(this.gameState.currentDate);
      newDate.setHours(newDate.getHours() + elapsedGameHours);

      await this.updateGameTime(newDate);
    }, 1000); // Update every second
  }

  private async updateGameTime(newDate: Date) {
    if (!this.gameState) return;

    const timeStateRef = doc(db, 'system', 'timeState');
    await updateDoc(timeStateRef, {
      currentDate: newDate.toISOString(),
      lastUpdateTimestamp: Date.now()
    });
  }

  public subscribe(callback: (date: Date) => void): () => void {
    this.listeners.add(callback);
    if (this.gameState) {
      callback(this.gameState.currentDate);
    }
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    if (!this.gameState) return;
    this.listeners.forEach(listener => listener(this.gameState!.currentDate));
  }

  public getCurrentDate(): Date {
    return this.gameState?.currentDate || new Date(2024, 0, 1);
  }

  public cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export const gameTimeManager = GameTimeManager.getInstance();
