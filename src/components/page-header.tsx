
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { memo } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode; // For actions like buttons
}

const PageHeaderComponent = ({ title, description, icon: Icon, children }: PageHeaderProps) => {
  return (
    <div className="mb-8 border-b border-border/50 pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          <div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-glow-primary tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-base text-foreground/70 font-body">
                {description}
              </p>
            )}
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
};

export const PageHeader = memo(PageHeaderComponent);
