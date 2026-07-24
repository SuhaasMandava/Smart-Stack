/**
 * useTasks — the app's single source of truth for task data.
 *
 * Responsibilities:
 *  - Load tasks from storage on mount (seeding examples on very first run).
 *  - Expose CRUD-ish operations (add / update / delete / complete).
 *  - Persist to storage whenever tasks change.
 *
 * Crucially, this hook talks to the `storage` module, never to localStorage
 * directly. When the FastAPI backend lands, we make the storage calls async and
 * adjust this hook — components consuming `useTasks` won't need to change their
 * call sites much (the operation names stay the same).
 */

import { useCallback, useEffect, useState } from 'react';
import type { Task, TaskType, Priority } from '../types';
import { hasStoredTasks, loadTasks, saveTasks } from '../lib/storage';
import { createSeedTasks } from '../lib/seed';
import { newId } from '../lib/id';

/** The editable fields when creating or editing a task (no id/status/actuals). */
export interface TaskDraft {
  title: string;
  type: TaskType;
  dueDate: string;
  priority: Priority;
  estimatedMinutes: number;
}

export interface UseTasks {
  tasks: Task[];
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  deleteTask: (id: string) => void;
  /** Mark a task done and record how long it actually took. */
  completeTask: (id: string, actualMinutes: number) => void;
  /** Flip a done task back to todo (clears the logged actual time). */
  reopenTask: (id: string) => void;
}

export function useTasks(): UseTasks {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load once on mount. If storage has never been written, seed examples so the
  // app isn't empty for a first-time visitor.
  useEffect(() => {
    if (hasStoredTasks()) {
      setTasks(loadTasks());
    } else {
      const seed = createSeedTasks();
      setTasks(seed);
      saveTasks(seed);
    }
  }, []);

  // Persist on every change. Keeping this in one effect means no operation can
  // forget to save — they all funnel through `setTasks`.
  useEffect(() => {
    // Skip the initial empty render before load completes to avoid clobbering
    // stored data with an empty array.
    if (tasks.length === 0 && !hasStoredTasks()) return;
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((draft: TaskDraft) => {
    const task: Task = {
      id: newId('task'),
      ...draft,
      actualMinutes: null,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, draft: TaskDraft) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...draft } : t)),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const completeTask = useCallback((id: string, actualMinutes: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'done', actualMinutes } : t,
      ),
    );
  }, []);

  const reopenTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'todo', actualMinutes: null } : t,
      ),
    );
  }, []);

  return { tasks, addTask, updateTask, deleteTask, completeTask, reopenTask };
}
