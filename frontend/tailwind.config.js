/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          default: 'var(--color-background-default)',
          app: 'var(--color-background-app)',
        },
        surface: {
          base: 'var(--color-surface-base)',
          section: 'var(--color-surface-section)',
          secondary: 'var(--color-surface-secondary)',
          action: 'var(--color-surface-action)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          link: 'var(--color-text-link)',
          accent: 'var(--color-text-accent)',
        },
        accent: {
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
          purple: 'var(--color-accent-purple)',
        },
        stat: {
          total: 'var(--color-stat-total)',
          deaths: 'var(--color-stat-deaths)',
          yeets: 'var(--color-stat-yeets)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          emphasis: 'var(--color-border-emphasis)',
        },
        avatar: {
          bg: 'var(--color-avatar-bg)',
        },
        overlay: {
          dark: 'var(--color-overlay-dark)',
        },
        brand: {
          gold: 'var(--color-brand-gold)',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
        number: 'var(--font-number)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
