import { ReactNode } from 'react';
import { Card } from './card';
import { ChartContainer } from './ChartContainer';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode; // This will be the actual chart (e.g. Recharts ResponsiveContainer)
  action?: ReactNode;
  height?: number | string;
  className?: string;
  legend?: ReactNode;
}

export function ChartCard({ title, description, children, action, height = 300, className, legend }: ChartCardProps) {
  return (
    <Card padding="lg" className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      
      <ChartContainer height={height}>
        {children}
      </ChartContainer>

      {legend && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {legend}
        </div>
      )}
    </Card>
  );
}
