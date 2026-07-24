/**
 * useTheme — light/dark mode toggle.
 *
 * The initial `dark` class is applied by an inline script in index.html (to
 * avoid a flash of the wrong theme). This hook keeps React in sync with, and in
 * control of, that state: it reads the current class, exposes a toggle, and
 * persists the choice. We store under the same key the index.html script reads.
 */

import { useCallback, useEffect, useState } from 'react';
import type { Theme } from '../types';

const THEME_KEY = 'smartstack.theme';

/** Read the theme that's currently applied to <html>. */
function getInitialTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  return 'light';
}

export interface UseTheme {
  theme: Theme;
  toggleTheme: () => void;
}

export function useTheme(): UseTheme {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Reflect state onto the <html> element and persist whenever it changes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore storage failures */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
