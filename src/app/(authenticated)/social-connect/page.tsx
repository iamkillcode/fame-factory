
'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/game-state-context';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Network, TrendingUp, RadioTower, Send, Heart, Repeat2, MessageSquare, Users, Loader2 } from 'lucide-react'; // Changed MessageCircle to Network
import { SectionCard } from '@/components/section-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Keep for potential future use, not directly used now
import { useToast } from '@/hooks/use-toast';
import type { Song } from '@/types';

interface SocialPost {
  id: string;
  user: { name: string; handle: string; avatarSeed: string };
  content: string;
  timestamp: string;
  likes: number;
  reposts: number;
  comments: number;
  isArtistPost?: boolean;
}

const generateRandomFanName = () => {
  const first = ["Music", "Beat", "Rhythm", "Song", "Star", "Groove"];
  const last = ["Lover", "Fan", "Addict", "Enthusiast", "Junkie", "Head"];
  return `${first[Math.floor(Math.random() * first.length)]}${last[Math.floor(Math.random() * last.length)]}${Math.floor(Math.random()*1000)}`;
}

const generateRandomPostContent = (artistName: string) => {
  const templates = [
    `Can't wait for new music from @${artistName}! 🔥🔥🔥`,
    `Just heard @${artistName}'s latest track, it's a banger! 🎧`,
    `@${artistName} is the G.O.A.T! 🐐`,
    `When is @${artistName} dropping the next album? The anticipation is killing me!`,
    `Saw @${artistName} live last night! Incredible show! 🤩`,
    `Who else thinks @${artistName} deserves more recognition? Underrated legend!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}


export default function SocialConnectPage() {
  const { gameState, updateArtistStats } = useGame();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const artistName = gameState.artist?.name || "TheArtist";
  const artistHandle = artistName.replace(/\s+/g, '');


  useEffect(() => {
    // Simulate fetching initial posts
    const initialPosts: SocialPost[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `post-${Date.now()}-${i}`,
      user: { name: generateRandomFanName(), handle: generateRandomFanName().toLowerCase(), avatarSeed: Math.random().toString() },
      content: generateRandomPostContent(artistHandle),
      timestamp: `${Math.floor(Math.random() * 59) + 1}m ago`,
      likes: Math.floor(Math.random() * 1000),
      reposts: Math.floor(Math.random() * 200),
      comments: Math.floor(Math.random() * 50),
    }));
    setPosts(initialPosts);
  }, [artistHandle]);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    
    const newArtistPost: SocialPost = {
      id: `post-${Date.now()}-artist`,
      user: { name: artistName, handle: artistHandle, avatarSeed: artistName },
      content: newPostContent,
      timestamp: 'Just now',
      likes: 0,
      reposts: 0,
      comments: 0,
      isArtistPost: true,
    };

    // Simulate API call & update UI
    setTimeout(() => {
      setPosts(prevPosts => [newArtistPost, ...prevPosts]);
      setNewPostContent('');
      setIsPosting(false);
      toast({ title: "Post Published!", description: "Your update is live on XConnect." });
      updateArtistStats({ fame: 1, reputation: 0.5 }); 
    }, 1000);
  };
  
  const releasedSongs = gameState.songs.filter(s => s.isReleased);

  const hypeRelease = (song: Song) => {
    setNewPostContent(`🚀 Big news! My new track "${song.title}" is out now! 🔥 Go stream it everywhere! #NewMusic #${artistHandle} #${song.style}`);
    toast({ title: "Hype Post Drafted!", description: "Content added to post box. Hit send!"});
  };

  const startTrend = () => {
    setNewPostContent(`Let's start a new trend! Use #My${artistHandle}Vibes to share how my music makes you feel! I'll be checking them out! 👇`);
    toast({ title: "Trend Post Drafted!", description: "Content added to post box. Hit send!"});
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="XConnect"
        description="Engage with your fans, share updates, and build your online presence on XConnect."
        icon={Network}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Create Post" action={
            <Button onClick={handleCreatePost} disabled={isPosting || !newPostContent.trim()} className="btn-glossy-accent">
              {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Post
            </Button>
          }>
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={`https://placehold.co/40x40.png?text=${artistName.charAt(0)}`} alt={artistName} data-ai-hint="abstract letter" />
                <AvatarFallback>{artistName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's happening?"
                className="min-h-[100px] flex-1 bg-background/50 focus:bg-background"
                rows={3}
              />
            </div>
          </SectionCard>

          <SectionCard title="Feed">
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {posts.map(post => (
                <div key={post.id} className={`p-4 rounded-lg border ${post.isArtistPost ? 'bg-primary/10 border-primary/30' : 'bg-card/50 border-border/30'}`}>
                  <div className="flex items-start space-x-3">
                    <Avatar className="mt-1">
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${post.user.name.charAt(0)}`} alt={post.user.name} data-ai-hint="abstract face" />
                      <AvatarFallback>{post.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-foreground">{post.user.name}</span>
                        <span className="text-xs text-muted-foreground">@{post.user.handle} · {post.timestamp}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/90 whitespace-pre-wrap">{post.content}</p>
                      <div className="mt-3 flex items-center space-x-6 text-xs text-muted-foreground">
                        <Button variant="ghost" size="xs" className="flex items-center gap-1 hover:text-pink-500"><Heart className="h-3 w-3"/> {post.likes}</Button>
                        <Button variant="ghost" size="xs" className="flex items-center gap-1 hover:text-green-500"><Repeat2 className="h-3 w-3"/> {post.reposts}</Button>
                        <Button variant="ghost" size="xs" className="flex items-center gap-1 hover:text-blue-500"><MessageSquare className="h-3 w-3"/> {post.comments}</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Quick Actions">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Hype a Release:</h4>
              {releasedSongs.length > 0 ? (
                releasedSongs.slice(0,2).map(song => (
                   <Button key={song.id} variant="outline" onClick={() => hypeRelease(song)} className="w-full justify-start glassy-card hover:bg-primary/10">
                     <RadioTower className="mr-2 h-4 w-4 text-primary" /> Hype "{song.title}"
                   </Button>
                ))
              ) : <p className="text-xs text-muted-foreground">No songs released yet to hype.</p>}
              
              <h4 className="text-sm font-semibold text-muted-foreground mt-4">Engage Fans:</h4>
              <Button variant="outline" onClick={startTrend} className="w-full justify-start glassy-card hover:bg-primary/10">
                <TrendingUp className="mr-2 h-4 w-4 text-primary" /> Start a Trend
              </Button>
              <Button variant="outline" onClick={() => {
                setNewPostContent("Shoutout to my amazing fans! Your support means the world to me! ❤️ What's your favorite song of mine and why? 👇 #FanLove");
                toast({title: "Fan Appreciation Post Drafted!"});
                }} className="w-full justify-start glassy-card hover:bg-primary/10">
                <Users className="mr-2 h-4 w-4 text-primary" /> Interact with Fans
              </Button>
            </div>
          </SectionCard>
           <SectionCard title="Social Stats">
                <div className="space-y-2">
                    <p className="text-sm flex justify-between">Followers: <span className="font-bold text-primary">{gameState.artist?.fanbase.toLocaleString()}</span></p>
                    <p className="text-sm flex justify-between">Engagement Rate: <span className="font-bold text-primary">{(Math.random() * 5 + 2).toFixed(1)}%</span></p>
                    <p className="text-sm flex justify-between">Posts This Week: <span className="font-bold text-primary">{posts.filter(p=>p.isArtistPost).length}</span></p>
                </div>
            </SectionCard>
        </div>
      </div>
    </div>
  );
}
