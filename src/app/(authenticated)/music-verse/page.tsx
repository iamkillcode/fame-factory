
'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { MediaItemCard } from '@/components/media-item-card';
import { Disc3, Loader2, Music, Layers } from 'lucide-react';
import type { Song, Album } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MusicVersePage() {
  const { gameState, isLoaded } = useGame();

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading MusicVerse...</div>;
  }

  const { artist, songs, albums } = gameState;

  const releasedSongs = songs.filter(s => s.isReleased).sort((a,b) => b.releaseTurn - a.releaseTurn); // Sort by release turn
  const releasedAlbums = albums.filter(a => a.isReleased).sort((a,b) => b.releaseTurn - a.releaseTurn);

  return (
    <div className="space-y-8">
      <PageHeader
        title="MusicVerse"
        description={`Discover ${artist.name}'s latest releases and curated collections.`}
        icon={Disc3}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SectionCard 
            title="Fresh Tracks" 
            icon={Music} 
            className="bg-primary/10 border-primary/30"
            titleClassName="text-primary"
        >
          {releasedSongs.length > 0 ? (
            <ScrollArea className="h-[400px] md:h-[500px] pr-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {releasedSongs.map(song => (
                  <MediaItemCard 
                    key={song.id} 
                    item={song} 
                    artistName={artist.name} 
                    className="bg-background/80 border-border"
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-4">No tracks available on MusicVerse yet.</p>
          )}
        </SectionCard>

        <SectionCard 
            title="Albums & Projects" 
            icon={Layers} 
            className="bg-primary/10 border-primary/30"
            titleClassName="text-primary"
        >
          {releasedAlbums.length > 0 ? (
            <ScrollArea className="h-[400px] md:h-[500px] pr-3">
              <div className="grid grid-cols-1 gap-4">
                {releasedAlbums.map(album => (
                  <MediaItemCard 
                    key={album.id} 
                    item={album} 
                    artistName={artist.name} 
                    className="bg-background/80 border-border"
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-4">No albums or projects available on MusicVerse yet.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
