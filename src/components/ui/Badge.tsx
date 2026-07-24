/**
 * Badge — small coloured pill for priorities, task types, and statuses.
 * The `tone` prop maps to a fixed colour set so meaning stays consistent
 * (e.g. high priority is always red-ish).
 */
import type { ReactNode } from 'react';

type Tone = 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

const TONE_CLASSES: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  blue: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  green:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  violet:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
