export type QualityIssue =
  | 'EDGE_SOFTNESS'
  | 'LOW_CONTRAST'
  | 'SHADOW_REMNANT'
  | 'PERSPECTIVE_ERROR'
  | 'MOIRÉ_PATTERN'
  | 'NOISE'
  | 'COMPRESSION_ARTIFACT';

export interface QualityReport {
  overallScore: number; // 0–100
  isAcceptable: boolean;
  issues: QualityIssue[];
  recommendation: string;
}

export class QualityEngine {
  /**
   * Analyzes the enhanced document and provides a quality score.
   * In a pro implementation, this would use computer vision to check
   * text legibility and artifacting.
   */
  public static analyze(
    blurScore: number,
    detectionConfidence: number,
    lightingScore: number,
    wasCropped: boolean
  ): QualityReport {
    let score = 100;
    const issues: QualityIssue[] = [];

    // 1. Check Sharpness
    if (blurScore < 0.5) {
      score -= 30;
      issues.push('EDGE_SOFTNESS');
    }

    // 2. Check Contrast/Lighting
    if (lightingScore < 0.3) {
      score -= 20;
      issues.push('LOW_CONTRAST');
    }

    // 3. Check Perspective
    if (detectionConfidence < 0.7) {
      score -= 15;
      issues.push('PERSPECTIVE_ERROR');
    }

    // 4. Shadow Check
    if (lightingScore > 0.4 && lightingScore < 0.6) {
      // Mid-range lighting often indicates uneven shadows
      score -= 10;
      issues.push('SHADOW_REMNANT');
    }

    // Determine recommendation
    let recommendation = 'Excellent quality';
    if (score < 40) {
      recommendation = 'Poor quality. Please rescan in better light.';
    } else if (score < 70) {
      recommendation = 'Acceptable, but hold the camera steadier.';
    }

    return {
      overallScore: Math.max(0, score),
      isAcceptable: score > 60,
      issues,
      recommendation,
    };
  }
}
