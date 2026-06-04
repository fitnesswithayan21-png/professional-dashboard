import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('w-full space-y-6 mb-10', className)}>
      {children}
    </section>
  );
}
