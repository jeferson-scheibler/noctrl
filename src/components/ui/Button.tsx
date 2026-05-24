import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'surface' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary:
    'bg-accent-blue text-white hover:bg-[#4480FF] active:bg-[#1D5EE8] glow-sm',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-white/5 active:bg-white/10',
  surface:
    'bg-bg-elevated border-subtle text-text-primary hover:border-white/10 active:bg-white/5',
  danger:
    'bg-[#FF4444]/10 text-[#FF6B6B] border border-[#FF4444]/20 hover:bg-[#FF4444]/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-btn transition-all duration-150 select-none',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}
