
'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGame } from '@/contexts/game-state-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { UserPlus, Loader2 } from 'lucide-react';
import type { Gender, Genre } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

const artistSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name can't exceed 50 characters."),
  gender: z.string().nonempty("Please select a gender."),
  genre: z.string().nonempty("Please select a genre."),
  backstory: z.string().max(500, "Keep backstory concise (max 500 chars).").optional(),
});

type ArtistFormValues = z.infer<typeof artistSchema>;

export default function ArtistGenesisPage() {
  const { createArtist, gameState, isLoaded: gameIsLoaded } = useGame();
  const { currentUser, loading: authIsLoading } = useAuth();
  const router = useRouter();

  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: '',
      gender: '',
      genre: '',
      backstory: '',
    },
  });

  useEffect(() => {
    if (authIsLoading || !gameIsLoaded) {
      return; 
    }
    if (!currentUser) {
      router.replace('/login'); 
      return;
    }
    if (currentUser && gameState.artist) {
      router.replace('/dashboard'); 
    }
  }, [currentUser, authIsLoading, gameState.artist, gameIsLoaded, router]);


  function onSubmit(values: ArtistFormValues) {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    createArtist({ 
      name: values.name,
      gender: values.gender as Gender,
      genre: values.genre as Genre,
      backstory: values.backstory, // Will be string or undefined
    });
    router.push('/dashboard'); 
  }
  
  if (authIsLoading || !gameIsLoaded) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading...</div>;
  }

  if (!currentUser || (currentUser && gameState.artist)) {
     return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Checking your profile...</div>;
  }


  return (
    <div className="container mx-auto max-w-3xl py-8">
      <PageHeader
        title="Create Your Star"
        description="Define your artist's identity and embark on the journey to fame!"
        icon={UserPlus}
      />
      
      <Card className="glassy-card">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-foreground">Artist Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Artist Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Nova Starr, MC Flow, The Nightingales" {...field} className="bg-background/50 focus:bg-background" />
                    </FormControl>
                    <FormDescription>Your artist's stage name or band name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 focus:bg-background"><SelectValue placeholder="Select gender" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gameState.availableGenders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Primary Genre</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 focus:bg-background"><SelectValue placeholder="Select genre" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {gameState.availableGenres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="backstory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Backstory (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your artist's origins, motivations, and early life... or leave it to fate!"
                        className="resize-y min-h-[120px] bg-background/50 focus:bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>A brief history to shape your artist's narrative. Can be developed over time.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto btn-glossy-accent text-lg px-8 py-6">
                Launch Career
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
