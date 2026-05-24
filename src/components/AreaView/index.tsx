import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG } from '../../types';
import type { Area, EnergyLevel } from '../../types';
import { TaskItem } from '../Dashboard/TaskItem';
import { Card } from '../ui/Card';

type FilterOption = 'all' | EnergyLevel;

export function AreaView() {
  const { area } = useParams<{ area: string }>();
  const { tasks, notes, updateNotes } = useStore();
  const [energyFilter, setEnergyFilter] = useState<FilterOption>('all');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const validArea = (area as Area) in AREA_CONFIG ? (area as Area) : 'personal';
  const config = AREA_CONFIG[validArea];

  const areaTasks = tasks.filter((t) => t.area === validArea);
  const filtered = energyFilter === 'all'
    ? areaTasks
    : areaTasks.filter((t) => t.energy === energyFilter);

  const pending = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  const areaNote = notes[validArea] ?? '';

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Header da area */}
        <div
          className="rounded-card p-5"
          style={{ background: `linear-gradient(135deg, ${config.color}15, ${config.color}08)`, border: `1px solid ${config.color}22` }}
        >
          <h1 className="font-display text-2xl" style={{ color: config.color }}>
            {config.label}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {pending.length} tarefa{pending.length !== 1 ? 's' : ''} pendente{pending.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtro por energia */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter size={13} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Filtrar por energia
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {([
              { value: 'all', label: 'Todas' },
              { value: 'easy', label: 'Facil' },
              { value: 'medium', label: 'Medio' },
              { value: 'heavy', label: 'Pesado' },
            ] as { value: FilterOption; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setEnergyFilter(value)}
                className={[
                  'px-3 py-1.5 rounded-btn text-xs font-semibold transition-all',
                  energyFilter === value
                    ? 'text-white'
                    : 'bg-bg-surface border-subtle text-text-secondary hover:text-text-primary',
                ].join(' ')}
                style={energyFilter === value ? { backgroundColor: config.color } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tarefas pendentes */}
        <section>
          <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
            Pendentes
          </h2>
          {pending.length === 0 ? (
            <Card>
              <p className="text-sm text-text-secondary text-center py-2">
                Nenhuma tarefa pendente aqui.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {pending.map((task) => (
                <TaskItem key={task.id} task={task} showDelete />
              ))}
            </div>
          )}
        </section>

        {/* Tarefas concluidas */}
        {done.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Concluidas ({done.length})
            </h2>
            <div className="space-y-2">
              {done.slice(0, 5).map((task) => (
                <TaskItem key={task.id} task={task} showDelete />
              ))}
            </div>
          </section>
        )}

        {/* Bloco de notas */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
              Notas
            </h2>
            <button
              onClick={() => setIsEditingNotes((v) => !v)}
              className="text-xs transition-colors"
              style={{ color: isEditingNotes ? config.color : undefined }}
            >
              {isEditingNotes ? 'Salvo automaticamente' : 'Editar'}
            </button>
          </div>
          <div
            className="rounded-card bg-bg-surface border overflow-hidden"
            style={{ borderColor: `${config.color}22` }}
          >
            {isEditingNotes ? (
              <textarea
                value={areaNote}
                onChange={(e) => updateNotes(validArea, e.target.value.slice(0, 10000))}
                placeholder="Escreva livremente aqui..."
                rows={8}
                className="w-full p-4 text-sm text-text-primary placeholder:text-text-muted bg-transparent"
                autoFocus
              />
            ) : (
              <div
                className="p-4 min-h-[120px] text-sm text-text-primary cursor-text whitespace-pre-wrap"
                onClick={() => setIsEditingNotes(true)}
              >
                {areaNote || (
                  <span className="text-text-muted">
                    Clique para escrever suas notas...
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
