
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { Wand2, Loader2, Disc3, Lightbulb, Music } from 'lucide-react';
import { generateMusicLyrics, type GenerateMusicLyricsInput, type GenerateMusicLyricsOutput } from '@/ai/flows/generate-music-lyrics';
import type { Genre } from '@/types';
import { SectionCard } from '@/components/section-card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const writeSongsSchema = z.object({
  genre: z.string().nonempty("Please select a music genre."),
  theme: z.string().min(2, "Theme must be at least 2 characters.").max(50, "Theme can't exceed 50 characters."),
  songTitle: z.string().min(2, "Song title must be at least 2 characters.").max(100, "Title too long."),
});

type WriteSongsFormValues = z.infer<typeof writeSongsSchema>;

interface LyricSection {
  title: string;
  content: string;
  key: keyof Omit<GenerateMusicLyricsOutput, 'beatSuggestion'>;
}

export default function WriteSongsPage() {
  const { gameState, addSong, updateArtistStats } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateMusicLyricsOutput | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<WriteSongsFormValues>({
    resolver: zodResolver(writeSongsSchema),
    defaultValues: { genre: '', theme: '', songTitle: '' },
    mode: 'onChange',
  });

  const handleGenerateIdeas = async () => {
    const isValid = await form.trigger(['genre', 'theme']);
    if (!isValid) {
      toast({
        title: "Missing Information",
        description: "Please select a music genre and provide a lyrical theme (2-50 characters).",
        variant: "destructive"
      });
      return;
    }

    const values = form.getValues();
    setIsLoading(true);
    setGeneratedContent(null);
    setSelectedLyrics([]);
    try {
      const input: GenerateMusicLyricsInput = {
        genre: values.genre,
        theme: values.theme,
      };
      const result = await generateMusicLyrics(input);

      if (result && result.beatSuggestion && result.verseSuggestion && result.chorusSuggestion && result.bridgeSuggestion) {
        setGeneratedContent(result);
      } else {
        console.warn("Generated content was empty or invalid:", result);
        toast({
          title: "No Ideas Generated",
          description: "The AI didn't come up with useful ideas for this combination. Try a different genre or theme.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error generating music content:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not generate music ideas. Please try again.";
      toast({ title: "Generation Failed", description: errorMessage, variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleLyricSelection = (lyric: string) => {
    setSelectedLyrics(prev =>
      prev.includes(lyric) ? prev.filter(l => l !== lyric) : [...prev, lyric]
    );
  };

  const handleRecordSong = async () => {
    const isTitleValid = await form.trigger('songTitle');
    if (!isTitleValid) {
      toast({ title: "Invalid Song Title", description: "Please provide a valid song title (2-100 characters).", variant: "destructive"});
      return;
    }

    if (!generatedContent || selectedLyrics.length === 0) {
      toast({ title: "Cannot Record Song", description: "Please generate content and select at least one lyric line.", variant: "destructive"});
      return;
    }
    const { songTitle, genre, theme } = form.getValues();
     if (!genre || !theme) {
       toast({ title: "Missing Information", description: "Genre and theme are required to draft a song.", variant: "destructive"});
       return;
    }

    addSong({
      title: songTitle,
      genre: genre as Genre,
      theme: theme,
      lyrics: selectedLyrics.join('\n\n'),
      beat: generatedContent.beatSuggestion,
    });
    toast({ title: "Song Drafted!", description: `${songTitle} has been added to your unreleased tracks.`});
    updateArtistStats({ skills: 1 });
    setGeneratedContent(null);
    setSelectedLyrics([]);
    form.resetField("songTitle");
  };

  const lyricSections: LyricSection[] = generatedContent ? [
    { title: "Verse Suggestion", content: generatedContent.verseSuggestion, key: "verseSuggestion" },
    { title: "Chorus Suggestion", content: generatedContent.chorusSuggestion, key: "chorusSuggestion" },
    { title: "Bridge Suggestion", content: generatedContent.bridgeSuggestion, key: "bridgeSuggestion" },
  ] : [];

  return (
    <Form {...form}>
      <div className="space-y-8">
        <PageHeader
          title="Write Songs"
          description="Craft your next hit! Generate unique lyrics and beat ideas."
          icon={Music}
        />

        <SectionCard title="Song Concept" description="Define the vibe for your new track.">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Music Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {gameState.availableGenres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
            <Button
              type="button"
              onClick={handleGenerateIdeas}
              disabled={isLoading}
              className="btn-glossy-accent"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Generate Ideas
            </Button>
          </form>
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

              {lyricSections.map(section => (
                <div key={section.key}>
                  <h3 className="text-lg font-semibold font-headline mb-2">{section.title}</h3>
                  <div
                    onClick={() => handleLyricSelection(section.content)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${selectedLyrics.includes(section.content) ? 'bg-primary/20 border-primary ring-2 ring-primary' : 'bg-muted/20 border-border hover:border-primary/50'}`}
                  >
                    <p className="font-code text-neon-accent whitespace-pre-line">{section.content}</p>
                  </div>
                </div>
              ))}

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
                <Button
                  onClick={handleRecordSong}
                  disabled={!generatedContent || selectedLyrics.length === 0}
                  className="btn-glossy-accent w-full md:w-auto"
                >
                  <Disc3 className="mr-2 h-4 w-4" />
                  Draft This Song
                </Button>
              </div>
            </div>
          </SectionCard>
        )}
      </div>
    </Form>
  );
}
