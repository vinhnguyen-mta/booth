/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F34B52',
        secondary: '#14B8A6',
        accent: '#F97316',
        dark: '#05106f',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'scale-102': 'scale 0.2s ease-in-out',
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [],
};