import { useState, useRef } from 'react';
import { Mic, MicOff, Image as ImageIcon, FileText, X, Loader2 } from 'lucide-react';

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';
import type { CaptureType, Area, EnergyLevel } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface QuickCaptureProps {
  open: boolean;
  onClose: () => void;
}

type InputMode = 'text' | 'audio' | 'image';

const INITIAL_STATE = {
  title: '',
  type: 'task' as CaptureType,
  area: 'personal' as Area,
  energy: 'medium' as EnergyLevel,
  notes: '',
  imageUrl: '',
  audioTranscript: '',
};

export function QuickCapture({ open, onClose }: QuickCaptureProps) {
  const { addTask, addIdea, addEvent } = useStore();
  const [form, setForm] = useState(INITIAL_STATE);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleClose() {
    setForm(INITIAL_STATE);
    setInputMode('text');
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    if (form.type === 'idea') {
      addIdea({
        title,
        area: form.area,
        energy: form.energy,
        notes: form.notes,
        imageUrl: form.imageUrl,
        audioTranscript: form.audioTranscript,
      });
    } else if (form.type === 'event') {
      addEvent({
        title,
        area: form.area,
        date: new Date().toISOString().split('T')[0],
        allDay: true,
        notes: form.notes,
      });
    } else {
      addTask({
        title,
        type: 'task',
        area: form.area,
        energy: form.energy,
        notes: form.notes,
        imageUrl: form.imageUrl,
        audioTranscript: form.audioTranscript,
      });
    }

    handleClose();
  }

  function startRecording() {
    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('Reconhecimento de voz nao disponivel neste navegador.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm((f) => ({
        ...f,
        title: f.title ? f.title + ' ' + transcript : transcript,
        audioTranscript: transcript,
      }));
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsProcessing(true);
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Limite de 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  const canSubmit = form.title.trim().length > 0;

  return (
    <Modal open={open} onClose={handleClose} title="Captura rapida">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">

        {/* Modo de entrada */}
        <div className="flex gap-2">
          {([
            { mode: 'text' as InputMode, label: 'Texto', Icon: FileText },
            { mode: 'audio' as InputMode, label: 'Audio', Icon: Mic },
            { mode: 'image' as InputMode, label: 'Imagem', Icon: ImageIcon },
          ] as const).map(({ mode, label, Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setInputMode(mode)}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn text-xs font-semibold transition-all',
                inputMode === mode
                  ? 'bg-accent-blue text-white glow-sm'
                  : 'bg-bg-surface border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
              ].join(' ')}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Campo de texto principal */}
        <div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value.slice(0, 200) }))}
            placeholder="O que esta na sua cabeca?"
            maxLength={200}
            autoFocus
            className="w-full bg-bg-surface border-subtle rounded-btn px-3 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:shadow-glow-sm transition-all"
          />
        </div>

        {/* Controles de audio */}
        {inputMode === 'audio' && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing && !isRecording}
              className={[
                'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                isRecording
                  ? 'bg-area-personal text-white animate-pulse'
                  : 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20',
              ].join(' ')}
            >
              {isProcessing && !isRecording ? (
                <Loader2 size={22} className="animate-spin" />
              ) : isRecording ? (
                <MicOff size={22} />
              ) : (
                <Mic size={22} />
              )}
            </button>
          </div>
        )}

        {/* Upload de imagem */}
        {inputMode === 'image' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            {form.imageUrl ? (
              <div className="relative rounded-card overflow-hidden">
                <img
                  src={form.imageUrl}
                  alt="Captura"
                  className="w-full max-h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border border-dashed border-text-muted rounded-card text-text-secondary text-sm hover:border-accent-blue hover:text-accent-blue transition-colors"
              >
                Toque para adicionar imagem
              </button>
            )}
          </div>
        )}

        {/* Tipo */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Tipo
          </label>
          <div className="flex gap-2">
            {([
              { value: 'task', label: 'Tarefa' },
              { value: 'idea', label: 'Ideia' },
              { value: 'event', label: 'Compromisso' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: value }))}
                className={[
                  'flex-1 py-2 rounded-btn text-xs font-semibold transition-all',
                  form.type === value
                    ? 'bg-accent-blue text-white'
                    : 'bg-bg-surface border-subtle text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Area */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Area
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(AREA_CONFIG) as [Area, typeof AREA_CONFIG[Area]][]).map(
              ([area, config]) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, area }))}
                  className={[
                    'py-2.5 rounded-btn text-xs font-semibold transition-all border',
                    form.area === area
                      ? 'border-current'
                      : 'border-subtle text-text-secondary hover:border-white/15',
                  ].join(' ')}
                  style={
                    form.area === area
                      ? {
                          backgroundColor: `${config.color}22`,
                          color: config.color,
                          borderColor: `${config.color}55`,
                        }
                      : undefined
                  }
                >
                  {config.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Energia (so para tarefas) */}
        {form.type === 'task' && (
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Nivel de energia
            </label>
            <div className="flex gap-2">
              {([
                { value: 'easy', label: 'Facil' },
                { value: 'medium', label: 'Medio' },
                { value: 'heavy', label: 'Pesado' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, energy: value }))}
                  className={[
                    'flex-1 py-2 rounded-btn text-xs font-semibold transition-all',
                    form.energy === value
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-surface border-subtle text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Acoes */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit} fullWidth>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
