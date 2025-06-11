'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGame } from '@/contexts/game-state-context';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SidebarNav } from '@/components/sidebar-nav';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { gameState, isLoaded, createArtist } = useGame();

  useEffect(() => {
    if (isLoaded && !gameState.artist) {
      router.replace('/artist-genesis');
    }
  }, [isLoaded, gameState.artist, router]);

  if (!isLoaded || !gameState.artist) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleLogout = () => {
    // Reset game state to initial, effectively logging out / starting new game prompt
    // A true logout would involve clearing localStorage and redirecting,
    // for this game, we'll re-initialize the artist.
    // For a full app with auth, this would be different.
    localStorage.removeItem('fameFactoryGameState_v1'); // Clear the specific key
    window.location.href = '/artist-genesis'; // Force reload to artist genesis
  };


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r-2 border-purple-liquid-gradient">
        <SidebarHeader className="p-0 border-b border-sidebar-border">
          <Logo collapsed={useSidebar().state === 'collapsed'} />
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
           {gameState.artist && !useSidebar().state?.includes('collapsed') && (
             <div className="flex items-center gap-2 p-2 rounded-md bg-sidebar-accent/20">
               <Avatar className="h-10 w-10 border-2 border-primary">
                 <AvatarImage src={`https://placehold.co/40x40.png?text=${gameState.artist.name.charAt(0)}`} alt={gameState.artist.name} data-ai-hint="abstract avatar"/>
                 <AvatarFallback>{gameState.artist.name.charAt(0).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div>
                 <p className="font-semibold text-sm text-sidebar-foreground truncate">{gameState.artist.name}</p>
                 <p className="text-xs text-sidebar-foreground/70 truncate">{gameState.artist.genre}</p>
               </div>
             </div>
           )}
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> 
            {!useSidebar().state?.includes('collapsed') && <span>New Game / Reset</span>}
          </Button>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm">
           <SidebarTrigger className="md:hidden" /> {/* Hidden on md+ screens where sidebar is visible */}
           <h1 className="text-xl font-semibold font-headline text-foreground/80 ml-auto md:ml-0">
             Week {gameState.currentTurn}
           </h1>
        </header>
        <SidebarInset className="flex-1 overflow-auto bg-gradient-to-br from-background to-purple-50/20 animate-fluid-bg bg-[length:200%_200%]">
          <main className="p-4 md:p-6 lg:p-8">
           {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
