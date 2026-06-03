'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  children?: ReactNode;
  loading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'default', 
  children, 
  className, 
  loading, 
  disabled, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#6366F1] hover:bg-[#4F46E5] active:bg-[#4338CA] text-white shadow-sm border border-transparent',
    secondary: 'bg-white hover:bg-[#F4F4F5] hover:border-[#D4D4D8] text-[#3F3F46] border border-[#E4E4E7]',
    ghost: 'bg-transparent hover:bg-[#F4F4F5] text-[#52525B] border border-transparent',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] active:bg-[#B91C1C] text-white shadow-sm border border-transparent',
  };

  const sizes = {
    sm: 'h-[32px] px-3 text-[13px] rounded-lg',
    default: 'h-[36px] px-4 text-[14px] rounded-lg',
    lg: 'h-[40px] px-5 text-[14px] rounded-lg',
    icon: 'h-[36px] w-[36px] flex items-center justify-center rounded-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-1 cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
