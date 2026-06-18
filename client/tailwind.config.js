/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#0a0a0a',
          dark: '#1a1a1a',
          gold: '#d4af37',
          lightGold: '#f3e5ab',
          text: '#f5f5f5',
          muted: '#a3a3a3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
