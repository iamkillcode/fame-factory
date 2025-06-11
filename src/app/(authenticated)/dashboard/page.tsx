
'use client';

import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { BarChart, DollarSign, TrendingUp, Users, Star, Award, CalendarDays, Loader2, Wand2, Library, MessageCircle, Zap } from 'lucide-react';
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


const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
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


export default function DashboardPage() {
  const { gameState, nextTurn, isLoaded } = useGame();

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading Dashboard...</div>;
  }

  const { artist, currentTurn, songs } = gameState;

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

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${artist.name}!`}
        description={`Currently Week ${currentTurn} of your career. Make it count!`}
        icon={Star}
      >
        <Button onClick={nextTurn} className="btn-glossy-accent" size="lg">
          <CalendarDays className="mr-2 h-5 w-5" />
          Advance to Next Week
        </Button>
      </PageHeader>

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
              <Link href="/music-forge">
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
                Engage on Socials
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

      {recentReleasedSongs.length > 0 && (
        <SectionCard title="Recent Releases">
          <div className="space-y-4">
            {recentReleasedSongs.map(song => (
              <div key={song.id} className="p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="font-semibold text-lg text-foreground">{song.title}</h3>
                <p className="text-sm text-muted-foreground">Style: {song.style} | Theme: {song.theme}</p>
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
