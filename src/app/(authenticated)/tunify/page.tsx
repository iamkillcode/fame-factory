
'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { MediaItemCard } from '@/components/media-item-card';
import { PlaySquare, Loader2, ListMusic, AlbumIcon } from 'lucide-react';
import type { Song, Album } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TunifyPage() {
  const { gameState, isLoaded } = useGame();

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green-500" /> Loading Tunify...</div>;
  }

  const { artist, songs, albums } = gameState;

  const releasedSongs = songs.filter(s => s.isReleased).sort((a, b) => (b.sales || 0) - (a.sales || 0)); // Sort by sales (streams)
  const releasedAlbums = albums.filter(a => a.isReleased).sort((a,b) => b.releaseTurn - a.releaseTurn);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tunify"
        description={`Explore ${artist.name}'s music. The world is listening.`}
        icon={PlaySquare} // Spotify-like icon placeholder
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SectionCard 
          title="Popular Tracks" 
          icon={ListMusic} 
          className="bg-neutral-900/80 backdrop-blur-sm border-neutral-700/60"
          titleClassName="text-green-400"
        >
          {releasedSongs.length > 0 ? (
            <ScrollArea className="h-[400px] md:h-[500px] pr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {releasedSongs.map(song => (
                  <MediaItemCard 
                    key={song.id} 
                    item={song} 
                    artistName={artist.name} 
                    className="bg-neutral-800/70 border-neutral-700 text-neutral-200 hover:bg-neutral-700/90"
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-4">No tracks released on Tunify yet.</p>
          )}
        </SectionCard>

        <SectionCard 
          title="Latest Albums & EPs" 
          icon={AlbumIcon} 
          className="bg-neutral-900/80 backdrop-blur-sm border-neutral-700/60"
          titleClassName="text-green-400"
        >
          {releasedAlbums.length > 0 ? (
            <ScrollArea className="h-[400px] md:h-[500px] pr-3">
              <div className="grid grid-cols-1 gap-4">
                {releasedAlbums.map(album => (
                  <MediaItemCard 
                    key={album.id} 
                    item={album} 
                    artistName={artist.name} 
                    className="bg-neutral-800/70 border-neutral-700 text-neutral-200 hover:bg-neutral-700/90"
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-4">No albums or EPs released on Tunify yet.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
