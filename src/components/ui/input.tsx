'use client';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[40px] w-full rounded-lg border border-[#E4E4E7] bg-[#F4F4F5] px-3 py-2 text-[14px] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A1A1AA]',
          'focus-visible:outline-none focus-visible:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/10',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#EF4444] focus-visible:border-[#EF4444] focus-visible:ring-[#EF4444]/10',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
