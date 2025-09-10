import { BaseModule } from "@/modules/BaseModule";

export class PerformanceModule extends BaseModule {
  public readonly moduleName: string = "perf";

  /**
   * Initializes performance monitoring by collecting various performance metrics.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      this.collectPerformanceData();
      this.setupPerformanceObservers();
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "perf", {
        pageLoadMs: -1,
        timestamp: Date.now(),
        error: "Performance collection failed",
      });
    }
  }

  private collectPerformanceData(): void {
    const performanceData = {
      pageLoadMs: this.getPageLoadTime(),
      navigationTiming: this.getNavigationTiming(),
      resourceTiming: this.getResourceTiming(),
      memoryUsage: this.getMemoryUsage(),
      connectionInfo: this.getConnectionInfo(),
      timestamp: Date.now(),
    };

    this.eventManager.dispatch(this.moduleName, "perf", performanceData);
  }

  private getPageLoadTime(): number {
    if (typeof performance !== "undefined" && performance.timing) {
      const timing = performance.timing;
      return timing.loadEventEnd - timing.navigationStart;
    }

    // Fallback for modern browsers
    if (typeof performance !== "undefined" && performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        return (
          navigationEntries[0].loadEventEnd - navigationEntries[0].startTime
        );
      }
    }

    return -1;
  }

  private getNavigationTiming(): any {
    if (typeof performance === "undefined" || !performance.timing) {
      return null;
    }

    const timing = performance.timing;
    return {
      navigationStart: timing.navigationStart,
      unloadEventStart: timing.unloadEventStart,
      unloadEventEnd: timing.unloadEventEnd,
      redirectStart: timing.redirectStart,
      redirectEnd: timing.redirectEnd,
      fetchStart: timing.fetchStart,
      domainLookupStart: timing.domainLookupStart,
      domainLookupEnd: timing.domainLookupEnd,
      connectStart: timing.connectStart,
      connectEnd: timing.connectEnd,
      secureConnectionStart: timing.secureConnectionStart,
      requestStart: timing.requestStart,
      responseStart: timing.responseStart,
      responseEnd: timing.responseEnd,
      domLoading: timing.domLoading,
      domInteractive: timing.domInteractive,
      domContentLoadedEventStart: timing.domContentLoadedEventStart,
      domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
      domComplete: timing.domComplete,
      loadEventStart: timing.loadEventStart,
      loadEventEnd: timing.loadEventEnd,
    };
  }

  private getResourceTiming(): any {
    if (typeof performance === "undefined" || !performance.getEntriesByType) {
      return null;
    }

    const resources = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];

    return {
      totalResources: resources.length,
      totalSize: resources.reduce(
        (sum, resource) => sum + (resource.transferSize || 0),
        0
      ),
      averageLoadTime:
        resources.reduce((sum, resource) => sum + resource.duration, 0) /
        resources.length,
      slowestResource: resources.reduce(
        (slowest, resource) =>
          resource.duration > slowest.duration ? resource : slowest,
        resources[0] || { duration: 0, name: "" }
      ),
      resourceTypes: this.categorizeResources(resources),
    };
  }

  private categorizeResources(
    resources: PerformanceResourceTiming[]
  ): Record<string, number> {
    const categories: Record<string, number> = {
      script: 0,
      stylesheet: 0,
      image: 0,
      font: 0,
      document: 0,
      other: 0,
    };

    resources.forEach((resource) => {
      const name = resource.name.toLowerCase();
      if (name.includes(".js") || name.includes("script")) {
        categories.script++;
      } else if (name.includes(".css") || name.includes("stylesheet")) {
        categories.stylesheet++;
      } else if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        categories.image++;
      } else if (name.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
        categories.font++;
      } else if (name.includes(document.location.hostname)) {
        categories.document++;
      } else {
        categories.other++;
      }
    });

    return categories;
  }

  private getMemoryUsage(): any {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  private getConnectionInfo(): any {
    if (typeof navigator !== "undefined" && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return null;
  }

  private setupPerformanceObservers(): void {
    // Observe long tasks
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const longTasks = list.getEntries();
          if (longTasks.length > 0) {
            this.eventManager.dispatch(this.moduleName, "longTasks", {
              tasks: longTasks.map((task) => ({
                duration: task.duration,
                startTime: task.startTime,
                name: task.name,
              })),
              timestamp: Date.now(),
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ["longtask"] });
      } catch (error) {
        console.warn(
          `[SDK] ${this.moduleName}: Long task observer not supported`
        );
      }

      // Observe layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          const layoutShifts = list.getEntries();
          if (layoutShifts.length > 0) {
            this.eventManager.dispatch(this.moduleName, "layoutShifts", {
              shifts: layoutShifts.map((shift) => ({
                value: (shift as any).value,
                startTime: shift.startTime,
                hadRecentInput: (shift as any).hadRecentInput,
              })),
              timestamp: Date.now(),
            });
          }
        });
        layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });
      } catch (error) {
        console.warn(
          `[SDK] ${this.moduleName}: Layout shift observer not supported`
        );
      }

      // Observe paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const paintEntries = list.getEntries();
          if (paintEntries.length > 0) {
            this.eventManager.dispatch(this.moduleName, "paintTiming", {
              paints: paintEntries.map((paint) => ({
                name: paint.name,
                startTime: paint.startTime,
              })),
              timestamp: Date.now(),
            });
          }
        });
        paintObserver.observe({ entryTypes: ["paint"] });
      } catch (error) {
        console.warn(`[SDK] ${this.moduleName}: Paint observer not supported`);
      }
    }
  }
}
