/**
 * Flashora Design System — Typography Tokens
 *
 * Uses system font stack for zero bundle overhead.
 * All sizes follow a modular scale for visual consistency.
 */

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type FontSize = keyof typeof Typography.size;
export type FontFamily = keyof typeof Typography.fontFamily;
export type LineHeight = keyof typeof Typography.lineHeight;
