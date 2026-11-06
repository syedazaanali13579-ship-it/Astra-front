/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B132B',
        copper: '#C17817',
        paper: '#F9F8F6',
        ink: '#182033',
        muted: '#74777F'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif']
      }
    }
  },
  plugins: []
};
