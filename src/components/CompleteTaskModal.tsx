/**
 * CompleteTaskModal — asks the student how long a task actually took before
 * marking it done. That logged `actualMinutes` is what powers the whole
 * estimate-vs-actual story (chart + insights + future ML), so we capture it at
 * the moment of completion rather than letting it be forgotten.
 */
import { useEffect, useState, type FormEvent } from 'react';
import type { Task } from '../types';
import { Modal } from './ui/Modal';
import { Field, TextInput } from './ui/Field';
import { Button } from './ui/Button';
import { formatMinutes } from '../lib/taskMeta';

interface CompleteTaskModalProps {
  task: Task | null;
  onConfirm: (actualMinutes: number) => void;
  onClose: () => void;
}

export function CompleteTaskModal({ task, onConfirm, onClose }: CompleteTaskModalProps) {
  // Pre-fill with the estimate as a helpful starting point.
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();

  // When a new task is selected for completion, seed the field with its
  // estimate and clear any stale error. Keyed on the task id so re-opening for
  // a different task resets cleanly.
  useEffect(() => {
    if (task) {
      setValue(String(task.estimatedMinutes));
      setError(undefined);
    }
  }, [task?.id]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const minutes = Number(value);
    if (!value.trim() || Number.isNaN(minutes) || minutes <= 0) {
      setError('Enter how many minutes it actually took.');
      return;
    }
    onConfirm(Math.round(minutes));
    // Clear local state for next time.
    setValue('');
    setError(undefined);
  }

  function handleClose() {
    setValue('');
    setError(undefined);
    onClose();
  }

  return (
    <Modal open={task !== null} onClose={handleClose} title="Mark task complete">
      {task && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nice work on <span className="font-medium text-slate-900 dark:text-slate-100">“{task.title}”</span>.
            You estimated {formatMinutes(task.estimatedMinutes)} — how long did it
            really take?
          </p>

          <Field label="Actual minutes" htmlFor="actual-minutes" error={error}>
            <TextInput
              id="actual-minutes"
              type="number"
              min={1}
              step={5}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </Field>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save & complete</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
