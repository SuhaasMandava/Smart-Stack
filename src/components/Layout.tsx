/**
 * Layout — the app shell shared by every page: sidebar + a top bar (page title,
 * theme toggle) + the routed page content in the main area.
 *
 * React Router renders the active page into <Outlet />. The page title shown in
 * the top bar is derived from the current route so pages don't each have to
 * render their own header.
 */
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

/** Map a pathname to a friendly page title for the top bar. */
function titleForPath(pathname: string): string {
  if (pathname.startsWith('/tasks')) return 'Tasks';
  if (pathname.startsWith('/schedule')) return 'Weekly Schedule';
  if (pathname.startsWith('/insights')) return 'Insights';
  return 'Dashboard';
}

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
      {/* Sidebar: top bar on mobile, left rail on desktop. */}
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800 md:border-b-0 md:px-4">
        <Sidebar />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {titleForPath(pathname)}
          </h1>
          <ThemeToggle />
        </header>

        <main className="flex-1 px-6 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
