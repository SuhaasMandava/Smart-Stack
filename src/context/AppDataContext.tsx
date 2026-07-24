/**
 * AppDataContext — shares one instance of the task and settings stores across
 * every page.
 *
 * Without this, each page that called `useTasks()` would get its own isolated
 * copy of the data and they'd drift out of sync. The provider calls the hooks
 * once at the top of the tree and hands the result down through context.
 *
 * This is also the natural place a future data layer plugs in: swap the hook
 * implementations for API-backed ones and every consumer keeps working.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useTasks, type UseTasks } from '../hooks/useTasks';
import { useSettings, type UseSettings } from '../hooks/useSettings';

type AppData = UseTasks & UseSettings;

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const tasks = useTasks();
  const settings = useSettings();
  return (
    <AppDataContext.Provider value={{ ...tasks, ...settings }}>
      {children}
    </AppDataContext.Provider>
  );
}

/** Access shared task + settings state. Throws if used outside the provider. */
export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within an <AppDataProvider>.');
  }
  return ctx;
}
