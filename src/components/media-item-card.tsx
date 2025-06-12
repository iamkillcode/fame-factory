
'use client';

import Image from 'next/image';
import type { Song, Album } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BarChart3, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface MediaItemCardProps {
  item: Song | Album;
  artistName: string;
  className?: string;
}

const MediaItemCardComponent = ({ item, artistName, className }: MediaItemCardProps) => {
  const isSong = 'lyrics' in item; // Type guard to differentiate Song from Album
  const placeholderSize = isSong ? "100" : "150";
  const coverArtHint = isSong ? "abstract pattern" : "album cover";

  return (
    <Card className={cn("glassy-card overflow-hidden hover:shadow-primary/30 transition-shadow", className)}>
      <CardHeader className="p-0 relative">
        <Image
          src={`https://placehold.co/${placeholderSize}x${placeholderSize}.png`}
          alt={`${item.title} cover art`}
          width={parseInt(placeholderSize)}
          height={parseInt(placeholderSize)}
          className="w-full object-cover aspect-square"
          data-ai-hint={coverArtHint}
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold truncate text-foreground" title={item.title}>
          {item.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground truncate" title={artistName}>
          {artistName}
        </CardDescription>
        
        {isSong && (item as Song).isReleased && (
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {(item as Song).sales !== undefined && (
              <p className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-primary" />
                Streams: { (item as Song).sales?.toLocaleString() || 'N/A' }
              </p>
            )}
            {(item as Song).currentChartPosition && (
              <p className="flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3 text-primary" />
                Chart: #{(item as Song).currentChartPosition}
              </p>
            )}
             {(item as Song).fanReaction !== undefined && (
              <p className="flex items-center gap-1.5">
                <Star className="h-3 w-3 text-primary" />
                Fan Reaction: {(item as Song).fanReaction}%
              </p>
            )}
          </div>
        )}
         {!isSong && (item as Album).isReleased && (
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {(item as Album).sales !== undefined && (
              <p className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-primary" />
                Total Units: { (item as Album).sales?.toLocaleString() || 'N/A' }
              </p>
            )}
            {(item as Album).currentChartPosition && (
              <p className="flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3 text-primary" />
                Chart: #{(item as Album).currentChartPosition}
              </p>
            )}
             {(item as Album).fanReaction !== undefined && (
              <p className="flex items-center gap-1.5">
                <Star className="h-3 w-3 text-primary" />
                Overall Reception: {(item as Album).fanReaction}%
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MediaItemCard = memo(MediaItemCardComponent);
