import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme=\"dark\"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)']
      },
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        foreground: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)'
        },
        accent: {
          blue: 'rgb(var(--color-accent) / <alpha-value>)'
        }
      },
      boxShadow: {
        soft: '0 16px 40px -24px rgba(15, 23, 42, 0.35)',
        card: '0 10px 30px -18px rgba(15, 23, 42, 0.25)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      },
      keyframes: {
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-6px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      },
      animation: {
        'toast-in': 'toast-in 180ms ease-out'
      }
    }
  },
  plugins: []
};

export default config;
