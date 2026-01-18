/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors matching the HLTV.org dark theme
        dark: {
          bg: '#1a1a1a',
          surface: '#2a2a2a',
          border: '#333',
          'border-hover': '#555',
        },
        // Mistake type colors
        mistake: {
          wipe: '#dc2626',
          death: '#ea580c',
          yeet: '#ca8a04',
        },
      },
    },
  },
  plugins: [],
}
