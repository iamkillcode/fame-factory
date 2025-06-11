import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  action?: ReactNode;
}

export function SectionCard({ title, description, children, className, titleClassName, action }: SectionCardProps) {
  return (
    <div className={cn('glassy-card p-6 shadow-lg', className)}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          {title && (
            <div>
              <h2 className={cn('text-xl font-headline font-semibold text-foreground', titleClassName)}>
                {title}
              </h2>
              {description && <p className="text-sm text-foreground/70 mt-1">{description}</p>}
            </div>
          )}
          {action && <div className="mt-2 sm:mt-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
