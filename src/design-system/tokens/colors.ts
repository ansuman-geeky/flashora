/**
 * Flashora Design System — Color Tokens
 *
 * Inspired by: Linear, Craft, Raycast — calm, confident, fast.
 * Avoid: glassmorphism, neon, heavy gradients, over-animation.
 * Use: generous whitespace, sharp card edges, monochrome depth.
 */

export const Colors = {
  // Brand
  primary: '#5B5FEF',
  primaryMuted: '#E8E9FF',

  // Accent
  accent: '#00C98D',
  accentMuted: '#D4F7EC',

  // Semantic
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',

  // Neutrals — Light Mode
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceRaised: '#FAFAFA',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Neutrals — Dark Mode
  bgDark: '#0D0F14',
  surfaceDark: '#161A23',
  surfaceRaisedDark: '#1E2330',
  borderDark: '#252B38',
  textPrimaryDark: '#F1F5F9',
  textSecondaryDark: '#94A3B8',

  // Tool Category Colors
  pdf: '#EF4444',
  qr: '#8B5CF6',
  image: '#F59E0B',
  converter: '#3B82F6',
  urlShortener: '#00C98D',
  scanner: '#0EA5E9',
} as const;

export type ColorToken = keyof typeof Colors;
