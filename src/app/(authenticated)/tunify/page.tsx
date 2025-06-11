
'use client';

import { useGame } from '@/contexts/game-state-context';
import { SectionCard } from '@/components/section-card';
import { MediaItemCard } from '@/components/media-item-card';
import { Loader2, ListMusic, Album as AlbumIconLucide, Home, Search, Library, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, Music2Icon } from 'lucide-react';
import type { Song, Album } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TunifyPage() {
  const { gameState, isLoaded } = useGame();

  if (!isLoaded || !gameState.artist) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" /> <span className="ml-2">Loading Tunify...</span>
      </div>
    );
  }

  const { artist, songs, albums } = gameState;

  const releasedSongs = songs.filter(s => s.isReleased).sort((a, b) => (b.sales || 0) - (a.sales || 0));
  const releasedAlbums = albums.filter(a => a.isReleased).sort((a,b) => b.releaseTurn - a.releaseTurn);

  const NavItem = ({ href, icon: Icon, label, isActive }: { href: string, icon: React.ElementType, label: string, isActive?: boolean }) => (
    <Link href={href} className={cn(
      "flex items-center gap-4 px-2 py-2 text-sm font-medium rounded-md hover:bg-neutral-700 transition-colors",
      isActive ? "text-white bg-neutral-700" : "text-neutral-400 hover:text-white"
    )}>
      <Icon className="h-6 w-6" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-57px)] bg-black text-neutral-200"> {/* 57px is approx header height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tunify Left Sidebar */}
        <aside className="w-60 bg-neutral-900 p-4 space-y-6 flex-shrink-0 overflow-y-auto hidden md:flex flex-col">
          <div className="flex items-center gap-2 px-2 py-2 text-xl font-bold text-white">
            <Music2Icon className="h-8 w-8 text-green-500" />
            <span>Tunify</span>
          </div>
          <nav className="space-y-2">
            <NavItem href="#" icon={Home} label="Home" isActive />
            <NavItem href="#" icon={Search} label="Search" />
            <NavItem href="#" icon={Library} label="Your Library" />
          </nav>
          <div className="mt-auto space-y-2">
             <h3 className="px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Playlists</h3>
             <ScrollArea className="h-32">
                {/* Placeholder playlists */}
                {['Chill Vibes', 'Workout Hits', artist.name + ' Radio'].map(pl => (
                    <Link key={pl} href="#" className="block px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-md truncate">{pl}</Link>
                ))}
             </ScrollArea>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-gradient-to-b from-neutral-800 via-black to-black">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Good afternoon, {artist.name}</h1>
          </div>
          
          <SectionCard 
            title="Popular Tracks" 
            icon={ListMusic} 
            className="bg-transparent border-none shadow-none p-0"
            titleClassName="text-2xl font-semibold text-white"
          >
            {releasedSongs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {releasedSongs.slice(0,5).map(song => ( // Show top 5 for example
                    <MediaItemCard 
                      key={song.id} 
                      item={song} 
                      artistName={artist.name} 
                      className="bg-neutral-800/70 border-neutral-700/60 text-neutral-200 hover:bg-neutral-700/90 transition-all duration-300 ease-in-out transform hover:scale-105"
                    />
                  ))}
                </div>
            ) : (
              <p className="text-center text-neutral-400 py-4">No tracks released on Tunify yet.</p>
            )}
          </SectionCard>

          <SectionCard 
            title="Latest Albums & EPs" 
            icon={AlbumIconLucide} 
            className="bg-transparent border-none shadow-none p-0"
            titleClassName="text-2xl font-semibold text-white"
          >
            {releasedAlbums.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {releasedAlbums.slice(0,5).map(album => ( // Show top 5 for example
                    <MediaItemCard 
                      key={album.id} 
                      item={album} 
                      artistName={artist.name} 
                      className="bg-neutral-800/70 border-neutral-700/60 text-neutral-200 hover:bg-neutral-700/90 transition-all duration-300 ease-in-out transform hover:scale-105"
                    />
                  ))}
                </div>
            ) : (
              <p className="text-center text-neutral-400 py-4">No albums or EPs released on Tunify yet.</p>
            )}
          </SectionCard>
        </main>
      </div>

      {/* Bottom Fixed Player Bar */}
      <footer className="h-[90px] bg-neutral-800/90 backdrop-blur-md border-t border-neutral-700 px-4 py-3 flex items-center justify-between flex-shrink-0 text-neutral-300">
        <div className="flex items-center gap-3 w-1/3">
          <Image 
            src="https://placehold.co/56x56.png" 
            alt="Album Art" 
            width={56} 
            height={56} 
            className="rounded"
            data-ai-hint="album cover"
          />
          <div>
            <p className="text-sm font-semibold text-white truncate">Song Title Placeholder</p>
            <p className="text-xs text-neutral-400 truncate">{artist.name}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><Shuffle className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><SkipBack className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="bg-white text-black hover:bg-neutral-200 h-10 w-10 rounded-full"><Play className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><SkipForward className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><Repeat className="h-5 w-5" /></Button>
          </div>
          {/* Placeholder for progress bar */}
          <div className="w-full max-w-xs h-1 bg-neutral-600 rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{width: '30%'}}></div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-1/3 justify-end">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><ListMusic className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white"><Volume2 className="h-5 w-5" /></Button>
          {/* Placeholder for volume bar */}
          <div className="w-20 h-1 bg-neutral-600 rounded-full overflow-hidden">
             <div className="h-full bg-white" style={{width: '70%'}}></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
