/**
 * insights.ts — turns completed-task history into plain-language observations.
 *
 * This is the seed of the future ML "duration predictor". Today it's simple
 * descriptive statistics: for each task type, how does the student's *actual*
 * time compare to their *estimate*? That estimation bias is exactly the target
 * a model would later learn to correct, so we keep the logic isolated and pure
 * — feed it completed tasks, get back structured insights, no side effects.
 *
 * Everything here operates only on completed tasks that have `actualMinutes`.
 */

import type { Task, TaskType } from '../types';

/** Human-readable labels for each task type. */
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  essay: 'Essay',
  'problem-set': 'Problem Set',
  reading: 'Reading',
  'exam-prep': 'Exam Prep',
  other: 'Other',
};

/** Aggregated estimate-vs-actual stats for a single task type. */
export interface TypeAccuracy {
  type: TaskType;
  /** Number of completed tasks of this type. */
  sampleSize: number;
  totalEstimated: number;
  totalActual: number;
  /**
   * Signed percentage difference of actual vs estimated.
   *  > 0  → took longer than estimated (underestimated)
   *  < 0  → finished faster than estimated (overestimated)
   */
  biasPercent: number;
}

/** A single plain-language insight ready to render. */
export interface Insight {
  id: string;
  /** 'warning' = underestimating, 'positive' = accurate/overestimating. */
  tone: 'warning' | 'positive' | 'neutral';
  message: string;
}

/** Only completed tasks that actually recorded a duration are usable. */
function completedWithActuals(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status === 'done' && t.actualMinutes != null);
}

/**
 * Compute estimate-vs-actual accuracy grouped by task type.
 * Returns one entry per type that has at least one completed task, sorted by
 * the most extreme estimation bias first (the most "interesting" rows).
 */
export function computeTypeAccuracy(tasks: Task[]): TypeAccuracy[] {
  const done = completedWithActuals(tasks);

  // Bucket totals by type in a single pass.
  const buckets = new Map<TaskType, { est: number; act: number; n: number }>();
  for (const task of done) {
    const bucket = buckets.get(task.type) ?? { est: 0, act: 0, n: 0 };
    bucket.est += task.estimatedMinutes;
    bucket.act += task.actualMinutes as number;
    bucket.n += 1;
    buckets.set(task.type, bucket);
  }

  const result: TypeAccuracy[] = [];
  for (const [type, { est, act, n }] of buckets) {
    // Guard against divide-by-zero if estimates were somehow all zero.
    const biasPercent = est > 0 ? ((act - est) / est) * 100 : 0;
    result.push({
      type,
      sampleSize: n,
      totalEstimated: est,
      totalActual: act,
      biasPercent,
    });
  }

  // Most misestimated types first — those are the ones worth surfacing.
  return result.sort((a, b) => Math.abs(b.biasPercent) - Math.abs(a.biasPercent));
}

/**
 * Overall estimation accuracy across every completed task, as a percentage
 * where 100% means estimates matched reality exactly. Returns null if there's
 * no data yet. Handy for a single headline number on the dashboard.
 */
export function overallAccuracy(tasks: Task[]): number | null {
  const done = completedWithActuals(tasks);
  if (done.length === 0) return null;

  const totalEst = done.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalAct = done.reduce((s, t) => s + (t.actualMinutes as number), 0);
  if (totalEst === 0) return null;

  // Accuracy = 100% minus the size of the average error, floored at 0.
  const errorRatio = Math.abs(totalAct - totalEst) / totalEst;
  return Math.max(0, Math.round((1 - errorRatio) * 100));
}

/**
 * Produce plain-language insights from the accuracy stats.
 *
 * We only comment on types with a meaningful sample (≥ 2 tasks) and a bias
 * above a small threshold, so we don't over-claim from a single data point —
 * the same discipline a model would need to avoid overfitting.
 */
export function generateInsights(tasks: Task[]): Insight[] {
  const accuracy = computeTypeAccuracy(tasks);
  const insights: Insight[] = [];
  const MIN_SAMPLE = 2;
  const MIN_BIAS = 10; // percent — ignore noise below this.

  for (const row of accuracy) {
    if (row.sampleSize < MIN_SAMPLE) continue;
    if (Math.abs(row.biasPercent) < MIN_BIAS) continue;

    const label = TASK_TYPE_LABELS[row.type].toLowerCase();
    const magnitude = Math.round(Math.abs(row.biasPercent));

    if (row.biasPercent > 0) {
      insights.push({
        id: `underestimate-${row.type}`,
        tone: 'warning',
        message: `You tend to underestimate ${label} tasks by about ${magnitude}%. Consider padding those estimates.`,
      });
    } else {
      insights.push({
        id: `overestimate-${row.type}`,
        tone: 'positive',
        message: `You usually finish ${label} tasks about ${magnitude}% faster than planned — you could budget less time for them.`,
      });
    }
  }

  // If there's simply not enough history yet, say so instead of showing nothing.
  if (insights.length === 0) {
    insights.push({
      id: 'need-more-data',
      tone: 'neutral',
      message:
        'Complete a few more tasks (and log the actual time) to unlock personalized insights.',
    });
  }

  return insights;
}
