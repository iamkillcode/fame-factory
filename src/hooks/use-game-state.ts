
'use client';

import type { Artist, GameState, Song, Album, ActiveEvent } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { ALL_GENDERS, ALL_GENRES, ALL_MUSIC_STYLES } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const initialArtistSkills = 5;
const initialArtistMoney = 1000;
const initialArtistReputation = 50;

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
  const [isLoaded, setIsLoaded] = useState(false); // Tracks if initial game state load (from Firestore or default) is complete
  const { currentUser, loading: authLoading } = useAuth();

  // Load game state from Firestore when user logs in or auth state changes
  useEffect(() => {
    if (authLoading) {
      setIsLoaded(false); // Ensure we show loading until auth is resolved
      return;
    }

    if (currentUser) {
      const userGameStateRef = doc(db, 'users', currentUser.uid, 'gameState');
      getDoc(userGameStateRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setGameState(docSnap.data() as GameState);
          } else {
            // No saved state, start fresh but keep user logged in
            setGameState({...initialGameState, artist: null}); // Ensure artist is null for new users
          }
        })
        .catch((error) => {
          console.error("Error fetching game state from Firestore:", error);
          setGameState({...initialGameState, artist: null});
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      // No user logged in, reset to initial state
      setGameState(initialGameState);
      setIsLoaded(true); // Consider loaded as there's no user data to fetch
    }
  }, [currentUser, authLoading]);

  // Save game state to Firestore whenever it changes and user is logged in
  useEffect(() => {
    if (currentUser && isLoaded && !authLoading) { // Only save if loaded, user exists, and auth isn't processing
      // Avoid saving during initial load before gameState is truly reflective of current user
      if (gameState !== initialGameState || gameState.artist !== null) { 
        const userGameStateRef = doc(db, 'users', currentUser.uid, 'gameState');
        setDoc(userGameStateRef, gameState, { merge: true }) // Use merge: true to avoid overwriting if not all fields are present
          .catch((error) => {
            console.error("Error saving game state to Firestore:", error);
          });
      }
    }
  }, [gameState, currentUser, isLoaded, authLoading]);

  const createArtist = useCallback((artistDetails: Omit<Artist, 'fame' | 'skills' | 'fanbase' | 'money' | 'reputation' | 'uid'>) => {
    if (!currentUser) {
      console.error("Cannot create artist: no user logged in.");
      return;
    }
    setGameState(prev => ({
      ...initialGameState, // Start from a clean slate except for user-specifics
      currentTurn: 1,
      artist: {
        ...artistDetails,
        uid: currentUser.uid, // Associate artist with the logged-in user
        fame: 0,
        skills: initialArtistSkills,
        fanbase: 0,
        money: initialArtistMoney,
        reputation: initialArtistReputation,
      },
      // Reset other game-specific arrays for a new artist profile under this user
      songs: [],
      albums: [],
      activeEvents: [],
      eventHistory: [],
    }));
  }, [currentUser]);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev.artist) return prev;
      
      let newMoney = prev.artist.money - 50; // Basic weekly expenses
      if (newMoney < 0) newMoney = 0; 

      let newFame = prev.artist.fame;
      if (prev.artist.fanbase > 1000 && prev.artist.fame > 10) {
        newFame += Math.floor(prev.artist.fanbase / 1000); 
      } else if (prev.artist.fame > 0) {
        newFame -=1; 
        if (newFame < 0) newFame = 0;
      }

      const updatedSongs = prev.songs.map(song => {
        if (song.isReleased && song.currentChartPosition && song.weeksOnChart !== undefined) {
          let newChartPos = song.currentChartPosition + Math.floor(Math.random() * 10 - 4); 
          if (newChartPos > 100 || newChartPos < 1 || song.weeksOnChart > 12) { 
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
        releaseTurn: 0, 
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

      const baseImpact = 10; 
      const skillBonus = prev.artist.skills / 10; 
      const fanReaction = Math.floor(Math.random() * 40 + 60); 
      const criticScore = Math.floor(Math.random() * 40 + 50); 
      
      const newFame = prev.artist.fame + Math.floor(baseImpact + skillBonus + (fanReaction / 20));
      const newFanbase = prev.artist.fanbase + Math.floor((fanReaction / 100) * (prev.artist.skills * 10) + Math.random() * 500);
      const newMoney = prev.artist.money + Math.floor(Math.random() * 1000 + (criticScore / 100 * 500));
      
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
          currentChartPosition: Math.floor(Math.random() * 70 + 30), 
          weeksOnChart: 0,
          peakChartPosition: 0, 
          sales: Math.floor(Math.random() * 5000 + 1000),
        } : s),
      };
    });
  }, []);


  const addAlbum = useCallback((album: Album) => { 
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
      switch (choiceIndex) {
        case 0: 
          newArtistState.fame += Math.floor(Math.random() * 10 + 5);
          newArtistState.reputation = Math.min(100, newArtistState.reputation + Math.floor(Math.random() * 5 + 2));
          newArtistState.money += Math.floor(Math.random() * 200 + 50);
          break;
        case 1: 
          newArtistState.fame += Math.floor(Math.random() * 5);
          newArtistState.reputation += Math.floor(Math.random() * 6 - 3); 
          break;
        case 2: 
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
    isLoaded // This reflects game state loading, auth state is in useAuth().loading
  };
}
