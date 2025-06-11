'use client';

import { useState } from 'react';
import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Zap, Loader2, ListChecks, History } from 'lucide-react';
import { generateArtistEvent, type GenerateArtistEventInput, type GenerateArtistEventOutput } from '@/ai/flows/generate-artist-event';
import type { ActiveEvent } from '@/types';
import { SectionCard } from '@/components/section-card';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function EventsPage() {
  const { gameState, addActiveEvent, resolveActiveEvent, isLoaded } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!isLoaded || !gameState.artist) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading Events...</div>;
  }

  const { artist, activeEvents, eventHistory, currentTurn } = gameState;

  const handleGenerateEvent = async () => {
    if (!artist) return;
    setIsLoading(true);
    try {
      const input: GenerateArtistEventInput = {
        artistName: artist.name,
        artistGenre: artist.genre,
        artistFame: artist.fame,
        artistSkills: artist.skills.toString(), // AI flow expects string for skills
        artistFanbase: artist.fanbase,
        artistReputation: artist.reputation,
      };
      const result = await generateArtistEvent(input);
      const newEvent: ActiveEvent = {
        ...result,
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        turnTriggered: currentTurn,
        resolved: false,
      };
      addActiveEvent(newEvent);
      toast({ title: "New Event!", description: "A new situation has arisen in your career." });
    } catch (error) {
      console.error("Error generating event:", error);
      toast({ title: "Event Generation Failed", description: "Could not generate an event. Please try again.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleResolveEvent = (eventId: string, choiceIndex: number) => {
    resolveActiveEvent(eventId, choiceIndex);
    const event = activeEvents.find(e => e.id === eventId) || eventHistory.find(e => e.id === eventId);
    toast({ title: "Event Resolved!", description: `You chose: ${event ? (event as any)[`choice${choiceIndex+1}`] : 'your path'}` });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dynamic Events"
        description="Navigate the twists and turns of a music career. Your choices shape your destiny."
        icon={Zap}
      >
        <Button onClick={handleGenerateEvent} disabled={isLoading || activeEvents.length > 0} className="btn-glossy-accent">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          {activeEvents.length > 0 ? 'Event Active' : 'Check for New Events'}
        </Button>
      </PageHeader>

      {activeEvents.length > 0 && (
        <SectionCard title="Current Event" description="An opportunity or challenge awaits. What will you do?">
          {activeEvents.map(event => (
            <div key={event.id} className="p-4 border border-primary/50 rounded-lg bg-primary/5 shadow-lg">
              <h3 className="text-xl font-semibold font-headline text-primary mb-3">{event.eventDescription}</h3>
              <div className="space-y-3">
                {[event.choice1, event.choice2, event.choice3].map((choice, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="w-full justify-start text-left glassy-card hover:bg-primary/10 hover:border-primary"
                    onClick={() => handleResolveEvent(event.id, index)}
                  >
                    {choice}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </SectionCard>
      )}
      
      {activeEvents.length === 0 && !isLoading && (
         <SectionCard className="text-center">
            <p className="text-muted-foreground py-4">No active events. Click "Check for New Events" to see what happens next!</p>
        </SectionCard>
      )}


      {eventHistory.length > 0 && (
        <SectionCard title="Event History" icon={History}>
          <ScrollArea className="h-[400px] pr-3">
            <div className="space-y-4">
              {eventHistory.slice().reverse().map(event => (
                <div key={event.id} className="p-3 rounded-md border border-border/30 bg-card/30 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-foreground/80 mb-1 flex-1">{event.eventDescription}</p>
                    <Badge variant="outline" className="ml-2 shrink-0">Week {event.turnTriggered}</Badge>
                  </div>
                  <p className="text-xs text-primary font-medium">
                    Your choice: {event.chosenOption !== undefined ? (event as any)[`choice${event.chosenOption+1}`] : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SectionCard>
      )}
    </div>
  );
}
