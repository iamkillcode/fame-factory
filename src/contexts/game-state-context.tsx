'use client';

import type { GameState, Artist, Song, Album, ActiveEvent } from '@/types';
import { useGameState, initialGameState } from '@/hooks/use-game-state';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

interface GameStateContextType {
  gameState: GameState;
  createArtist: (artistDetails: Omit<Artist, 'fame' | 'skills' | 'fanbase' | 'money' | 'reputation'>) => void;
  nextTurn: () => void;
  addSong: (song: Omit<Song, 'id' | 'isReleased' | 'releaseTurn'>) => void;
  updateSong: (updatedSong: Song) => void;
  releaseSong: (songId: string) => void;
  addAlbum: (album: Album) => void; // Consider Omit for new albums
  addActiveEvent: (event: ActiveEvent) => void;
  resolveActiveEvent: (eventId: string, choiceIndex: number) => void;
  updateArtistStats: (statsDelta: Partial<Artist>) => void;
  isLoaded: boolean;
}

const GameStateContext = createContext<GameStateContextType>({
  gameState: initialGameState,
  createArtist: () => { throw new Error('GameStateProvider not found') },
  nextTurn: () => { throw new Error('GameStateProvider not found') },
  addSong: () => { throw new Error('GameStateProvider not found') },
  updateSong: () => { throw new Error('GameStateProvider not found') },
  releaseSong: () => { throw new Error('GameStateProvider not found') },
  addAlbum: () => { throw new Error('GameStateProvider not found') },
  addActiveEvent: () => { throw new Error('GameStateProvider not found') },
  resolveActiveEvent: () => { throw new Error('GameStateProvider not found') },
  updateArtistStats: () => { throw new Error('GameStateProvider not found') },
  isLoaded: false,
});

export function GameStateProvider({ children }: { children: ReactNode }) {
  const gameStateHook = useGameState();
  return (
    <GameStateContext.Provider value={gameStateHook}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGame(): GameStateContextType {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameStateProvider');
  }
  return context;
}
