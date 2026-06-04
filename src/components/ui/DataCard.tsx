import { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface DataField {
  label: string;
  value: ReactNode;
}

interface DataCardProps {
  title: string;
  fields: DataField[];
  className?: string;
  columns?: 1 | 2;
}

export function DataCard({ title, fields, className, columns = 2 }: DataCardProps) {
  return (
    <Card padding="default" className={className}>
      <h3 className="text-base font-semibold text-slate-900 mb-4">{title}</h3>
      <div className={cn(
        'grid gap-y-4 gap-x-6',
        columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
      )}>
        {fields.map((field, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{field.label}</span>
            <span className="text-sm font-medium text-slate-900">{field.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
