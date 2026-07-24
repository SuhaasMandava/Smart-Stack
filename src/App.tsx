/**
 * App — wires up routing and the shared data provider.
 *
 * Everything lives under one <Layout> (sidebar + top bar) via a nested route, so
 * each page only renders its own content. The AppDataProvider sits above the
 * router so task/settings state is shared across every page.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { SchedulePage } from './pages/SchedulePage';
import { InsightsPage } from './pages/InsightsPage';

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="insights" element={<InsightsPage />} />
            {/* Unknown routes fall back to the dashboard. */}
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}
