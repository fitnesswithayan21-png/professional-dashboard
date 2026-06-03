'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1 bg-white/5 border border-white/[0.06] rounded-xl p-1 shrink-0',
      className
    )}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  activeValue: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ 
  value, 
  activeValue, 
  onClick, 
  children, 
  className 
}: TabsTriggerProps) {
  const isActive = value === activeValue;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2',
        isActive 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15 border border-indigo-500/20' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  activeValue: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, activeValue, children, className }: TabsContentProps) {
  if (value !== activeValue) return null;
  
  return (
    <div className={cn('animate-fade-in w-full', className)}>
      {children}
    </div>
  );
}
