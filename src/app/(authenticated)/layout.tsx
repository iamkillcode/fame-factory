
'use client';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useGame } from '@/contexts/game-state-context';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { SidebarNav } from '@/components/sidebar-nav';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, UserCircle } from 'lucide-react'; // UserCircle for generic user avatar
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function AuthenticatedPageStructure({ children }: { children: ReactNode }) {
  const { gameState } = useGame();
  const { currentUser, signOut, loading: authLoading } = useAuth(); // Get signOut and currentUser
  const sidebarContext = useSidebar();
  
  const isSidebarCollapsed = sidebarContext?.state?.includes('collapsed') ?? false;

  const handleLogout = async () => {
    await signOut();
    // Router push to login will be handled by the main layout's useEffect
  };
  
  const artistName = gameState.artist?.name;
  const artistGenre = gameState.artist?.genre;
  const userEmail = currentUser?.email;

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
          {currentUser && !isSidebarCollapsed && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-sidebar-accent/20">
              <Avatar className="h-10 w-10 border-2 border-primary">
                {artistName ? (
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${artistName.charAt(0)}`} alt={artistName} data-ai-hint="abstract letter"/>
                ) : (
                  <UserCircle className="h-full w-full text-primary" />
                )}
                <AvatarFallback>{artistName ? artistName.charAt(0).toUpperCase() : (userEmail ? userEmail.charAt(0).toUpperCase() : 'U')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-sidebar-foreground truncate">{artistName || userEmail || 'User'}</p>
                {artistGenre && <p className="text-xs text-sidebar-foreground/70 truncate">{artistGenre}</p>}
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {!isSidebarCollapsed && <span>Logout</span>}
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
  const { gameState, isLoaded: gameIsLoaded } = useGame();
  const { currentUser, loading: authIsLoading } = useAuth(); // Get auth state

  useEffect(() => {
    if (authIsLoading || !gameIsLoaded) {
      // Still waiting for auth or game state to load
      return;
    }

    if (!currentUser) {
      // No user, redirect to login, unless already on a public page (though this layout implies authenticated)
      if (pathname !== '/login') { // Prevent redirect loop if somehow on login
         router.replace('/login');
      }
      return;
    }

    // User is authenticated, now check game state
    if (!gameState.artist && pathname !== '/artist-genesis') {
      // User logged in, but no artist profile yet, and not on artist creation page
      router.replace('/artist-genesis');
    }
  }, [currentUser, authIsLoading, gameIsLoaded, gameState.artist, router, pathname]);

  // Show loader if auth is processing, or if game state isn't loaded yet and user is determined
  if (authIsLoading || (!gameIsLoaded && currentUser)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If not authenticated and not on a public page (though this layout is for auth pages)
  // This case should ideally be caught by the useEffect redirecting to /login
  if (!currentUser && pathname !== '/login' && pathname !=='/artist-genesis') {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-2">Redirecting to login...</p>
        </div>
    );
  }
  
  // If authenticated, but no artist and not on artist-genesis page (already handled by useEffect redirect)
  // This specific condition is less likely to be hit due to the useEffect, but as a fallback:
  if (currentUser && !gameState.artist && pathname !== '/artist-genesis') {
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Setting up your artist profile...</p>
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
