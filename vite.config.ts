/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration. The React plugin enables Fast Refresh and JSX transform.
// The `test` block configures Vitest (kept here rather than in a separate file
// so there's a single source of build + test config).
export default defineConfig({
  plugins: [react()],
  test: {
    // The modules under test (scheduler, insights) are pure functions with no
    // DOM dependencies, so the lighter Node environment is all we need.
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/scheduler.ts', 'src/lib/insights.ts'],
    },
  },
});
