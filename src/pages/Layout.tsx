import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Lightbulb, Plus } from 'lucide-react';
import { QuickCapture } from '../components/QuickCapture';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Painel' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendario' },
  { path: '/ideas', icon: Lightbulb, label: 'Ideias' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [captureOpen, setCaptureOpen] = useState(false);

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg-primary">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>

      {/* Barra de navegacao inferior */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-subtle safe-bottom"
        role="navigation"
        aria-label="Navegacao principal"
      >
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-btn transition-all',
                  active
                    ? 'text-accent-blue'
                    : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
              >
                <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            );
          })}

          {/* FAB Captura Rapida */}
          <button
            onClick={() => setCaptureOpen(true)}
            aria-label="Captura rapida"
            className={[
              'w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center',
              'glow-sm hover:bg-[#4480FF] active:scale-95 transition-all duration-150',
            ].join(' ')}
          >
            <Plus size={22} strokeWidth={2.5} className="text-white" />
          </button>
        </div>
      </nav>

      <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </div>
  );
}
