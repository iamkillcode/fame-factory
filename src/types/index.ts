
import type { User as FirebaseUser } from 'firebase/auth';

export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
export type Genre = 'Pop' | 'Rock' | 'Hip Hop' | 'R&B' | 'Electronic' | 'Country' | 'Jazz' | 'Blues' | 'K-Pop' | 'Indie' | 'Folk' | 'Metal' | 'Rap';
export type MusicStyle = 'Love' | 'Party' | 'Struggle' | 'Conscious' | 'Hype' | 'Chill' | 'Experimental';

export interface Artist {
  uid: string; // Firebase User ID
  name: string;
  gender: Gender;
  genre: Genre;
  backstory?: string; // Made optional
  fame: number; // 0-1000
  skills: number; // 0-100 (Overall skill level: vocals, songwriting, stage presence)
  fanbase: number; // Number of fans
  money: number; // In-game currency
  reputation: number; // 0-100 (Public perception)
}

export interface LyricSuggestion {
  id: string;
  text: string;
}

export interface GeneratedLyrics {
  beatSuggestion: string;
  lyricSuggestions: LyricSuggestion[]; // Typically 3 suggestions
}

export interface Song {
  id: string;
  title: string;
  theme: string; // e.g., Heartbreak, Success, Social Commentary
  style: MusicStyle;
  lyrics: string; // Finalized lyrics
  beat: string; // Beat description or identifier
  isReleased: boolean;
  releaseTurn: number; // Turn number when released
  weeksOnChart?: number;
  peakChartPosition?: number;
  currentChartPosition?: number | null; // Null if not charting
  sales?: number; // Units sold or streams
  fanReaction?: number; // 0-100, general sentiment
  criticScore?: number; // 0-100, reviews
}

export interface Album {
  id: string;
  title: string;
  type: 'Mixtape' | 'EP' | 'Album' | 'Single';
  songIds: string[]; // IDs of songs included in the album
  isReleased: boolean;
  releaseTurn: number;
  weeksOnChart?: number;
  peakChartPosition?: number;
  currentChartPosition?: number | null;
  sales?: number;
  fanReaction?: number;
  criticScore?: number;
}

// For AI generated event
export interface GeneratedEventData {
  eventDescription: string;
  choice1: string;
  choice2: string;
  choice3:string;
}

// For game state storage
export interface ActiveEvent extends GeneratedEventData {
  id: string;
  turnTriggered: number;
  resolved: boolean;
  chosenOption?: number; // 0, 1, or 2
}


export interface GameState {
  artist: Artist | null;
  songs: Song[]; // All created songs
  albums: Album[]; // All created albums/mixtapes
  currentTurn: number; // Represents weeks
  activeEvents: ActiveEvent[]; // Events needing player action
  eventHistory: ActiveEvent[]; // Resolved events
  lyricThemes: string[]; // User-selectable themes for Music Forge
  availableMusicStyles: MusicStyle[]; // Styles for Music Forge
  availableGenres: Genre[];
  availableGenders: Gender[];
}

export const ALL_GENRES: Genre[] = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Blues', 'K-Pop', 'Indie', 'Folk', 'Metal', 'Rap'];
export const ALL_GENDERS: Gender[] = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
export const ALL_MUSIC_STYLES: MusicStyle[] = ['Love', 'Party', 'Struggle', 'Conscious', 'Hype', 'Chill', 'Experimental'];


// Firebase Auth Types
export interface AuthProviderProps {
  children: React.ReactNode;
}

// This can be more specific if you know the structure of Firebase Auth errors
export interface AuthError extends Error {
  code?: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials extends SignUpCredentials {}


export interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  authError: AuthError | null;
  setAuthError: (error: AuthError | null) => void;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}
