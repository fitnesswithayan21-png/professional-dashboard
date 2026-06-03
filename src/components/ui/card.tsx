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
        'bg-white border border-[#E2E8F0] rounded-xl',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        hoverable && 'transition-shadow duration-150 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer',
        padding === 'none' && '',
        padding === 'sm' && 'p-4',
        padding === 'default' && 'p-5',
        padding === 'lg' && 'p-6',
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
