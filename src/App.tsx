import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore, useMoodValid } from './store';
import { MoodCheckin } from './components/MoodCheckin';
import { Dashboard } from './components/Dashboard';
import { WeekCalendar } from './components/WeekCalendar';
import { IdeaInbox } from './components/IdeaInbox';
import { FocusMode } from './components/FocusMode';
import { Layout } from './pages/Layout';
import { AreaPage } from './pages/AreaPage';
import { CelebrationToast } from './components/ui/Toast';

function AppRoutes() {
  const { resetMoodIfNewDay } = useStore();
  const moodValid = useMoodValid();

  useEffect(() => {
    resetMoodIfNewDay();
  }, [resetMoodIfNewDay]);

  if (!moodValid) {
    return (
      <>
        <MoodCheckin />
        <CelebrationToast />
      </>
    );
  }

  return (
    <BrowserRouter>
      <CelebrationToast />
      <Routes>
        {/* Modo Foco fora do Layout para tela limpa sem navbar */}
        <Route path="/focus" element={<FocusMode />} />
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
