/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration. The React plugin enables Fast Refresh and JSX transform.
// The `test` block configures Vitest (kept here rather than in a separate file
// so there's a single source of build + test config).
export default defineConfig({
  plugins: [react()],
  // Security headers for the LOCAL preview server (`npm run preview`) only.
  // Vercel does NOT read this — production headers live in vercel.json, which is
  // authoritative. These two blocks MUST be kept in sync so what you verify
  // locally matches what ships. `style-src` keeps 'unsafe-inline' on purpose:
  // Recharts writes inline style attributes on its SVG elements. `script-src`
  // pins the sha256 of the inline theme script in index.html; recompute it with
  // the script in dist/index.html if that script ever changes.
  preview: {
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'sha256-w+4wxkZP0NeNriDhqwD41AMWdbQ0lhbfMZIaqWVrBR4='; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
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
