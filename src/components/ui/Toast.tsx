import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useStore } from '../../store';

const AUTO_DISMISS_MS = 2800;

export function CelebrationToast() {
  const { celebration, clearCelebration } = useStore();

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(clearCelebration, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [celebration, clearCelebration]);

  if (!celebration) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 left-1/2 z-50 animate-slide-up"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-card border"
        style={{
          backgroundColor: '#0F1A0F',
          borderColor: 'rgba(6,214,160,0.3)',
          boxShadow: '0 0 24px rgba(6,214,160,0.15)',
          minWidth: 240,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(6,214,160,0.15)' }}
        >
          <Check size={14} strokeWidth={2.5} style={{ color: '#06D6A0' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: '#06D6A0' }}>
          {celebration}
        </p>
      </div>
    </div>
  );
}
