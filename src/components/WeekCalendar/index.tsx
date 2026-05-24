import { useState, useEffect, useRef } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameDay, isSameMonth,
  isToday, isAfter,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';
import type { CalendarEvent } from '../../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildMonthGrid(month: Date): Date[] {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const last  = endOfWeek(endOfMonth(month),     { weekStartsOn: 0 });
  const days: Date[] = [];
  let cur = first;
  while (!isAfter(cur, last)) { days.push(cur); cur = addDays(cur, 1); }
  return days;
}

function eventsForDay(events: CalendarEvent[], date: Date) {
  const ds = format(date, 'yyyy-MM-dd');
  return events.filter((e) => e.date === ds);
}

function dotColors(events: CalendarEvent[], date: Date): string[] {
  return [...new Set(eventsForDay(events, date).map((e) => AREA_CONFIG[e.area].color))].slice(0, 3);
}

function formatTimeRange(ev: CalendarEvent): string {
  if (ev.allDay) return 'Dia inteiro';
  if (!ev.startTime) return '';
  return ev.endTime ? `${ev.startTime} – ${ev.endTime}` : ev.startTime;
}

// ─── EventCard ───────────────────────────────────────────────────────────────

function EventCard({ ev }: { ev: CalendarEvent }) {
  const area = AREA_CONFIG[ev.area];
  const time = formatTimeRange(ev);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-150 active:scale-[0.98]"
      style={{ border: `1px solid ${area.color}20` }}
    >
      {/* Faixa superior colorida */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${area.color}40, ${area.color}20)`,
        }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: area.color }}
        >
          {area.label}
        </span>
        {time && (
          <span className="text-xs font-medium" style={{ color: `${area.color}CC` }}>
            {time}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div
        className="px-4 py-3"
        style={{ background: `linear-gradient(180deg, ${area.color}0A, transparent)` }}
      >
        <p className="text-base font-semibold text-text-primary leading-snug">
          {ev.title}
        </p>
        {ev.notes && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">{ev.notes}</p>
        )}
      </div>
    </div>
  );
}

// ─── DayAgenda ────────────────────────────────────────────────────────────────

function DayAgenda({ date }: { date: Date }) {
  const { events } = useStore();
  const dayEvents = eventsForDay(events, date)
    .sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return (a.startTime ?? '').localeCompare(b.startTime ?? '');
    });

  const dayName  = format(date, 'EEEE', { locale: ptBR });
  const dayNum   = format(date, 'd');
  const monthStr = format(date, 'MMMM', { locale: ptBR });
  const current  = isToday(date);

  return (
    <div className="px-4 pb-8 animate-fade-in">
      {/* Cabeçalho do dia */}
      <div className="flex items-end gap-4 mb-5 pt-1">
        <div className="relative">
          <span
            className="font-display leading-none"
            style={{
              fontSize: 72,
              color: current ? '#2E6FFF' : '#F0F0F5',
              lineHeight: 1,
              textShadow: current ? '0 0 40px rgba(46,111,255,0.4)' : 'none',
            }}
          >
            {dayNum}
          </span>
          {current && (
            <div
              className="absolute -top-1 -right-2 w-2 h-2 rounded-full"
              style={{ backgroundColor: '#2E6FFF', boxShadow: '0 0 8px #2E6FFF' }}
            />
          )}
        </div>
        <div className="pb-2">
          <p className="font-display text-lg text-text-primary capitalize">{dayName}</p>
          <p className="text-sm text-text-secondary capitalize">{monthStr}</p>
        </div>
        {dayEvents.length > 0 && (
          <div className="pb-2 ml-auto">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(46,111,255,0.12)', color: '#5B9FFF' }}
            >
              {dayEvents.length} evento{dayEvents.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Eventos */}
      {dayEvents.length > 0 ? (
        <div className="space-y-3">
          {dayEvents.map((ev) => <EventCard key={ev.id} ev={ev} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 gap-3">
          {/* Ícone abstrato — 3 linhas tracejadas */}
          <div className="space-y-2 opacity-20">
            {[60, 44, 52].map((w, i) => (
              <div
                key={i}
                className="h-px rounded-full"
                style={{ width: w, background: 'repeating-linear-gradient(90deg,#5A5A6E 0,#5A5A6E 4px,transparent 4px,transparent 8px)' }}
              />
            ))}
          </div>
          <p className="text-sm text-text-muted">
            {current ? 'Dia livre. As vezes descansar e o plano.' : 'Nenhum compromisso neste dia.'}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MonthGrid ───────────────────────────────────────────────────────────────

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function MonthGrid({
  month,
  selected,
  onSelect,
  onMonthChange,
}: {
  month: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}) {
  const { events } = useStore();
  const grid = buildMonthGrid(month);

  return (
    <div
      className="flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Navegação de mês */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-display text-base text-text-primary capitalize">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-1">
          {!isToday(selected) && (
            <button
              onClick={() => { onSelect(new Date()); onMonthChange(new Date()); }}
              className="text-xs text-accent-glow hover:text-accent-blue mr-2 transition-colors"
            >
              Hoje
            </button>
          )}
          <button
            onClick={() => onMonthChange(subMonths(month, 1))}
            aria-label="Mes anterior"
            className="w-7 h-7 flex items-center justify-center rounded-btn text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => onMonthChange(addMonths(month, 1))}
            aria-label="Proximo mes"
            className="w-7 h-7 flex items-center justify-center rounded-btn text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Nomes dos dias */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="flex justify-center">
            <span className="text-[10px] font-semibold text-text-muted w-7 text-center">{l}</span>
          </div>
        ))}
      </div>

      {/* Células */}
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
        {grid.map((day) => {
          const inMonth  = isSameMonth(day, month);
          const active   = isSameDay(day, selected);
          const current  = isToday(day);
          const dots     = inMonth ? dotColors(events, day) : [];

          return (
            <button
              key={day.toISOString()}
              onClick={() => { onSelect(day); if (!isSameMonth(day, month)) onMonthChange(day); }}
              className="flex flex-col items-center gap-0.5 py-0.5 transition-all duration-100"
            >
              {/* Quadrado destacado — tamanho fixo, independente da grade */}
              <div
                className="w-8 h-8 flex items-center justify-center text-xs font-semibold"
                style={{
                  borderRadius: 10,
                  color: active ? '#fff' : current ? '#5B9FFF' : inMonth ? '#F0F0F5' : '#3A3A4A',
                  ...(active ? {
                    background: 'rgba(46,111,255,0.95)',
                    boxShadow: '0 0 14px rgba(46,111,255,0.5)',
                  } : current ? {
                    background: 'rgba(46,111,255,0.14)',
                    border: '1px solid rgba(46,111,255,0.35)',
                  } : {}),
                }}
              >
                {format(day, 'd')}
              </div>
              {/* Dots de eventos */}
              <div className="flex gap-0.5 h-1">
                {dots.map((color, i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: active ? '#5B9FFF' : color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── WeekCalendar ────────────────────────────────────────────────────────────

export function WeekCalendar() {
  const [selectedDay, setSelectedDay]   = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const agendaRef = useRef<HTMLDivElement>(null);

  // Ao trocar de dia, rola o conteúdo para o topo
  useEffect(() => {
    agendaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDay]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">
      <MonthGrid
        month={currentMonth}
        selected={selectedDay}
        onSelect={setSelectedDay}
        onMonthChange={setCurrentMonth}
      />
      <div ref={agendaRef} className="flex-1 overflow-y-auto pt-4">
        <DayAgenda date={selectedDay} />
      </div>
    </div>
  );
}
