import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, className, iconClassName, valueClassName, description }: StatCardProps) {
  return (
    <Card className={cn("glassy-card overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground/80">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-primary", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold text-card-foreground", valueClassName)}>{value}</div>
        {description && <p className="text-xs text-card-foreground/70 pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
