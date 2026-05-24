import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore, useMoodValid } from './store';
import { MoodCheckin } from './components/MoodCheckin';
import { Dashboard } from './components/Dashboard';
import { WeekCalendar } from './components/WeekCalendar';
import { IdeaInbox } from './components/IdeaInbox';
import { Layout } from './pages/Layout';
import { AreaPage } from './pages/AreaPage';

function AppRoutes() {
  const { resetMoodIfNewDay } = useStore();
  const moodValid = useMoodValid();

  useEffect(() => {
    resetMoodIfNewDay();
  }, [resetMoodIfNewDay]);

  if (!moodValid) {
    return <MoodCheckin />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<WeekCalendar />} />
          <Route path="/ideas" element={<IdeaInbox />} />
          <Route path="/area/:area" element={<AreaPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppRoutes />;
}
