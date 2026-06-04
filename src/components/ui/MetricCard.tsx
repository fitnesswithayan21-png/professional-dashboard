import { ReactNode } from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: ReactNode;
  icon: React.ElementType;
  iconColor?: string;
  trend?: { value: string; type: 'up' | 'down' | 'neutral' };
  className?: string;
}

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = '#2563EB',
  trend,
  className
}: MetricCardProps) {
  return (
    <Card padding="default" className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Icon size={18} style={{ color: iconColor }} strokeWidth={2.5} />
          <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
        </div>
        {trend && (
          <div className={cn(
            'inline-flex items-center gap-1 text-[13px] font-bold px-2.5 py-1 rounded-md',
            trend.type === 'up' && 'text-emerald-600 bg-emerald-50',
            trend.type === 'down' && 'text-red-600 bg-red-50',
            trend.type === 'neutral' && 'text-slate-600 bg-slate-100'
          )}>
            {trend.type === 'up' && <TrendingUp size={14} strokeWidth={2.5} />}
            {trend.type === 'down' && <TrendingDown size={14} strokeWidth={2.5} />}
            {trend.type === 'neutral' && <Minus size={14} strokeWidth={2.5} />}
            {trend.value}
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="text-4xl font-bold text-slate-900 leading-none tracking-tight">{value}</p>
      </div>

      {sub && (
        <div>
          <span className="text-sm font-medium text-slate-500">{sub}</span>
        </div>
      )}
    </Card>
  );
}
