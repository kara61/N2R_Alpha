/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'steel-blue': '#2B3A42',
        'dark-gray': '#1F1F1F',
        'light-gray': '#E0E0E0',
        'accent-yellow': '#F5A623',
        'accent-green': '#4CAF50',
        'accent-red': '#D32F2F',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'neumorphic': '5px 5px 10px rgba(0, 0, 0, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.05)',
        'neumorphic-inset': 'inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'blueprint-grid': 'linear-gradient(rgba(43, 58, 66, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(43, 58, 66, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
    },
  },
  plugins: [],
};