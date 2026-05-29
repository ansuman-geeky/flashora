/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: '#0061A4',
        onPrimary: '#FFFFFF',
        primaryContainer: '#D1E4FF',
        onPrimaryContainer: '#001D36',
        'primary-dark': '#9ECAFF',
        'onPrimary-dark': '#003258',
        'primaryContainer-dark': '#00497D',
        'onPrimaryContainer-dark': '#D1E4FF',
        
        // Secondary
        secondary: '#535F70',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#D7E3F7',
        onSecondaryContainer: '#101C2B',
        'secondary-dark': '#BBC7DB',
        'onSecondary-dark': '#253140',
        'secondaryContainer-dark': '#3B4858',
        'onSecondaryContainer-dark': '#D7E3F7',

        // Tertiary
        tertiary: '#6B5778',
        onTertiary: '#FFFFFF',
        tertiaryContainer: '#F2DAFF',
        onTertiaryContainer: '#251431',
        'tertiary-dark': '#D6BEE4',
        'onTertiary-dark': '#3B2948',
        'tertiaryContainer-dark': '#523F5F',
        'onTertiaryContainer-dark': '#F2DAFF',

        // Error
        error: '#BA1A1A',
        onError: '#FFFFFF',
        errorContainer: '#FFDAD6',
        onErrorContainer: '#410002',
        'error-dark': '#FFB4AB',
        'onError-dark': '#690005',
        'errorContainer-dark': '#93000A',
        'onErrorContainer-dark': '#FFDAD6',

        // Background & Surface
        bg: '#FDFBFF',
        onBg: '#1A1C1E',
        surface: '#FDFBFF',
        onSurface: '#1A1C1E',
        surfaceVariant: '#DFE2E6',
        onSurfaceVariant: '#43474E',
        outline: '#73777F',
        outlineVariant: '#C3C7CF',
        
        'bg-dark': '#1A1C1E',
        'onBg-dark': '#E2E2E6',
        'surface-dark': '#1A1C1E',
        'onSurface-dark': '#E2E2E6',
        'surfaceVariant-dark': '#43474E',
        'onSurfaceVariant-dark': '#C3C7CF',
        'outline-dark': '#8D9199',
        'outlineVariant-dark': '#43474E',

        // Tool Category Colors (Keep these for visual variety if needed, or map to M3)
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
        xl: '28px',
        '2xl': '32px',
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
