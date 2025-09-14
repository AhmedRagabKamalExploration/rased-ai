import { BaseModule } from "../BaseModule";

export class FrameRateModule extends BaseModule {
  public readonly moduleName: string = "frameRate";
  private frameTimestamps: number[] = [];
  private hasLowFrameRate: boolean = false;
  private frameRateThreshold: number = 30;
  private requestId: number | null = null;
  private intervalId: number | null = null;

  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    this.startFrameRateMonitoring();
    this.startPeriodicReporting();
  }

  private startFrameRateMonitoring(): void {
    const raf =
      window.requestAnimationFrame ||
      (window as any).webkitRequestAnimationFrame ||
      (window as any).mozRequestAnimationFrame;

    if (raf) {
      const monitorFrame = (timestamp: number) => {
        this.frameTimestamps.push(timestamp);

        if (this.frameTimestamps.length > 10) {
          this.frameTimestamps.shift(); // Keep only recent frames
        }

        this.requestId = raf(monitorFrame);
      };

      raf(monitorFrame);
    }
  }

  private startPeriodicReporting(): void {
    // Send frame rate data every second, matching obfuscated code
    this.intervalId = window.setInterval(() => {
      this.reportFrameRate();
    }, 1000);
  }

  private reportFrameRate(): void {
    if (this.frameTimestamps.length < 2) {
      return;
    }

    const fps = this.calculateFPS();
    const isLow = fps <= this.frameRateThreshold;

    // Only dispatch if state changed
    if (isLow !== this.hasLowFrameRate) {
      this.hasLowFrameRate = isLow;
    }

    // Always dispatch current state (matching obfuscated code pattern)
    this.eventManager.dispatch(this.moduleName, "frameRate", {
      hasLowFrameRate: this.hasLowFrameRate,
    });
  }

  private calculateFPS(): number {
    const firstFrame = this.frameTimestamps[0];
    const lastFrame = this.frameTimestamps[this.frameTimestamps.length - 1];
    const frameCount = this.frameTimestamps.length - 1;
    const timeElapsed = lastFrame - firstFrame;

    if (timeElapsed === 0) {
      return 0;
    }

    return Math.round((frameCount * 1000) / timeElapsed);
  }

  /**
   * Get current frame rate data
   */
  public getFrameRateData(): {
    hasLowFrameRate: boolean;
    threshold: number;
    frameCount: number;
  } {
    return {
      hasLowFrameRate: this.hasLowFrameRate,
      threshold: this.frameRateThreshold,
      frameCount: this.frameTimestamps.length,
    };
  }

  /**
   * Update frame rate threshold
   */
  public setFrameRateThreshold(threshold: number): void {
    this.frameRateThreshold = Math.max(1, Math.min(120, threshold));
  }

  /**
   * Reset frame rate monitoring
   */
  public reset(): void {
    this.frameTimestamps = [];
    this.hasLowFrameRate = false;
  }

  /**
   * Cleanup and destroy module
   */
  public destroy(): void {
    if (this.requestId) {
      const cancelRaf =
        window.cancelAnimationFrame ||
        (window as any).webkitCancelAnimationFrame ||
        (window as any).mozCancelAnimationFrame;

      if (cancelRaf) {
        cancelRaf(this.requestId);
      }
      this.requestId = null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.reset();
  }
}
