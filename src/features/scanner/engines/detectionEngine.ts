import { DocumentQuad } from '../types/scanner';

export interface DetectionResult {
  quad: DocumentQuad;
  frameWidth: number;
  frameHeight: number;
  confidence: number;
  isStable: boolean;
  stableFrames: number;
  blurScore: number;
  lightingScore: number;
  warnings: DetectionWarning[];
}

export type DetectionWarning =
  | 'TOO_DARK'
  | 'TOO_BRIGHT'
  | 'BLURRY'
  | 'MOVE_CLOSER'
  | 'MOVE_FARTHER'
  | 'SHADOW_DETECTED'
  | 'GLARE_DETECTED'
  | 'PARTIAL_DOCUMENT'
  | 'CURVED_PAGE';

export const WARNING_MESSAGES: Record<DetectionWarning, string> = {
  TOO_DARK: 'Too dark — move to better lighting',
  TOO_BRIGHT: 'Overexposed — avoid direct light',
  BLURRY: 'Hold steady — camera is moving',
  MOVE_CLOSER: 'Move closer to the document',
  MOVE_FARTHER: 'Move farther from the document',
  SHADOW_DETECTED: 'Shadow detected — try a different angle',
  GLARE_DETECTED: 'Glare detected — tilt slightly',
  PARTIAL_DOCUMENT: 'Full document not in frame',
  CURVED_PAGE: 'Book detected — use Book mode',
};

export function computeWarnings(result: any): DetectionWarning[] {
  'worklet';
  const warnings: DetectionWarning[] = [];
  if (result.lightingScore < 0.35) warnings.push('TOO_DARK');
  if (result.blurScore < 0.4) warnings.push('BLURRY');
  return warnings;
}
