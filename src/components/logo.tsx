
import { Music2 } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { memo } from 'react';

interface LogoProps {
  collapsed?: boolean;
}

const LogoComponent = ({ collapsed }: LogoProps) => {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 py-4 text-sidebar-foreground hover:text-sidebar-primary transition-colors">
      <Music2 className={`h-8 w-8 ${collapsed ? 'mx-auto' : ''} text-primary`} />
      {!collapsed && (
        <span className="text-2xl font-headline font-semibold text-glow-primary">
          Fame Factory
        </span>
      )}
    </Link>
  );
};

export const Logo = memo(LogoComponent);
