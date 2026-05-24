import { useState } from 'react';
import { Battery, BatteryMedium, BatteryLow } from 'lucide-react';
import { useStore } from '../../store';
import type { Mood } from '../../types';
import { JarvisOrb } from './JarvisOrb';

interface MoodOption {
  mood: Mood;
  label: string;
  description: string;
  sublabel: string;
  Icon: typeof Battery;
  color: string;
}

const OPTIONS: MoodOption[] = [
  {
    mood: 'FULL',
    label: 'Cheio de energia',
    description: 'Pronto para tudo',
    sublabel: 'Mostra todas as suas areas e tarefas',
    Icon: Battery,
    color: '#06D6A0',
  },
  {
    mood: 'MEDIUM',
    label: 'Energia media',
    description: 'Foco no essencial',
    sublabel: 'Mostra prioridades e compromissos do dia',
    Icon: BatteryMedium,
    color: '#FFD166',
  },
  {
    mood: 'LOW',
    label: 'Baixa energia',
    description: 'Dia de coisas pequenas',
    sublabel: 'Mostra apenas 3 tarefas faceis',
    Icon: BatteryLow,
    color: '#FF6B6B',
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function MoodCheckin() {
  const { setMood, userName, setUserName } = useStore();
  const [hoveredMood, setHoveredMood] = useState<Mood | null>(null);
  const [nameInput, setNameInput] = useState(userName);
  const [showNameForm, setShowNameForm] = useState(!userName);

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) {
      setUserName(trimmed);
      setShowNameForm(false);
    }
  }

  function handleMoodSelect(mood: Mood) {
    setMood(mood);
  }

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col items-center justify-center p-6 animate-fade-in overflow-hidden">
      <div className="w-full max-w-sm space-y-8">

        {/* Assistente visual */}
        <div className="flex justify-center pt-2">
          <JarvisOrb />
        </div>

        {/* Saudacao e pergunta */}
        <div className="space-y-1">
          <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">
            {getGreeting()}{userName ? `, ${userName}` : ''}
          </p>
          <h1 className="font-display text-3xl text-text-primary">
            Como voce esta hoje?
          </h1>
          <p className="text-text-secondary text-sm">
            Seu nivel de energia define o que aparece no painel.
          </p>
        </div>

        {/* Campo de nome (primeiro acesso) */}
        {showNameForm && (
          <form onSubmit={handleNameSubmit} className="space-y-3 animate-slide-up">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Como posso te chamar?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value.slice(0, 50))}
                placeholder="Seu nome"
                maxLength={50}
                autoFocus
                className="flex-1 bg-bg-surface border-subtle rounded-btn px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:shadow-glow-sm transition-all"
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="px-4 py-2.5 bg-accent-blue text-white text-sm font-medium rounded-btn hover:bg-[#4480FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Ok
              </button>
            </div>
          </form>
        )}

        {/* Opcoes de mood */}
        <div className="space-y-3">
          {OPTIONS.map(({ mood, label, description, sublabel, Icon, color }) => {
            const isHovered = hoveredMood === mood;
            return (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                onMouseEnter={() => setHoveredMood(mood)}
                onMouseLeave={() => setHoveredMood(null)}
                className={[
                  'w-full flex items-center gap-4 p-4 rounded-card text-left',
                  'bg-bg-surface border transition-all duration-200',
                  isHovered
                    ? 'border-white/15 bg-bg-elevated scale-[1.01]'
                    : 'border-subtle',
                ].join(' ')}
                style={isHovered ? { boxShadow: `0 0 20px ${color}22` } : undefined}
              >
                <div
                  className="w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-text-primary">{label}</span>
                    <span className="text-xs text-text-secondary">{description}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>
                </div>
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-opacity duration-200"
                  style={{ backgroundColor: color, opacity: isHovered ? 1 : 0.3 }}
                />
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-text-muted">
          Sem pressao. Sem julgamento.
        </p>
      </div>
    </div>
  );
}
