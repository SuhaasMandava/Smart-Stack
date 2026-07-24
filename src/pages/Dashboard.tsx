/**
 * Dashboard — the landing page. A quick, at-a-glance answer to "where do I
 * stand?": what's due soon, how many tasks are open vs done, overall progress,
 * estimate accuracy, and the estimate-vs-actual chart.
 *
 * It's read-only and derives everything from the shared task store with memoized
 * selectors, so it stays fast and never mutates data itself.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { EstimateVsActualChart } from '../components/EstimateVsActualChart';
import {
  PRIORITY_TONE,
  PRIORITY_LABEL,
  TYPE_LABEL,
  TYPE_TONE,
} from '../lib/taskMeta';
import { overallAccuracy } from '../lib/insights';
import { daysUntil, formatDayLabel } from '../lib/dates';
import { priorityScore } from '../lib/scheduler';
import { todayISO } from '../lib/dates';

export function Dashboard() {
  const { tasks } = useAppData();

  // Derive all dashboard numbers in one memoized pass.
  const stats = useMemo(() => {
    const today = todayISO();
    const open = tasks.filter((t) => t.status === 'todo');
    const done = tasks.filter((t) => t.status === 'done');

    // "Due soon" = open tasks due within the next 3 days (incl. overdue),
    // ordered by scheduler priority so the most pressing sit on top.
    const dueSoon = open
      .filter((t) => daysUntil(t.dueDate) <= 3)
      .sort((a, b) => priorityScore(b, today) - priorityScore(a, today))
      .slice(0, 5);

    return {
      openCount: open.length,
      doneCount: done.length,
      totalCount: tasks.length,
      dueSoon,
      accuracy: overallAccuracy(tasks),
    };
  }, [tasks]);

  return (
    <div className="flex flex-col gap-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Open tasks" value={stats.openCount} tone="blue" />
        <StatTile label="Completed" value={stats.doneCount} tone="green" />
        <StatTile label="Due soon" value={stats.dueSoon.length} tone="amber" />
        <StatTile
          label="Estimate accuracy"
          value={stats.accuracy != null ? `${stats.accuracy}%` : '—'}
          tone="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Due soon */}
        <Card>
          <CardHeader
            title="Due soon"
            subtitle="Open tasks due in the next 3 days"
            action={
              <Link
                to="/tasks"
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                All tasks →
              </Link>
            }
          />
          {stats.dueSoon.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Nothing urgent. Nice and clear ahead 🌤️
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {stats.dueSoon.map((task) => {
                const days = daysUntil(task.dueDate);
                return (
                  <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Badge tone={TYPE_TONE[task.type]}>{TYPE_LABEL[task.type]}</Badge>
                        <Badge tone={PRIORITY_TONE[task.priority]}>
                          {PRIORITY_LABEL[task.priority]}
                        </Badge>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-medium ${
                        days < 0
                          ? 'text-red-600 dark:text-red-400'
                          : days === 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {days < 0
                        ? `${Math.abs(days)}d overdue`
                        : days === 0
                          ? 'Today'
                          : formatDayLabel(task.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader title="Progress" subtitle="Completed vs. total tasks" />
          <div className="flex flex-col gap-6 py-2">
            <ProgressBar
              value={stats.doneCount}
              max={stats.totalCount}
              label="Tasks completed"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You've completed{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {stats.doneCount}
              </span>{' '}
              of {stats.totalCount} tasks
              {stats.accuracy != null && (
                <>
                  , and your time estimates are about{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {stats.accuracy}% accurate
                  </span>
                </>
              )}
              .
            </p>
          </div>
        </Card>
      </div>

      {/* Estimate vs actual chart */}
      <Card>
        <CardHeader
          title="Estimated vs. actual time"
          subtitle="How your planned time compares to reality, per completed task"
        />
        <EstimateVsActualChart tasks={tasks} />
      </Card>
    </div>
  );
}

/** A single headline number tile. */
function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: 'blue' | 'green' | 'amber' | 'violet';
}) {
  const accent: Record<typeof tone, string> = {
    blue: 'text-brand-600 dark:text-brand-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    violet: 'text-violet-600 dark:text-violet-400',
  };
  return (
    <Card className="p-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent[tone]}`}>{value}</p>
    </Card>
  );
}
