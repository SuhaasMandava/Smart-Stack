/**
 * seed.ts — example tasks loaded on first run.
 *
 * The very first time the app opens (nothing in localStorage yet), we drop in a
 * handful of realistic tasks so the dashboard, scheduler, and insights all have
 * something to show. A couple are already completed with logged actual times so
 * the estimate-vs-actual chart and insights aren't empty on day one.
 *
 * Dates are generated relative to "today" at seed time so the examples always
 * look current, no matter when the project is cloned.
 */

import type { Task } from '../types';
import { addDays, toISODate } from './dates';
import { newId } from './id';

/** Build the initial set of example tasks relative to `now`. */
export function createSeedTasks(now: Date = new Date()): Task[] {
  const iso = (offsetDays: number) => toISODate(addDays(now, offsetDays));
  const createdAt = now.toISOString();

  return [
    {
      id: newId('task'),
      title: 'Read Chapters 4–5 of Biology textbook',
      type: 'reading',
      dueDate: iso(2),
      priority: 'medium',
      estimatedMinutes: 90,
      actualMinutes: null,
      status: 'todo',
      createdAt,
    },
    {
      id: newId('task'),
      title: 'Calculus problem set #7',
      type: 'problem-set',
      dueDate: iso(1),
      priority: 'high',
      estimatedMinutes: 120,
      actualMinutes: null,
      status: 'todo',
      createdAt,
    },
    {
      id: newId('task'),
      title: 'Draft History essay on the Cold War',
      type: 'essay',
      dueDate: iso(4),
      priority: 'high',
      estimatedMinutes: 180,
      actualMinutes: null,
      status: 'todo',
      createdAt,
    },
    {
      id: newId('task'),
      title: 'Review flashcards for Spanish quiz',
      type: 'exam-prep',
      dueDate: iso(3),
      priority: 'low',
      estimatedMinutes: 45,
      actualMinutes: null,
      status: 'todo',
      createdAt,
    },
    // --- Already completed, with logged actual times, so insights have data ---
    {
      id: newId('task'),
      title: 'English essay: character analysis',
      type: 'essay',
      dueDate: iso(-3),
      priority: 'medium',
      estimatedMinutes: 120,
      actualMinutes: 165, // took longer than planned → underestimated essays
      status: 'done',
      createdAt,
    },
    {
      id: newId('task'),
      title: 'Physics problem set #6',
      type: 'problem-set',
      dueDate: iso(-2),
      priority: 'high',
      estimatedMinutes: 90,
      actualMinutes: 150, // also over — underestimating problem sets
      status: 'done',
      createdAt,
    },
    {
      id: newId('task'),
      title: 'Read Chapter 3 of History textbook',
      type: 'reading',
      dueDate: iso(-4),
      priority: 'low',
      estimatedMinutes: 60,
      actualMinutes: 45, // faster than planned → overestimates reading
      status: 'done',
      createdAt,
    },
    {
      id: newId('task'),
      title: 'Argumentative essay outline',
      type: 'essay',
      dueDate: iso(-1),
      priority: 'medium',
      estimatedMinutes: 60,
      actualMinutes: 95, // reinforces the essay-underestimate pattern
      status: 'done',
      createdAt,
    },
  ];
}
