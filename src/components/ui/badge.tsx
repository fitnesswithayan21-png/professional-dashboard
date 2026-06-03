'use client';
import { cn } from '@/lib/utils';

interface BadgeProps { status: string; className?: string; }

const STATUS_MAP: Record<string, string> = {
  new:           'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
  contacted:     'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  qualified:     'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  proposal:      'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]',
  negotiation:   'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]',
  converted:     'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  completed:     'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  confirmed:     'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
  scheduled:     'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  lost:          'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  disqualified:  'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  'no-show':     'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  'no show':     'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  pending:       'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  cancelled:     'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]',
};

export function Badge({ status, className }: BadgeProps) {
  const key = status.toLowerCase().trim();
  const styles = STATUS_MAP[key] ?? 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 text-[12px] font-medium border rounded-full whitespace-nowrap tracking-wide leading-none',
      styles, className
    )}>
      {label}
    </span>
  );
}

interface ScoreBadgeProps { score: number; className?: string; }
export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const color = score >= 90 ? 'text-[#047857]' : score >= 70 ? 'text-[#B45309]' : 'text-[#B91C1C]';
  return (
    <span className={cn('font-mono text-[13px] font-semibold tabular-nums', color, className)}>
      {score}
    </span>
  );
}
