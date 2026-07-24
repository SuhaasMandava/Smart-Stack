/**
 * storage.ts — the ONLY place in the app that touches localStorage.
 *
 * Why this matters: every read/write of persisted data goes through this
 * module. The rest of the app depends on these functions, not on
 * `window.localStorage` directly. When we swap localStorage for a FastAPI
 * backend later, we change only this file (turning these into `fetch` calls,
 * likely async) — the hooks, pages, and components stay untouched.
 *
 * The functions are intentionally synchronous today, but the app consumes them
 * through hooks, so moving to async later is a contained change.
 */

import type { Settings, Task } from '../types';

/** Namespaced keys keep our data from colliding with anything else on origin. */
const KEYS = {
  tasks: 'smartstack.tasks',
  settings: 'smartstack.settings',
} as const;

/** Sensible defaults used until the student customizes their settings. */
export const DEFAULT_SETTINGS: Settings = {
  availableHoursPerDay: 3,
  dayStartTime: '16:00',
};

/**
 * Safely parse a JSON value from localStorage.
 * Returns `fallback` if the key is missing or the stored value is corrupt,
 * so a bad write can never crash the app on load.
 */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Serialize and persist a value, swallowing quota/serialization errors. */
function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled (e.g. private mode). Nothing we can
    // meaningfully do here; the in-memory state remains the source of truth.
  }
}

/* ------------------------------------------------------------------ Tasks -- */

export function loadTasks(): Task[] {
  return readJSON<Task[]>(KEYS.tasks, []);
}

export function saveTasks(tasks: Task[]): void {
  writeJSON(KEYS.tasks, tasks);
}

/** True only when the tasks key has never been written — used for seeding. */
export function hasStoredTasks(): boolean {
  return localStorage.getItem(KEYS.tasks) !== null;
}

/* --------------------------------------------------------------- Settings -- */

export function loadSettings(): Settings {
  // Merge stored values over defaults so new setting fields added later still
  // get a sane value for users with older persisted data.
  return { ...DEFAULT_SETTINGS, ...readJSON<Partial<Settings>>(KEYS.settings, {}) };
}

export function saveSettings(settings: Settings): void {
  writeJSON(KEYS.settings, settings);
}
