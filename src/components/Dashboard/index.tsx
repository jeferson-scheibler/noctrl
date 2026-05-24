import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Leaf, BookOpen, DollarSign,
  Battery, BatteryMedium, BatteryLow,
  CalendarDays, Lightbulb,
} from 'lucide-react';
import { useStore, useTodayTasks, useTodayEvents } from '../../store';
import { AREA_CONFIG } from '../../types';
import type { Area } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TaskItem } from './TaskItem';
import { WeekStrip } from './WeekStrip';

function AreaCard({ area }: { area: Area }) {
  const navigate = useNavigate();
  const config = AREA_CONFIG[area];
  const AREA_ICONS: Record<Area, typeof Briefcase> = {
    work: Briefcase,
    personal: Leaf,
    study: BookOpen,
    finance: DollarSign,
  };
  const Icon = AREA_ICONS[area];
  const taskCount = useStore((s) => s.tasks.filter((t) => t.area === area && !t.done).length);

  return (
    <Card onClick={() => navigate(`/area/${area}`)} className="group">
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-btn flex items-center justify-center"
          style={{ backgroundColor: `${config.color}1A`, color: config.color }}
        >
          <Icon size={18} />
        </div>
        {taskCount > 0 && (
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${config.color}22`, color: config.color }}
          >
            {taskCount}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold" style={{ color: config.color }}>
        {config.label}
      </p>
    </Card>
  );
}


const MOOD_ICONS = {
  FULL: Battery,
  MEDIUM: BatteryMedium,
  LOW: BatteryLow,
};

const MOOD_LABELS = {
  FULL: 'Cheio de energia',
  MEDIUM: 'Energia media',
  LOW: 'Baixa energia',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Dashboard() {
  const navigate = useNavigate();
  const { mood, userName, streakCount } = useStore();
  const todayTasks = useTodayTasks();
  const todayEvents = useTodayEvents();

  const MoodIcon = mood ? MOOD_ICONS[mood] : Battery;
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Header */}
        <div className="space-y-0.5">
          <p className="text-text-secondary text-sm">{today}</p>
          <h1 className="font-display text-2xl text-text-primary">
            {getGreeting()}{userName ? `, ${userName}` : ''}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {mood && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <MoodIcon size={13} />
                <span>{MOOD_LABELS[mood]}</span>
              </div>
            )}
            {streakCount > 1 && (
              <Badge className="text-xs">
                {streakCount} dias seguidos
              </Badge>
            )}
          </div>
        </div>

        {/* Foco de Hoje */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Foco de hoje
            </h2>
            {todayTasks.length === 0 && (
              <span className="text-xs text-text-muted">Dia livre</span>
            )}
          </div>

          {todayTasks.length === 0 ? (
            <Card>
              <p className="text-sm text-text-secondary text-center py-2">
                {mood === 'LOW'
                  ? 'Tudo bem. Hoje e dia de coisas pequenas.'
                  : 'Dia livre. As vezes descansar e o plano.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

        {/* Eventos de Hoje */}
        {todayEvents.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Compromissos de hoje
            </h2>
            <div className="space-y-2">
              {todayEvents.map((event) => {
                const areaConfig = AREA_CONFIG[event.area];
                return (
                  <Card key={event.id} accentColor={areaConfig.color}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-primary">{event.title}</span>
                      {event.startTime && (
                        <span className="text-xs text-text-secondary">{event.startTime}</span>
                      )}
                    </div>
                    <Badge color={areaConfig.color} className="mt-1.5">
                      {areaConfig.label}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Mini calendário semanal */}
        {mood !== 'LOW' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                Esta semana
              </h2>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs text-accent-glow hover:text-accent-blue transition-colors"
              >
                Ver tudo
              </button>
            </div>
            <WeekStrip />
          </section>
        )}

        {/* Areas */}
        {mood !== 'LOW' && (
          <section>
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Areas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(AREA_CONFIG) as Area[]).map((area) => (
                <AreaCard key={area} area={area} />
              ))}
            </div>
          </section>
        )}

        {/* Links rapidos */}
        <section className="flex gap-3">
          <button
            onClick={() => navigate('/calendar')}
            className="flex-1 flex items-center gap-2 p-3 bg-bg-surface border-subtle rounded-card text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <CalendarDays size={16} />
            <span>Calendario</span>
          </button>
          <button
            onClick={() => navigate('/ideas')}
            className="flex-1 flex items-center gap-2 p-3 bg-bg-surface border-subtle rounded-card text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <Lightbulb size={16} />
            <span>Ideias</span>
          </button>
        </section>

      </div>
    </div>
  );
}
