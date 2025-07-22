
'use client';

import type { Artist, GameState, Song, Album, ActiveEvent, TrainingActivity, ProductionQuality, Genre, NPCArtist, NPCSong } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { ALL_GENDERS, ALL_GENRES, ALL_MUSIC_STYLES } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const initialArtistSkills = 5;
const initialArtistMoney = 1000;
const initialArtistReputation = 50;
const CHART_SIZE = 100; // Top 100 songs
const EARNING_PER_STREAM = 0.0005; // Example earning rate

export const AVAILABLE_TRAINING_ACTIVITIES: TrainingActivity[] = [
  { id: 'vocal_training', name: 'Vocal Training', description: 'Hone your singing skills.', cost: 150, effects: { skills: 2, reputation: 0.5 } },
  { id: 'songwriting_workshop', name: 'Songwriting Workshop', description: 'Improve your lyricism and composition.', cost: 200, effects: { skills: 3 } },
  { id: 'networking_event', name: 'Industry Networking', description: 'Meet influential people.', cost: 100, effects: { reputation: 2, fame: 1 } },
  { id: 'performance_rehearsal', name: 'Performance Rehearsal', description: 'Sharpen your stage presence.', cost: 120, effects: { skills: 1.5, fame: 0.5 } },
  { id: 'social_media_blitz', name: 'Social Media Blitz', description: 'Engage with fans online.', cost: 50, effects: { fame: 2, fanbase: 50 } },
  { id: 'rest_recover', name: 'Rest & Recover', description: 'Take a break to avoid burnout.', cost: 0, effects: { skills: 0.5, reputation: 0.2 } },
];

const NPC_ARTIST_POOL_DATA: { name: string, genre: Genre, popularity: number }[] = [
    { name: "Nova Wave", genre: "Electronic", popularity: 7 }, { name: "Rocky Stone", genre: "Rock", popularity: 6 },
    { name: "MC Flowmaster", genre: "Hip Hop", popularity: 8 }, { name: "Silky Smooth", genre: "R&B", popularity: 7 },
    { name: "Pop Princess", genre: "Pop", popularity: 9 }, { name: "Dusty Roads", genre: "Country", popularity: 5 },
    { name: "Smooth Jazzman", genre: "Jazz", popularity: 4 }, { name: "Blue Heart", genre: "Blues", popularity: 4 },
    { name: "K-Shine", genre: "K-Pop", popularity: 8 }, { name: "Indie Darling", genre: "Indie", popularity: 6 },
    { name: "Forest Folk", genre: "Folk", popularity: 5 }, { name: "Iron Maidenhead", genre: "Metal", popularity: 5 },
    { name: "Rap God Jr.", genre: "Rap", popularity: 9 }, { name: "Synth Dreamer", genre: "Electronic", popularity: 6 },
    { name: "Guitar Heroine", genre: "Rock", popularity: 7 }, { name: "Beat Poet", genre: "Hip Hop", popularity: 6 },
    { name: "Soul Sister", genre: "R&B", popularity: 7 }, { name: "Bubblegum Star", genre: "Pop", popularity: 8 },
    { name: "Neon Knight", genre: "Electronic", popularity: 7 }, { name: "Lyricist Supreme", genre: "Rap", popularity: 8 }
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
  npcArtists: [],
  npcSongs: [],
};

