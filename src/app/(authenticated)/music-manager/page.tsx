
'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Library, Disc3, PlusCircle, UploadCloud, BarChart2, ListMusic, Loader2, DollarSign, TrendingUp, Star } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import type { Song, ProductionQuality } from '@/types';
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
import { cn } from '@/lib/utils';

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
  const releasedSongs = gameState.songs.filter(s => s.isReleased).sort((a,b) => b.releaseTurn - a.releaseTurn);
  const artistMoney = gameState.artist.money;

  const handleReleaseSong = (songId: string) => {
    releaseSong(songId);
    const releasedSongDetails = gameState.songs.find(s => s.id === songId); // Find again from potentially updated state
    toast({
      title: "Song Released!",
      description: `${releasedSongDetails?.title || 'Your song'} is now out for the world to hear! (Quality: ${releasedSongDetails?.productionQuality})`,
    });
  };

  const handleInvestInProduction = (songId: string, qualityLevel: 'Medium' | 'High') => {
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
  };
  
  const getSongChartPerformance = (song: Song) => {
    if (!song.isReleased || !song.weeksOnChart || song.weeksOnChart < 1) return [];
    let data = [];
    let currentPos = song.peakChartPosition || song.currentChartPosition || Math.floor(Math.random() * 50 + 50); 
    for (let i = 0; i <= song.weeksOnChart; i++) {
        data.push({ week: song.releaseTurn + i, position: currentPos });
        currentPos += Math.floor(Math.random() * 10 - 5 + (song.productionQuality === 'High' ? -1 : song.productionQuality === 'Medium' ? 0 : 1) ); // Quality influence
        if (currentPos < 1) currentPos = 1;
        if (currentPos > 100) currentPos = 100; 
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
              <p className="text-muted-foreground text-center py-8">
                No unreleased tracks. <Link href="/music-forge" className="text-primary hover:underline">Go create some hits!</Link>
              </p>
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
                          <p className="text-sm text-muted-foreground mt-1">
                            Production Quality: <Badge variant={song.productionQuality === 'High' ? 'default' : song.productionQuality === 'Medium' ? 'secondary' : 'outline'} className={cn(song.productionQuality === 'High' && "bg-green-500 text-white")}>{song.productionQuality}</Badge>
                            {song.productionInvestment > 0 && ` ($${song.productionInvestment} Invested)`}
                          </p>
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
                             <Star className="mr-1.5 h-3 w-3"/> High Quality (${song.productionQuality === 'Low' ? productionUpgradeCosts.HighFromLow : productionUpgradeCosts.HighFromMedium})
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
                          <p className="text-sm text-muted-foreground">Released: Week {song.releaseTurn} | Style: {song.style}</p>
                          <p className="text-sm text-muted-foreground">Production: <Badge variant={song.productionQuality === 'High' ? 'default' : song.productionQuality === 'Medium' ? 'secondary' : 'outline'} className={cn(song.productionQuality === 'High' && "bg-green-500 text-white")}>{song.productionQuality}</Badge></p>
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

