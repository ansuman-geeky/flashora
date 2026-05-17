export type AutoCaptureState =
  | 'SCANNING'      // No document visible
  | 'DETECTING'     // Document found, not stable yet
  | 'STABILIZING'   // Stable, counting down
  | 'CAPTURING'     // Shutter triggered
  | 'COOLDOWN';     // Post-capture cooldown

export interface AutoCaptureConfig {
  enabled: boolean;
  stabilityFrames: number;
  minConfidence: number;
  minBlurScore: number;
  captureDelay: number;
  cooldownMs: number;
}

export const DEFAULT_AUTO_CAPTURE_CONFIG: AutoCaptureConfig = {
  enabled: true,
  stabilityFrames: 12, // ~400ms at 30fps
  minConfidence: 0.82,
  minBlurScore: 0.65,
  captureDelay: 300,
  cooldownMs: 1500,
};

export class AutoCaptureEngine {
  private state: AutoCaptureState = 'SCANNING';
  private config: AutoCaptureConfig;
  private lastCaptureTime: number = 0;
  private stableFrameCount: number = 0;

  constructor(config: Partial<AutoCaptureConfig> = {}) {
    this.config = { ...DEFAULT_AUTO_CAPTURE_CONFIG, ...config };
  }

  public update(
    hasDocument: boolean,
    confidence: number,
    isStable: boolean,
    blurScore: number
  ): { state: AutoCaptureState; shouldCapture: boolean } {
    const now = Date.now();

    // 1. Handle Cooldown
    if (this.state === 'COOLDOWN') {
      if (now - this.lastCaptureTime > this.config.cooldownMs) {
        this.state = 'SCANNING';
      }
      return { state: this.state, shouldCapture: false };
    }

    // 2. Handle State Transitions
    if (!hasDocument) {
      this.state = 'SCANNING';
      this.stableFrameCount = 0;
    } else if (confidence < this.config.minConfidence || blurScore < this.config.minBlurScore) {
      this.state = 'DETECTING';
      this.stableFrameCount = 0;
    } else if (isStable) {
      this.stableFrameCount++;
      if (this.stableFrameCount >= this.config.stabilityFrames) {
        this.state = 'STABILIZING';
        // If we are stable for enough frames, trigger capture
        // In a real implementation, the 'STABILIZING' state would trigger the UI countdown
        if (this.stableFrameCount >= this.config.stabilityFrames + (this.config.captureDelay / 33)) {
          this.state = 'CAPTURING';
          this.lastCaptureTime = now;
          return { state: 'CAPTURING', shouldCapture: true };
        }
      }
    } else {
      this.state = 'DETECTING';
      this.stableFrameCount = 0;
    }

    return { state: this.state, shouldCapture: false };
  }

  public reset() {
    this.state = 'SCANNING';
    this.stableFrameCount = 0;
  }

  public onCaptured() {
    this.state = 'COOLDOWN';
    this.lastCaptureTime = Date.now();
  }
}
