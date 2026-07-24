/**
 * dates.ts — tiny, dependency-free date helpers.
 *
 * We deliberately store dates as ISO strings everywhere (see types/index.ts).
 * These helpers convert to/from `Date` at the edges and format for display, so
 * date logic lives in one place instead of being sprinkled through the UI.
 * All operations are local-time based, which is what a student expects from a
 * daily planner.
 */

/** Format a `Date` as a local "YYYY-MM-DD" string (no timezone surprises). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's date as a "YYYY-MM-DD" string. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Parse a "YYYY-MM-DD" (or full ISO) string into a local `Date` at midnight. */
export function parseISODate(iso: string): Date {
  // Split rather than `new Date(iso)` to avoid UTC interpretation of date-only
  // strings, which can shift the day depending on the user's timezone.
  const [datePart] = iso.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Return a new date `days` after the given one (does not mutate input). */
export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Whole days from today until `iso` (negative = overdue, 0 = due today).
 * Used by the scheduler for urgency and by the UI for "due in N days".
 */
export function daysUntil(iso: string): number {
  const start = parseISODate(todayISO());
  const end = parseISODate(iso);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

/** Human-friendly label like "Wed, Jul 30". */
export function formatDayLabel(iso: string): string {
  return parseISODate(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Convert a "HH:MM" time and a minute count into a new "HH:MM" string. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Format "16:00" as "4:00 PM" for display. */
export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
