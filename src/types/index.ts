export type Mood = 'FULL' | 'MEDIUM' | 'LOW';
export type CaptureType = 'task' | 'idea' | 'event';
export type Area = 'work' | 'personal' | 'study' | 'finance';
export type EnergyLevel = 'easy' | 'medium' | 'heavy';

export interface Task {
  id: string;
  title: string;
  type: CaptureType;
  area: Area;
  energy: EnergyLevel;
  done: boolean;
  createdAt: string;
  dueDate?: string;
  notes?: string;
  imageUrl?: string;
  audioTranscript?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  area: Area;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  notes?: string;
}

export interface DayMood {
  date: string;
  mood: Mood;
}

export interface AppState {
  mood: Mood | null;
  moodDate: string | null;
  tasks: Task[];
  ideas: Task[];
  events: CalendarEvent[];
  notes: Record<Area, string>;
  userName: string;
  streakCount: number;
  lastOpenedDate: string | null;
}

export const AREA_CONFIG: Record<Area, { label: string; color: string; colorVar: string }> = {
  work: { label: 'Trabalho', color: '#7C6FFF', colorVar: 'area-work' },
  personal: { label: 'Pessoal', color: '#FF6B6B', colorVar: 'area-personal' },
  study: { label: 'Estudos', color: '#FFD166', colorVar: 'area-study' },
  finance: { label: 'Financeiro', color: '#06D6A0', colorVar: 'area-finance' },
};

export const ENERGY_CONFIG: Record<EnergyLevel, { label: string; weight: number }> = {
  easy: { label: 'Facil', weight: 1 },
  medium: { label: 'Medio', weight: 2 },
  heavy: { label: 'Pesado', weight: 3 },
};

export const MOOD_CONFIG: Record<Mood, { label: string; description: string; icon: string }> = {
  FULL: { label: 'Cheio de energia', description: 'Pronto para tudo', icon: 'battery-full' },
  MEDIUM: { label: 'Energia media', description: 'Foco no essencial', icon: 'battery-medium' },
  LOW: { label: 'Baixa energia', description: 'Dia de coisas pequenas', icon: 'battery-low' },
};
