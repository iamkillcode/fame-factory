
'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Library, PlusCircle, UploadCloud, Loader2, TrendingUp, Star as StarIcon } from 'lucide-react'; // Renamed Star to StarIcon to avoid conflict
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
} from "@/components/ui/chart";
import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, TooltipProps } from "recharts";
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { cn } from '@/lib/utils';
import { memo, useCallback, useMemo } from 'react';

const CustomTooltipComponent = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
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
const CustomTooltip = memo(CustomTooltipComponent);


const productionUpgradeCosts = {
    Medium: 500,
    HighFromLow: 2000,
    HighFromMedium: 1500,
};


export default function MusicManagerPage() {
  const { gameState, releaseSong, investInSongProduction, isLoaded } = useGame();
  const { toast } = useToast();

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading Music Manager...</div>;
  }

  const unreleasedSongs = gameState.songs.filter(s => !s.isReleased);
  const releasedSongs = gameState.songs.filter(s => s.isReleased).sort((a,b) => (b.releaseTurn || 0) - (a.releaseTurn || 0));
  const artistMoney = gameState.artist.money;

  const handleReleaseSong = useCallback((songId: string) => {
    releaseSong(songId);
    const releasedSongDetails = gameState.songs.find(s => s.id === songId);
    toast({
      title: "Song Released!",
      description: `${releasedSongDetails?.title || 'Your song'} is now out! (Quality: ${releasedSongDetails?.productionQuality}) Its initial chart score is ${releasedSongDetails?.chartScore || 'N/A'}.`,
    });
  }, [releaseSong, gameState.songs, toast]);

  const handleInvestInProduction = useCallback((songId: string, qualityLevel: 'Medium' | 'High') => {
    let cost = 0;
    const song = unreleasedSongs.find(s => s.id === songId);
    if (!song) return;

    if (qualityLevel === 'Medium' && song.productionQuality === 'Low') {
        cost = productionUpgradeCosts.Medium;
    } else if (qualityLevel === 'High') {
        cost = song.productionQuality === 'Low' ? productionUpgradeCosts.HighFromLow : productionUpgradeCosts.HighFromMedium;
    }
    
    if (artistMoney < cost) {
        toast({ title: "Insufficient Funds", description: `You need $${cost} to upgrade production.`, variant: "destructive"});
        return;
    }
    investInSongProduction(songId, qualityLevel);
    toast({ title: "Production Upgraded!", description: `Invested $${cost} in "${song.title}" for ${qualityLevel} quality.`});
  }, [unreleasedSongs, artistMoney, investInSongProduction, toast]);
  
  const getSongChartPerformance = useCallback((song: Song) => {
    // This function might need to be adapted if chart history is stored differently.
    // For now, it simulates based on current and peak position.
    if (!song.isReleased || !song.weeksOnChart || song.weeksOnChart < 1 || !song.currentChartPosition) return [];
    
    // A more robust history would be stored, here we simulate for display
    const data = [];
    let pos = song.peakChartPosition || song.currentChartPosition;
    const peakWeek = Math.max(1, Math.floor((song.weeksOnChart || 1) / 2)); // Assume peak around mid-chart life

    for (let i = 0; i <= (song.weeksOnChart || 0) ; i++) {
        let simulatedPos;
        if (i < peakWeek) { // Rising phase
            simulatedPos = (song.peakChartPosition || 100) + Math.floor(((100 - (song.peakChartPosition || 100)) / peakWeek) * (peakWeek - i) * (Math.random() * 0.2 + 0.9));
        } else { // Falling phase or stable
             simulatedPos = (song.peakChartPosition || 1) + Math.floor((( (song.currentChartPosition || 100) - (song.peakChartPosition || 1)) / Math.max(1, (song.weeksOnChart || 1) - peakWeek)) * (i - peakWeek) * (Math.random() * 0.2 + 0.9));
        }
        simulatedPos = Math.max(1, Math.min(100, Math.round(simulatedPos)));
        data.push({ week: (song.releaseTurn || 0) + i, position: simulatedPos });
    }
    if (data.length > 0 && song.currentChartPosition) { // Ensure current position is accurate
        data[data.length-1].position = song.currentChartPosition;
    }

    return data;
  }, []);

  const chartConfig = useMemo(() => ({
    position: {
      label: "Chart Position",
      color: "hsl(var(--chart-1))",
    },
  }), []) satisfies import('@/components/ui/chart').ChartConfig;


  return (
    <div className="space-y-8">
      <PageHeader
        title="Music Manager"
        description="Oversee your discography, invest in production, release new music, and track your success."
        icon={Library}
      >
        <Button asChild className="btn-glossy-accent">
          <Link href="/music-forge"><PlusCircle className="mr-2 h-4 w-4" /> Create New Music</Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="unreleased" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="unreleased">Unreleased Tracks ({unreleasedSongs.length})</TabsTrigger>
          <TabsTrigger value="released">Released Catalogue ({releasedSongs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unreleased" className="mt-6">
          <SectionCard title="Ready for Release?" description="Enhance production quality before releasing your tracks.">
            {unreleasedSongs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No unreleased tracks. <Link href="/music-forge" className="text-primary hover:underline">Go create some hits!</Link>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {unreleasedSongs.map(song => (
                    <div key={song.id} className="glassy-card p-4 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{song.title}</h3>
                          <p className="text-sm text-muted-foreground">Style: {song.style} | Theme: {song.theme}</p>
                          <p className="text-xs text-muted-foreground font-code truncate max-w-xs md:max-w-sm" title={song.beat}>Beat: {song.beat}</p>
                          <div className="text-sm text-muted-foreground mt-1">
                            Production Quality: <Badge variant={song.productionQuality === 'High' ? 'default' : song.productionQuality === 'Medium' ? 'secondary' : 'outline'} className={cn(song.productionQuality === 'High' && "bg-green-500 text-white")}>{song.productionQuality}</Badge>
                            {song.productionInvestment > 0 && ` ($${song.productionInvestment} Invested)`}
                          </div>
                        </div>
                        <Button onClick={() => handleReleaseSong(song.id)} size="sm" className="btn-glossy-accent shrink-0 w-full sm:w-auto">
                          <UploadCloud className="mr-2 h-4 w-4" /> Release Song
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-center border-t border-border/30 pt-3">
                        <p className="text-sm font-medium text-muted-foreground shrink-0">Improve Production:</p>
                        <div className="flex gap-2 flex-wrap">
                           <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleInvestInProduction(song.id, 'Medium')}
                            disabled={song.productionQuality !== 'Low' || artistMoney < productionUpgradeCosts.Medium}
                            className="text-xs"
                            >
                            <TrendingUp className="mr-1.5 h-3 w-3"/> Medium Quality (${productionUpgradeCosts.Medium})
                           </Button>
                           <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleInvestInProduction(song.id, 'High')}
                            disabled={song.productionQuality === 'High' || artistMoney < (song.productionQuality === 'Low' ? productionUpgradeCosts.HighFromLow : productionUpgradeCosts.HighFromMedium)}
                            className="text-xs"
                            >
                             <StarIcon className="mr-1.5 h-3 w-3"/> High Quality (${song.productionQuality === 'Low' ? productionUpgradeCosts.HighFromLow : productionUpgradeCosts.HighFromMedium})
                           </Button>
                        </div>
                      </div>
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
                          <div className="text-sm text-muted-foreground">Released: Week {song.releaseTurn} | Style: {song.style}</div>
                          <div className="text-sm text-muted-foreground">Production: <Badge variant={song.productionQuality === 'High' ? 'default' : song.productionQuality === 'Medium' ? 'secondary' : 'outline'} className={cn(song.productionQuality === 'High' && "bg-green-500 text-white")}>{song.productionQuality}</Badge></div>
                        </div>
                        {song.currentChartPosition ? (
                          <Badge variant="default" className="bg-primary/80 text-primary-foreground">
                            Chart: #{song.currentChartPosition} (Peak: #{song.peakChartPosition || song.currentChartPosition})
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Charting</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                        <div>Fan Reaction: <span className="font-semibold text-primary">{song.fanReaction || 'N/A'}%</span></div>
                        <div>Critic Score: <span className="font-semibold text-primary">{song.criticScore || 'N/A'}%</span></div>
                        <div>Sales/Streams: <span className="font-semibold text-primary">{song.sales?.toLocaleString() || 'N/A'}</span></div>
                      </div>
                       <div>Internal Chart Score: <span className="text-xs text-muted-foreground">{song.chartScore?.toFixed(0) || 'N/A'}</span></div>
                      {performanceData.length > 0 && song.currentChartPosition && (
                        <div>
                          <h4 className="text-xs uppercase text-muted-foreground mb-1">Chart Performance (Position vs Week)</h4>
                          <ChartContainer config={chartConfig} className="h-[150px] w-full">
                            <RechartsLineChart data={performanceData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.3)" />
                              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                              <YAxis reversed domain={[1, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} allowDataOverflow={true} ticks={[1, 10, 25, 50, 75, 100]} />
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
