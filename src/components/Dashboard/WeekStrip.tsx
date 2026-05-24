import { format, startOfWeek, addDays, isToday, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';

export function WeekStrip() {
  const { events, tasks } = useStore();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function getDotColors(date: Date): string[] {
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
    const allItems = [...dayEvents, ...dayTasks];
    return [...new Set(allItems.map((i) => AREA_CONFIG[i.area].color))].slice(0, 3);
  }

  return (
    <div className="bg-bg-surface border-subtle rounded-card p-3">
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentDay = isToday(day);
          const dotColors = getDotColors(day);

          return (
            <div key={day.toISOString()} className="flex flex-col items-center gap-1 py-1">
              <span className="text-xs text-text-muted">
                {format(day, 'EEE', { locale: ptBR }).slice(0, 3)}
              </span>
              <div
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
                  isCurrentDay
                    ? 'bg-accent-blue text-white glow-sm'
                    : 'text-text-secondary',
                ].join(' ')}
              >
                {format(day, 'd')}
              </div>
              <div className="flex gap-0.5 h-2 items-center">
                {dotColors.map((color, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
