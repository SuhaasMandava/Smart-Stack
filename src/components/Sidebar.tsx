/**
 * Sidebar — primary navigation. On desktop it's a fixed left rail; on small
 * screens it collapses to a horizontal top bar of icons (see Layout for how the
 * two are arranged). Active route styling comes from React Router's NavLink.
 */
import { NavLink } from 'react-router-dom';
import {
  DashboardIcon,
  TasksIcon,
  CalendarIcon,
  InsightsIcon,
} from './icons';

/** The app's navigation entries — single source for both nav renderings. */
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: DashboardIcon, end: true },
  { to: '/tasks', label: 'Tasks', Icon: TasksIcon, end: false },
  { to: '/schedule', label: 'Schedule', Icon: CalendarIcon, end: false },
  { to: '/insights', label: 'Insights', Icon: InsightsIcon, end: false },
] as const;

/** The brand mark shown at the top of the sidebar. */
function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        {/* Simple stacked-bars glyph echoing the favicon. */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="13" width="4" height="7" rx="1" />
          <rect x="10" y="8" width="4" height="12" rx="1" opacity="0.7" />
          <rect x="16" y="4" width="4" height="16" rx="1" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        SmartStack
      </span>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full flex-col gap-6 border-slate-200 dark:border-slate-800 md:w-60 md:border-r md:py-6">
      <div className="hidden md:block">
        <Brand />
      </div>

      <nav className="flex gap-1 md:flex-col md:px-3">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'focus-ring flex flex-1 items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex-none md:justify-start',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
