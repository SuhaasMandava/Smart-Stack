# SmartStack 📚

**An AI-ready study planner for students.**

Students enter their assignments and deadlines; SmartStack auto-builds a weekly
study schedule and tracks how long tasks *actually* take versus how long they
were *estimated* to take. That estimate-vs-actual signal powers simple insights
today — and is the seed of a machine-learning duration predictor tomorrow.

---

## ✨ Features

- **Tasks** — add, edit, delete, and complete assignments with a clean,
  validated form. Completing a task prompts you for the *actual* minutes it took,
  so the app learns how good your estimates are.
- **Smart scheduler** — a pure, greedy algorithm scores every open task by
  deadline urgency + priority, then packs your available study hours across the
  next 7 days.
- **Weekly Schedule** — a 7-day calendar view of the generated plan. Change your
  available hours per day and watch the plan re-flow instantly.
- **Dashboard** — what's due soon, task counts, a progress bar, an overall
  estimate-accuracy score, and a Recharts chart of estimated vs. actual time.
- **Insights** — plain-language observations like *"You tend to underestimate
  essay tasks by ~35%."* This module is intentionally isolated — it's the seed
  of the future ML feature.
- **Light / dark mode**, responsive layout, and example seed data on first run.

---

## 🚀 Getting started

Requires **Node 18+**.

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run build   # type-check + production build to dist/
npm run preview # preview the production build locally
```

On first launch the app seeds a handful of realistic example tasks (some already
completed with logged times) so every page has something to show. All data lives
in your browser's `localStorage` — there's no backend yet.

---

## 🏗️ Architecture & project structure

The guiding principle is **isolate the parts that will change**. Data access,
the scheduling algorithm, and the insights logic each live in their own module
so they're easy to test, reason about, and later swap out.

```
src/
├── types/           # Domain types — the single source of truth for data shapes
│   └── index.ts
│
├── lib/             # Pure, framework-free logic (no React, easily testable)
│   ├── storage.ts   # ⭐ THE ONLY place that touches localStorage
│   ├── scheduler.ts # ⭐ Pure greedy scheduling algorithm (priorityScore + buildSchedule)
│   ├── insights.ts  # ⭐ Estimate-vs-actual analysis (seed of the future ML model)
│   ├── seed.ts      # Example tasks loaded on first run
│   ├── dates.ts     # Small date/time helpers (ISO strings in, labels out)
│   ├── taskMeta.ts  # Enum → label/colour mappings for the UI
│   └── id.ts        # Unique id generation
│
├── hooks/           # React state, backed by the lib layer
│   ├── useTasks.ts    # Task CRUD + persistence
│   ├── useSettings.ts # Availability settings + persistence
│   └── useTheme.ts    # Light/dark theme
│
├── context/
│   └── AppDataContext.tsx  # Shares one task/settings store across all pages
│
├── components/      # Reusable presentational components
│   ├── ui/          # Primitives: Card, Button, Badge, Modal, Field
│   ├── Layout.tsx, Sidebar.tsx, ThemeToggle.tsx   # App shell + nav
│   ├── TaskForm.tsx, TaskItem.tsx, CompleteTaskModal.tsx
│   ├── ProgressBar.tsx, EstimateVsActualChart.tsx
│   └── icons.tsx
│
├── pages/           # One component per route
│   ├── Dashboard.tsx     # Home — due soon, counts, progress, chart
│   ├── TasksPage.tsx     # Add / edit / delete / complete tasks
│   ├── SchedulePage.tsx  # 7-day calendar of scheduled blocks
│   └── InsightsPage.tsx  # Estimate-accuracy insights
│
├── App.tsx          # Router + data provider wiring
└── main.tsx         # Entry point
```

### Key decisions

- **`storage.ts` is the only seam to persistence.** Every read/write funnels
  through it. When the FastAPI backend lands, this one file becomes `fetch`
  calls (likely async) and the rest of the app barely changes. Hooks depend on
  `storage`, never on `window.localStorage`.
- **The scheduler is a pure function.** `buildSchedule(tasks, options)` has no
  I/O and takes an injectable `today`, so it's deterministic and trivial to unit
  test. The scoring rule (`priorityScore`) is factored out on purpose — it's the
  natural place to later drop in an ML-predicted score.
- **The insights engine is isolated for a reason.** Today it's descriptive
  statistics (per-type estimate bias). The estimate-vs-actual gap it measures is
  exactly the training signal a duration-prediction model would use, so keeping
  it in `lib/insights.ts` means the UI won't move when the model arrives.
- **Dates are stored as ISO strings**, never `Date` objects, so everything
  round-trips cleanly through JSON/localStorage and, later, an API.
- **Shared state via a small context** so every page reads one consistent copy
  of the tasks, rather than each page holding its own.

---

## 🗺️ Roadmap

1. **ML duration predictor** — replace the rule-based insights with a model that
   predicts how long a task will actually take (from type, priority, time of
   day, history) and feeds smarter estimates back into the scheduler.
2. **FastAPI backend (Python)** — move persistence off `localStorage` and behind
   an API, with accounts and cross-device sync. Only `lib/storage.ts` changes on
   the frontend.
3. **Calendar-feed integrations** — pull deadlines automatically from
   **Google Calendar**, **Canvas**, and **Infinite Campus**, and push the
   generated study blocks back out.

---

## 🔒 Security

SmartStack is a fully static single-page app with no backend, no authentication,
and no outbound network calls — all data lives in the browser's `localStorage`.
The main hardening surface is therefore the HTTP response headers, defined in
[`vercel.json`](vercel.json) (authoritative for production on Vercel) and mirrored
into `vite.config.ts` under `preview.headers` so `npm run preview` reproduces the
exact same policy locally. **Keep the two in sync** if you change either.

| Header | Value | Why |
|---|---|---|
| **Content-Security-Policy** | see below | Restricts where scripts, styles, images, and connections can come from — the primary defense against XSS and data exfiltration. |
| **X-Frame-Options** | `DENY` | Blocks the app from being embedded in an `<iframe>`, preventing clickjacking. (Reinforced by CSP `frame-ancestors 'none'`.) |
| **X-Content-Type-Options** | `nosniff` | Stops browsers from MIME-sniffing responses into an unexpected type. |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Sends only the origin (not the full path) on cross-origin navigations, avoiding referrer leakage. |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Explicitly denies powerful device APIs the app never uses. |

### Content-Security-Policy, directive by directive

- `default-src 'self'` — deny-by-default; everything not overridden below must be same-origin.
- `script-src 'self' 'sha256-…'` — only our own bundled JS runs, plus the one inline
  theme script in `index.html` (which applies light/dark mode before first paint to
  avoid a flash). That script is allow-listed by its **exact sha256 hash**, not by
  `'unsafe-inline'`, so no other inline script can execute. **If you edit that script,
  recompute the hash** (sha256 of the script's exact text content, base64-encoded) or it
  will be blocked.
- `style-src 'self' 'unsafe-inline'` — `'unsafe-inline'` is a **deliberate, documented
  choice**: Recharts sets inline `style` attributes directly on the SVG elements it
  renders, and the charts break without it. It's the one intentional loosening; every
  other directive stays strict.
- `img-src 'self' data:` — same-origin images plus `data:` URIs (used for small inline assets).
- `font-src 'self'` — the app uses system fonts only; no external font CDNs.
- `connect-src 'self'` — there is no API, so no cross-origin fetch/XHR/WebSocket is permitted.
- `object-src 'none'` / `base-uri 'self'` / `form-action 'self'` — disable plugins, lock
  down `<base>`, and restrict form submission targets.
- `frame-ancestors 'none'` — nobody may frame this app.
- `upgrade-insecure-requests` — force any stray `http:` sub-resource to `https:`.

The policy was verified end-to-end in headless Chrome against `npm run preview`:
every route (Dashboard, Tasks, Schedule, Insights), the Recharts chart, and the
dark-mode toggle load with **zero CSP violations**.

---

## 🛠️ Tech stack

React 18 · Vite · TypeScript · Tailwind CSS · React Router · Recharts