const generateInitialNPCSongs = (npcArtists: NPCArtist[], currentTurn: number): NPCSong[] => {
    const songs: NPCSong[] = [];
    const songTitlesBank = ["Echoes in Time", "Neon Nights", "City Dreams", "Lost Stars", "Velvet Moon", "Quantum Leap", "Silent Sirens", "Rebel Heart", "Midnight Drive", "Golden Hour", "Forgotten Melody", "Electric Pulse", "Cosmic Dance", "Urban Canvas", "Wildfire Soul", "Retrograde", "Future Shock", "Starlight Anthem", "Shadow Play", "Digital Ghost"];

    npcArtists.forEach(artist => {
        const numSongs = Math.floor(Math.random() * 2) + 1; // 1-2 songs per NPC initially
        for (let i = 0; i < numSongs; i++) {
            const titleIndex = Math.floor(Math.random() * songTitlesBank.length);
            const title = `${songTitlesBank[titleIndex]} ${i > 0 ? (i+1) : ''}`.trim();
            songs.push({
                id: `npcsong-${artist.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                title: title,
                artistId: artist.id,
                artistName: artist.name,
                genre: artist.genre,
                chartScore: Math.floor(Math.random() * 300 * (artist.popularity / 5)) + (200 * (artist.popularity / 5)), // Initial score based on popularity
                weeksOnChart: Math.floor(Math.random() * 10),
                releaseTurn: Math.max(1, currentTurn - Math.floor(Math.random() * 5)),
            });
        }
    });
    return songs;
};


export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

 useEffect(() => {
    if (authLoading) {
      setIsLoaded(false);
      return;
    }

    if (currentUser) {
      setIsLoaded(false);
      const userGameStateRef = doc(db, 'users', currentUser.uid);
      getDoc(userGameStateRef)
        .then((docSnap) => {
          let finalState: GameState;
          if (docSnap.exists()) {
            const loadedData = docSnap.data() as Partial<GameState>;
            
            let npcArtists = loadedData.npcArtists && loadedData.npcArtists.length > 0 
              ? loadedData.npcArtists.map(na => ({...na, popularity: na.popularity || 5})) // Ensure popularity exists
              : NPC_ARTIST_POOL_DATA.map((na, index) => ({ id: `npc-${index}`, ...na }));
            
            let npcSongs = loadedData.npcSongs && loadedData.npcSongs.length > 0 
              ? loadedData.npcSongs 
              : generateInitialNPCSongs(npcArtists, loadedData.currentTurn || 1);

            finalState = {
              ...initialGameState,
              ...loadedData,
              artist: loadedData.artist || null,
              songs: loadedData.songs ? loadedData.songs.map(s => ({
                ...s,
                genre: s.genre || ALL_GENRES[0],
                productionQuality: s.productionQuality || 'Low',
                productionInvestment: s.productionInvestment || 0,
                sales: s.sales || 0,
                weeklyStreams: s.weeklyStreams || 0,
                totalEarnings: s.totalEarnings || 0,
              })) : [],
              albums: loadedData.albums || [],
              activeEvents: loadedData.activeEvents || [],
              eventHistory: loadedData.eventHistory || [],
              currentTurn: loadedData.currentTurn || 1,
              npcArtists: npcArtists,
              npcSongs: npcSongs,
              availableMusicStyles: loadedData.availableMusicStyles || initialGameState.availableMusicStyles,
              availableGenres: loadedData.availableGenres || initialGameState.availableGenres,
              availableGenders: loadedData.availableGenders || initialGameState.availableGenders,
              lyricThemes: loadedData.lyricThemes || initialGameState.lyricThemes,
            };
          } else {
            // New user, set up a fresh state with NPCs
            const initialNpcArtists = NPC_ARTIST_POOL_DATA.map((na, index) => ({ id: `npc-${index}`, ...na }));
            const initialNpcSongs = generateInitialNPCSongs(initialNpcArtists, 1);
            finalState = {
              ...initialGameState,
              artist: null, // No artist yet
              currentTurn: 1,
              npcArtists: initialNpcArtists,
              npcSongs: initialNpcSongs,
            };
          }
          setGameState(finalState);
        })
        .catch((error) => {
          console.error("Error fetching game state from Firestore:", error);
          toast({
            title: "Load Error",
            description: "Could not load your game progress. Starting fresh or try refreshing.",
            variant: "destructive",
          });
          // Fallback to a clean initial state, even on error
          const fallbackNpcArtists = NPC_ARTIST_POOL_DATA.map((na, index) => ({ id: `npc-${index}`, ...na }));
          const fallbackNpcSongs = generateInitialNPCSongs(fallbackNpcArtists, 1);
          setGameState({
              ...initialGameState,
              artist: null,
              npcArtists: fallbackNpcArtists,
              npcSongs: fallbackNpcSongs,
          });
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      // Not logged in, use a clean initial state
      const initialNpcArtists = gameState.npcArtists.length > 0 ? gameState.npcArtists : NPC_ARTIST_POOL_DATA.map((na, index) => ({ id: `npc-${index}`, ...na }));
      const initialNpcSongs = gameState.npcSongs.length > 0 ? gameState.npcSongs : generateInitialNPCSongs(initialNpcArtists, 1);
      setGameState({
        ...initialGameState,
        npcArtists: initialNpcArtists,
        npcSongs: initialNpcSongs,
      });
      setIsLoaded(true);
    }
  }, [currentUser, authLoading]); // Dependency array is crucial here to prevent loops


  useEffect(() => {
    if (currentUser && isLoaded && !authLoading && gameState.artist) {
      const userGameStateRef = doc(db, 'users', currentUser.uid);
      setDoc(userGameStateRef, gameState, { merge: true })
        .catch((error) => {
          console.error("Error saving game state to Firestore:", error);
          toast({
            title: "Save Error",
            description: "There was a problem saving your game progress. Please check your connection.",
            variant: "destructive",
          });
        });
    }
  }, [gameState, currentUser, isLoaded, authLoading, toast]);

  const createArtist = useCallback((artistDetails: Omit<Artist, 'fame' | 'skills' | 'fanbase' | 'money' | 'reputation' | 'uid'>) => {
    if (!currentUser) {
      console.error("Cannot create artist: no user logged in.");
      toast({ title: "Not Logged In", description: "You must be logged in to create an artist.", variant: "destructive" });
      return;
    }
    const initialNpcArtists = NPC_ARTIST_POOL_DATA.map((na, index) => ({ id: `npc-${index}`, ...na }));
    const initialNpcSongs = generateInitialNPCSongs(initialNpcArtists, 1);

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
      npcArtists: initialNpcArtists,
      npcSongs: initialNpcSongs,
    }));
  }, [currentUser, toast]);
  
  const performActivity = useCallback((activity: TrainingActivity) => {
    setGameState(prev => {
        if (!prev.artist || prev.artist.money < activity.cost) {
            toast({
                title: "Cannot perform activity",
                description: `You need $${activity.cost} for ${activity.name}. You only have $${prev.artist.money}.`,
                variant: "destructive",
            });
            return prev;
        }

        const newArtistState = { ...prev.artist };
        newArtistState.money -= activity.cost;
        if (activity.effects.skills) newArtistState.skills = Math.min(100, Math.max(0, newArtistState.skills + activity.effects.skills));
        if (activity.effects.reputation) newArtistState.reputation = Math.min(100, Math.max(0, newArtistState.reputation + activity.effects.reputation));
        if (activity.effects.fame) newArtistState.fame = Math.max(0, newArtistState.fame + activity.effects.fame);
        if (activity.effects.money) newArtistState.money += activity.effects.money;
        if (activity.effects.fanbase) newArtistState.fanbase = Math.max(0, newArtistState.fanbase + activity.effects.fanbase);
        
        toast({
            title: "Activity Completed!",
            description: `You spent $${activity.cost} on ${activity.name}.`,
        });

        return {
            ...prev,
            artist: newArtistState,
        };
    });
}, [toast]);

  const addSong = useCallback((song: Omit<Song, 'id' | 'isReleased' | 'releaseTurn' | 'productionQuality' | 'productionInvestment' | 'chartScore' | 'sales' | 'weeklyStreams' | 'totalEarnings'>) => {
    setGameState(prev => {
      const newSong: Song = {
        ...song,
        id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isReleased: false,
        releaseTurn: 0,
        productionQuality: 'Low',
        productionInvestment: 0,
        chartScore: 0,
        sales: 0,
        weeklyStreams: 0,
        totalEarnings: 0,
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
        cost = 500;
        targetQuality = 'Medium';
      } else if (qualityLevel === 'High' && (song.productionQuality === 'Low' || song.productionQuality === 'Medium')) {
        cost = song.productionQuality === 'Low' ? 2000 : 1500;
        targetQuality = 'High';
      } else {
        return prev;
      }

      if (prev.artist.money < cost) return prev;

      const updatedSong = {
        ...song,
        productionQuality: targetQuality,
        productionInvestment: (song.productionInvestment || 0) + cost,
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

      let fanReaction = Math.floor(Math.random() * 30 + 50 * qualityMultiplier);
      fanReaction = Math.min(100, Math.max(0, fanReaction));
      let criticScore = Math.floor(Math.random() * 30 + 40 * qualityMultiplier);
      criticScore = Math.min(100, Math.max(0, criticScore));

      const newFame = prev.artist.fame + Math.floor((baseImpact + skillBonus + (fanReaction / 20)) * qualityMultiplier);
      const newFanbase = prev.artist.fanbase + Math.floor(((fanReaction / 100) * (prev.artist.skills * 10) + Math.random() * 500) * qualityMultiplier);
      
      const initialSalesGenerated = Math.floor((Math.random() * 5000 + 1000 + (prev.artist.fanbase / 10)) * qualityMultiplier);
      const initialEarnings = Math.floor(initialSalesGenerated * EARNING_PER_STREAM);
      const newMoney = prev.artist.money + initialEarnings;


      let initialChartScore = (fanReaction * 2) + (criticScore * 3) + (prev.artist.fame / 10) + (prev.artist.skills * 1.5);
      initialChartScore *= qualityMultiplier;
      initialChartScore = Math.floor(initialChartScore + (Math.random() * 100)); 
      initialChartScore = Math.max(50, Math.min(1000, initialChartScore)); 

      return {
        ...prev,
        artist: {
          ...prev.artist,
          fame: Math.max(0, newFame),
          fanbase: Math.max(0, newFanbase),
          money: Math.max(0, newMoney),
        },
        songs: prev.songs.map(s => s.id === songId ? {
          ...s,
          isReleased: true,
          releaseTurn: prev.currentTurn,
          fanReaction,
          criticScore,
          sales: (s.sales || 0) + initialSalesGenerated,
          weeklyStreams: initialSalesGenerated, // First week's streams are the initial sales
          totalEarnings: (s.totalEarnings || 0) + initialEarnings,
          chartScore: initialChartScore, 
          weeksOnChart: 0, 
          currentChartPosition: null, 
          peakChartPosition: null, 
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
          newArtistState.reputation += Math.floor(Math.random() * 6 - 3); // Can be positive or negative
          break;
        case 2:
          newArtistState.fame -= Math.floor(Math.random() * 5);
          if (newArtistState.fame < 0) newArtistState.fame = 0;
          newArtistState.reputation = Math.max(0, newArtistState.reputation - Math.floor(Math.random() * 5 + 2));
          newArtistState.money -= Math.floor(Math.random() * 100 + 20);
          if (newArtistState.money < 0) newArtistState.money = 0;
          break;
      }
      newArtistState.fame = Math.max(0, newArtistState.fame);
      newArtistState.reputation = Math.max(0, Math.min(100, newArtistState.reputation));
      newArtistState.money = Math.max(0, newArtistState.money);

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
          fame: Math.max(0, (prev.artist.fame || 0) + (statsDelta.fame || 0)),
          skills: Math.max(0, Math.min(100, (prev.artist.skills || 0) + (statsDelta.skills || 0))),
          fanbase: Math.max(0, (prev.artist.fanbase || 0) + (statsDelta.fanbase || 0)),
          money: Math.max(0, (prev.artist.money || 0) + (statsDelta.money || 0)),
          reputation: Math.max(0, Math.min(100, (prev.artist.reputation || 0) + (statsDelta.reputation || 0))),
        }
      };
    });
  }, []);

  return {
    gameState,
    createArtist,
    addSong,
    updateSong,
    releaseSong,
    addAlbum,
    addActiveEvent,
    resolveActiveEvent,
    updateArtistStats,
    isLoaded,
    performActivity,
    investInSongProduction,
  };
}
