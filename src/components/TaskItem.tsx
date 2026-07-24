/**
 * TaskItem — a single row in the Tasks list. Shows the title, type/priority
 * badges, due date, and time info, plus the actions available for its status
 * (complete/edit/delete for open tasks; reopen for done tasks).
 *
 * All actions are passed in from the parent page, so this component stays purely
 * presentational and easy to reason about.
 */
import type { Task } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { CheckIcon, EditIcon, TrashIcon, ClockIcon } from './icons';
import {
  PRIORITY_LABEL,
  PRIORITY_TONE,
  TYPE_LABEL,
  TYPE_TONE,
  formatMinutes,
} from '../lib/taskMeta';
import { daysUntil, formatDayLabel } from '../lib/dates';

interface TaskItemProps {
  task: Task;
  onComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReopen: (task: Task) => void;
}

/** Turn a days-until number into a short, colour-hinted due label. */
function DueLabel({ dueDate }: { dueDate: string }) {
  const days = daysUntil(dueDate);
  let text: string;
  let className = 'text-slate-500 dark:text-slate-400';

  if (days < 0) {
    text = `Overdue by ${Math.abs(days)}d`;
    className = 'text-red-600 dark:text-red-400 font-medium';
  } else if (days === 0) {
    text = 'Due today';
    className = 'text-amber-600 dark:text-amber-400 font-medium';
  } else if (days === 1) {
    text = 'Due tomorrow';
    className = 'text-amber-600 dark:text-amber-400';
  } else {
    text = `Due ${formatDayLabel(dueDate)}`;
  }

  return <span className={className}>{text}</span>;
}

export function TaskItem({ task, onComplete, onEdit, onDelete, onReopen }: TaskItemProps) {
  const isDone = task.status === 'done';

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: title + metadata */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={`truncate font-medium ${
              isDone
                ? 'text-slate-400 line-through dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {task.title}
          </h3>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Badge tone={TYPE_TONE[task.type]}>{TYPE_LABEL[task.type]}</Badge>
          <Badge tone={PRIORITY_TONE[task.priority]}>
            {PRIORITY_LABEL[task.priority]} priority
          </Badge>

          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <ClockIcon className="h-3.5 w-3.5" />
            {formatMinutes(task.estimatedMinutes)} est.
            {isDone && task.actualMinutes != null && (
              <> · {formatMinutes(task.actualMinutes)} actual</>
            )}
          </span>

          {!isDone && <DueLabel dueDate={task.dueDate} />}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-1">
        {isDone ? (
          <Button variant="secondary" onClick={() => onReopen(task)}>
            Reopen
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onComplete(task)}>
              <CheckIcon /> Done
            </Button>
            <Button
              variant="ghost"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              title="Edit task"
            >
              <EditIcon />
            </Button>
          </>
        )}
        <Button
          variant="danger"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
          title="Delete task"
        >
          <TrashIcon />
        </Button>
      </div>
    </li>
  );
}
