import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Editorial Soft Pastel Color Palette
        pastel: {
          sage: '#EBF3EE',
          'sage-border': '#D0E2D6',
          'sage-text': '#264D34',
          peach: '#FAF0EB',
          'peach-border': '#F2D8CD',
          'peach-text': '#7D432D',
          cornflower: '#EDF2FA',
          'cornflower-border': '#D1DFF2',
          'cornflower-text': '#284A78',
          sand: '#FAF6F0',
          'sand-border': '#EFE7DC',
          'sand-text': '#5E4F38',
        },
        // Dark Legal Custom Color Palette (Retained for backwards compatibility)
        legal: {
          obsidian: '#FAF9F6',
          'obsidian-deep': '#F4F2EC',
          'obsidian-surface': '#FFFFFF',
          gold: '#3B414B',
          'gold-bright': '#222730',
          'gold-muted': '#6B7280',
          'gold-subtle': '#9CA3AF',
          slate: '#E5E2DC',
          card: '#FFFFFF',
          'card-subtle': '#FAF9F6',
        },
        // Semantic Traffic Light Risk Palette (Editorial Pastel)
        risk: {
          high: '#E11D48',
          caution: '#D97706',
          standard: '#059669',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        '2xl': '1.125rem',
        xl: '0.875rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'card-soft': '0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'pill-soft': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shake: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'pulse-glow': 'pulseGlow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
