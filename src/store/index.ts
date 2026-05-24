import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, isToday, parseISO, differenceInCalendarDays, startOfWeek } from 'date-fns';
import type { Mood, Task, CalendarEvent, Area, AppState, WeeklyReview } from '../types';
import { CELEBRATION_MESSAGES } from '../types';

interface Actions {
  setMood: (mood: Mood) => void;
  resetMoodIfNewDay: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'done'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addIdea: (idea: Omit<Task, 'id' | 'createdAt' | 'done' | 'type'>) => void;
  promoteIdeaToTask: (id: string) => void;
  deleteIdea: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  updateNotes: (area: Area, content: string) => void;
  setUserName: (name: string) => void;
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt' | 'weekDate'>) => void;
  // Estado efemero de UI — nao persistido
  celebration: string | null;
  triggerCelebration: () => void;
  clearCelebration: () => void;
}

type Store = AppState & Actions;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function randomCelebration(): string {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

// localStorage falha silenciosamente em modo anonimo e em alguns browsers embarcados.
// O teste de escrita detecta isso antes de registrar o storage, evitando crash no middleware persist.
function safeStorage() {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return createJSONStorage(() => localStorage);
  } catch {
    return createJSONStorage(() => sessionStorage);
  }
}

const initialState: AppState = {
  mood: null,
  moodDate: null,
  tasks: [],
  ideas: [],
  events: [],
  notes: { work: '', personal: '', study: '', finance: '' },
  userName: '',
  streakCount: 0,
  lastOpenedDate: null,
  weeklyReviews: [],
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Estado efemero — nao aparece em partialize, nao persiste
      celebration: null,

      triggerCelebration() {
        set({ celebration: randomCelebration() });
      },

      clearCelebration() {
        set({ celebration: null });
      },

      setMood(mood) {
        const today = format(new Date(), 'yyyy-MM-dd');
        set({ mood, moodDate: today });
      },

      resetMoodIfNewDay() {
        const { moodDate, lastOpenedDate, streakCount } = get();
        const today = format(new Date(), 'yyyy-MM-dd');

        if (moodDate && moodDate !== today) {
          set({ mood: null, moodDate: null });
        }

        if (lastOpenedDate !== today) {
          // Streak so incrementa se o usuario abriu o app ontem (diferenca exata de 1 dia).
          // Qualquer lacuna — feriado, fim de semana sem abrir — reinicia para 1.
          const yesterday = lastOpenedDate
            ? differenceInCalendarDays(parseISO(today), parseISO(lastOpenedDate)) === 1
            : false;
          set({
            lastOpenedDate: today,
            streakCount: yesterday ? streakCount + 1 : 1,
          });
        }
      },

      addTask(taskData) {
        const task: Task = {
          ...taskData,
          id: generateId(),
          done: false,
          createdAt: new Date().toISOString(),
          type: 'task',
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
      },

      updateTask(id, updates) {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTask(id) {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },

      toggleTask(id) {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        }));
      },

      addIdea(ideaData) {
        const idea: Task = {
          ...ideaData,
          id: generateId(),
          done: false,
          type: 'idea',
          energy: ideaData.energy ?? 'easy',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ ideas: [idea, ...s.ideas] }));
      },

      promoteIdeaToTask(id) {
        const { ideas } = get();
        const idea = ideas.find((i) => i.id === id);
        if (!idea) return;
        const task: Task = { ...idea, type: 'task', done: false };
        set((s) => ({
          ideas: s.ideas.filter((i) => i.id !== id),
          tasks: [task, ...s.tasks],
        }));
      },

      deleteIdea(id) {
        set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }));
      },

      addEvent(eventData) {
        const event: CalendarEvent = { ...eventData, id: generateId() };
        set((s) => ({ events: [event, ...s.events] }));
      },

      updateEvent(id, updates) {
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      deleteEvent(id) {
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
      },

      updateNotes(area, content) {
        set((s) => ({ notes: { ...s.notes, [area]: content } }));
      },

      setUserName(name) {
        const sanitized = name.trim().slice(0, 50);
        set({ userName: sanitized });
      },

      addWeeklyReview({ wentWell, improve, intention }) {
        const weekDate = format(
          startOfWeek(new Date(), { weekStartsOn: 1 }),
          'yyyy-MM-dd'
        );
        const review: WeeklyReview = {
          id: generateId(),
          weekDate,
          wentWell: wentWell.trim().slice(0, 2000),
          improve: improve.trim().slice(0, 2000),
          intention: intention.trim().slice(0, 2000),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ weeklyReviews: [review, ...s.weeklyReviews] }));
      },
    }),
    {
      name: 'noctrl-storage',
      storage: safeStorage(),
      partialize: (state) => ({
        mood: state.mood,
        moodDate: state.moodDate,
        tasks: state.tasks,
        ideas: state.ideas,
        events: state.events,
        notes: state.notes,
        userName: state.userName,
        streakCount: state.streakCount,
        lastOpenedDate: state.lastOpenedDate,
        weeklyReviews: state.weeklyReviews,
      }),
    }
  )
);

export function useTodayTasks() {
  const { tasks, mood } = useStore();
  const pending = tasks.filter((t) => !t.done);

  if (!mood) return pending.slice(0, 3);

  if (mood === 'LOW') {
    return pending.filter((t) => t.energy === 'easy').slice(0, 3);
  }

  if (mood === 'MEDIUM') {
    return pending.slice(0, 5);
  }

  return pending;
}

export function useTodayEvents() {
  const { events } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  return events.filter((e) => e.date === today);
}

export function useWeekEvents() {
  const { events } = useStore();
  return events;
}

export function useMoodValid(): boolean {
  const { mood, moodDate } = useStore();
  if (!mood || !moodDate) return false;
  try {
    return isToday(parseISO(moodDate));
  } catch {
    return false;
  }
}

export function useWeeklyReviewPending(): boolean {
  const { weeklyReviews } = useStore();
  const today = new Date();
  // Domingo = 0. Revisao disponivel aos domingos.
  if (today.getDay() !== 0) return false;
  const thisWeek = format(
    startOfWeek(today, { weekStartsOn: 1 }),
    'yyyy-MM-dd'
  );
  return !weeklyReviews.some((r) => r.weekDate === thisWeek);
}
