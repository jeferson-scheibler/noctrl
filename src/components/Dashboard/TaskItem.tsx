import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { AREA_CONFIG, ENERGY_CONFIG } from '../../types';
import type { Task } from '../../types';
import { Badge } from '../ui/Badge';

interface TaskItemProps {
  task: Task;
  showDelete?: boolean;
}

export function TaskItem({ task, showDelete = false }: TaskItemProps) {
  const { toggleTask, deleteTask } = useStore();
  const [justDone, setJustDone] = useState(false);

  const areaConfig = AREA_CONFIG[task.area];
  const energyConfig = ENERGY_CONFIG[task.energy];

  function handleToggle() {
    if (!task.done) {
      setJustDone(true);
      setTimeout(() => toggleTask(task.id), 400);
    } else {
      toggleTask(task.id);
    }
  }

  return (
    <div
      className={[
        'flex items-center gap-3 p-3 bg-bg-surface border-subtle rounded-card group',
        'transition-all duration-300',
        task.done || justDone ? 'opacity-40' : '',
      ].join(' ')}
    >
      <button
        onClick={handleToggle}
        aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluida'}
        className={[
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          'transition-all duration-200',
          task.done || justDone
            ? 'bg-accent-blue border-accent-blue animate-check-pop'
            : 'border-text-muted hover:border-accent-blue',
        ].join(' ')}
      >
        {(task.done || justDone) && <Check size={11} strokeWidth={3} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-sm text-text-primary truncate',
            task.done || justDone ? 'line-through text-text-secondary' : '',
          ].join(' ')}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge color={areaConfig.color} className="text-xs">{areaConfig.label}</Badge>
          <Badge className="text-xs">{energyConfig.label}</Badge>
        </div>
      </div>

      {showDelete && (
        <button
          onClick={() => deleteTask(task.id)}
          aria-label="Excluir tarefa"
          className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-area-personal transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
