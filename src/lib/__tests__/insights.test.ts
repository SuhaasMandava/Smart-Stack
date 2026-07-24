import { describe, it, expect } from 'vitest';
import {
  computeTypeAccuracy,
  overallAccuracy,
  generateInsights,
} from '../insights';
import type { Task, TaskType } from '../../types';
import { makeTask } from './helpers';

/**
 * Shorthand for a completed task with a logged actual time — the only kind of
 * task the insights engine looks at.
 */
function completed(
  type: TaskType,
  estimatedMinutes: number,
  actualMinutes: number,
  id: string = type,
): Task {
  return makeTask({ id, type, estimatedMinutes, actualMinutes, status: 'done' });
}

describe('computeTypeAccuracy', () => {
  it('returns an empty array when there are no completed tasks', () => {
    expect(computeTypeAccuracy([])).toEqual([]);
    expect(computeTypeAccuracy([makeTask({ status: 'todo' })])).toEqual([]);
  });

  it('groups estimate-vs-actual totals by task type', () => {
    const tasks = [
      completed('essay', 60, 90, 'e1'),
      completed('essay', 60, 90, 'e2'),
      completed('reading', 60, 30, 'r1'),
      completed('reading', 60, 30, 'r2'),
    ];
    const result = computeTypeAccuracy(tasks);

    expect(result).toHaveLength(2);

    const essay = result.find((r) => r.type === 'essay')!;
    expect(essay.sampleSize).toBe(2);
    expect(essay.totalEstimated).toBe(120);
    expect(essay.totalActual).toBe(180);
    expect(essay.biasPercent).toBeCloseTo(50); // 50% over => underestimated

    const reading = result.find((r) => r.type === 'reading')!;
    expect(reading.sampleSize).toBe(2);
    expect(reading.biasPercent).toBeCloseTo(-50); // 50% under => overestimated
  });

  it('sorts the most misestimated type first', () => {
    const tasks = [
      completed('problem-set', 100, 120, 'p1'), // +20% bias
      completed('problem-set', 100, 120, 'p2'),
      completed('essay', 60, 90, 'e1'), // +50% bias
      completed('essay', 60, 90, 'e2'),
    ];
    const result = computeTypeAccuracy(tasks);

    expect(result[0].type).toBe('essay'); // |50%| ranks above |20%|
  });

  it('never divides by zero: a zero-estimate task yields 0% bias, not NaN', () => {
    const tasks = [completed('other', 0, 30, 'o1')];
    const [row] = computeTypeAccuracy(tasks);

    expect(row.biasPercent).toBe(0);
    expect(Number.isNaN(row.biasPercent)).toBe(false);
  });

  it('ignores done tasks with no logged actual time, and open tasks', () => {
    const tasks = [
      makeTask({ id: 'open', status: 'todo', estimatedMinutes: 60 }),
      makeTask({ id: 'done-no-actual', status: 'done', actualMinutes: null, estimatedMinutes: 60 }),
      completed('reading', 60, 90, 'done-ok'),
    ];
    const result = computeTypeAccuracy(tasks);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('reading');
    expect(result[0].sampleSize).toBe(1);
  });
});

describe('overallAccuracy', () => {
  it('returns null (not NaN) when there are no completed tasks', () => {
    expect(overallAccuracy([])).toBeNull();
    expect(overallAccuracy([makeTask({ status: 'todo' })])).toBeNull();
  });

  it('reports 100% when estimates exactly match reality', () => {
    expect(overallAccuracy([completed('essay', 60, 60)])).toBe(100);
  });

  it('reports 50% accuracy when actual time is 50% off the estimate', () => {
    // total est 120, total act 180 => errorRatio 0.5 => 50% accurate.
    const tasks = [completed('essay', 60, 90, 'a'), completed('essay', 60, 90, 'b')];
    expect(overallAccuracy(tasks)).toBe(50);
  });

  it('floors at 0% for wildly-off estimates rather than going negative', () => {
    // est 60, act 300 => errorRatio 4 => (1 - 4) clamped to 0.
    expect(overallAccuracy([completed('essay', 60, 300)])).toBe(0);
  });

  it('returns null when every estimate is zero (avoids divide-by-zero)', () => {
    expect(overallAccuracy([completed('other', 0, 30)])).toBeNull();
  });
});

describe('generateInsights', () => {
  it('returns a single safe "need more data" note when there is no history', () => {
    const insights = generateInsights([]);

    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('need-more-data');
    expect(insights[0].tone).toBe('neutral');
  });

  it('flags systematic underestimation with a warning insight', () => {
    const tasks = [completed('essay', 60, 90, 'e1'), completed('essay', 60, 90, 'e2')];
    const insights = generateInsights(tasks);

    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('underestimate-essay');
    expect(insights[0].tone).toBe('warning');
    expect(insights[0].message).toContain('50%');
    expect(insights[0].message.toLowerCase()).toContain('essay');
  });

  it('celebrates systematic overestimation with a positive insight', () => {
    const tasks = [completed('reading', 60, 30, 'r1'), completed('reading', 60, 30, 'r2')];
    const insights = generateInsights(tasks);

    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('overestimate-reading');
    expect(insights[0].tone).toBe('positive');
    expect(insights[0].message).toContain('50%');
  });

  it('does not draw conclusions from a single data point (needs >= 2 samples)', () => {
    // One essay off by 100% — but a sample of 1 is not enough to comment on.
    const insights = generateInsights([completed('essay', 60, 120)]);

    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('need-more-data');
  });

  it('ignores small biases below the 10% noise threshold', () => {
    // Two essays only 5% over — treated as noise, so no insight is produced.
    const tasks = [completed('essay', 100, 105, 'e1'), completed('essay', 100, 105, 'e2')];
    const insights = generateInsights(tasks);

    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('need-more-data');
  });
});
