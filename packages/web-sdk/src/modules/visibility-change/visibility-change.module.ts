import { BaseModule } from "@/modules/BaseModule";

export class VisibilityChangeModule extends BaseModule {
  public readonly moduleName: string = "visibilityChange";
  private currentVisibilityState: string = "unknown";
  private visibilityChangeCount: number = 0;
  private lastVisibilityChangeTime: number = 0;

  /**
   * Initializes the visibility change detection module.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);

    try {
      // Detect browser support and set up appropriate listeners
      this.setupVisibilityListeners();

      // Dispatch initial visibility state
      this.dispatchInitialVisibilityState();
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "visibilityChange.error", {
        error: "Visibility change detection failed",
        errorCode: "COLLECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Sets up visibility change listeners based on browser support
   */
  private setupVisibilityListeners(): void {
    // Check for standard Page Visibility API support
    if (typeof document !== "undefined" && "hidden" in document) {
      this.addListener(
        document,
        "visibilitychange",
        this.handleVisibilityChange.bind(this)
      );
      return;
    }

    // Check for Internet Explorer/Edge support
    if (typeof document !== "undefined" && "msHidden" in document) {
      this.addListener(
        document,
        "msvisibilitychange",
        this.handleVisibilityChange.bind(this)
      );
      return;
    }

    // Check for WebKit support (Safari, older Chrome)
    if (typeof document !== "undefined" && "webkitHidden" in document) {
      this.addListener(
        document,
        "webkitvisibilitychange",
        this.handleVisibilityChange.bind(this)
      );
      return;
    }

    // Fallback: No visibility API support
    console.warn(`[SDK] ${this.moduleName}: Page Visibility API not supported`);
    this.eventManager.dispatch(this.moduleName, "visibilityChange", {
      visibilityState: "unsupported",
      changeCount: 0,
      timestamp: this.getHighPrecisionTime(),
      browserSupport: false,
    });
  }

  /**
   * Dispatches the initial visibility state
   */
  private dispatchInitialVisibilityState(): void {
    const visibilityState = this.getCurrentVisibilityState();
    this.currentVisibilityState = visibilityState;

    this.eventManager.dispatch(this.moduleName, "visibilityChange", {
      visibilityState,
      changeCount: 0,
      timestamp: this.getHighPrecisionTime(),
      browserSupport: true,
      isInitialState: true,
    });
  }

  /**
   * Handles visibility change events
   */
  private handleVisibilityChange(): void {
    const newVisibilityState = this.getCurrentVisibilityState();
    const currentTime = this.getHighPrecisionTime();

    // Only dispatch if the state actually changed
    if (this.currentVisibilityState !== newVisibilityState) {
      this.visibilityChangeCount++;
      this.lastVisibilityChangeTime = currentTime;
      this.currentVisibilityState = newVisibilityState;

      this.eventManager.dispatch(this.moduleName, "visibilityChange", {
        visibilityState: newVisibilityState,
        previousState: this.currentVisibilityState,
        changeCount: this.visibilityChangeCount,
        timestamp: currentTime,
        timeSinceLastChange:
          this.lastVisibilityChangeTime > 0
            ? currentTime - this.lastVisibilityChangeTime
            : 0,
        browserSupport: true,
        isInitialState: false,
      });
    }
  }

  /**
   * Gets the current visibility state based on browser support
   */
  private getCurrentVisibilityState(): string {
    if (typeof document === "undefined") {
      return "unknown";
    }

    // Standard Page Visibility API
    if ("hidden" in document) {
      if (document.hidden) {
        return "hidden";
      }
      if ("visibilityState" in document) {
        return document.visibilityState || "visible";
      }
      return "visible";
    }

    // Internet Explorer/Edge
    if ("msHidden" in document) {
      return (document as any).msHidden ? "hidden" : "visible";
    }

    // WebKit browsers
    if ("webkitHidden" in document) {
      return (document as any).webkitHidden ? "hidden" : "visible";
    }

    return "unknown";
  }

  /**
   * Gets high precision time using performance.now() if available, fallback to Date.now()
   */
  private getHighPrecisionTime(): number {
    try {
      return performance.now();
    } catch (error) {
      return Date.now();
    }
  }

  /**
   * Gets current visibility statistics
   */
  public getVisibilityStats(): {
    currentState: string;
    changeCount: number;
    lastChangeTime: number;
  } {
    return {
      currentState: this.currentVisibilityState,
      changeCount: this.visibilityChangeCount,
      lastChangeTime: this.lastVisibilityChangeTime,
    };
  }

  /**
   * Cleans up the event listeners when the module is destroyed.
   */
  public destroy(): void {
    // Remove all listeners added by this module
    super.destroy();

    // Reset state
    this.currentVisibilityState = "unknown";
    this.visibilityChangeCount = 0;
    this.lastVisibilityChangeTime = 0;
  }
}
