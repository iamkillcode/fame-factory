
'use client';

import type { Artist, GameState, Song, Album, ActiveEvent, TrainingActivity, ProductionQuality } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { ALL_GENDERS, ALL_GENRES, ALL_MUSIC_STYLES } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const initialArtistSkills = 5;
const initialArtistMoney = 1000;
const initialArtistReputation = 50;

export const AVAILABLE_TRAINING_ACTIVITIES: TrainingActivity[] = [
  { id: 'vocal_training', name: 'Vocal Training', description: 'Hone your singing skills.', cost: 150, effects: { skills: 2, reputation: 0.5 } },
  { id: 'songwriting_workshop', name: 'Songwriting Workshop', description: 'Improve your lyricism and composition.', cost: 200, effects: { skills: 3 } },
  { id: 'networking_event', name: 'Industry Networking', description: 'Meet influential people.', cost: 100, effects: { reputation: 2, fame: 1 } },
  { id: 'performance_rehearsal', name: 'Performance Rehearsal', description: 'Sharpen your stage presence.', cost: 120, effects: { skills: 1.5, fame: 0.5 } },
  { id: 'social_media_blitz', name: 'Social Media Blitz', description: 'Engage with fans online.', cost: 50, effects: { fame: 2, fanbase: 50 } }, // Assuming fanbase effect is direct number
  { id: 'rest_recover', name: 'Rest & Recover', description: 'Take a break to avoid burnout.', cost: 0, effects: { skills: 0.5, reputation: 0.2 } }, // Small passive skill gain from being well-rested
];

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
  selectedActivityId: null,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      setIsLoaded(false);
      return;
    }
    if (currentUser) {
      const userGameStateRef = doc(db, 'users', currentUser.uid);
      getDoc(userGameStateRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const loadedData = docSnap.data() as GameState;
            // Ensure new fields have default values if not present in saved data
            setGameState({
              ...initialGameState, // Start with defaults
              ...loadedData,       // Override with loaded data
              selectedActivityId: loadedData.selectedActivityId || null, // Ensure this field exists
              songs: loadedData.songs ? loadedData.songs.map(s => ({ // Ensure songs have new production fields
                ...s,
                productionQuality: s.productionQuality || 'Low',
                productionInvestment: s.productionInvestment || 0,
              })) : [],
            });
          } else {
            setGameState({...initialGameState, artist: null, selectedActivityId: null});
          }
        })
        .catch((error) => {
          console.error("Error fetching game state from Firestore:", error);
          setGameState({...initialGameState, artist: null, selectedActivityId: null});
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      setGameState(initialGameState);
      setIsLoaded(true);
    }
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (currentUser && isLoaded && !authLoading) {
      if (gameState !== initialGameState || gameState.artist !== null) {
        const userGameStateRef = doc(db, 'users', currentUser.uid);
        setDoc(userGameStateRef, gameState, { merge: true })
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
      ...initialGameState,
      currentTurn: 1,
      artist: {
        ...artistDetails,
        uid: currentUser.uid,
        fame: 0,
        skills: initialArtistSkills,
        fanbase: 0,
        money: initialArtistMoney,
        reputation: initialArtistReputation,
      },
      songs: [],
      albums: [],
      activeEvents: [],
      eventHistory: [],
      selectedActivityId: null,
    }));
  }, [currentUser]);

  const selectWeeklyActivity = useCallback((activityId: string | null) => {
    setGameState(prev => ({
      ...prev,
      selectedActivityId: activityId,
    }));
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev.artist) return prev;
      
      let newArtistState = { ...prev.artist };
      let activityCost = 0;

      if (prev.selectedActivityId) {
        const activity = AVAILABLE_TRAINING_ACTIVITIES.find(act => act.id === prev.selectedActivityId);
        if (activity && newArtistState.money >= activity.cost) {
          activityCost = activity.cost;
          newArtistState.money -= activity.cost;
          if (activity.effects.skills) newArtistState.skills = Math.min(100, Math.max(0, newArtistState.skills + activity.effects.skills));
          if (activity.effects.reputation) newArtistState.reputation = Math.min(100, Math.max(0, newArtistState.reputation + activity.effects.reputation));
          if (activity.effects.fame) newArtistState.fame = Math.max(0, newArtistState.fame + activity.effects.fame);
          if (activity.effects.money) newArtistState.money += activity.effects.money; // Can be a gain
          // if (activity.effects.fanbase) newArtistState.fanbase += activity.effects.fanbase; // Add if fanbase can be directly affected like this
        }
      }

      newArtistState.money -= 50; // Basic weekly expenses
      if (newArtistState.money < 0) newArtistState.money = 0; 

      if (prev.artist.fanbase > 1000 && prev.artist.fame > 10) {
        newArtistState.fame += Math.floor(prev.artist.fanbase / 1000); 
      } else if (prev.artist.fame > 0) {
        newArtistState.fame -=1; 
        if (newArtistState.fame < 0) newArtistState.fame = 0;
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
        artist: newArtistState,
        songs: updatedSongs,
        selectedActivityId: null, // Reset selected activity for next turn
      };
    });
  }, []);

  const addSong = useCallback((song: Omit<Song, 'id' | 'isReleased' | 'releaseTurn' | 'productionQuality' | 'productionInvestment'>) => {
    setGameState(prev => {
      const newSong: Song = {
        ...song,
        id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isReleased: false,
        releaseTurn: 0,
        productionQuality: 'Low',
        productionInvestment: 0,
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

  const investInSongProduction = useCallback((songId: string, qualityLevel: 'Medium' | 'High') => {
    setGameState(prev => {
      if (!prev.artist) return prev;
      const songIndex = prev.songs.findIndex(s => s.id === songId);
      if (songIndex === -1) return prev;

      const song = prev.songs[songIndex];
      let cost = 0;
      let targetQuality: ProductionQuality = 'Low';

      if (qualityLevel === 'Medium' && song.productionQuality === 'Low') {
        cost = 500; // Cost to upgrade to Medium
        targetQuality = 'Medium';
      } else if (qualityLevel === 'High' && (song.productionQuality === 'Low' || song.productionQuality === 'Medium')) {
        cost = song.productionQuality === 'Low' ? 2000 : 1500; // Cost to upgrade to High (from Low or Medium)
        targetQuality = 'High';
      } else {
        return prev; // Already at or above this quality, or invalid request
      }

      if (prev.artist.money < cost) return prev; // Cannot afford

      const updatedSong = {
        ...song,
        productionQuality: targetQuality,
        productionInvestment: song.productionInvestment + cost,
      };
      const updatedSongs = [...prev.songs];
      updatedSongs[songIndex] = updatedSong;

      return {
        ...prev,
        artist: {
          ...prev.artist,
          money: prev.artist.money - cost,
        },
        songs: updatedSongs,
      };
    });
  }, []);

  const releaseSong = useCallback((songId: string) => {
    setGameState(prev => {
      if (!prev.artist) return prev;
      const songToRelease = prev.songs.find(s => s.id === songId);
      if (!songToRelease) return prev;

      let baseImpact = 10;
      let skillBonus = prev.artist.skills / 10;
      
      let qualityMultiplier = 1.0;
      if (songToRelease.productionQuality === 'Medium') qualityMultiplier = 1.2;
      if (songToRelease.productionQuality === 'High') qualityMultiplier = 1.5;

      let fanReaction = Math.floor(Math.random() * 30 + 50 * qualityMultiplier); // Base 50-80, boosted by quality
      fanReaction = Math.min(100, fanReaction);
      let criticScore = Math.floor(Math.random() * 30 + 40 * qualityMultiplier); // Base 40-70, boosted by quality
      criticScore = Math.min(100, criticScore);
      
      const newFame = prev.artist.fame + Math.floor((baseImpact + skillBonus + (fanReaction / 20)) * qualityMultiplier);
      const newFanbase = prev.artist.fanbase + Math.floor(((fanReaction / 100) * (prev.artist.skills * 10) + Math.random() * 500) * qualityMultiplier);
      const newMoney = prev.artist.money + Math.floor((Math.random() * 1000 + (criticScore / 100 * 500)) * qualityMultiplier);
      
      const initialSales = Math.floor((Math.random() * 5000 + 1000) * qualityMultiplier);

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
          currentChartPosition: Math.floor(Math.random() * (100 - (criticScore / 2)) + (criticScore / 5)), // Better scores = better initial chart
          weeksOnChart: 0,
          peakChartPosition: 0, 
          sales: initialSales,
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
    isLoaded,
    selectWeeklyActivity,
    investInSongProduction,
  };
}

