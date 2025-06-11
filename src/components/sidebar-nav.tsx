
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Home, Wand2, Library, Network, Zap, PlaySquare, Disc3 } from 'lucide-react'; 
import { useSidebar } from '@/components/ui/sidebar'; 

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/music-forge', label: 'Music Forge', icon: Wand2 },
  { href: '/music-manager', label: 'Music Manager', icon: Library },
  { href: '/social-connect', label: 'XConnect', icon: Network },
  { href: '/events', label: 'Events', icon: Zap },
  { href: '/tunify', label: 'Tunify', icon: PlaySquare },
  { href: '/music-verse', label: 'MusicVerse', icon: Disc3 },
  // { href: '/artist-genesis', label: 'New Artist', icon: UserPlus }, 
  // { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar(); 
  const collapsed = sidebarState === 'collapsed';

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            pathname === item.href && 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md',
            item.disabled && 'pointer-events-none opacity-50',
            collapsed && 'justify-center'
          )}
          title={collapsed ? item.label : undefined}
          aria-label={item.label}
        >
          <item.icon className={cn('h-5 w-5 shrink-0', collapsed ? 'h-6 w-6' : '')} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
      ))}
    </nav>
  );
}
