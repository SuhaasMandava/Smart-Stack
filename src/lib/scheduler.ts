/**
 * scheduler.ts — the "smart scheduler".
 *
 * Takes the student's open tasks plus a simple availability setting and packs a
 * study plan for the next 7 days. It is a PURE function: same inputs → same
 * outputs, no I/O, no reading the clock beyond an injectable `today`. That makes
 * it trivial to unit-test and safe to re-run any time the data changes.
 *
 * Algorithm (greedy, by priority score):
 *   1. Score every open task by urgency (how soon it's due) + priority level.
 *   2. Sort tasks so the most pressing work is placed first.
 *   3. Walk the next 7 days, and for each task pour its estimated minutes into
 *      the available time, day by day, splitting across days when needed.
 *
 * Greedy is the right call here: it's predictable, easy to explain on a
 * portfolio walkthrough, and good enough for a personal planner. The scoring
 * function is isolated (`priorityScore`) so it's easy to tweak or, later,
 * replace with an ML-predicted score.
 */

import type { Priority, ScheduledBlock, Task } from '../types';
import { addDays, addMinutesToTime, toISODate } from './dates';

/** How many days ahead we plan. */
export const PLANNING_HORIZON_DAYS = 7;

/** Weight added to a task's score based on its manual priority label. */
const PRIORITY_WEIGHT: Record<Priority, number> = {
  low: 0,
  medium: 15,
  high: 30,
};

/**
 * Compute a numeric priority score for a task. Higher = schedule sooner.
 *
 * Two components:
 *  - Urgency: the closer (or more overdue) the due date, the higher the score.
 *    We use `max(0, 30 - daysLeft)` so anything due today/overdue tops out and
 *    far-off work contributes little. Overdue tasks get an extra bump.
 *  - Priority label: a flat weight from PRIORITY_WEIGHT.
 *
 * Exported so it can be unit-tested and reused by the UI (e.g. to sort lists).
 *
 * @param task     the task to score
 * @param todayISO the reference "today" as a YYYY-MM-DD string (injectable for tests)
 */
export function priorityScore(task: Task, todayISO: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const today = new Date(todayISO).getTime();
  const due = new Date(task.dueDate).getTime();
  const daysLeft = Math.round((due - today) / msPerDay);

  // Urgency ramps up as the deadline approaches; caps so week-away work is low.
  const urgency = Math.max(0, 30 - daysLeft);
  // Overdue work is a priority — pile on extra weight per day past due.
  const overduePenalty = daysLeft < 0 ? Math.abs(daysLeft) * 10 : 0;

  return urgency + overduePenalty + PRIORITY_WEIGHT[task.priority];
}

/** A task plus the minutes of work still unscheduled — used internally. */
interface RemainingTask {
  task: Task;
  minutesLeft: number;
}

/**
 * Build a 7-day study schedule from the given open tasks.
 *
 * @param tasks      all tasks; only `status === 'todo'` are scheduled
 * @param options.availableMinutesPerDay  study budget per day (hours × 60)
 * @param options.dayStartTime            "HH:MM" the first block starts at
 * @param options.today                   reference date (defaults to real today)
 * @returns a flat list of ScheduledBlocks ordered by date then start time
 */
export function buildSchedule(
  tasks: Task[],
  options: {
    availableMinutesPerDay: number;
    dayStartTime: string;
    today?: Date;
  },
): ScheduledBlock[] {
  const { availableMinutesPerDay, dayStartTime } = options;
  const today = options.today ?? new Date();
  const todayISO = toISODate(today);

  // 1 & 2: keep only open tasks, score them, and sort most-pressing first.
  //        Ties break by earlier due date so short deadlines still win.
  const queue: RemainingTask[] = tasks
    .filter((t) => t.status === 'todo' && t.estimatedMinutes > 0)
    .sort((a, b) => {
      const scoreDiff = priorityScore(b, todayISO) - priorityScore(a, todayISO);
      if (scoreDiff !== 0) return scoreDiff;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .map((task) => ({ task, minutesLeft: task.estimatedMinutes }));

  const blocks: ScheduledBlock[] = [];
  let blockCounter = 0;

  // 3: For each of the next 7 days, pour queued work into the day's budget.
  for (let dayOffset = 0; dayOffset < PLANNING_HORIZON_DAYS; dayOffset++) {
    const date = toISODate(addDays(today, dayOffset));
    let minutesFilledToday = 0;
    let nextStart = dayStartTime;

    // Fill this day until we run out of budget or out of work.
    for (const item of queue) {
      if (minutesFilledToday >= availableMinutesPerDay) break;
      if (item.minutesLeft <= 0) continue;

      const remainingBudget = availableMinutesPerDay - minutesFilledToday;
      // Place as much of this task as fits in what's left of today's budget.
      const chunk = Math.min(item.minutesLeft, remainingBudget);

      blocks.push({
        id: `block-${date}-${blockCounter++}`,
        taskId: item.task.id,
        date,
        startTime: nextStart,
        durationMinutes: chunk,
      });

      item.minutesLeft -= chunk;
      minutesFilledToday += chunk;
      nextStart = addMinutesToTime(nextStart, chunk);
    }
  }

  return blocks;
}
