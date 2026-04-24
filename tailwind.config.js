/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#818cf8',
          dark: '#4338ca',
        },
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        surface: {
          DEFAULT: '#1e1b4b',
          light: '#312e81',
          card: 'rgba(30, 27, 75, 0.6)',
        },
        background: '#0f0a2a',
        text: {
          DEFAULT: '#e2e8f0',
          muted: '#94a3b8',
          heading: '#f8fafc',
        },
        border: 'rgba(99, 102, 241, 0.2)',
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        success: '#10b981',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in': 'slideInRight 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
