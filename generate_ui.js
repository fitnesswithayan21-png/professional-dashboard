const fs = require('fs');
const path = require('path');

const UI_DIR = path.join('e:', 'other project', 'working dashboard', 'src', 'components', 'ui');

// Ensure directory exists
if (!fs.existsSync(UI_DIR)) {
  fs.mkdirSync(UI_DIR, { recursive: true });
}

const files = {
  'PageContainer.tsx': `import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full max-w-[1600px] mx-auto px-6 py-8', className)}>
      {children}
    </div>
  );
}
`,

  'SectionContainer.tsx': `import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('w-full space-y-6 mb-10', className)}>
      {children}
    </section>
  );
}
`,

  'SectionHeader.tsx': `import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeader({ title, description, action, className }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6', className)}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
`,

  'DashboardGrid.tsx': `import { ReactNode } from 'react';
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
`,

  'Card.tsx': `'use client';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = 'default', hoverable = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card relative',
        hoverable && 'transition-shadow duration-150 hover:shadow-elevated cursor-pointer',
        padding === 'none' && '',
        padding === 'sm' && 'p-4',
        padding === 'default' && 'p-6',
        padding === 'lg' && 'p-8',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
`,

  'MetricCard.tsx': `import { ReactNode } from 'react';
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
`,

  'ChartContainer.tsx': `import { ReactNode } from 'react';
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
`,

  'ChartCard.tsx': `import { ReactNode } from 'react';
import { Card } from './Card';
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
`,

  'ProfileCard.tsx': `import { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { Avatar } from './avatar';

interface ProfileCardProps {
  name: string;
  avatarUrl?: string;
  initials?: string;
  status?: ReactNode;
  score?: ReactNode;
  metadata?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ProfileCard({ name, avatarUrl, initials, status, score, metadata, className, onClick }: ProfileCardProps) {
  return (
    <Card padding="default" hoverable={!!onClick} onClick={onClick} className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={avatarUrl} fallback={initials || name.charAt(0)} size="lg" />
          <div>
            <h4 className="font-semibold text-slate-900 text-base">{name}</h4>
            {status && <div className="mt-0.5">{status}</div>}
          </div>
        </div>
        {score && <div>{score}</div>}
      </div>
      
      {metadata && (
        <div className="pt-4 border-t border-slate-100 text-sm text-slate-500">
          {metadata}
        </div>
      )}
    </Card>
  );
}
`,

  'DataCard.tsx': `import { ReactNode } from 'react';
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
`,

  'EmptyState.tsx': `import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50', className)}>
      <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-400">
        <Icon size={24} strokeWidth={2} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-[250px] mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
`,

  'InsightCard.tsx': `import { ReactNode } from 'react';
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
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(UI_DIR, filename), content);
  console.log('Created: ' + filename);
}
