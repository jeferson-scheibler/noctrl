import { Lightbulb, ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function IdeaInbox() {
  const { ideas, promoteIdeaToTask, deleteIdea } = useStore();

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={18} className="text-area-study" />
            <h1 className="font-display text-2xl text-text-primary">Inbox de Ideias</h1>
          </div>
          <p className="text-sm text-text-secondary">
            {ideas.length} {ideas.length === 1 ? 'ideia capturada' : 'ideias capturadas'}
          </p>
        </div>

        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-bg-elevated flex items-center justify-center">
              <Lightbulb size={24} className="text-text-muted" />
            </div>
            <p className="text-sm text-text-secondary text-center max-w-xs">
              Capture ideias pelo botao <strong className="text-text-primary">+</strong> e elas aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ideas.map((idea) => {
              const area = AREA_CONFIG[idea.area];
              let dateStr = '';
              try {
                dateStr = format(parseISO(idea.createdAt), "d 'de' MMM", { locale: ptBR });
              } catch {
                dateStr = '';
              }

              return (
                <Card
                  key={idea.id}
                  className="border-l-2"
                  accentColor="#7C6FFF"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary leading-snug">{idea.title}</p>
                      {idea.notes && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{idea.notes}</p>
                      )}
                      {idea.imageUrl && (
                        <img
                          src={idea.imageUrl}
                          alt="Imagem da ideia"
                          className="mt-2 rounded-btn max-h-24 object-cover"
                        />
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge color={area.color}>{area.label}</Badge>
                        {dateStr && (
                          <span className="text-xs text-text-muted">{dateStr}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-subtle">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => promoteIdeaToTask(idea.id)}
                      className="flex-1 justify-center"
                    >
                      <ArrowRight size={13} />
                      Transformar em tarefa
                    </Button>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      aria-label="Descartar ideia"
                      className="p-2 text-text-muted hover:text-area-personal transition-colors rounded-btn"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
