import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full max-w-[1600px] mx-auto px-6 py-8', className)}>
      {children}
    </div>
  );
}
