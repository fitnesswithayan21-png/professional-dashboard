import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({ children, columns = 3, className }: DashboardGridProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 1 && 'grid-cols-1',
      columns === 2 && 'grid-cols-1 lg:grid-cols-2',
      columns === 3 && 'grid-cols-1 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
      className
    )}>
      {children}
    </div>
  );
}
