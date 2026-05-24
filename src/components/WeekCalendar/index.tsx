import { useState, useEffect, useRef, useCallback } from 'react';
import {
  format, startOfWeek, addDays, addWeeks,
  isSameDay, isToday, parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';
import type { CalendarEvent, Area } from '../../types';

// Layout constants
const HOUR_PX   = 64;   // pixels por hora
const DAY_START = 6;    // 06:00
const DAY_END   = 23;   // 23:00
const HOURS     = Array.from({ length: DAY_END - DAY_START }, (_, i) => i + DAY_START);
const GRID_H    = HOURS.length * HOUR_PX;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function eventPosition(ev: CalendarEvent): { top: number; height: number } | null {
  if (!ev.startTime) return null;
  const startMin = timeToMinutes(ev.startTime) - DAY_START * 60;
  const endMin   = ev.endTime
    ? timeToMinutes(ev.endTime) - DAY_START * 60
    : startMin + 60;
  if (startMin < 0 && endMin <= 0) return null;
  const top    = Math.max(0, (startMin / 60) * HOUR_PX);
  const height = Math.max(24, ((endMin - startMin) / 60) * HOUR_PX);
  return { top, height };
}

function getNowTop(): number {
  const now = new Date();
  const min = (now.getHours() - DAY_START) * 60 + now.getMinutes();
  return (min / 60) * HOUR_PX;
}

// ─── EventBlock ────────────────────────────────────────────────────────────
function EventBlock({ ev, compact = false }: { ev: CalendarEvent; compact?: boolean }) {
  const area = AREA_CONFIG[ev.area];
  const pos  = eventPosition(ev);

  if (!pos && !ev.allDay) return null;

  const style = pos
    ? {
        position: 'absolute' as const,
        top:    pos.top + 2,
        height: pos.height - 4,
        left: 3,
        right: 3,
        background: `linear-gradient(135deg, ${area.color}28, ${area.color}10)`,
        borderLeft: `3px solid ${area.color}`,
        borderRadius: 8,
        overflow: 'hidden',
      }
    : {};

  return (
    <div
      style={style}
      className={compact ? '' : 'px-2 py-1 cursor-default select-none'}
    >
      <p
        className="text-xs font-semibold leading-tight truncate"
        style={{ color: area.color }}
      >
        {ev.title}
      </p>
      {pos && pos.height >= 40 && ev.startTime && (
        <p className="text-[10px] mt-0.5 opacity-70" style={{ color: area.color }}>
          {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
        </p>
      )}
    </div>
  );
}

// ─── CurrentTimeLine ────────────────────────────────────────────────────────
function CurrentTimeLine() {
  const [top, setTop] = useState(getNowTop);

  useEffect(() => {
    const id = setInterval(() => setTop(getNowTop()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (top < 0 || top > GRID_H) return null;

  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
      style={{ top }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 -ml-1"
        style={{ backgroundColor: '#2E6FFF', boxShadow: '0 0 6px #2E6FFF' }}
      />
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: 'rgba(46,111,255,0.6)' }}
      />
    </div>
  );
}

// ─── DayColumn ──────────────────────────────────────────────────────────────
function DayColumn({ date, showNow }: { date: Date; showNow: boolean }) {
  const { events } = useStore();
  const dateStr   = format(date, 'yyyy-MM-dd');
  const dayEvents = events.filter((e) => e.date === dateStr && !e.allDay && e.startTime);

  return (
    <div className="relative flex-1" style={{ height: GRID_H }}>
      {/* Linhas de hora — background only */}
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0"
          style={{
            top: (h - DAY_START) * HOUR_PX,
            height: HOUR_PX,
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        />
      ))}

      {/* Indicador de agora */}
      {showNow && <CurrentTimeLine />}

      {/* Eventos */}
      {dayEvents.map((ev) => (
        <EventBlock key={ev.id} ev={ev} />
      ))}
    </div>
  );
}

// ─── DayStrip ───────────────────────────────────────────────────────────────
function DayStrip({
  days,
  selected,
  onSelect,
}: {
  days: Date[];
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  const { events, tasks } = useStore();
  const stripRef = useRef<HTMLDivElement>(null);

  // Centraliza o dia selecionado no strip
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const idx   = days.findIndex((d) => isSameDay(d, selected));
    const child = el.children[idx] as HTMLElement | undefined;
    if (child) {
      el.scrollTo({ left: child.offsetLeft - el.clientWidth / 2 + child.clientWidth / 2, behavior: 'smooth' });
    }
  }, [selected, days]);

  function getDots(date: Date): string[] {
    const ds = format(date, 'yyyy-MM-dd');
    const evAreas = events.filter((e) => e.date === ds).map((e) => e.area);
    const tkAreas = tasks
      .filter((t) => {
        if (!t.dueDate) return false;
        try { return isSameDay(parseISO(t.dueDate), date); } catch { return false; }
      })
      .map((t) => t.area);
    return [...new Set([...evAreas, ...tkAreas])].slice(0, 3);
  }

  return (
    <div
      ref={stripRef}
      className="flex gap-1 overflow-x-auto px-3 py-2 scrollbar-none"
      style={{ scrollbarWidth: 'none' }}
    >
      {days.map((day) => {
        const active   = isSameDay(day, selected);
        const current  = isToday(day);
        const dots     = getDots(day);

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className="flex flex-col items-center gap-1 flex-shrink-0 w-11 py-1.5 rounded-xl transition-all duration-150"
            style={
              active
                ? { backgroundColor: '#2E6FFF', boxShadow: '0 0 14px rgba(46,111,255,0.45)' }
                : current
                ? { backgroundColor: 'rgba(46,111,255,0.12)', border: '1px solid rgba(46,111,255,0.3)' }
                : {}
            }
          >
            <span
              className="text-[10px] font-semibold uppercase"
              style={{ color: active ? 'rgba(255,255,255,0.7)' : '#5A5A6E' }}
            >
              {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: active ? '#fff' : current ? '#2E6FFF' : '#F0F0F5' }}
            >
              {format(day, 'd')}
            </span>
            <div className="flex gap-0.5 h-1.5">
              {dots.map((area) => (
                <span
                  key={area}
                  className="w-1 h-1 rounded-full"
                  style={{
                    backgroundColor: active
                      ? 'rgba(255,255,255,0.7)'
                      : AREA_CONFIG[area as Area].color,
                  }}
                />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── AllDayRow ───────────────────────────────────────────────────────────────
function AllDayRow({ date }: { date: Date }) {
  const { events } = useStore();
  const ds = format(date, 'yyyy-MM-dd');
  const allDay = events.filter((e) => e.date === ds && e.allDay);
  if (allDay.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-subtle flex flex-wrap gap-1.5">
      {allDay.map((ev) => {
        const area = AREA_CONFIG[ev.area];
        return (
          <span
            key={ev.id}
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${area.color}22`, color: area.color }}
          >
            {ev.title}
          </span>
        );
      })}
    </div>
  );
}

// ─── TimeLabels ──────────────────────────────────────────────────────────────
function TimeLabels() {
  return (
    <div className="flex-shrink-0 w-12" style={{ height: GRID_H }}>
      {HOURS.map((h) => (
        <div
          key={h}
          className="flex items-start justify-end pr-2"
          style={{ height: HOUR_PX }}
        >
          <span className="text-[10px] text-text-muted mt-[-6px]">{h}h</span>
        </div>
      ))}
    </div>
  );
}

// ─── WeekCalendar ────────────────────────────────────────────────────────────
export function WeekCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const baseDate  = addWeeks(new Date(), weekOffset);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const days      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Rola para o horario atual na montagem
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nowTop = getNowTop();
    el.scrollTo({ top: Math.max(0, nowTop - 120), behavior: 'smooth' });
  }, []);

  // Ao trocar de semana, seleciona hoje se estiver na semana, senao segunda-feira
  const handleWeekChange = useCallback((delta: number) => {
    setWeekOffset((o) => {
      const next = o + delta;
      const newBase  = addWeeks(new Date(), next);
      const newStart = startOfWeek(newBase, { weekStartsOn: 0 });
      const newDays  = Array.from({ length: 7 }, (_, i) => addDays(newStart, i));
      const todayInWeek = newDays.find((d) => isToday(d));
      setSelectedDay(todayInWeek ?? newDays[1]);
      return next;
    });
  }, []);

  const monthLabel = format(selectedDay, 'MMMM yyyy', { locale: ptBR });
  const showNow    = isToday(selectedDay);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bg-primary">

      {/* Header: mes + navegacao de semana */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1 flex-shrink-0">
        <h2 className="font-display text-lg text-text-primary capitalize">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          {weekOffset !== 0 && (
            <button
              onClick={() => { setWeekOffset(0); setSelectedDay(new Date()); }}
              className="text-xs text-accent-glow hover:text-accent-blue mr-2 transition-colors"
            >
              Hoje
            </button>
          )}
          <button
            onClick={() => handleWeekChange(-1)}
            aria-label="Semana anterior"
            className="w-8 h-8 flex items-center justify-center rounded-btn text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => handleWeekChange(1)}
            aria-label="Proxima semana"
            className="w-8 h-8 flex items-center justify-center rounded-btn text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Strip de dias */}
      <div className="flex-shrink-0">
        <DayStrip days={days} selected={selectedDay} onSelect={setSelectedDay} />
      </div>

      {/* Eventos de dia inteiro */}
      <AllDayRow date={selectedDay} />

      {/* Divisor */}
      <div className="h-px bg-subtle flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />

      {/* Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: GRID_H }}>
          <TimeLabels />
          <div className="flex-1 relative">
            <DayColumn date={selectedDay} showNow={showNow} />
          </div>
        </div>
      </div>

      {/* Estado vazio */}
      {useStore.getState().events.filter(
        (e) => e.date === format(selectedDay, 'yyyy-MM-dd')
      ).length === 0 && (
        <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          <CalendarDays size={28} className="text-text-muted opacity-40" />
          <p className="text-xs text-text-muted opacity-40">Nenhum compromisso neste dia</p>
        </div>
      )}
    </div>
  );
}
