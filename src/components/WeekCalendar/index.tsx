import { useState } from 'react';
import {
  format, startOfWeek, addDays, addWeeks, subWeeks,
  isSameDay, isToday, parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';
import type { Area } from '../../types';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface DayDetailProps {
  date: Date;
  onClose: () => void;
}

function DayDetail({ date, onClose }: DayDetailProps) {
  const { events, tasks } = useStore();
  const dateStr = format(date, 'yyyy-MM-dd');

  const dayEvents = events.filter((e) => e.date === dateStr);
  const dayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    try {
      return isSameDay(parseISO(t.dueDate), date);
    } catch {
      return false;
    }
  });

  const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

  return (
    <Modal
      open
      onClose={onClose}
      title={format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
    >
      <div className="p-5 space-y-4">
        {!hasItems && (
          <p className="text-sm text-text-secondary text-center py-4">
            Nenhum compromisso neste dia.
          </p>
        )}

        {dayEvents.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2">
              Compromissos
            </p>
            <div className="space-y-2">
              {dayEvents.map((ev) => {
                const area = AREA_CONFIG[ev.area];
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-3 bg-bg-surface border-subtle rounded-card"
                    style={{ borderLeft: `3px solid ${area.color}` }}
                  >
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">{ev.title}</p>
                      {ev.startTime && (
                        <p className="text-xs text-text-secondary mt-0.5">{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</p>
                      )}
                    </div>
                    <Badge color={area.color}>{area.label}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {dayTasks.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2">
              Tarefas com prazo
            </p>
            <div className="space-y-2">
              {dayTasks.map((task) => {
                const area = AREA_CONFIG[task.area];
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-bg-surface border-subtle rounded-card"
                  >
                    <div
                      className={[
                        'w-4 h-4 rounded-full border-2 flex-shrink-0',
                        task.done ? 'bg-accent-blue border-accent-blue' : 'border-text-muted',
                      ].join(' ')}
                    />
                    <p className={['text-sm flex-1', task.done ? 'line-through text-text-secondary' : 'text-text-primary'].join(' ')}>
                      {task.title}
                    </p>
                    <Badge color={area.color}>{area.label}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function WeekCalendar() {
  const { events, tasks } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const baseDate = weekOffset === 0
    ? new Date()
    : weekOffset > 0
    ? addWeeks(new Date(), weekOffset)
    : subWeeks(new Date(), Math.abs(weekOffset));

  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

  function getEventsForDayHour(date: Date, hour: number) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((e) => {
      if (e.date !== dateStr || e.allDay) return false;
      if (!e.startTime) return false;
      const [h] = e.startTime.split(':').map(Number);
      return h === hour;
    });
  }

  function getAllDayEvents(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((e) => e.date === dateStr && e.allDay);
  }

  function getDotAreas(date: Date): Area[] {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter((e) => e.date === dateStr);
    const dayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      try {
        return isSameDay(parseISO(t.dueDate), date);
      } catch {
        return false;
      }
    });
    return [...new Set([...dayEvents, ...dayTasks].map((i) => i.area))];
  }

  const weekLabel = `${format(weekStart, "d 'de' MMM", { locale: ptBR })} – ${format(addDays(weekStart, 6), "d 'de' MMM", { locale: ptBR })}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Navegacao */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-subtle flex-shrink-0">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary">{weekLabel}</p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-accent-glow hover:text-accent-blue transition-colors"
            >
              Voltar para hoje
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Proxima semana"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Cabecalho dos dias */}
      <div className="grid grid-cols-8 px-2 py-2 border-b border-subtle flex-shrink-0">
        <div className="w-10" />
        {days.map((day) => {
          const isCurrentDay = isToday(day);
          const dotAreas = getDotAreas(day);
          return (
            <div
              key={day.toISOString()}
              className="flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => setSelectedDay(day)}
            >
              <span className="text-xs text-text-muted">
                {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
              </span>
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                  isCurrentDay ? 'bg-accent-blue text-white glow-sm' : 'text-text-secondary',
                ].join(' ')}
              >
                {format(day, 'd')}
              </div>
              <div className="flex gap-0.5">
                {dotAreas.slice(0, 3).map((area) => (
                  <span
                    key={area}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: AREA_CONFIG[area].color }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid de horas */}
      <div className="flex-1 overflow-y-auto">
        {/* Eventos de dia inteiro */}
        <div className="grid grid-cols-8 px-2 py-1 border-b border-subtle">
          <div className="w-10 text-xs text-text-muted flex items-center justify-end pr-2">
            dia
          </div>
          {days.map((day) => {
            const allDay = getAllDayEvents(day);
            return (
              <div key={day.toISOString()} className="px-0.5 space-y-0.5">
                {allDay.map((ev) => {
                  const area = AREA_CONFIG[ev.area];
                  return (
                    <div
                      key={ev.id}
                      className="rounded text-xs px-1 py-0.5 truncate"
                      style={{ backgroundColor: `${area.color}33`, color: area.color }}
                    >
                      {ev.title}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Horas */}
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 px-2 min-h-[48px] border-b border-subtle/50">
            <div className="w-10 text-xs text-text-muted flex items-start justify-end pr-2 pt-1">
              {hour}h
            </div>
            {days.map((day) => {
              const hourEvents = getEventsForDayHour(day, hour);
              return (
                <div key={day.toISOString()} className="px-0.5 py-0.5 space-y-0.5">
                  {hourEvents.map((ev) => {
                    const area = AREA_CONFIG[ev.area];
                    return (
                      <div
                        key={ev.id}
                        className="rounded text-xs px-1 py-0.5 truncate"
                        style={{ backgroundColor: `${area.color}33`, color: area.color }}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDay && (
        <DayDetail date={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </div>
  );
}
