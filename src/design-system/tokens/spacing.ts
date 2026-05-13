/**
 * Flashora Design System — Spacing, Shape & Motion Tokens
 *
 * Spacing: 8-point grid system.
 * Radius: consistent border radius scale.
 * Shadow: elevation-based shadow system for Android.
 * Motion: constrained animation parameters.
 */

export const Spacing = {
  0.5: 4,
  1: 8,
  1.5: 12,
  2: 16,
  2.5: 20,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: { elevation: 2, shadowOpacity: 0.06 },
  md: { elevation: 4, shadowOpacity: 0.08 },
  lg: { elevation: 8, shadowOpacity: 0.12 },
} as const;

export const Motion = {
  duration: {
    fast: 120,
    normal: 200,
    slow: 300,
  },
  easing: 'ease-out',
} as const;

export type SpacingToken = keyof typeof Spacing;
export type RadiusToken = keyof typeof Radius;
export type ShadowToken = keyof typeof Shadow;
