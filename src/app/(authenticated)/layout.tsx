
'use client';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useGame } from '@/contexts/game-state-context';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SidebarNav } from '@/components/sidebar-nav';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// This new component will be rendered inside SidebarProvider
// and can safely call useSidebar()
function AuthenticatedPageStructure({ children }: { children: ReactNode }) {
  const { gameState } = useGame(); // gameState is needed for artist info and currentTurn
  const sidebarContext = useSidebar();
  
  // It's possible sidebarContext could be null if useSidebar is called outside a provider,
  // though our structure should prevent this. Add a defensive check.
  const isSidebarCollapsed = sidebarContext?.state?.includes('collapsed') ?? false;

  const handleLogout = () => {
    localStorage.removeItem('fameFactoryGameState_v1');
    window.location.href = '/artist-genesis'; // Full page reload to reset state
  };

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r-2 border-purple-liquid-gradient">
        <SidebarHeader className="p-0 border-b border-sidebar-border">
          <Logo collapsed={isSidebarCollapsed} />
        </SidebarHeader>
        <SidebarContent className="flex-1">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          {gameState.artist && !isSidebarCollapsed && (
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
            {!isSidebarCollapsed && <span>New Game / Reset</span>}
          </Button>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm">
          <SidebarTrigger className="md:hidden" />
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
    </>
  );
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { gameState, isLoaded } = useGame();

  useEffect(() => {
    if (isLoaded && !gameState.artist && pathname !== '/artist-genesis') {
      router.replace('/artist-genesis');
    }
  }, [isLoaded, gameState.artist, router, pathname]);

  if (!isLoaded || (isLoaded && !gameState.artist && pathname !== '/artist-genesis')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AuthenticatedPageStructure>
        {children}
      </AuthenticatedPageStructure>
    </SidebarProvider>
  );
}
