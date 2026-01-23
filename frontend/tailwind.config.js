/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warcraft-themed color palette
        warcraft: {
          // Backgrounds - deep dark browns/blacks
          bg: '#0d0a06',
          'bg-light': '#1a1209',
          surface: '#261d14',
          'surface-hover': '#342718',
          
          // Legendary orange - for totals
          gold: '#ff8000',
          'gold-light': '#ffaa44',
          'gold-dark': '#cc6600',
          
          // Bronze/copper borders
          border: '#5c4a32',
          'border-light': '#8b7355',
          'border-gold': '#b8860b',
          
          // Text colors
          text: '#e8dcc8',
          'text-muted': '#a89880',
          'text-dark': '#6b5c4a',
        },
        
        // Mistake type colors - WoW item quality themed
        mistake: {
          yeet: '#a335ee',      // Epic purple - for yeets
          death: '#0070dd',     // Rare blue - for deaths
        },
        
        // Rank colors
        rank: {
          first: '#ffd700',     // Gold
          second: '#c0c0c0',    // Silver
          third: '#cd7f32',     // Bronze
        }
      },
      fontFamily: {
        warcraft: ['Cinzel', 'Times New Roman', 'serif'],
        body: ['Crimson Text', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'warcraft-gradient': 'linear-gradient(180deg, #1a1209 0%, #0d0a06 100%)',
        'gold-gradient': 'linear-gradient(180deg, #ffd54f 0%, #c79100 100%)',
        'surface-gradient': 'radial-gradient(ellipse at top, #342718 0%, #1a1209 70%)',
      },
      boxShadow: {
        'warcraft': '0 0 20px rgba(255, 193, 7, 0.15)',
        'warcraft-lg': '0 0 40px rgba(255, 193, 7, 0.2)',
        'inner-gold': 'inset 0 1px 0 rgba(255, 193, 7, 0.1)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 193, 7, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 193, 7, 0.4)' },
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
