/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#f5f6ff',
          100: '#ebedff',
          200: '#dcdfff',
          300: '#c3c7ff',
          400: '#a1a6ff',
          500: '#7c81ff',
          600: '#5a5df5',
          700: '#474adb',
          800: '#3a3cb5',
          900: '#323491',
          950: '#1d1e57',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', 
          950: '#020617',
        },
        amber: {
          50: '#fefbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        brand: {
          primary: '#5a5df5',
          secondary: '#0f172a',
          accent: '#b45309',
          gold: '#c5a880',
        }
      }
    },
  },
  plugins: [],
}

