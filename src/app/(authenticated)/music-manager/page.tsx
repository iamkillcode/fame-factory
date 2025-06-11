'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { LibraryMusic, Disc3, PlusCircle, UploadCloud, BarChart2, ListMusic } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import type { Song } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, TooltipProps } from "recharts"
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-popover/80 backdrop-blur-sm shadow-lg rounded-md border border-border text-popover-foreground">
        <p className="label font-semibold">{`Week ${label}`}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.fill }}>
             {`${pld.name}: #${pld.value}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export default function MusicManagerPage() {
  const { gameState, releaseSong, isLoaded } = useGame();
  const { toast } = useToast();

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading Music Manager...</div>;
  }

  const unreleasedSongs = gameState.songs.filter(s => !s.isReleased);
  const releasedSongs = gameState.songs.filter(s => s.isReleased).sort((a,b) => b.releaseTurn - a.releaseTurn);
  // TODO: Add album management

  const handleReleaseSong = (songId: string) => {
    releaseSong(songId);
    const releasedSong = gameState.songs.find(s => s.id === songId);
    toast({
      title: "Song Released!",
      description: `${releasedSong?.title || 'Your song'} is now out for the world to hear!`,
    });
  };
  
  // Mock chart data for a song
  const getSongChartPerformance = (song: Song) => {
    if (!song.isReleased || !song.weeksOnChart || song.weeksOnChart < 1) return [];
    let data = [];
    let currentPos = song.peakChartPosition || Math.floor(Math.random() * 50 + 50); // Start somewhere reasonable if no peak
    for (let i = 0; i <= song.weeksOnChart; i++) {
        data.push({ week: song.releaseTurn + i, position: currentPos });
        // Simulate chart movement (very basic)
        currentPos += Math.floor(Math.random() * 10 - 5);
        if (currentPos < 1) currentPos = 1;
        if (currentPos > 100) currentPos = 100; // Should fall off but for demo keep it
    }
    return data;
  }

  const chartConfig = {
    position: {
      label: "Chart Position",
      color: "hsl(var(--chart-1))",
    },
  } satisfies import('@/components/ui/chart').ChartConfig;


  return (
    <div className="space-y-8">
      <PageHeader
        title="Music Manager"
        description="Oversee your discography, release new music, and track your success."
        icon={LibraryMusic}
      >
        <Button asChild className="btn-glossy-accent">
          <Link href="/music-forge"><PlusCircle className="mr-2 h-4 w-4" /> Create New Music</Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="unreleased" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="unreleased">Unreleased Tracks ({unreleasedSongs.length})</TabsTrigger>
          <TabsTrigger value="released">Released Catalogue ({releasedSongs.length})</TabsTrigger>
          {/* <TabsTrigger value="albums" disabled>Albums & Mixtapes (0)</TabsTrigger> */}
        </TabsList>

        <TabsContent value="unreleased" className="mt-6">
          <SectionCard title="Ready for Release?" description="These tracks are waiting in the vault.">
            {unreleasedSongs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No unreleased tracks. <Link href="/music-forge" className="text-primary hover:underline">Go create some hits!</Link>
              </p>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {unreleasedSongs.map(song => (
                    <div key={song.id} className="glassy-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">Style: {song.style} | Theme: {song.theme}</p>
                        <p className="text-xs text-muted-foreground font-code truncate max-w-xs md:max-w-sm" title={song.beat}>Beat: {song.beat}</p>
                      </div>
                      <Button onClick={() => handleReleaseSong(song.id)} size="sm" className="btn-glossy-accent shrink-0">
                        <UploadCloud className="mr-2 h-4 w-4" /> Release Song
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="released" className="mt-6">
          <SectionCard title="Your Released Music" description="Track the performance of your hits.">
            {releasedSongs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No music released yet. Release a track to see its performance here.</p>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {releasedSongs.map(song => {
                    const performanceData = getSongChartPerformance(song);
                    return (
                    <div key={song.id} className="glassy-card p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{song.title}</h3>
                          <p className="text-sm text-muted-foreground">Released: Week {song.releaseTurn} | Style: {song.style}</p>
                        </div>
                        {song.currentChartPosition && (
                          <Badge variant="default" className="bg-primary/80 text-primary-foreground">
                            Currently #{song.currentChartPosition}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                        <p>Fan Reaction: <span className="font-semibold text-primary">{song.fanReaction || 'N/A'}%</span></p>
                        <p>Critic Score: <span className="font-semibold text-primary">{song.criticScore || 'N/A'}%</span></p>
                        <p>Sales/Streams: <span className="font-semibold text-primary">{song.sales?.toLocaleString() || 'N/A'}</span></p>
                      </div>
                      {performanceData.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase text-muted-foreground mb-1">Chart Performance (Position vs Week)</h4>
                          <ChartContainer config={chartConfig} className="h-[150px] w-full">
                            <RechartsLineChart data={performanceData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                              <YAxis reversed domain={[1, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} allowDataOverflow={true} />
                              <ChartTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                              <Line type="monotone" dataKey="position" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 2, fill: 'hsl(var(--primary))'}} activeDot={{r:4}} />
                            </RechartsLineChart>
                          </ChartContainer>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </ScrollArea>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
