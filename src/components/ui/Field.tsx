/**
 * Field primitives — labelled inputs/selects with shared styling and a slot for
 * validation errors. Keeps every form in the app looking and behaving the same.
 */
import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from 'react';

/** Shared control styling so inputs and selects match exactly. */
const CONTROL =
  'focus-ring w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

/** A label + control + optional error message, stacked vertically. */
export function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${CONTROL} ${props.className ?? ''}`} />;
}
