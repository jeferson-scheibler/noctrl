import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG, ENERGY_CONFIG } from '../../types';

export function FocusMode() {
  const navigate = useNavigate();
  const { tasks, toggleTask, triggerCelebration } = useStore();
  const [taskIndex, setTaskIndex] = useState(0);
  const [justDone, setJustDone] = useState(false);

  const pending = tasks.filter((t) => !t.done);
  const task = pending[taskIndex] ?? null;

  function handleComplete() {
    if (!task) return;
    setJustDone(true);
    triggerCelebration();
    setTimeout(() => {
      toggleTask(task.id);
      setJustDone(false);
      // Avanca para a proxima tarefa se houver
      if (taskIndex >= pending.length - 1) {
        setTaskIndex(0);
      }
    }, 500);
  }

  function handleNext() {
    setTaskIndex((i) => (i + 1) % Math.max(pending.length, 1));
  }

  const areaConfig = task ? AREA_CONFIG[task.area] : null;
  const energyConfig = task ? ENERGY_CONFIG[task.energy] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: '#0A0A0C' }}
    >
      {/* Botao fechar */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Sair do modo foco"
        className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-secondary transition-colors rounded-btn"
      >
        <X size={20} />
      </button>

      {/* Label */}
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-10">
        Modo Foco
      </p>

      {task ? (
        <>
          {/* Glow de fundo baseado na area */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 320,
              height: 320,
              background: areaConfig
                ? `radial-gradient(circle, ${areaConfig.color}0A 0%, transparent 70%)`
                : undefined,
            }}
          />

          {/* Tarefa */}
          <div className="relative text-center max-w-xs space-y-6">
            <div className="space-y-2">
              {areaConfig && (
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: areaConfig.color }}
                >
                  {areaConfig.label}
                </p>
              )}
              <h1
                className={[
                  'font-display text-3xl text-text-primary leading-tight transition-all duration-300',
                  justDone ? 'opacity-30 scale-95 line-through' : '',
                ].join(' ')}
              >
                {task.title}
              </h1>
              {energyConfig && (
                <p className="text-sm text-text-secondary">{energyConfig.label}</p>
              )}
            </div>

            {/* Botao concluir */}
            <button
              onClick={handleComplete}
              disabled={justDone}
              className={[
                'w-16 h-16 rounded-full mx-auto flex items-center justify-center',
                'border-2 transition-all duration-300',
                justDone
                  ? 'border-area-finance bg-area-finance/20 scale-110'
                  : 'border-text-muted hover:border-accent-blue hover:bg-accent-blue/10 hover:scale-105',
              ].join(' ')}
              aria-label="Marcar tarefa como concluida"
            >
              <Check
                size={28}
                strokeWidth={2}
                className={justDone ? 'text-area-finance' : 'text-text-muted'}
              />
            </button>

            <p className="text-xs text-text-muted">
              Toque no circulo para concluir
            </p>
          </div>

          {/* Proxima tarefa */}
          {pending.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute bottom-10 flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Proxima tarefa
              <ChevronRight size={14} />
            </button>
          )}

          {/* Contador */}
          <div className="absolute top-6 left-6 text-xs text-text-muted">
            {taskIndex + 1} / {pending.length}
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: 'rgba(6,214,160,0.1)', border: '2px solid rgba(6,214,160,0.3)' }}
          >
            <Check size={28} style={{ color: '#06D6A0' }} />
          </div>
          <p className="font-display text-2xl text-text-primary">Tudo feito.</p>
          <p className="text-sm text-text-secondary">
            Nao ha tarefas pendentes. Isso e consistencia.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-accent-glow hover:text-accent-blue transition-colors"
          >
            Voltar ao painel
          </button>
        </div>
      )}
    </div>
  );
}
