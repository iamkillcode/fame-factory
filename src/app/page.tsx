
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/game-state-context';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { gameState, isLoaded: gameIsLoaded } = useGame();
  const { currentUser, loading: authIsLoading } = useAuth(); // Get auth state

  useEffect(() => {
    if (authIsLoading || !gameIsLoaded) {
      // Wait for auth and game state to load
      return;
    }

    if (currentUser) {
      if (gameState.artist) {
        router.replace('/dashboard'); // Authenticated and artist exists
      } else {
        router.replace('/artist-genesis'); // Authenticated but no artist profile yet
      }
    } else {
      router.replace('/login'); // Not authenticated
    }
  }, [authIsLoading, gameIsLoaded, currentUser, gameState.artist, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center p-8 rounded-xl glassy-card">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <h1 className="text-3xl font-headline text-glow-primary mb-2">Fame Factory</h1>
        <p className="text-lg text-foreground/80">Loading your music empire...</p>
      </div>
    </div>
  );
}
