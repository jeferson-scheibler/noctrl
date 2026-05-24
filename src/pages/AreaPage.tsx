import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AreaView } from '../components/AreaView';
import { AREA_CONFIG } from '../types';
import type { Area } from '../types';

export function AreaPage() {
  const navigate = useNavigate();
  const { area } = useParams<{ area: string }>();
  const validArea = (area as Area) in AREA_CONFIG ? (area as Area) : 'personal';
  const config = AREA_CONFIG[validArea];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-subtle flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors rounded-btn hover:bg-white/5"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <h1
          className="font-display text-lg"
          style={{ color: config.color }}
        >
          {config.label}
        </h1>
      </header>
      <AreaView />
    </div>
  );
}
