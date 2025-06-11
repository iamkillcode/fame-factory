
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, currentUser, loading, authError, setAuthError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser && !loading) {
      router.replace('/'); // Redirect to home page, which will route to dashboard or artist-genesis
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (authError) {
      toast({
        title: "Authentication Error",
        description: authError.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setAuthError(null); // Clear error after showing
    }
  }, [authError, toast, setAuthError]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    await signIn({ email, password });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    await signUp({ email, password });
  };
  
  if (loading && !currentUser) { // Show loader if auth is processing and no user yet (to avoid flash of login form)
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  // If user becomes available while loading, useEffect will redirect, so this might not be shown often
  // but good for initial render if user is already cached by Firebase SDK
  if (currentUser) {
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-purple-100/30 p-4">
      <Card className="w-full max-w-md glassy-card">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline text-glow-primary">Welcome to Fame Factory!</CardTitle>
          <CardDescription>Sign in or create an account to start your journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 focus:bg-background"
              />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 focus:bg-background"
              />
            </div>
           <CardFooter className="flex flex-col gap-4 pt-8 pb-0 px-0"> {/* Changed to flex-col and added gap */}
              <Button type="submit" className="w-full btn-glossy-accent" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
              <Button variant="outline" onClick={handleSignUp} className="w-full glassy-card hover:bg-primary/10" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
