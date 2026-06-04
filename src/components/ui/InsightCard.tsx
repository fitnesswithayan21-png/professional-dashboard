import { ReactNode } from 'react';
import { Card } from './Card';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function InsightCard({ title = "AI Insight", children, className }: InsightCardProps) {
  return (
    <Card 
      padding="default" 
      className={cn(
        'bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 border-indigo-100',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3 text-indigo-600">
        <Sparkles size={16} strokeWidth={2.5} />
        <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-sm text-slate-700 leading-relaxed font-medium">
        {children}
      </div>
    </Card>
  );
}
