import { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, Camera, X, Loader2,
  CheckSquare, Lightbulb, CalendarDays,
} from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';
import type { CaptureType, Area, EnergyLevel } from '../../types';

// ─── Speech Recognition ──────────────────────────────────────────────────────

type SpeechRecognitionInstance = {
  lang: string; continuous: boolean; interimResults: boolean;
  start: () => void; stop: () => void;
  onstart: (() => void) | null;
  onend:   (() => void) | null;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
  onerror:  (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface QuickCaptureProps {
  open: boolean;
  onClose: () => void;
}

const INITIAL: {
  title: string; type: CaptureType; area: Area;
  energy: EnergyLevel; notes: string; imageUrl: string;
} = {
  title: '', type: 'task', area: 'personal',
  energy: 'medium', notes: '', imageUrl: '',
};

const TYPE_OPTIONS: { value: CaptureType; label: string; Icon: typeof CheckSquare }[] = [
  { value: 'task',  label: 'Tarefa',      Icon: CheckSquare  },
  { value: 'idea',  label: 'Ideia',       Icon: Lightbulb    },
  { value: 'event', label: 'Compromisso', Icon: CalendarDays },
];

const ENERGY_OPTIONS: { value: EnergyLevel; dots: number; label: string }[] = [
  { value: 'easy',   dots: 1, label: 'Facil'  },
  { value: 'medium', dots: 2, label: 'Medio'  },
  { value: 'heavy',  dots: 3, label: 'Pesado' },
];

// ─── EnergyDots ──────────────────────────────────────────────────────────────

function EnergyDots({ count, active }: { count: number; active: boolean }) {
  return (
    <span className="flex gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className="rounded-full transition-all duration-150"
          style={{
            width: 5, height: 5,
            backgroundColor: i < count
              ? active ? '#fff' : '#2E6FFF'
              : active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
          }}
        />
      ))}
    </span>
  );
}

// ─── WaveformBars ─────────────────────────────────────────────────────────────

function WaveformBars() {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[3, 6, 10, 7, 4, 9, 5, 8, 3].map((h, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 2, height: h,
            backgroundColor: '#FF6B6B',
            animation: `waveBar 0.9s ease-in-out ${(i * 0.08).toFixed(2)}s infinite alternate`,
          }}
        />
      ))}
    </span>
  );
}

// ─── QuickCapture ────────────────────────────────────────────────────────────

