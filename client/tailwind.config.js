/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#070B13',
          card: '#0E1626',
          border: '#1B273D',
          hover: '#152136',
          text: '#F3F4F6',
          muted: '#9CA3AF'
        },
        eco: {
          green: '#10B981',
          lightGreen: '#34D399',
          blue: '#3B82F6',
          indigo: '#6366F1',
          amber: '#F59E0B',
          red: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        glow: '0 0 25px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
