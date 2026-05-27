/**
 * Flashora Design System — Color Tokens
 *
 * Inspired by: Linear, Craft, Raycast — calm, confident, fast.
 * Avoid: glassmorphism, neon, heavy gradients, over-animation.
 * Use: generous whitespace, sharp card edges, monochrome depth.
 */

export const Colors = {
  // Primary
  primary: '#0061A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D1E4FF',
  onPrimaryContainer: '#001D36',
  primaryDark: '#9ECAFF',
  onPrimaryDark: '#003258',
  primaryContainerDark: '#00497D',
  onPrimaryContainerDark: '#D1E4FF',

  // Secondary
  secondary: '#535F70',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#D7E3F7',
  onSecondaryContainer: '#101C2B',
  secondaryDark: '#BBC7DB',
  onSecondaryDark: '#253140',
  secondaryContainerDark: '#3B4858',
  onSecondaryContainerDark: '#D7E3F7',

  // Tertiary
  tertiary: '#6B5778',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#F2DAFF',
  onTertiaryContainer: '#251431',
  tertiaryDark: '#D6BEE4',
  onTertiaryDark: '#3B2948',
  tertiaryContainerDark: '#523F5F',
  onTertiaryContainerDark: '#F2DAFF',

  // Error
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  errorDark: '#FFB4AB',
  onErrorDark: '#690005',
  errorContainerDark: '#93000A',
  onErrorContainerDark: '#FFDAD6',

  // Background & Surface
  bg: '#FDFBFF',
  onBg: '#1A1C1E',
  surface: '#FDFBFF',
  onSurface: '#1A1C1E',
  surfaceVariant: '#DFE2E6',
  onSurfaceVariant: '#43474E',
  outline: '#73777F',
  outlineVariant: '#C3C7CF',

  bgDark: '#1A1C1E',
  onBgDark: '#E2E2E6',
  surfaceDark: '#1A1C1E',
  onSurfaceDark: '#E2E2E6',
  surfaceVariantDark: '#43474E',
  onSurfaceVariantDark: '#C3C7CF',
  outlineDark: '#8D9199',
  outlineVariantDark: '#43474E',

  // Tool Category Colors
  pdf: '#EF4444',
  qr: '#8B5CF6',
  image: '#F59E0B',
  converter: '#3B82F6',
  urlShortener: '#00C98D',
  scanner: '#0EA5E9',
} as const;

export type ColorToken = keyof typeof Colors;
