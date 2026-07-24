/**
 * EstimateVsActualChart — a grouped bar chart comparing estimated vs actual
 * minutes for each completed task, built with Recharts.
 *
 * This is the visual heart of the "how good are my estimates?" story. It reads
 * completed tasks and plots two bars per task. Colours and tooltip are wired to
 * work in both light and dark mode by passing the current theme in.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Task } from '../types';
import { useTheme } from '../hooks/useTheme';

interface ChartProps {
  tasks: Task[];
}

export function EstimateVsActualChart({ tasks }: ChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Shape completed tasks into the rows Recharts expects. Truncate long titles
  // so the axis labels stay readable.
  const data = tasks
    .filter((t) => t.status === 'done' && t.actualMinutes != null)
    .map((t) => ({
      name: t.title.length > 18 ? `${t.title.slice(0, 17)}…` : t.title,
      Estimated: t.estimatedMinutes,
      Actual: t.actualMinutes as number,
    }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        Complete a few tasks to see how your estimates compare to reality.
      </p>
    );
  }

  // Theme-aware colours for axes/grid/tooltip.
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: axisColor }}
          angle={-15}
          textAnchor="end"
          height={50}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 11, fill: axisColor }}
          label={{
            value: 'minutes',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fill: axisColor },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${gridColor}`,
            borderRadius: 8,
            fontSize: 12,
            color: isDark ? '#f1f5f9' : '#0f172a',
          }}
          cursor={{ fill: isDark ? '#1e293b55' : '#f1f5f955' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Estimated" fill="#93c5fd" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Actual" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
