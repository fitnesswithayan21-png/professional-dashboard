'use client';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colors = [
  'from-indigo-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-fuchsia-500',
];

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-11 w-11 text-sm' };
  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-white shrink-0',
      colors[colorIndex],
      sizes[size],
      className
    )}>
      {getInitials(name)}
    </div>
  );
}
