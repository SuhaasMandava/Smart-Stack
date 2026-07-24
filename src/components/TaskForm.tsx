/**
 * TaskForm — the add/edit task form, rendered inside a Modal.
 *
 * Controlled inputs with lightweight client-side validation. It's used for both
 * "create" (no `initial`) and "edit" (an existing task passed in) — the parent
 * decides which by whether it passes an initial task, and receives a clean
 * `TaskDraft` via `onSubmit`.
 */
import { useState, type FormEvent } from 'react';
import type { Task } from '../types';
import type { TaskDraft } from '../hooks/useTasks';
import { Field, Select, TextInput } from './ui/Field';
import { Button } from './ui/Button';
import {
  PRIORITIES,
  PRIORITY_LABEL,
  TASK_TYPES,
  TYPE_LABEL,
} from '../lib/taskMeta';
import { todayISO } from '../lib/dates';

interface TaskFormProps {
  /** Existing task when editing; omitted when creating. */
  initial?: Task;
  onSubmit: (draft: TaskDraft) => void;
  onCancel: () => void;
}

/** Validation errors keyed by field name. Empty object = valid. */
type Errors = Partial<Record<'title' | 'dueDate' | 'estimatedMinutes', string>>;

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps) {
  // Seed state from `initial` when editing, otherwise sensible defaults.
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<TaskDraft['type']>(initial?.type ?? 'essay');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? todayISO());
  const [priority, setPriority] = useState<TaskDraft['priority']>(
    initial?.priority ?? 'medium',
  );
  // Keep the estimate as a string so the input can be cleared while typing.
  const [estimate, setEstimate] = useState(
    initial ? String(initial.estimatedMinutes) : '60',
  );
  const [errors, setErrors] = useState<Errors>({});

  /** Validate all fields; returns the parsed draft when valid, else null. */
  function validate(): TaskDraft | null {
    const next: Errors = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) next.title = 'Please enter a title.';

    if (!dueDate) next.dueDate = 'Please choose a due date.';

    const minutes = Number(estimate);
    if (!estimate.trim() || Number.isNaN(minutes)) {
      next.estimatedMinutes = 'Enter a number of minutes.';
    } else if (minutes <= 0) {
      next.estimatedMinutes = 'Estimate must be greater than zero.';
    } else if (minutes > 24 * 60) {
      next.estimatedMinutes = 'That’s more than a day — split it into smaller tasks.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return null;

    return {
      title: trimmedTitle,
      type,
      dueDate,
      priority,
      estimatedMinutes: Math.round(minutes),
    };
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const draft = validate();
    if (draft) onSubmit(draft);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Title" htmlFor="task-title" error={errors.title}>
        <TextInput
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish history essay draft"
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="task-type">
          <Select
            id="task-type"
            value={type}
            onChange={(e) => setType(e.target.value as TaskDraft['type'])}
          >
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Priority" htmlFor="task-priority">
          <Select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskDraft['priority'])}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Due date" htmlFor="task-due" error={errors.dueDate}>
          <TextInput
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>

        <Field
          label="Estimated minutes"
          htmlFor="task-estimate"
          error={errors.estimatedMinutes}
        >
          <TextInput
            id="task-estimate"
            type="number"
            min={1}
            step={5}
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
            placeholder="60"
          />
        </Field>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Save changes' : 'Add task'}</Button>
      </div>
    </form>
  );
}
