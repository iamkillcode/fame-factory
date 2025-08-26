export const WORLD_CONFIG = {
  startYear: 2024,
  worldPopulation: 8_000_000_000,
  
  musicIndustry: {
    majorLabels: 5,
    independentLabels: 250,
    distributors: 20,
    
    artists: {
      established: 1000,    // Major artists
      midTier: 10000,      // Working professionals
      emerging: 50000,     // Active indie artists
      amateur: 500000,     // Hobby/part-time musicians
      players: 0,          // Dynamic: Actual players in the game
    },
    
    venues: {
      stadiums: {
        count: 500,
        capacity: { min: 40000, max: 100000 },
        minFameRequired: 85
      },
      arenas: {
        count: 2000,
        capacity: { min: 10000, max: 39999 },
        minFameRequired: 70
      },
      clubs: {
        count: 25000,
        capacity: { min: 500, max: 9999 },
        minFameRequired: 40
      },
      smallVenues: {
        count: 100000,
        capacity: { min: 50, max: 499 },
        minFameRequired: 0
      }
    },
    
    streaming: {
      platforms: [
        { name: 'Melodify', marketShare: 35, monthlyUsers: 450_000_000 },
        { name: 'SoundWave', marketShare: 30, monthlyUsers: 380_000_000 },
        { name: 'BeatStream', marketShare: 20, monthlyUsers: 250_000_000 },
        { name: 'RhythmBox', marketShare: 10, monthlyUsers: 120_000_000 },
        { name: 'VibeCloud', marketShare: 5, monthlyUsers: 60_000_000 }
      ],
      totalMonthlyStreams: 1_000_000_000
    }
  },
  
  socialMedia: {
    totalUsers: 4_500_000_000,
    musicActiveUsers: 2_000_000_000,
    platforms: [
      { name: 'BeatBoost', type: 'short-form-video', userBase: 1_200_000_000 },
      { name: 'SoundScene', type: 'music-focused', userBase: 800_000_000 },
      { name: 'ArtistConnect', type: 'professional', userBase: 500_000_000 }
    ],
    influencerTiers: {
      mega: { min: 1_000_000, count: 1000 },
      macro: { min: 100_000, count: 10000 },
      micro: { min: 10_000, count: 100000 },
      nano: { min: 1_000, count: 1000000 }
    }
  },
  
  economy: {
    ticketPrices: {
      stadium: { min: 75, max: 500 },
      arena: { min: 45, max: 200 },
      club: { min: 15, max: 50 },
      smallVenue: { min: 5, max: 20 }
    },
    streamingPayout: 0.004,
    albumPrices: {
      digital: { min: 7.99, max: 12.99 },
      physical: { min: 9.99, max: 24.99 }
    },
    marketSize: 25_000_000_000
  }
};
