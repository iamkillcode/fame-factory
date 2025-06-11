'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { Wand2, Loader2, Disc3, Lightbulb } from 'lucide-react';
import { generateMusicLyrics, type GenerateMusicLyricsInput, type GenerateMusicLyricsOutput } from '@/ai/flows/generate-music-lyrics';
import type { MusicStyle } from '@/types';
import { SectionCard } from '@/components/section-card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const forgeSchema = z.object({
  style: z.string().nonempty("Please select a music style."),
  theme: z.string().min(2, "Theme must be at least 2 characters.").max(50, "Theme can't exceed 50 characters."),
  songTitle: z.string().min(2, "Song title must be at least 2 characters.").max(100, "Title too long."),
});

type ForgeFormValues = z.infer<typeof forgeSchema>;

export default function MusicForgePage() {
  const { gameState, addSong, updateArtistStats } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateMusicLyricsOutput | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<ForgeFormValues>({
    resolver: zodResolver(forgeSchema),
    defaultValues: { style: '', theme: '', songTitle: '' },
  });

  async function onSubmit(values: ForgeFormValues) {
    setIsLoading(true);
    setGeneratedContent(null);
    setSelectedLyrics([]);
    try {
      const input: GenerateMusicLyricsInput = {
        style: values.style,
        theme: values.theme,
      };
      const result = await generateMusicLyrics(input);
      setGeneratedContent(result);
    } catch (error) {
      console.error("Error generating music content:", error);
      toast({ title: "Generation Failed", description: "Could not generate music ideas. Please try again.", variant: "destructive"});
    }
    setIsLoading(false);
  }

  const handleLyricSelection = (lyric: string) => {
    setSelectedLyrics(prev => 
      prev.includes(lyric) ? prev.filter(l => l !== lyric) : [...prev, lyric]
    );
  };

  const handleRecordSong = () => {
    if (!generatedContent || !form.getValues().songTitle || selectedLyrics.length === 0) {
      toast({ title: "Cannot Record Song", description: "Please generate content, provide a title, and select at least one lyric line.", variant: "destructive"});
      return;
    }
    const { songTitle, style, theme } = form.getValues();
    addSong({
      title: songTitle,
      style: style as MusicStyle,
      theme: theme,
      lyrics: selectedLyrics.join('\n\n'), // Combine selected lyrics
      beat: generatedContent.beatSuggestion,
      // Other properties like isReleased, releaseTurn will be set upon release
    });
    toast({ title: "Song Drafted!", description: `${songTitle} has been added to your unreleased tracks.`});
    updateArtistStats({ skills: 1 }); // Small skill increase for songwriting
    setGeneratedContent(null); // Clear suggestions
    setSelectedLyrics([]);
    form.resetField("songTitle"); // Keep style/theme for potentially another song in same vibe
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Music Forge"
        description="Craft your next hit! Generate unique lyrics and beat ideas."
        icon={Wand2}
      />

      <SectionCard title="Song Concept" description="Define the vibe for your new track.">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Music Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {gameState.availableMusicStyles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lyrical Theme</FormLabel>
                    <FormControl><Input placeholder="E.g., Heartbreak, City Nights, Ambition" {...field} /></FormControl>
                    <FormDescription>The core idea or topic of your song.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="btn-glossy-accent">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Generate Ideas
            </Button>
          </form>
        </Form>
      </SectionCard>

      {isLoading && (
        <SectionCard title="Generating..." className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">The AI is cooking up some magic...</p>
        </SectionCard>
      )}

      {generatedContent && (
        <SectionCard title="Generated Ideas" description="Here's what the AI came up with. Select lyrics and give your song a title.">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold font-headline mb-2">Beat Suggestion</h3>
              <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-md font-code">{generatedContent.beatSuggestion}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-headline mb-2">Lyric Suggestions</h3>
              <div className="space-y-3">
                {generatedContent.lyricSuggestions.map((lyric, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleLyricSelection(lyric)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${selectedLyrics.includes(lyric) ? 'bg-primary/20 border-primary ring-2 ring-primary' : 'bg-muted/20 border-border hover:border-primary/50'}`}
                  >
                    <p className="font-code text-neon-accent">{lyric}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50 space-y-4">
               <FormField
                control={form.control}
                name="songTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Song Title</FormLabel>
                    <FormControl><Input placeholder="Enter a catchy title for your song" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button onClick={handleRecordSong} disabled={!form.getValues().songTitle || selectedLyrics.length === 0} className="btn-glossy-accent w-full md:w-auto">
                <Disc3 className="mr-2 h-4 w-4" />
                Draft This Song
              </Button>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
