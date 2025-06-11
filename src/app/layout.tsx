import type { Metadata } from 'next';
import './globals.css';
import { GameStateProvider } from '@/contexts/game-state-context';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Fame Factory',
  description: 'Rise to stardom in Fame Factory!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <GameStateProvider>
          {children}
          <Toaster />
        </GameStateProvider>
      </body>
    </html>
  );
}
