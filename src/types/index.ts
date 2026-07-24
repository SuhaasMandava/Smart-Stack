/**
 * Core domain types for SmartStack.
 *
 * These are the single source of truth for the shape of our data. Everything —
 * storage, the scheduler, the insights engine, and the UI — imports from here.
 * When the FastAPI backend arrives, these same types will describe the API
 * payloads, so keep them framework-agnostic and serializable (no class
 * instances, no Date objects — dates are stored as ISO strings).
 */

/** The kind of academic work a task represents. Drives insight grouping. */
export type TaskType =
  | 'essay'
  | 'problem-set'
  | 'reading'
  | 'exam-prep'
  | 'other';

/** How important/urgent the student considers the task. */
export type Priority = 'low' | 'medium' | 'high';

/** Lifecycle of a task. Kept intentionally simple for now. */
export type TaskStatus = 'todo' | 'done';

/**
 * A single assignment the student needs to complete.
 *
 * `dueDate` and `createdAt` are ISO-8601 strings (e.g. "2026-07-30" or a full
 * timestamp) so the whole object round-trips cleanly through JSON/localStorage.
 * `actualMinutes` stays null until the task is marked done and the student
 * reports how long it really took — that gap between estimate and actual is the
 * signal the insights engine (and, later, the ML model) learns from.
 */
export interface Task {
  id: string;
  title: string;
  type: TaskType;
  /** Due date as an ISO date string, e.g. "2026-07-30". */
  dueDate: string;
  priority: Priority;
  estimatedMinutes: number;
  /** Real time spent, recorded on completion. Null while still `todo`. */
  actualMinutes: number | null;
  status: TaskStatus;
  /** ISO timestamp of when the task was created. */
  createdAt: string;
}

/**
 * A slice of study time the scheduler has allocated to a task.
 *
 * The scheduler produces these; the Weekly Schedule page renders them. A single
 * task can be split across several blocks/days if it doesn't fit in one sitting.
 */
export interface ScheduledBlock {
  id: string;
  taskId: string;
  /** ISO date string for the day this block falls on, e.g. "2026-07-24". */
  date: string;
  /** Local start time in 24h "HH:MM" format, e.g. "16:00". */
  startTime: string;
  durationMinutes: number;
}

/** User-configurable settings that influence scheduling. */
export interface Settings {
  /** How many hours per day the student is willing to study. */
  availableHoursPerDay: number;
  /** The time of day study blocks start being packed from, "HH:MM". */
  dayStartTime: string;
}

/** The active colour theme. */
export type Theme = 'light' | 'dark';
