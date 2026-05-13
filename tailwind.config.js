/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#5B5FEF',
          muted: '#E8E9FF',
        },
        // Accent
        accent: {
          DEFAULT: '#00C98D',
          muted: '#D4F7EC',
        },
        // Semantic
        warning: {
          DEFAULT: '#F59E0B',
          muted: '#FEF3C7',
        },
        error: {
          DEFAULT: '#EF4444',
          muted: '#FEE2E2',
        },
        info: {
          DEFAULT: '#3B82F6',
          muted: '#DBEAFE',
        },
        // Neutrals — Light Mode
        bg: '#F4F5F7',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FAFAFA',
        },
        border: {
          DEFAULT: '#E5E7EB',
          subtle: '#F3F4F6',
        },
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-tertiary': '#94A3B8',
        'text-inverse': '#FFFFFF',
        // Neutrals — Dark Mode
        'bg-dark': '#0D0F14',
        'surface-dark': {
          DEFAULT: '#161A23',
          raised: '#1E2330',
        },
        'border-dark': '#252B38',
        'text-primary-dark': '#F1F5F9',
        'text-secondary-dark': '#94A3B8',
        // Tool Category Colors
        tool: {
          pdf: '#EF4444',
          qr: '#8B5CF6',
          image: '#F59E0B',
          converter: '#3B82F6',
          'url-shortener': '#00C98D',
        },
      },
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.2' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.5' }],
        md: ['17px', { lineHeight: '1.5' }],
        lg: ['20px', { lineHeight: '1.2' }],
        xl: ['24px', { lineHeight: '1.2' }],
        '2xl': ['30px', { lineHeight: '1.2' }],
        '3xl': ['36px', { lineHeight: '1.2' }],
      },
      fontFamily: {
        regular: ['System'],
        medium: ['System'],
        semibold: ['System'],
        bold: ['System'],
      },
    },
  },
  plugins: [],
};
