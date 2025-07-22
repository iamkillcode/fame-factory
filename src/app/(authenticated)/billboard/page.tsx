
'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListMusic, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { Song, NPCSong } from '@/types';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ChartEntry = (Song | NPCSong) & { rank: number; previousRank?: number | null };

export default function BillboardPage() {
  const { gameState, isLoaded } = useGame();

  const chartData = useMemo(() => {
    if (!isLoaded || !gameState.artist) return [];

    const allSongs: (Song | NPCSong)[] = [
      ...gameState.songs.filter(s => s.isReleased && s.chartScore && s.chartScore > 0),
      ...gameState.npcSongs.filter(s => s.chartScore && s.chartScore > 0),
    ];

    const sortedSongs = allSongs
      .sort((a, b) => (b.chartScore || 0) - (a.chartScore || 0))
      .slice(0, 100); 

    
    return sortedSongs.map((song, index) => ({
      ...song,
      rank: index + 1,
      previousRank: song.currentChartPosition && song.weeksOnChart && song.weeksOnChart > 0 ? song.currentChartPosition : null
    }));
  }, [gameState, isLoaded]);

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading Billboard Chart...</div>;
  }
  
  const getTrendIcon = (currentRank: number, previousRank?: number | null) => {
    if (!previousRank || currentRank === previousRank) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (currentRank < previousRank) return <ArrowUp className="h-4 w-4 text-green-500" />;
    return <ArrowDown className="h-4 w-4 text-red-500" />;
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="Fame Factory Top 100"
        description={`The official chart for Week ${gameState.currentTurn}. Who's climbing and who's falling?`}
        icon={ListMusic}
      />

      <SectionCard title="This Week's Hottest Tracks">
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">The chart is currently empty. Release some music to make an impact!</p>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]"> {/* Adjust height as needed */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead className="w-[80px] text-center">Trend</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead className="text-right">Weeks</TableHead>
                  <TableHead className="text-right">Peak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((song) => (
                  <TableRow key={song.id} className={cn('lyrics' in song && 'bg-primary/10 hover:bg-primary/20')}>
                    <TableCell className="font-bold text-lg">{song.rank}</TableCell>
                    <TableCell className="text-center">
                      {getTrendIcon(song.rank, song.previousRank)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{song.title}</div>
                      <div className="text-xs text-muted-foreground">{'genre' in song ? song.genre : ''}</div>
                    </TableCell>
                    <TableCell>
                      {'lyrics' in song ? (
                        <Badge variant="default">{gameState.artist?.name}</Badge>
                      ) : (
                        <Badge variant="secondary">{song.artistName}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{song.weeksOnChart || 0}</TableCell>
                    <TableCell className="text-right">#{song.peakChartPosition || song.rank}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </SectionCard>
    </div>
  );
}

    