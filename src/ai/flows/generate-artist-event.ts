// src/ai/flows/generate-artist-event.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating dynamic events and scenarios for an artist's career in the Fame Factory game.
 *
 * The flow takes artist details as input and generates a dynamic event with multiple choice options.
 * @interface GenerateArtistEventInput - Input type for the generateArtistEvent function.
 * @interface GenerateArtistEventOutput - Output type for the generateArtistEvent function.
 * @function generateArtistEvent - The main function to trigger the event generation flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArtistEventInputSchema = z.object({
  artistName: z.string().describe('The name of the artist.'),
  artistGenre: z.string().describe('The genre of music the artist creates.'),
  artistFame: z.number().describe('The current fame level of the artist.'),
  artistSkills: z.string().describe('The current skill set of the artist.'),
  artistFanbase: z.number().describe('The current fanbase size of the artist.'),
  artistReputation: z.number().describe('The current reputation of the artist.'),
});

export type GenerateArtistEventInput = z.infer<typeof GenerateArtistEventInputSchema>;

const GenerateArtistEventOutputSchema = z.object({
  eventDescription: z.string().describe('A description of the event that occurred.'),
  choice1: z.string().describe('The first choice for how to react to the event.'),
  choice2: z.string().describe('The second choice for how to react to the event.'),
  choice3: z.string().describe('The third choice for how to react to the event.'),
});

export type GenerateArtistEventOutput = z.infer<typeof GenerateArtistEventOutputSchema>;

export async function generateArtistEvent(input: GenerateArtistEventInput): Promise<GenerateArtistEventOutput> {
  return generateArtistEventFlow(input);
}

const generateArtistEventPrompt = ai.definePrompt({
  name: 'generateArtistEventPrompt',
  input: {schema: GenerateArtistEventInputSchema},
  output: {schema: GenerateArtistEventOutputSchema},
  prompt: `You are a game master in a music career simulator. The player is managing an artist and you will generate a dynamic event that will influence the artist's career.

  Artist Name: {{artistName}}
  Artist Genre: {{artistGenre}}
  Artist Fame: {{artistFame}}
  Artist Skills: {{artistSkills}}
  Artist Fanbase: {{artistFanbase}}
  Artist Reputation: {{artistReputation}}

  Create a scenario that is appropriate for the artist's current situation. Provide three choices for the player to react to the event. Ensure the choices are distinct and have different potential consequences.

  The event and choices should be interesting and engaging for the player.`,
});

const generateArtistEventFlow = ai.defineFlow(
  {
    name: 'generateArtistEventFlow',
    inputSchema: GenerateArtistEventInputSchema,
    outputSchema: GenerateArtistEventOutputSchema,
  },
  async input => {
    const {output} = await generateArtistEventPrompt(input);
    return output!;
  }
);
