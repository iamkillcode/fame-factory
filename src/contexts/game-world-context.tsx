'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { WORLD_CONFIG } from '@/config/world-config';
import { RECORD_LABELS } from '@/config/record-labels';
import { NPCArtist, addPlayerArtist, getArtistWorldRank, getArtistTier } from '@/config/artist-ecosystem';

type WorldAction = 
  | { type: 'UPDATE_WORLD' }
  | { type: 'ADD_PLAYER'; payload: NPCArtist };

const initialWorldState: WorldState = {
  currentDate: new Date(2024, 0, 1), // Start at January 1, 2024
  activeArtists: {
    players: 0,
    total: WORLD_CONFIG.musicIndustry.artists.established + 
           WORLD_CONFIG.musicIndustry.artists.midTier + 
           WORLD_CONFIG.musicIndustry.artists.emerging + 
           WORLD_CONFIG.musicIndustry.artists.amateur
  },
  musicIndustry: WORLD_CONFIG.musicIndustry,
  streamingStats: {
    dailyStreams: WORLD_CONFIG.musicIndustry.streaming.totalMonthlyStreams / 30,
    averageStreamingRate: WORLD_CONFIG.economy.streamingPayout
  }
};

function worldReducer(state: WorldState, action: WorldAction): WorldState {
  switch (action.type) {
    case 'UPDATE_WORLD':
      return {
        ...state,
        currentDate: new Date(state.currentDate.getTime() + 3600000), // Add 1 hour
        streamingStats: {
          ...state.streamingStats,
          dailyStreams: Math.floor(WORLD_CONFIG.musicIndustry.streaming.totalMonthlyStreams / 30 * 
            (1 + (Math.random() * 0.1 - 0.05))) // ±5% daily variation
        }
      };
    case 'ADD_PLAYER':
      return {
        ...state,
        activeArtists: {
          players: state.activeArtists.players + 1,
          total: state.activeArtists.total + 1
        }
      };
    default:
      return state;
  }
};

interface WorldState {
  currentDate: Date;
  activeArtists: {
    players: number;
    total: number;
  };
  musicIndustry: typeof WORLD_CONFIG.musicIndustry;
  streamingStats: {
    dailyStreams: number;
    averageStreamingRate: number;
  };
}

interface GameWorldContextType {
  worldState: WorldState;
  addNewPlayer: (artistData: any) => void;
  getArtistRanking: (fame: number) => number;
  getCurrentTier: (fame: number) => string;
  getAvailableLabels: (fame: number) => typeof RECORD_LABELS.major | typeof RECORD_LABELS.independent;
}

const GameWorldContext = createContext<GameWorldContextType | undefined>(undefined);

export function GameWorldProvider({ children }: { children: React.ReactNode }) {
  const [worldState, dispatch] = useReducer(worldReducer, initialWorldState);

  // Update world state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_WORLD' });
    }, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  const addNewPlayer = (artistData: any) => {
    const newArtist = addPlayerArtist(artistData);
    dispatch({ type: 'ADD_PLAYER', payload: newArtist });
  };

  const getArtistRanking = (fame: number) => {
    return getArtistWorldRank(fame);
  };

  const getCurrentTier = (fame: number) => {
    return getArtistTier(fame);
  };

  const getAvailableLabels = (fame: number) => {
    return fame >= 65 
      ? RECORD_LABELS.major.filter(label => fame >= label.minFameRequired)
      : RECORD_LABELS.independent.filter(label => fame >= label.minFameRequired);
  };

  return (
    <GameWorldContext.Provider value={{
      worldState,
      addNewPlayer,
      getArtistRanking,
      getCurrentTier,
      getAvailableLabels
    }}>
      {children}
    </GameWorldContext.Provider>
  );
}

export function useGameWorld() {
  const context = useContext(GameWorldContext);
  if (context === undefined) {
    throw new Error('useGameWorld must be used within a GameWorldProvider');
  }
  return context;
}
