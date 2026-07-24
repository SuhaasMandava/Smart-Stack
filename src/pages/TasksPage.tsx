/**
 * TasksPage — the CRUD hub. Add, edit, delete, and complete tasks.
 *
 * The page owns only *UI* state (which modal is open, which task is being edited
 * or completed). All *data* operations go through `useAppData`, which is backed
 * by the storage layer — this page never touches persistence directly.
 */
import { useMemo, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { Task } from '../types';
import type { TaskDraft } from '../hooks/useTasks';
import { TaskItem } from '../components/TaskItem';
import { TaskForm } from '../components/TaskForm';
import { CompleteTaskModal } from '../components/CompleteTaskModal';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PlusIcon } from '../components/icons';
import { priorityScore } from '../lib/scheduler';
import { todayISO } from '../lib/dates';

/** Which tab of the list is showing. */
type Filter = 'open' | 'done';

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask, reopenTask } =
    useAppData();

  // --- UI state -------------------------------------------------------------
  const [filter, setFilter] = useState<Filter>('open');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [completing, setCompleting] = useState<Task | null>(null);

  // Open tasks sorted by scheduler priority (most pressing first); done tasks
  // most-recently-due first. Memoized so we only re-sort when tasks change.
  const { open, done } = useMemo(() => {
    const today = todayISO();
    const openTasks = tasks
      .filter((t) => t.status === 'todo')
      .sort((a, b) => priorityScore(b, today) - priorityScore(a, today));
    const doneTasks = tasks
      .filter((t) => t.status === 'done')
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    return { open: openTasks, done: doneTasks };
  }, [tasks]);

  const visible = filter === 'open' ? open : done;

  // --- Handlers -------------------------------------------------------------
  function handleAddClick() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEditClick(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  function handleFormSubmit(draft: TaskDraft) {
    if (editing) {
      updateTask(editing.id, draft);
    } else {
      addTask(draft);
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmComplete(actualMinutes: number) {
    if (completing) completeTask(completing.id, actualMinutes);
    setCompleting(null);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar: filter tabs + add button */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <TabButton active={filter === 'open'} onClick={() => setFilter('open')}>
            Open ({open.length})
          </TabButton>
          <TabButton active={filter === 'done'} onClick={() => setFilter('done')}>
            Completed ({done.length})
          </TabButton>
        </div>

        <Button onClick={handleAddClick}>
          <PlusIcon /> Add task
        </Button>
      </div>

      {/* Task list, or an empty state */}
      {visible.length === 0 ? (
        <Card className="text-center">
          <p className="py-8 text-sm text-slate-500 dark:text-slate-400">
            {filter === 'open'
              ? 'No open tasks. Add one to get started 🎉'
              : 'No completed tasks yet — finish a task to see it here.'}
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={setCompleting}
              onEdit={handleEditClick}
              onDelete={(t) => deleteTask(t.id)}
              onReopen={(t) => reopenTask(t.id)}
            />
          ))}
        </ul>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit task' : 'Add a task'}
      >
        <TaskForm
          initial={editing ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* Complete modal (captures actual minutes) */}
      <CompleteTaskModal
        task={completing}
        onConfirm={handleConfirmComplete}
        onClose={() => setCompleting(null)}
      />
    </div>
  );
}

/** Small pill-style tab button used in the filter toolbar. */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}
