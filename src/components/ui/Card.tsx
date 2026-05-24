import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  accentColor?: string;
}

export function Card({ children, className = '', onClick, accentColor }: CardProps) {
  const style = accentColor
    ? { borderLeft: `3px solid ${accentColor}` }
    : undefined;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={style}
      className={[
        'bg-bg-surface border-subtle rounded-card p-4',
        onClick
          ? 'cursor-pointer hover:bg-bg-elevated hover:border-white/10 transition-colors duration-150 active:scale-[0.99]'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
