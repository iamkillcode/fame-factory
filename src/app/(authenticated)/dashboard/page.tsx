
'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { BarChart, DollarSign, TrendingUp, Users, Star, Award, CalendarDays, Loader2, Wand2, Library, MessageCircle, Zap, Palette, Briefcase, Brain, Smile } from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, TooltipProps } from "recharts"
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { AVAILABLE_TRAINING_ACTIVITIES } from '@/hooks/use-game-state';
import type { TrainingActivity } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { memo, useCallback, useState, useEffect } from 'react';


const CustomTooltipComponent = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-popover/80 backdrop-blur-sm shadow-lg rounded-md border border-border text-popover-foreground">
        <p className="label font-semibold">{`${label}`}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.fill }}>
             {`${pld.name}: ${pld.value}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};
const CustomTooltip = memo(CustomTooltipComponent);

const activityIcons: Record<string, React.ElementType> = {
  vocal_training: Palette,
  songwriting_workshop: Brain,
  networking_event: Briefcase,
  performance_rehearsal: Star,
  social_media_blitz: TrendingUp,
  rest_recover: Smile,
};


export default function DashboardPage() {
  const { gameState, isLoaded, performActivity } = useGame();
  const { toast } = useToast();
  const [gameTime, setGameTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!gameState.gameStartDate) {
      setGameTime(null);
      return;
    }

    const realWorldStartDate = new Date(gameState.gameStartDate);
    const inGameBaseDate = new Date('2024-01-01T00:00:00Z');

    const intervalId = setInterval(() => {
      const now = new Date();
      const elapsedRealMilliseconds = now.getTime() - realWorldStartDate.getTime();
      
      const realMinutesElapsed = elapsedRealMilliseconds / (1000 * 60);
      const inGameDaysElapsed = realMinutesElapsed;
      
      const currentInGameTime = new Date(inGameBaseDate.getTime() + inGameDaysElapsed * 24 * 60 * 60 * 1000);
      setGameTime(currentInGameTime);
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, [gameState.gameStartDate]);

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading Dashboard...</div>;
  }

  const { artist, currentTurn, songs } = gameState;

  const handlePerformActivity = useCallback((activity: TrainingActivity) => {
    if (artist.money < activity.cost) {
      toast({
        title: "Not enough funds",
        description: `You need $${activity.cost} for ${activity.name}. You only have $${artist.money}.`,
        variant: "destructive",
      });
      return;
    }
    performActivity(activity);
  }, [artist.money, performActivity, toast]);

  const chartData = [
    { name: 'Fame', value: artist.fame, fill: "hsl(var(--chart-1))" },
    { name: 'Skills', value: artist.skills, fill: "hsl(var(--chart-2))" },
    { name: 'Reputation', value: artist.reputation, fill: "hsl(var(--chart-3))" },
  ];

  const chartConfig = {
    value: {
      label: "Value",
    },
    fame: {
      label: "Fame",
      color: "hsl(var(--chart-1))",
    },
    skills: {
      label: "Skills",
      color: "hsl(var(--chart-2))",
    },
    reputation: {
      label: "Reputation",
      color: "hsl(var(--chart-3))",
    },
  } satisfies import('@/components/ui/chart').ChartConfig;


  const recentReleasedSongs = songs.filter(s => s.isReleased).slice(-3).reverse();

  const formattedGameTime = gameTime 
    ? gameTime.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric',
        second: 'numeric',
        hour12: true 
      }) 
    : 'Initializing...';


  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${artist.name}!`}
        description={formattedGameTime}
        icon={Star}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Fame Level" value={artist.fame.toLocaleString()} icon={TrendingUp} description="How well-known you are." iconClassName="text-yellow-400" />
        <StatCard title="Skills" value={`${artist.skills}/100`} icon={Award} description="Your talent and abilities." iconClassName="text-blue-400" />
        <StatCard title="Fanbase" value={artist.fanbase.toLocaleString()} icon={Users} description="Your loyal supporters." iconClassName="text-green-400" />
        <StatCard title="Money" value={`$${artist.money.toLocaleString()}`} icon={DollarSign} description="Your current earnings." iconClassName="text-teal-400" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Career Snapshot" className="lg:col-span-2">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))"/>
                <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }}/>
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="Quick Actions">
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start text-left glassy-card hover:bg-primary/10">
              <Link href="/write-songs">
                <Wand2 className="mr-2 h-4 w-4 text-primary" />
                Craft New Music
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-left glassy-card hover:bg-primary/10">
              <Link href="/music-manager">
                <Library className="mr-2 h-4 w-4 text-primary" />
                Manage Releases
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-left glassy-card hover:bg-primary/10">
             <Link href="/social-connect">
                <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                Engage on XConnect
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-left glassy-card hover:bg-primary/10">
              <Link href="/events">
                <Zap className="mr-2 h-4 w-4 text-primary" />
                Check for Events
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Activities & Training" description="Spend money to improve your artist's stats. Effects are applied immediately.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_TRAINING_ACTIVITIES.map(activity => {
            const Icon = activityIcons[activity.id] || Award; // Default icon
            const canAfford = artist.money >= activity.cost;
            return (
              <Button
                key={activity.id}
                variant="outline"
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left glassy-card hover:border-primary/80",
                  !canAfford && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handlePerformActivity(activity)}
                disabled={!canAfford}
              >
                <div className="flex items-center mb-2">
                  <Icon className={cn("h-6 w-6 mr-3 text-muted-foreground")} />
                  <h3 className="text-lg font-semibold text-foreground">{activity.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                <p className="text-xs font-semibold text-primary">Cost: ${activity.cost}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  Effects:
                  {activity.effects.skills ? ` Skills +${activity.effects.skills}` : ""}
                  {activity.effects.reputation ? ` Rep +${activity.effects.reputation}` : ""}
                  {activity.effects.fame ? ` Fame +${activity.effects.fame}` : ""}
                  {activity.effects.money ? ` Money ${activity.effects.money > 0 ? '+' : ''}${activity.effects.money}` : ""}
                  {activity.effects.fanbase ? ` Fans +${activity.effects.fanbase}` : ""}
                </div>
              </Button>
            );
          })}
        </div>
      </SectionCard>


      {recentReleasedSongs.length > 0 && (
        <SectionCard title="Recent Releases">
          <div className="space-y-4">
            {recentReleasedSongs.map(song => (
              <div key={song.id} className="p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="font-semibold text-lg text-foreground">{song.title}</h3>
                <p className="text-sm text-muted-foreground">Genre: {song.genre} | Theme: {song.theme}</p>
                <p className="text-sm text-muted-foreground">Production: {song.productionQuality} (${song.productionInvestment} invested)</p>
                <p className="text-sm text-muted-foreground">Released: Week {song.releaseTurn}</p>
                {song.currentChartPosition && <p className="text-sm text-primary">Chart Position: #{song.currentChartPosition}</p>}
                <p className="text-sm text-muted-foreground">Fan Reaction: {song.fanReaction}% | Critic Score: {song.criticScore}%</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

    </div>
  );
}
