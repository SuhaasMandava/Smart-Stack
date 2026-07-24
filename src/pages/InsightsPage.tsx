/**
 * InsightsPage — surfaces the observations from the insights engine.
 *
 * This is the seed of the future ML feature: today it shows rule-based
 * estimate-vs-actual insights and a per-type accuracy breakdown. When the
 * duration-predictor model lands, it will render *its* predictions here using
 * the same layout — the page stays; only `lib/insights.ts` grows up.
 */
import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Card, CardHeader } from '../components/ui/Card';
import {
  computeTypeAccuracy,
  generateInsights,
  overallAccuracy,
  TASK_TYPE_LABELS,
} from '../lib/insights';
import { formatMinutes } from '../lib/taskMeta';

export function InsightsPage() {
  const { tasks } = useAppData();

  // Compute all three views once per task change.
  const { insights, accuracy, overall } = useMemo(
    () => ({
      insights: generateInsights(tasks),
      accuracy: computeTypeAccuracy(tasks),
      overall: overallAccuracy(tasks),
    }),
    [tasks],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Headline accuracy */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Overall estimate accuracy
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Based on every completed task with a logged time
            </p>
          </div>
          <span className="text-4xl font-bold text-brand-600 dark:text-brand-400">
            {overall != null ? `${overall}%` : '—'}
          </span>
        </div>
      </Card>

      {/* Plain-language insights */}
      <Card>
        <CardHeader
          title="What we've noticed"
          subtitle="Patterns in how you estimate different kinds of work"
        />
        <ul className="flex flex-col gap-2.5">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${toneClasses(
                insight.tone,
              )}`}
            >
              <span className="mt-0.5 text-base leading-none">
                {insight.tone === 'warning' ? '⚠️' : insight.tone === 'positive' ? '✅' : '💡'}
              </span>
              <span>{insight.message}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Per-type accuracy table */}
      <Card>
        <CardHeader
          title="Accuracy by task type"
          subtitle="Estimated vs. actual time, grouped by type"
        />
        {accuracy.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No completed tasks yet — your breakdown will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Tasks</th>
                  <th className="pb-2 pr-4 font-medium">Estimated</th>
                  <th className="pb-2 pr-4 font-medium">Actual</th>
                  <th className="pb-2 font-medium">Bias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accuracy.map((row) => (
                  <tr key={row.type} className="text-slate-700 dark:text-slate-300">
                    <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-slate-100">
                      {TASK_TYPE_LABELS[row.type]}
                    </td>
                    <td className="py-2.5 pr-4">{row.sampleSize}</td>
                    <td className="py-2.5 pr-4">{formatMinutes(row.totalEstimated)}</td>
                    <td className="py-2.5 pr-4">{formatMinutes(row.totalActual)}</td>
                    <td className="py-2.5">
                      <BiasCell biasPercent={row.biasPercent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/** Colour a bias value: red = over (underestimated), green = under budget. */
function BiasCell({ biasPercent }: { biasPercent: number }) {
  const rounded = Math.round(biasPercent);
  if (Math.abs(rounded) < 5) {
    return <span className="text-slate-500 dark:text-slate-400">on target</span>;
  }
  const over = rounded > 0;
  return (
    <span
      className={
        over ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
      }
    >
      {over ? '+' : ''}
      {rounded}% {over ? 'over' : 'under'}
    </span>
  );
}

/** Border/background classes for each insight tone. */
function toneClasses(tone: 'warning' | 'positive' | 'neutral'): string {
  switch (tone) {
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200';
    case 'positive':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300';
  }
}
