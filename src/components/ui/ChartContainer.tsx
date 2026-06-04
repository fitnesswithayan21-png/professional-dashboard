import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
}

export function ChartContainer({ children, height = 300, className }: ChartContainerProps) {
  return (
    <div style={{ height }} className={cn('w-full mt-4', className)}>
      {children}
    </div>
  );
}
