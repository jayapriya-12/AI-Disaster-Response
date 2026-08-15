/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0265d6',
          700: '#034ea2',
          900: '#0b2545',
        },
        emergency: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        },
        darkBg: '#0f172a',
        darkCard: '#1e293b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
