/**
 * id.ts — generate unique ids for tasks and blocks.
 *
 * Uses the browser's `crypto.randomUUID` when available and falls back to a
 * timestamp+random string otherwise, so the app works in every environment.
 */
export function newId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
