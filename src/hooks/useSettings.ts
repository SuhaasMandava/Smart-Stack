/**
 * useSettings — reads and persists the study-availability settings that feed
 * the scheduler. Backed by the storage module, same as useTasks.
 */

import { useCallback, useEffect, useState } from 'react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../lib/storage';

export interface UseSettings {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

export function useSettings(): UseSettings {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
