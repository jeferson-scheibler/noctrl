import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className = '' }: BadgeProps) {
  const style = color
    ? {
        backgroundColor: `${color}1A`,
        color,
        borderColor: `${color}33`,
      }
    : undefined;

  return (
    <span
      style={style}
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
        !color ? 'bg-bg-elevated text-text-secondary border-subtle' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
