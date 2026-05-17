/**
 * src/features/scanner/constants/scannerTypography.ts
 * Extracted from flashora_scanner_screens.html and redesign spec.
 */

import { ScannerColors } from './scannerColors';

export const ScannerTypography = {
  headerTitle:   { fontSize: 14, fontWeight: '500' as const, color: ScannerColors.textPrimary },
  headerAction:  { fontSize: 13, color: ScannerColors.accent },
  sectionLabel:  { fontSize: 11, color: ScannerColors.textTertiary, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  formatName:    { fontSize: 13, fontWeight: '500' as const, color: ScannerColors.textPrimary },
  formatDesc:    { fontSize: 11, color: ScannerColors.textTertiary },
  fileName:      { fontSize: 12, color: ScannerColors.textPrimary },
  fileLabel:     { fontSize: 11, color: ScannerColors.textTertiary },
  badgeText:     { fontSize: 10, color: ScannerColors.accent },
  premiumText:   { fontSize: 10, color: ScannerColors.premiumText },
  pageCount:     { fontSize: 11, color: ScannerColors.textTertiary },
  thumbNum:      { fontSize: 9,  color: ScannerColors.textTertiary },
  hintText:      { fontSize: 11, color: ScannerColors.accent },
  sliderLabel:   { fontSize: 12, color: ScannerColors.textTertiary, width: 70 },
  pillText:      { fontSize: 12 },
  actionPrimary: { fontSize: 14, fontWeight: '500' as const, color: '#FFFFFF' },
  actionSecondary:{ fontSize: 14, color: ScannerColors.textSecondary },
};
