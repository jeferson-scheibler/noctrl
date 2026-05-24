import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface WeeklyReviewProps {
  open: boolean;
  onClose: () => void;
}

const QUESTIONS = [
  { key: 'wentWell', label: 'O que funcionou bem esta semana?' },
  { key: 'improve', label: 'O que voce poderia melhorar?' },
  { key: 'intention', label: 'Qual e a sua intencao para a proxima semana?' },
] as const;

type AnswerKey = (typeof QUESTIONS)[number]['key'];

const INITIAL_ANSWERS: Record<AnswerKey, string> = {
  wentWell: '',
  improve: '',
  intention: '',
};

export function WeeklyReview({ open, onClose }: WeeklyReviewProps) {
  const { addWeeklyReview } = useStore();
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addWeeklyReview(answers);
    setSubmitted(true);
  }

  function handleClose() {
    setAnswers(INITIAL_ANSWERS);
    setSubmitted(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Revisao Semanal" size="md">
      {submitted ? (
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(46,111,255,0.12)', border: '1px solid rgba(46,111,255,0.3)' }}
          >
            <ClipboardList size={24} className="text-accent-blue" />
          </div>
          <div>
            <p className="font-display text-lg text-text-primary">Revisao salva.</p>
            <p className="text-sm text-text-secondary mt-1">
              Refletir e parte do processo.
            </p>
          </div>
          <Button onClick={handleClose} variant="ghost">
            Fechar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <p className="text-sm text-text-secondary">
            Tres perguntas. Sem julgamento. So para voce.
          </p>

          {QUESTIONS.map(({ key, label }, index) => (
            <div key={key} className="space-y-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                {index + 1}. {label}
              </label>
              <textarea
                value={answers[key]}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [key]: e.target.value.slice(0, 2000) }))
                }
                placeholder="Escreva livremente..."
                rows={3}
                className="w-full bg-bg-surface border-subtle rounded-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue transition-colors"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={handleClose} fullWidth>
              Agora nao
            </Button>
            <Button type="submit" fullWidth>
              Salvar revisao
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
