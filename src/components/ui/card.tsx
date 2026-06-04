'use client';
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

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-[14px] font-semibold text-[#0F172A]', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[13px] text-[#64748B]', className)}>{children}</p>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('w-full', className)}>{children}</div>;
}
