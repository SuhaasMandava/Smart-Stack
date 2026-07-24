/**
 * taskMeta.ts — presentation metadata for task enums.
 *
 * Maps the domain enums (task type, priority) to human labels and Badge tones.
 * Keeping this next to the data (rather than in each component) means a new task
 * type only needs updating in one place, and colours stay consistent app-wide.
 */
import type { Priority, TaskType } from '../types';

/** Display labels for task types (mirrors insights.ts TASK_TYPE_LABELS). */
export const TYPE_LABEL: Record<TaskType, string> = {
  essay: 'Essay',
  'problem-set': 'Problem Set',
  reading: 'Reading',
  'exam-prep': 'Exam Prep',
  other: 'Other',
};

/** Badge tone per task type. */
export const TYPE_TONE: Record<TaskType, 'blue' | 'violet' | 'green' | 'amber' | 'slate'> = {
  essay: 'violet',
  'problem-set': 'blue',
  reading: 'green',
  'exam-prep': 'amber',
  other: 'slate',
};

/** Display labels for priorities. */
export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/** Badge tone per priority (high = red, medium = amber, low = slate). */
export const PRIORITY_TONE: Record<Priority, 'red' | 'amber' | 'slate'> = {
  high: 'red',
  medium: 'amber',
  low: 'slate',
};

/** All task types, in the order we want them to appear in dropdowns. */
export const TASK_TYPES: TaskType[] = [
  'essay',
  'problem-set',
  'reading',
  'exam-prep',
  'other',
];

/** All priorities, low → high. */
export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

/** Format a minute count as "1h 30m" / "45m" / "2h". */
export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
