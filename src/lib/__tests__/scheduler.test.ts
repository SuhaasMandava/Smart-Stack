import { describe, it, expect } from 'vitest';
import { priorityScore, buildSchedule, PLANNING_HORIZON_DAYS } from '../scheduler';
import type { ScheduledBlock } from '../../types';
import { makeTask } from './helpers';

// A fixed reference "today" so every scheduling test is deterministic and
// independent of the machine clock. Local midnight, 23 Jul 2026.
const TODAY = new Date(2026, 6, 23);
const TODAY_ISO = '2026-07-23';

/** Sum the scheduled minutes on a given date. */
function minutesOnDate(blocks: ScheduledBlock[], date: string): number {
  return blocks
    .filter((b) => b.date === date)
    .reduce((sum, b) => sum + b.durationMinutes, 0);
}

describe('priorityScore', () => {
  it('ranks the sooner-due task above the later one when priority is equal', () => {
    const soon = makeTask({ dueDate: '2026-07-24', priority: 'medium' });
    const later = makeTask({ dueDate: '2026-07-30', priority: 'medium' });

    expect(priorityScore(soon, TODAY_ISO)).toBeGreaterThan(
      priorityScore(later, TODAY_ISO),
    );
  });

  it('ranks the higher-priority task above the lower one when due dates match', () => {
    const high = makeTask({ dueDate: '2026-07-28', priority: 'high' });
    const low = makeTask({ dueDate: '2026-07-28', priority: 'low' });

    // The score gap should be exactly the priority weight difference (30 - 0).
    expect(priorityScore(high, TODAY_ISO) - priorityScore(low, TODAY_ISO)).toBe(30);
  });

  it('scores an overdue task higher than one due today (urgency + overdue penalty)', () => {
    const overdue = makeTask({ dueDate: '2026-07-21', priority: 'low' }); // 2 days late
    const dueToday = makeTask({ dueDate: TODAY_ISO, priority: 'low' });

    // due today: urgency = 30 - 0 = 30, no penalty, low weight 0 => 30.
    expect(priorityScore(dueToday, TODAY_ISO)).toBe(30);
    // overdue by 2: urgency = 30 - (-2) = 32, penalty = 2 * 10 = 20 => 52.
    // NOTE: urgency is NOT capped at 30 for overdue work — it keeps climbing.
    expect(priorityScore(overdue, TODAY_ISO)).toBe(52);
    expect(priorityScore(overdue, TODAY_ISO)).toBeGreaterThan(
      priorityScore(dueToday, TODAY_ISO),
    );
  });

  it('gives two otherwise-identical tasks the same score (ties are equal)', () => {
    const a = makeTask({ id: 'a', dueDate: '2026-07-27', priority: 'medium' });
    const b = makeTask({ id: 'b', dueDate: '2026-07-27', priority: 'medium' });

    expect(priorityScore(a, TODAY_ISO)).toBe(priorityScore(b, TODAY_ISO));
  });
});

