/**
 * Button — one styled button with a few semantic variants, so we don't repeat
 * Tailwind class soup at every call site and every button behaves consistently.
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger:
    'bg-transparent text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