export function QuickCapture({ open, onClose }: QuickCaptureProps) {
  const { addTask, addIdea, addEvent } = useStore();
  const [form, setForm]           = useState(INITIAL);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  // Foca o textarea ao abrir
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 120);
  }, [open]);

  // Bloqueia scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function handleClose() {
    setForm(INITIAL);
    setRecording(false);
    recognitionRef.current?.stop();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    if (form.type === 'idea') {
      addIdea({ title, area: form.area, energy: form.energy, notes: form.notes, imageUrl: form.imageUrl });
    } else if (form.type === 'event') {
      addEvent({ title, area: form.area, date: new Date().toISOString().split('T')[0], allDay: true });
    } else {
      addTask({ title, type: 'task', area: form.area, energy: form.energy, notes: form.notes, imageUrl: form.imageUrl });
    }
    handleClose();
  }

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const API = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!API) { alert('Voz nao disponivel neste navegador.'); return; }

    const r = new API();
    r.lang = 'pt-BR'; r.continuous = false; r.interimResults = false;
    r.onstart  = () => { setRecording(true); setProcessing(false); };
    r.onend    = () => { setRecording(false); setProcessing(false); };
    r.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      setForm((f) => ({ ...f, title: f.title ? `${f.title} ${t}` : t }));
    };
    r.onerror = () => { setRecording(false); setProcessing(false); };
    recognitionRef.current = r;
    r.start();
    setProcessing(true);
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Imagem muito grande. Limite: 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  if (!open) return null;

  const canSubmit = form.title.trim().length > 0;
  const areaColor = AREA_CONFIG[form.area].color;

  return (
    <>
      {/* Keyframes de waveform — injetados inline uma vez */}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.4); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={handleClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
        style={{
          background: '#18181F',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col overflow-y-auto"
          style={{ gap: 0 }}
        >
          {/* Área de texto principal */}
          <div className="px-5 pt-3 pb-4">
            <textarea
              ref={textareaRef}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value.slice(0, 300) }))}
              placeholder="O que esta na sua cabeca?"
              rows={3}
              maxLength={300}
              className="w-full bg-transparent text-lg text-text-primary placeholder:text-text-muted resize-none leading-relaxed"
              style={{ outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />

            {/* Preview de imagem */}
            {form.imageUrl && (
              <div className="relative mt-3 rounded-xl overflow-hidden">
                <img src={form.imageUrl} alt="Imagem capturada" className="w-full max-h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                >
                  <X size={13} className="text-white" />
                </button>
              </div>
            )}

            {/* Acessórios de entrada */}
            <div className="flex items-center gap-3 mt-3">
              {/* Microfone */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={processing && !recording}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
                style={recording
                  ? { backgroundColor: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)' }
                  : { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {processing && !recording
                  ? <Loader2 size={14} className="animate-spin text-text-secondary" />
                  : recording
                  ? <><MicOff size={14} style={{ color: '#FF6B6B' }} /><WaveformBars /></>
                  : <Mic size={14} className="text-text-secondary" />
                }
                {!processing && !recording && (
                  <span className="text-xs text-text-muted">Voz</span>
                )}
              </button>

              {/* Câmera */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Camera size={14} className="text-text-secondary" />
                <span className="text-xs text-text-muted">Foto</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImage}
                className="hidden"
              />

              {/* Contador de caracteres */}
              {form.title.length > 200 && (
                <span className="ml-auto text-xs text-text-muted">{form.title.length}/300</span>
              )}
            </div>
          </div>

          {/* Divisor */}
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />

          {/* Seções de categorização */}
          <div className="px-5 py-4 space-y-5">

            {/* Tipo */}
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(({ value, label, Icon }) => {
                const active = form.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: value }))}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-150"
                    style={active ? {
                      backgroundColor: 'rgba(46,111,255,0.15)',
                      border: '1px solid rgba(46,111,255,0.45)',
                      boxShadow: '0 0 16px rgba(46,111,255,0.15)',
                    } : {
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: active ? '#5B9FFF' : '#5A5A6E' }}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: active ? '#5B9FFF' : '#5A5A6E' }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Área */}
            <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              {(Object.entries(AREA_CONFIG) as [Area, typeof AREA_CONFIG[Area]][]).map(([area, cfg]) => {
                const active = form.area === area;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, area }))}
                    className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-150"
                    style={active ? {
                      backgroundColor: `${cfg.color}25`,
                      color: cfg.color,
                      border: `1px solid ${cfg.color}60`,
                      boxShadow: `0 0 12px ${cfg.color}20`,
                    } : {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#5A5A6E',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Energia — só para tarefas */}
            {form.type === 'task' && (
              <div className="flex gap-2">
                {ENERGY_OPTIONS.map(({ value, dots, label }) => {
                  const active = form.energy === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, energy: value }))}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-150"
                      style={active ? {
                        backgroundColor: `${areaColor}20`,
                        border: `1px solid ${areaColor}50`,
                      } : {
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <EnergyDots count={dots} active={active} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: active ? areaColor : '#5A5A6E' }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divisor */}
          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />

          {/* Botão salvar */}
          <div className="px-5 py-4 safe-bottom">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-150"
              style={canSubmit ? {
                background: 'linear-gradient(135deg, #4480FF, #2E6FFF)',
                color: '#fff',
                boxShadow: '0 0 24px rgba(46,111,255,0.4), 0 4px 16px rgba(0,0,0,0.3)',
              } : {
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: '#3A3A4A',
                cursor: 'not-allowed',
              }}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
