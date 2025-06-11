
'use client';

import type { Artist, GameState, Song, Album, ActiveEvent, MusicStyle, Genre, Gender } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { ALL_GENDERS, ALL_GENRES, ALL_MUSIC_STYLES } from '@/types';

const LOCAL_STORAGE_KEY = 'fameFactoryGameState_v1'; // Added versioning

const initialArtistSkills = 5; // Start low, player needs to improve
const initialArtistMoney = 1000;
const initialArtistReputation = 50; // Neutral start

export const initialGameState: GameState = {
  artist: null,
  songs: [],
  albums: [],
  currentTurn: 1,
  activeEvents: [],
  eventHistory: [],
  lyricThemes: ['Heartbreak', 'Success', 'Betrayal', 'Celebration', 'Reflection', 'Dreams', 'Nightlife', 'Social Justice'],
  availableMusicStyles: ALL_MUSIC_STYLES,
  availableGenres: ALL_GENRES,
  availableGenders: ALL_GENDERS,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          // Basic validation or migration could happen here if versions change
          setGameState(parsedState);
        } catch (error) {
          console.error("Failed to parse game state from localStorage", error);
          localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted state
          setGameState(initialGameState);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

  const createArtist = useCallback((artistDetails: Omit<Artist, 'fame' | 'skills' | 'fanbase' | 'money' | 'reputation'>) => {
    setGameState(prev => ({
      ...initialGameState, // Reset most of the state for a new game
      artist: {
        ...artistDetails,
        fame: 0,
        skills: initialArtistSkills,
        fanbase: 0,
        money: initialArtistMoney,
        reputation: initialArtistReputation,
      },
    }));
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev.artist) return prev;
      // Example: living costs
      let newMoney = prev.artist.money - 50;
      if (newMoney < 0) newMoney = 0; // Cannot have negative money from living costs

      // Example: Small passive fame/fanbase changes (can be more complex)
      let newFame = prev.artist.fame;
      if (prev.artist.fanbase > 1000 && prev.artist.fame > 10) {
        newFame += Math.floor(prev.artist.fanbase / 1000); // Small fame boost from existing fans
      } else if (prev.artist.fame > 0) {
        newFame -=1; // Slight fame decay if inactive
        if (newFame < 0) newFame = 0;
      }

      // Update song/album chart positions (simplified)
      const updatedSongs = prev.songs.map(song => {
        if (song.isReleased && song.currentChartPosition && song.weeksOnChart !== undefined) {
          let newChartPos = song.currentChartPosition + Math.floor(Math.random() * 10 - 4); // Fluctuate
          if (newChartPos > 100 || newChartPos < 1 || song.weeksOnChart > 12) { // Fall off chart
            return { ...song, currentChartPosition: null, weeksOnChart: song.weeksOnChart + 1 };
          }
          return { ...song, currentChartPosition: newChartPos, weeksOnChart: song.weeksOnChart + 1 };
        }
        return song;
      });

      return {
        ...prev,
        currentTurn: prev.currentTurn + 1,
        artist: {
          ...prev.artist,
          money: newMoney,
          fame: newFame,
        },
        songs: updatedSongs,
      };
    });
  }, []);

  const addSong = useCallback((song: Omit<Song, 'id' | 'isReleased' | 'releaseTurn'>) => {
    setGameState(prev => {
      const newSong: Song = {
        ...song,
        id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isReleased: false,
        releaseTurn: 0, // Set upon release
      };
      return {
        ...prev,
        songs: [...prev.songs, newSong],
      };
    });
  }, []);
  
  const updateSong = useCallback((updatedSong: Song) => {
    setGameState(prev => ({
      ...prev,
      songs: prev.songs.map(s => s.id === updatedSong.id ? updatedSong : s),
    }));
  }, []);

  const releaseSong = useCallback((songId: string) => {
    setGameState(prev => {
      if (!prev.artist) return prev;
      const songToRelease = prev.songs.find(s => s.id === songId);
      if (!songToRelease) return prev;

      // Simulate release impact
      const baseImpact = 10; // Base impact for releasing a song
      const skillBonus = prev.artist.skills / 10; // Better skills, better impact
      const fanReaction = Math.floor(Math.random() * 40 + 60); // 60-100
      const criticScore = Math.floor(Math.random() * 40 + 50); // 50-90
      
      const newFame = prev.artist.fame + Math.floor(baseImpact + skillBonus + (fanReaction / 20));
      const newFanbase = prev.artist.fanbase + Math.floor((fanReaction / 100) * (prev.artist.skills * 10) + Math.random() * 500);
      const newMoney = prev.artist.money + Math.floor((Math.random() * 1000) + (criticScore / 100 * 500)); // Simplified income
      
      return {
        ...prev,
        artist: {
          ...prev.artist,
          fame: newFame,
          fanbase: newFanbase,
          money: newMoney,
        },
        songs: prev.songs.map(s => s.id === songId ? {
          ...s,
          isReleased: true,
          releaseTurn: prev.currentTurn,
          fanReaction,
          criticScore,
          currentChartPosition: Math.floor(Math.random() * 70 + 30), // Initial chart position 30-100
          weeksOnChart: 0,
          peakChartPosition: 0, // Will be updated
          sales: Math.floor(Math.random() * 5000 + 1000),
        } : s),
      };
    });
  }, []);


  const addAlbum = useCallback((album: Album) => { // Should be Omit<Album, 'id' | 'isReleased' | 'releaseTurn'>
    setGameState(prev => ({
      ...prev,
      albums: [...prev.albums, album],
    }));
  }, []);

  const addActiveEvent = useCallback((eventData: ActiveEvent) => {
     setGameState(prev => ({
      ...prev,
      activeEvents: [...prev.activeEvents, eventData],
    }));
  }, []);

  const resolveActiveEvent = useCallback((eventId: string, choiceIndex: number) => {
    setGameState(prev => {
      const eventToResolve = prev.activeEvents.find(e => e.id === eventId);
      if (!eventToResolve || !prev.artist) return prev;

      let newArtistState = { ...prev.artist };
      // Simplified outcomes - these would be specific to event types in a full game
      switch (choiceIndex) {
        case 0: // Generally positive
          newArtistState.fame += Math.floor(Math.random() * 10 + 5);
          newArtistState.reputation = Math.min(100, newArtistState.reputation + Math.floor(Math.random() * 5 + 2));
          newArtistState.money += Math.floor(Math.random() * 200 + 50);
          break;
        case 1: // Neutral or mixed
          newArtistState.fame += Math.floor(Math.random() * 5);
          newArtistState.reputation += Math.floor(Math.random() * 6 - 3); // Can go up or down
          break;
        case 2: // Generally negative
          newArtistState.fame -= Math.floor(Math.random() * 5);
          if (newArtistState.fame < 0) newArtistState.fame = 0;
          newArtistState.reputation = Math.max(0, newArtistState.reputation - Math.floor(Math.random() * 5 + 2));
          newArtistState.money -= Math.floor(Math.random() * 100 + 20);
          if (newArtistState.money < 0) newArtistState.money = 0;
          break;
      }
      newArtistState.reputation = Math.max(0, Math.min(100, newArtistState.reputation));


      const resolvedEvent: ActiveEvent = { ...eventToResolve, resolved: true, chosenOption: choiceIndex };
      
      return {
        ...prev,
        artist: newArtistState,
        activeEvents: prev.activeEvents.filter(e => e.id !== eventId),
        eventHistory: [...prev.eventHistory, resolvedEvent],
      };
    });
  }, []);
  
  const updateArtistStats = useCallback((statsDelta: Partial<Artist>) => {
    setGameState(prev => {
      if (!prev.artist) return prev;
      return {
        ...prev,
        artist: {
          ...prev.artist,
          fame: Math.max(0, prev.artist.fame + (statsDelta.fame || 0)),
          skills: Math.max(0, Math.min(100, prev.artist.skills + (statsDelta.skills || 0))),
          fanbase: Math.max(0, prev.artist.fanbase + (statsDelta.fanbase || 0)),
          money: Math.max(0, prev.artist.money + (statsDelta.money || 0)),
          reputation: Math.max(0, Math.min(100, prev.artist.reputation + (statsDelta.reputation || 0))),
        }
      };
    });
  }, []);

  return { 
    gameState, 
    createArtist, 
    nextTurn, 
    addSong, 
    updateSong,
    releaseSong, 
    addAlbum, 
    addActiveEvent, 
    resolveActiveEvent, 
    updateArtistStats, 
    isLoaded 
  };
}

