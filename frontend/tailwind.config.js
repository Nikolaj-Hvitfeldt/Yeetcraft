/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors via CSS custom properties.
        // These respond to data-theme on <html>.
        warcraft: {
          bg: 'var(--theme-bg)',
          'bg-light': 'var(--theme-bg-light)',
          surface: 'var(--theme-surface)',
          'surface-hover': 'var(--theme-surface-hover)',

          gold: 'var(--theme-accent)',
          'gold-light': 'var(--theme-accent-light)',
          'gold-dark': 'var(--theme-accent-dark)',

          border: 'var(--theme-border)',
          'border-light': 'var(--theme-border-light)',
          'border-gold': 'var(--theme-border-gold)',

          text: 'var(--theme-text)',
          'text-muted': 'var(--theme-text-muted)',
          'text-dark': 'var(--theme-text-dark)',
        },

        // Mistake type colors – WoW item quality themed (constant across themes)
        mistake: {
          yeet: '#a335ee',      // Epic purple
          death: '#0070dd',     // Rare blue
        },

        // WoW item-quality (constant across themes)
        rarity: {
          legendary: '#ff8000', // Legendary orange
          epic: '#a335ee', // Epic purple
          rare: '#0070dd', // Rare blue
          uncommon: '#1eff00', // Uncommon green (matches screenshot)
          common: '#ffffff', // Common white
          poor: '#9d9d9d', // Poor gray
        },

        // Rank colors (constant across themes)
        rank: {
          first: '#ffd700',
          second: '#c0c0c0',
          third: '#cd7f32',
        }
      },
      fontFamily: {
        warcraft: ['Cinzel', 'Times New Roman', 'serif'],
        body: ['Crimson Text', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warcraft': 'var(--theme-shadow)',
        'warcraft-lg': 'var(--theme-shadow-lg)',
        'inner-gold': 'inset 0 1px 0 var(--theme-glow-color-soft)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--theme-glow-color-soft)' },
          '100%': { boxShadow: '0 0 20px var(--theme-glow-color)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
