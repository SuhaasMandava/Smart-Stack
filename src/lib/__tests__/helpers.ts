/**
 * Test helpers shared across the lib test suites.
 */
import type { Task } from '../../types';

/**
 * Build a Task with sensible defaults, overriding only the fields a given test
 * cares about. This keeps each test focused on the one rule it's documenting
 * rather than restating the whole Task shape every time.
 */
export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-default',
    title: 'Sample task',
    type: 'essay',
    dueDate: '2026-07-30',
    priority: 'medium',
    estimatedMinutes: 60,
    actualMinutes: null,
    status: 'todo',
    createdAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}
