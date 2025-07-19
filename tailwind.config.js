/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'poker-dark': '#1a1a1a',
        'poker-gray': '#2d2d2d',
        'poker-accent': '#10b981',
        'poker-text': '#f3f4f6',
        'poker-text-secondary': '#9ca3af',
        'poker-border': '#374151',
        'poker-card': '#ffffff',
        'poker-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        }
      },
      fontFamily: {
        'poker': ['Georgia', 'serif'],
      },
      animation: {
        'flip': 'flip 0.3s ease-in-out',
        'card-deal': 'cardDeal 0.5s ease-out',
        'chip-bounce': 'chipBounce 0.6s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        cardDeal: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px) scale(0.8) rotate(-5deg)'
          },
          '50%': { 
            opacity: '0.7',
            transform: 'translateY(-10px) scale(0.9) rotate(-2deg)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1) rotate(0deg)'
          },
        },
        chipBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [],
}