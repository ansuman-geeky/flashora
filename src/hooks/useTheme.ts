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
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
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
        bg: Colors.bgDark,
        surface: Colors.surfaceDark,
        surfaceRaised: Colors.surfaceRaisedDark,
        border: Colors.borderDark,
        textPrimary: Colors.textPrimaryDark,
        textSecondary: Colors.textSecondaryDark,
        textTertiary: Colors.textSecondaryDark,
        textInverse: Colors.textPrimary,
      }
    : {
        bg: Colors.bg,
        surface: Colors.surface,
        surfaceRaised: Colors.surfaceRaised,
        border: Colors.border,
        textPrimary: Colors.textPrimary,
        textSecondary: Colors.textSecondary,
        textTertiary: Colors.textTertiary,
        textInverse: Colors.textInverse,
      };

  return { theme: resolved, colors, isDark };
}