describe('buildSchedule', () => {
  const opts = { availableMinutesPerDay: 120, dayStartTime: '16:00', today: TODAY };

  it('is deterministic: identical inputs (with injected today) produce identical output', () => {
    const tasks = [
      makeTask({ id: 'a', dueDate: '2026-07-24', estimatedMinutes: 90 }),
      makeTask({ id: 'b', dueDate: '2026-07-26', estimatedMinutes: 150 }),
    ];

    expect(buildSchedule(tasks, opts)).toEqual(buildSchedule(tasks, opts));
  });

  it('never schedules more than the available minutes per day', () => {
    // 500 minutes of work against a 120-minute/day budget.
    const tasks = [makeTask({ id: 'big', estimatedMinutes: 500 })];
    const blocks = buildSchedule(tasks, opts);

    for (let day = 0; day < PLANNING_HORIZON_DAYS; day++) {
      const date = ['2026-07-23', '2026-07-24', '2026-07-25', '2026-07-26',
        '2026-07-27', '2026-07-28', '2026-07-29'][day];
      expect(minutesOnDate(blocks, date)).toBeLessThanOrEqual(120);
    }
  });

  it('excludes completed tasks from the schedule', () => {
    const tasks = [
      makeTask({ id: 'open', status: 'todo', estimatedMinutes: 60 }),
      makeTask({ id: 'done', status: 'done', actualMinutes: 60, estimatedMinutes: 60 }),
    ];
    const blocks = buildSchedule(tasks, opts);

    expect(blocks.every((b) => b.taskId === 'open')).toBe(true);
    expect(blocks.some((b) => b.taskId === 'done')).toBe(false);
  });

  it('excludes tasks with a non-positive estimate', () => {
    // The source filters on `estimatedMinutes > 0`, so a 0-minute task is skipped.
    const tasks = [makeTask({ id: 'empty', estimatedMinutes: 0 })];
    expect(buildSchedule(tasks, opts)).toEqual([]);
  });

  it('returns an empty schedule for an empty task list', () => {
    expect(buildSchedule([], opts)).toEqual([]);
  });

  it('schedules nothing when zero hours are available', () => {
    // With a 0-minute budget the day loop breaks immediately (0 >= 0).
    const tasks = [makeTask({ estimatedMinutes: 120 })];
    expect(
      buildSchedule(tasks, { availableMinutesPerDay: 0, dayStartTime: '16:00', today: TODAY }),
    ).toEqual([]);
  });

  it('splits a task larger than one day across consecutive days', () => {
    // 300 minutes at 120/day => 120 + 120 + 60 over three consecutive days.
    const tasks = [makeTask({ id: 'long', estimatedMinutes: 300 })];
    const blocks = buildSchedule(tasks, opts);

    expect(blocks.map((b) => ({ date: b.date, mins: b.durationMinutes }))).toEqual([
      { date: '2026-07-23', mins: 120 },
      { date: '2026-07-24', mins: 120 },
      { date: '2026-07-25', mins: 60 },
    ]);
    expect(blocks.every((b) => b.taskId === 'long')).toBe(true);
  });

  it('advances the start time as multiple blocks fill a single day', () => {
    // Two 60-minute tasks, 120/day budget: both fit on day 0, back to back.
    const tasks = [
      makeTask({ id: 'first', dueDate: '2026-07-24', estimatedMinutes: 60 }),
      makeTask({ id: 'second', dueDate: '2026-07-25', estimatedMinutes: 60 }),
    ];
    const day0 = buildSchedule(tasks, opts).filter((b) => b.date === '2026-07-23');

    expect(day0).toHaveLength(2);
    expect(day0[0].startTime).toBe('16:00');
    expect(day0[1].startTime).toBe('17:00'); // 16:00 + 60 minutes
  });

  it('schedules the sooner-due task first when priority is equal', () => {
    // Only 60 minutes/day, two 60-minute medium tasks: the sooner-due one wins day 0.
    const tasks = [
      makeTask({ id: 'sooner', dueDate: '2026-07-24', priority: 'medium', estimatedMinutes: 60 }),
      makeTask({ id: 'later', dueDate: '2026-07-28', priority: 'medium', estimatedMinutes: 60 }),
    ];
    const blocks = buildSchedule(tasks, {
      availableMinutesPerDay: 60,
      dayStartTime: '16:00',
      today: TODAY,
    });

    expect(blocks[0].taskId).toBe('sooner');
    expect(blocks[0].date).toBe('2026-07-23');
  });

  it('schedules the higher-priority task first when due dates match', () => {
    const tasks = [
      makeTask({ id: 'low', dueDate: '2026-07-28', priority: 'low', estimatedMinutes: 60 }),
      makeTask({ id: 'high', dueDate: '2026-07-28', priority: 'high', estimatedMinutes: 60 }),
    ];
    const blocks = buildSchedule(tasks, {
      availableMinutesPerDay: 60,
      dayStartTime: '16:00',
      today: TODAY,
    });

    expect(blocks[0].taskId).toBe('high');
  });

  it('silently drops work that exceeds the whole 7-day capacity', () => {
    // 940 minutes of work, 120/day for 7 days = 840 minutes of capacity.
    // The scheduler plans 840 minutes and the remaining 100 simply vanish —
    // there is no overflow marker. Documented here, not "fixed".
    const tasks = [makeTask({ id: 'huge', estimatedMinutes: 940 })];
    const blocks = buildSchedule(tasks, opts);

    const totalScheduled = blocks.reduce((s, b) => s + b.durationMinutes, 0);
    expect(totalScheduled).toBe(PLANNING_HORIZON_DAYS * 120); // 840, not 940
    expect(totalScheduled).toBeLessThan(940);
  });
});
