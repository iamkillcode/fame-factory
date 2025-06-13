
'use server';

/**
 * @fileOverview An AI agent for generating music lyrics and beat ideas based on a selected genre and theme.
 *
 * - generateMusicLyrics - A function that handles the music lyrics generation process.
 * - GenerateMusicLyricsInput - The input type for the generateMusicLyrics function.
 * - GenerateMusicLyricsOutput - The return type for the generateMusicLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMusicLyricsInputSchema = z.object({
  genre: z
    .string()
    .describe('The genre of the music, e.g., Pop, Rock, Hip Hop.'),
  theme: z
    .string()
    .describe('The theme of the song, e.g., Heartbreak, Success, Betrayal.'),
});
export type GenerateMusicLyricsInput = z.infer<typeof GenerateMusicLyricsInputSchema>;

const GenerateMusicLyricsOutputSchema = z.object({
  beatSuggestion: z.string().describe('A suggestion for the beat of the song.'),
  verseSuggestion: z.string().describe('A suggestion for a verse of the song.'),
  chorusSuggestion: z.string().describe('A suggestion for a chorus of the song.'),
  bridgeSuggestion: z.string().describe('A suggestion for a bridge or an alternative lyrical idea for the song.'),
});
export type GenerateMusicLyricsOutput = z.infer<typeof GenerateMusicLyricsOutputSchema>;

export async function generateMusicLyrics(input: GenerateMusicLyricsInput): Promise<GenerateMusicLyricsOutput> {
  return generateMusicLyricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMusicLyricsPrompt',
  input: {schema: GenerateMusicLyricsInputSchema},
  output: {schema: GenerateMusicLyricsOutputSchema},
  prompt: `You are a professional songwriter who is able to generate lyric and beat ideas based on a genre and theme.

  Genre: {{{genre}}}
  Theme: {{{theme}}}

  Please provide:
  1. A beat suggestion.
  2. A suggestion for a verse.
  3. A suggestion for a chorus.
  4. A suggestion for a bridge or an alternative lyrical idea.

  Format your response as a JSON object:
  {
    "beatSuggestion": "[beat suggestion here]",
    "verseSuggestion": "[verse suggestion here]",
    "chorusSuggestion": "[chorus suggestion here]",
    "bridgeSuggestion": "[bridge/alternative idea here]"
  }`,
});

const generateMusicLyricsFlow = ai.defineFlow(
  {
    name: 'generateMusicLyricsFlow',
    inputSchema: GenerateMusicLyricsInputSchema,
    outputSchema: GenerateMusicLyricsOutputSchema,
  },
  async (input): Promise<GenerateMusicLyricsOutput> => {
    const response = await prompt(input);
    const parsedOutput = response.output;

    if (!parsedOutput) {
      console.error(
        `[generateMusicLyricsFlow] LLM response did not conform to the expected schema or was empty. Input: ${JSON.stringify(input)}. Full Genkit response object:`, response
      );
      throw new Error(
        'The AI had trouble generating ideas in the right format. Try a different genre or theme, or simplify your theme.'
      );
    }
    return parsedOutput;
  }
);
