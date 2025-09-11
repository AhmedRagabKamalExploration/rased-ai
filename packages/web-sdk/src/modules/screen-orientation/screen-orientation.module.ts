import { BaseModule } from "@/modules/BaseModule";

export class ScreenOrientationModule extends BaseModule {
  public readonly moduleName: string = "screenOrientation";

  /**
   * Initializes screen orientation data collection and sets up an event listener for changes.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      this.collectOrientationData();
      window.addEventListener(
        "orientationchange",
        this.handleOrientationChange.bind(this)
      );
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "screenOrientation.error", {
        error: "Screen orientation data collection failed",
        errorCode: "UNSUPPORTED_API",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Collects and dispatches a single snapshot of the current screen orientation.
   */
  private collectOrientationData(): void {
    if ("screen" in window && "orientation" in window.screen) {
      this.eventManager.dispatch(this.moduleName, "screenOrientation", {
        type: window.screen.orientation.type,
        angle: window.screen.orientation.angle,
        timestamp: Date.now(),
      });
    } else {
      console.warn(
        `[SDK] ${this.moduleName}: Screen Orientation API not supported.`
      );
      // Dispatch an event to indicate that the API is not supported.
      this.eventManager.dispatch(this.moduleName, "screenOrientation.error", {
        error: "Screen Orientation API not supported",
        errorCode: "UNSUPPORTED_API",
        details: {
          message: "The `window.screen.orientation` API is not available.",
        },
      });
    }
  }

  /**
   * Handles the orientationchange event and dispatches the new data.
   */
  private handleOrientationChange(): void {
    this.collectOrientationData();
  }

  /**
   * Cleans up the event listener when the module is destroyed.
   */
  public destroy(): void {
    window.removeEventListener(
      "orientationchange",
      this.handleOrientationChange.bind(this)
    );
  }
}
