/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poker-green': '#0f5132',
        'poker-felt': '#1a5e3a',
        'card-red': '#dc2626',
        'card-black': '#1f2937',
      },
      fontFamily: {
        'poker': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}