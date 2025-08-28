import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette - Sage Green
        sage: {
          50: '#F3F5F4',
          100: '#E8EDE9',
          200: '#D1DBD4',
          300: '#A5BAAC',
          400: '#7C9885', // Primary Brand Color
          500: '#5F7A67',
          600: '#4A6051',
          700: '#3B4D41',
          800: '#2F3D34',
          900: '#1F2922',
        },
        // Secondary Palette - Cream
        cream: {
          50: '#FEFEF9',
          100: '#FDFDF3',
          200: '#FAF9E6',
          300: '#F5F5DC', // Background
          400: '#E8E5C8',
        },
        // Accent - Teal
        teal: {
          400: '#4A8B8B',
          500: '#3A7575',
          600: '#2C5F5F', // Accent
          700: '#224A4A',
          800: '#1A3838',
        },
        // Semantic Colors
        primary: '#7C9885', // sage-400
        secondary: '#2C5F5F', // teal-600
        background: '#F5F5DC', // cream-300
        foreground: '#333333',
        success: '#5CB85C',
        warning: '#F0AD4E',
        error: '#D9534F',
        info: '#5BC0DE',
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: ['SF Mono', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
      },
      spacing: {
        '18': '4.5rem',     // 72px
        '88': '22rem',      // 352px
        '128': '32rem',     // 512px
        '144': '36rem',     // 576px
      },
      animation: {
        'like-bounce': 'like-bounce 0.6s ease-in-out',
        'spin': 'spin 1s linear infinite',
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'like-bounce': {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      screens: {
        'mobile': '320px',
        'mobile-lg': '428px',
        'tablet': '768px',
        'desktop': '1024px',
        'desktop-lg': '1440px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;