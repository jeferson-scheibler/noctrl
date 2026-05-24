import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0C',
        'bg-surface': '#141418',
        'bg-elevated': '#1E1E24',
        'accent-blue': '#2E6FFF',
        'accent-glow': '#5B9FFF',
        'area-work': '#7C6FFF',
        'area-personal': '#FF6B6B',
        'area-study': '#FFD166',
        'area-finance': '#06D6A0',
        'text-primary': '#F0F0F5',
        'text-secondary': '#5A5A6E',
        'text-muted': '#3A3A4A',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(46,111,255,0.3)',
        'glow-sm': '0 0 10px rgba(46,111,255,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'check-pop': 'checkPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        checkPop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
