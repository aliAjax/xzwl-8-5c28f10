/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'archive': {
          'bg': '#1a1a1a',
          'card': '#242424',
          'gold': '#b8860b',
          'gold-light': '#daa520',
          'cream': '#f5f5dc',
          'available': '#2d5016',
          'reserved': '#8b4513',
          'sold': '#8b0000',
          'border': '#3d3d3d',
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'body': ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(184, 134, 11, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(184, 134, 11, 0)' },
        },
      },
    },
  },
  plugins: [],
}
