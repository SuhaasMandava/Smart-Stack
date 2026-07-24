/**
 * ProgressBar — a labelled completion bar used on the dashboard. Pure
 * presentation: give it a value and max and it renders the filled proportion.
 */
interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  // Clamp to 0–100% so odd data can never overflow the bar.
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">{label}</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {value}/{max}
          </span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
