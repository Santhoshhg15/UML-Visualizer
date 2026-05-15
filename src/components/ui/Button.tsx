/**
 * Button.tsx
 * ──────────────────────────────────────────────────
 * Unified button system for the engineering workspace.
 */

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style of the button.
   * - primary: Brand blue solid.
   * - secondary: Slate bordered, subtle depth.
   * - ghost: Minimal, for secondary actions.
   * - danger: Error red, restrained.
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  
  /**
   * The size and padding of the button.
   */
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-sm border border-brand-400/20',
    secondary: 'bg-surface-800/40 border border-white/5 text-surface-300 hover:bg-surface-700 hover:text-surface-100 hover:border-white/10',
    ghost: 'bg-transparent text-surface-400 hover:bg-surface-800/40 hover:text-surface-100',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300'
  };

  const sizes = {
    sm: 'py-1.5 px-3 text-[11px] rounded-lg gap-1.5',
    md: 'py-2 px-4 text-xs rounded-xl gap-2',
    lg: 'py-2.5 px-5 text-[13px] rounded-xl gap-2'
  };

  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
