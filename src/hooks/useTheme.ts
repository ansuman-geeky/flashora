/**
 * useTheme — resolves the current theme based on user preference
 *
 * Only supports 'light' and 'dark'. System theme removed.
 */

import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useAppStore } from '@store/useAppStore';
import { Colors } from '@design-system/tokens';
import { useEffect } from 'react';
import { Appearance } from 'react-native';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  bg: string;
  onBg: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
}

/**
 * Returns the resolved theme and its associated color tokens.
 */
export function useTheme(): {
  theme: ResolvedTheme;
  colors: ThemeColors;
  isDark: boolean;
} {
  const themeMode = useAppStore((s) => s.themeMode);
  const { setColorScheme } = useNativeWindColorScheme();

  const resolved: ResolvedTheme = themeMode === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    setColorScheme(resolved);
    if (Appearance.getColorScheme() !== resolved) {
      Appearance.setColorScheme(resolved);
    }
  }, [resolved, setColorScheme]);

  const isDark = resolved === 'dark';

  const colors: ThemeColors = isDark
    ? {
        primary: Colors.primaryDark,
        onPrimary: Colors.onPrimaryDark,
        primaryContainer: Colors.primaryContainerDark,
        onPrimaryContainer: Colors.onPrimaryContainerDark,
        secondary: Colors.secondaryDark,
        onSecondary: Colors.onSecondaryDark,
        secondaryContainer: Colors.secondaryContainerDark,
        onSecondaryContainer: Colors.onSecondaryContainerDark,
        tertiary: Colors.tertiaryDark,
        onTertiary: Colors.onTertiaryDark,
        tertiaryContainer: Colors.tertiaryContainerDark,
        onTertiaryContainer: Colors.onTertiaryContainerDark,
        error: Colors.errorDark,
        onError: Colors.onErrorDark,
        errorContainer: Colors.errorContainerDark,
        onErrorContainer: Colors.onErrorContainerDark,
        bg: Colors.bgDark,
        onBg: Colors.onBgDark,
        surface: Colors.surfaceDark,
        onSurface: Colors.onSurfaceDark,
        surfaceVariant: Colors.surfaceVariantDark,
        onSurfaceVariant: Colors.onSurfaceVariantDark,
        outline: Colors.outlineDark,
        outlineVariant: Colors.outlineVariantDark,
      }
    : {
        primary: Colors.primary,
        onPrimary: Colors.onPrimary,
        primaryContainer: Colors.primaryContainer,
        onPrimaryContainer: Colors.onPrimaryContainer,
        secondary: Colors.secondary,
        onSecondary: Colors.onSecondary,
        secondaryContainer: Colors.secondaryContainer,
        onSecondaryContainer: Colors.onSecondaryContainer,
        tertiary: Colors.tertiary,
        onTertiary: Colors.onTertiary,
        tertiaryContainer: Colors.tertiaryContainer,
        onTertiaryContainer: Colors.onTertiaryContainer,
        error: Colors.error,
        onError: Colors.onError,
        errorContainer: Colors.errorContainer,
        onErrorContainer: Colors.onErrorContainer,
        bg: Colors.bg,
        onBg: Colors.onBg,
        surface: Colors.surface,
        onSurface: Colors.onSurface,
        surfaceVariant: Colors.surfaceVariant,
        onSurfaceVariant: Colors.onSurfaceVariant,
        outline: Colors.outline,
        outlineVariant: Colors.outlineVariant,
      };

  return { theme: resolved, colors, isDark };
}
