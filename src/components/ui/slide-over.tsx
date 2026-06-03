'use client';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Button } from './button';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
  showHeader?: boolean;
}

export function SlideOver({ isOpen, onClose, title, children, width = 'max-w-md', showHeader = true }: SlideOverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Slide Over Panel */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out w-full",
          width,
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7]">
            <h2 className="text-[16px] font-semibold text-[#09090B]">
              {title || 'Details'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-[#A1A1AA] hover:text-[#09090B]">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
}
