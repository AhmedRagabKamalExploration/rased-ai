import { BaseModule } from "@/modules/BaseModule";

export class PageMonitoringModule extends BaseModule {
  public readonly moduleName: string = "pageMonitoring";
  private startTime: number = 0;
  private pageLoadTime: number = 0;
  private pageShowTime: number = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private interval = 5000; // Dispatch event every 5 seconds
  private isInitialized = false;

  /**
   * Initializes the module by capturing the start time and setting up listeners.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    this.startTime = this.getHighPrecisionTime();
    this.isInitialized = true;

    try {
      // Capture page load time from Performance API
      this.capturePageLoadTime();

      // Dispatch an initial event with page load time
      this.dispatchInitialPageLoadTime();

      // Dispatch page time periodically
      this.timer = setInterval(() => this.dispatchPageTime(), this.interval);

      // Add listeners for page events
      this.setupPageEventListeners();
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "pageMonitoring.error", {
        error: "Page monitoring failed",
        errorCode: "COLLECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Captures page load time from Performance API
   */
  private capturePageLoadTime(): void {
    try {
      // Try to get navigation timing first
      const navigationEntries = performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];

      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        this.pageLoadTime = entry.loadEventEnd - entry.fetchStart;
        return;
      }

      // Fallback to performance.timing if available
      if (performance.timing && performance.timing.loadEventEnd) {
        this.pageLoadTime =
          performance.timing.loadEventEnd - performance.timing.navigationStart;
        return;
      }

      // Final fallback
      this.pageLoadTime = 0;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Failed to capture page load time:`,
        error
      );
      this.pageLoadTime = 0;
    }
  }

  /**
   * Dispatches the initial page load time.
   */
  private dispatchInitialPageLoadTime(): void {
    if (this.pageLoadTime > 0) {
      this.eventManager.dispatch(this.moduleName, "pageMonitoring", {
        eventType: "PAGE_LOAD",
        pageTime: this.pageLoadTime,
        timestamp: this.getHighPrecisionTime(),
      });
    } else {
      // Fallback if the Performance API is not available
      this.dispatchPageTime();
    }
  }

  /**
   * Dispatches the current total time spent on the page.
   */
  private dispatchPageTime(): void {
    const pageTime = this.getHighPrecisionTime() - this.startTime;
    this.eventManager.dispatch(this.moduleName, "pageMonitoring", {
      eventType: "PAGE_TIME",
      pageTime,
      timestamp: this.getHighPrecisionTime(),
    });
  }

  /**
   * Sets up page event listeners
   */
  private setupPageEventListeners(): void {
    // Listen for page show events (like back/forward navigation)
    window.addEventListener("pageshow", this.handlePageShow.bind(this));

    // Listen for page hide events
    window.addEventListener("pagehide", this.handlePageHide.bind(this));

    // Listen for beforeunload to capture final page time
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));
  }

  /**
   * Handles page show events
   */
  private handlePageShow(event: PageTransitionEvent): void {
    this.pageShowTime = this.getHighPrecisionTime();
    this.eventManager.dispatch(this.moduleName, "pageMonitoring", {
      eventType: "PAGE_SHOW",
      pageTime: this.pageShowTime - this.startTime,
      timestamp: this.pageShowTime,
      persisted: event.persisted,
    });
  }

  /**
   * Handles page hide events
   */
  private handlePageHide(event: PageTransitionEvent): void {
    const pageTime = this.getHighPrecisionTime() - this.startTime;
    this.eventManager.dispatch(this.moduleName, "pageMonitoring", {
      eventType: "PAGE_HIDE",
      pageTime,
      timestamp: this.getHighPrecisionTime(),
      persisted: event.persisted,
    });
  }

  /**
   * Handles the beforeunload event to dispatch the final page time.
   */
  private handleBeforeUnload(): void {
    this.dispatchPageTime();
    if (this.timer) {
      clearInterval(this.timer);
    }
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
   * Cleans up the event listeners when the module is destroyed.
   */
  public destroy(): void {
    window.removeEventListener("pageshow", this.handlePageShow.bind(this));
    window.removeEventListener("pagehide", this.handlePageHide.bind(this));
    window.removeEventListener(
      "beforeunload",
      this.handleBeforeUnload.bind(this)
    );

    if (this.timer) {
      clearInterval(this.timer);
    }

    // Dispatch one final event to capture the last moment
    if (this.isInitialized) {
      this.dispatchPageTime();
    }
  }
}
