/**
 * SchedulePage — a 7-day calendar view of the plan the scheduler produces.
 *
 * The page is a thin shell around the pure `buildSchedule` function: it feeds in
 * the open tasks and the availability settings, then lays the resulting blocks
 * out day-by-day. Editing the "hours per day" setting re-runs the scheduler
 * instantly (via useMemo) so students can see the plan adapt.
 */
import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { buildSchedule, PLANNING_HORIZON_DAYS } from '../lib/scheduler';
import type { ScheduledBlock, Task } from '../types';
import { Card } from '../components/ui/Card';
import { Field, Select, TextInput } from '../components/ui/Field';
import { Badge } from '../components/ui/Badge';
import {
  TYPE_LABEL,
  TYPE_TONE,
  formatMinutes,
} from '../lib/taskMeta';
import {
  addDays,
  formatDayLabel,
  formatTimeLabel,
  addMinutesToTime,
  toISODate,
  todayISO,
} from '../lib/dates';

export function SchedulePage() {
  const { tasks, settings, updateSettings } = useAppData();

  // Re-run the scheduler whenever tasks or availability settings change.
  const blocks = useMemo(
    () =>
      buildSchedule(tasks, {
        availableMinutesPerDay: settings.availableHoursPerDay * 60,
        dayStartTime: settings.dayStartTime,
      }),
    [tasks, settings.availableHoursPerDay, settings.dayStartTime],
  );

  // Fast lookup from taskId → task so blocks can show their title.
  const taskById = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  // Build the 7 day columns, each with its blocks (grouped from the flat list).
  const days = useMemo(() => {
    const start = new Date();
    return Array.from({ length: PLANNING_HORIZON_DAYS }, (_, i) => {
      const date = toISODate(addDays(start, i));
      return {
        date,
        blocks: blocks.filter((b) => b.date === date),
      };
    });
  }, [blocks]);

  const totalScheduled = blocks.reduce((s, b) => s + b.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Availability controls + summary */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-2 gap-4 sm:max-w-md">
            <Field label="Study hours / day" htmlFor="hours">
              <Select
                id="hours"
                value={settings.availableHoursPerDay}
                onChange={(e) =>
                  updateSettings({ availableHoursPerDay: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 6].map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h > 1 ? 's' : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Start time" htmlFor="start">
              <TextInput
                id="start"
                type="time"
                value={settings.dayStartTime}
                onChange={(e) => updateSettings({ dayStartTime: e.target.value })}
              />
            </Field>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatMinutes(totalScheduled)}
            </span>{' '}
            of study planned across the next 7 days.
          </p>
        </div>
      </Card>

      {/* 7-day grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {days.map((day) => (
          <DayColumn
            key={day.date}
            date={day.date}
            blocks={day.blocks}
            taskById={taskById}
          />
        ))}
      </div>
    </div>
  );
}

/** One day's column: a header plus its stacked study blocks. */
function DayColumn({
  date,
  blocks,
  taskById,
}: {
  date: string;
  blocks: ScheduledBlock[];
  taskById: Map<string, Task>;
}) {
  const isToday = date === todayISO();

  return (
    <div
      className={`flex min-h-[8rem] flex-col rounded-xl border p-3 ${
        isToday
          ? 'border-brand-300 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-900/10'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {formatDayLabel(date)}
        </span>
        {isToday && <span className="text-xs font-medium text-brand-600 dark:text-brand-400">Today</span>}
      </div>

      {blocks.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-600">Free day</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blocks.map((block) => {
            const task = taskById.get(block.taskId);
            if (!task) return null;
            const endTime = addMinutesToTime(block.startTime, block.durationMinutes);
            return (
              <li
                key={block.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {formatTimeLabel(block.startTime)} – {formatTimeLabel(endTime)}
                </div>
                <div className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {task.title}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge tone={TYPE_TONE[task.type]}>{TYPE_LABEL[task.type]}</Badge>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatMinutes(block.durationMinutes)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
