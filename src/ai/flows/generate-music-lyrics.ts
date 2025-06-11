'use server';

/**
 * @fileOverview An AI agent for generating music lyrics based on a selected style and theme.
 *
 * - generateMusicLyrics - A function that handles the music lyrics generation process.
 * - GenerateMusicLyricsInput - The input type for the generateMusicLyrics function.
 * - GenerateMusicLyricsOutput - The return type for the generateMusicLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMusicLyricsInputSchema = z.object({
  style: z
    .string()
    .describe('The style of the music, e.g., Love, Party, Struggle.'),
  theme: z
    .string()
    .describe('The theme of the song, e.g., Heartbreak, Success, Betrayal.'),
});
export type GenerateMusicLyricsInput = z.infer<typeof GenerateMusicLyricsInputSchema>;

const GenerateMusicLyricsOutputSchema = z.object({
  beatSuggestion: z.string().describe('A suggestion for the beat of the song.'),
  lyricSuggestions: z.array(z.string()).describe('Suggestions for the lyrics of the song.'),
});
export type GenerateMusicLyricsOutput = z.infer<typeof GenerateMusicLyricsOutputSchema>;

export async function generateMusicLyrics(input: GenerateMusicLyricsInput): Promise<GenerateMusicLyricsOutput> {
  return generateMusicLyricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMusicLyricsPrompt',
  input: {schema: GenerateMusicLyricsInputSchema},
  output: {schema: GenerateMusicLyricsOutputSchema},
  prompt: `You are a professional songwriter who is able to generate lyric and beat ideas based on a style and theme.

  Style: {{{style}}}
  Theme: {{{theme}}}

  Please provide a beat suggestion and three lyric suggestions for a song with the given style and theme.
  Format your response as a JSON object:
  {
    "beatSuggestion": "[beat suggestion here]",
    "lyricSuggestions": ["[lyric suggestion 1]", "[lyric suggestion 2]", "[lyric suggestion 3]"]
  }`,
});

const generateMusicLyricsFlow = ai.defineFlow(
  {
    name: 'generateMusicLyricsFlow',
    inputSchema: GenerateMusicLyricsInputSchema,
    outputSchema: GenerateMusicLyricsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
