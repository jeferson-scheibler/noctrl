import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Lightbulb, Plus } from 'lucide-react';
import { QuickCapture } from '../components/QuickCapture';

const NAV_ITEMS = [
  { path: '/',         icon: LayoutDashboard, label: 'Painel'    },
  { path: '/calendar', icon: CalendarDays,    label: 'Calendario' },
  { path: '/ideas',    icon: Lightbulb,       label: 'Ideias'    },
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

      {/* Bottom nav — glassmorphism */}
      <nav
        role="navigation"
        aria-label="Navegacao principal"
        className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: 'rgba(14,14,18,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-around px-4 pb-2 pt-1.5">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 transition-all duration-200"
              >
                {/* Pill indicador acima do icone */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                  style={{
                    width: active ? 20 : 0,
                    backgroundColor: '#2E6FFF',
                    boxShadow: active ? '0 0 8px rgba(46,111,255,0.8)' : 'none',
                  }}
                />
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.7}
                  style={{ color: active ? '#2E6FFF' : '#5A5A6E', transition: 'color 0.2s' }}
                />
                <span
                  className="text-[10px] font-semibold transition-colors duration-200"
                  style={{ color: active ? '#2E6FFF' : '#5A5A6E' }}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* FAB */}
          <button
            onClick={() => setCaptureOpen(true)}
            aria-label="Captura rapida"
            className="w-13 h-13 flex items-center justify-center transition-all duration-150 active:scale-90"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4480FF, #2E6FFF)',
              boxShadow: '0 0 24px rgba(46,111,255,0.5), 0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <Plus size={24} strokeWidth={2.5} color="#fff" />
          </button>
        </div>
      </nav>

      <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </div>
  );
}
