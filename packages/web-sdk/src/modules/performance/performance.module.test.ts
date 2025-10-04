import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PerformanceModule } from "./performance.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

describe("PerformanceModule", () => {
  let performanceModule: PerformanceModule;
  let mockEventManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock event manager
    mockEventManager = {
      dispatch: vi.fn(),
    };

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    // Mock Date.now
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    // Mock performance API
    global.performance = {
      timing: {
        navigationStart: 1000,
        unloadEventStart: 1100,
        unloadEventEnd: 1200,
        redirectStart: 1300,
        redirectEnd: 1400,
        fetchStart: 1500,
        domainLookupStart: 1600,
        domainLookupEnd: 1700,
        connectStart: 1800,
        connectEnd: 1900,
        secureConnectionStart: 2000,
        requestStart: 2100,
        responseStart: 2200,
        responseEnd: 2300,
        domLoading: 2400,
        domInteractive: 2500,
        domContentLoadedEventStart: 2600,
        domContentLoadedEventEnd: 2700,
        domComplete: 2800,
        loadEventStart: 2900,
        loadEventEnd: 3000,
      },
      getEntriesByType: vi.fn().mockReturnValue([]),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      },
    } as any;

    // Mock navigator
    global.navigator = {
      connection: {
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        saveData: false,
      },
    } as any;

    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation((_callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn().mockReturnValue([]),
    })) as any;
    
    // Add supportedEntryTypes static property
    (global.PerformanceObserver as any).supportedEntryTypes = ['navigation', 'resource'];

    performanceModule = new PerformanceModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(performanceModule.moduleName).toBe("perf");
    });
  });

  describe("init", () => {
    it("should initialize successfully and collect performance data", () => {
      performanceModule.init();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] perf: Initializing..."
      );

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "perf",
        "perf",
        expect.objectContaining({
          pageLoadMs: 2000, // 3000 - 1000
          navigationTiming: expect.any(Object),
          resourceTiming: expect.any(Object),
          memoryUsage: expect.any(Object),
          connectionInfo: expect.any(Object),
          timestamp: 1234567890,
        })
      );
    });

    it("should handle initialization errors gracefully", () => {
      // Mock performance to throw error
      global.performance = null as any;

      performanceModule.init();

      expect(global.console.error).toHaveBeenCalledWith(
        "[SDK] perf: Collection failed.",
        expect.any(Error)
      );

      expect(mockEventManager.dispatch).toHaveBeenCalledWith("perf", "perf", {
        pageLoadMs: -1,
        timestamp: 1234567890,
        error: "Performance collection failed",
      });
    });
  });

  describe("getPageLoadTime", () => {
    it("should calculate page load time from performance.timing", () => {
      // Access private method through any type
      const pageLoadTime = (performanceModule as any).getPageLoadTime();

      expect(pageLoadTime).toBe(2000); // 3000 - 1000
    });

    it("should fallback to navigation entries when timing is unavailable", () => {
      // Mock performance without timing
      global.performance = {
        getEntriesByType: vi.fn().mockReturnValue([
          {
            loadEventEnd: 2500,
            startTime: 500,
          },
        ]),
      } as any;

      // Access private method through any type
      const pageLoadTime = (performanceModule as any).getPageLoadTime();

      expect(pageLoadTime).toBe(2000); // 2500 - 500
    });

    it("should return -1 when performance data is unavailable", () => {
      global.performance = undefined as any;

      // Access private method through any type
      const pageLoadTime = (performanceModule as any).getPageLoadTime();

      expect(pageLoadTime).toBe(-1);
    });
  });

  describe("getNavigationTiming", () => {
    it("should return navigation timing data", () => {
      // Access private method through any type
      const navigationTiming = (performanceModule as any).getNavigationTiming();

      expect(navigationTiming).toEqual({
        navigationStart: 1000,
        unloadEventStart: 1100,
        unloadEventEnd: 1200,
        redirectStart: 1300,
        redirectEnd: 1400,
        fetchStart: 1500,
        domainLookupStart: 1600,
        domainLookupEnd: 1700,
        connectStart: 1800,
        connectEnd: 1900,
        secureConnectionStart: 2000,
        requestStart: 2100,
        responseStart: 2200,
        responseEnd: 2300,
        domLoading: 2400,
        domInteractive: 2500,
        domContentLoadedEventStart: 2600,
        domContentLoadedEventEnd: 2700,
        domComplete: 2800,
        loadEventStart: 2900,
        loadEventEnd: 3000,
      });
    });

    it("should return null when performance.timing is unavailable", () => {
      global.performance = {} as any;

      // Access private method through any type
      const navigationTiming = (performanceModule as any).getNavigationTiming();

      expect(navigationTiming).toBeNull();
    });
  });

  describe("getResourceTiming", () => {
    it("should return resource timing data", () => {
      const mockResources = [
        { name: "script.js", duration: 100, transferSize: 1000 },
        { name: "style.css", duration: 50, transferSize: 500 },
        { name: "image.png", duration: 200, transferSize: 2000 },
      ];

      global.performance.getEntriesByType = vi
        .fn()
        .mockReturnValue(mockResources);

      // Access private method through any type
      const resourceTiming = (performanceModule as any).getResourceTiming();

      expect(resourceTiming).toEqual({
        totalResources: 3,
        totalSize: 3500,
        averageLoadTime: 116.66666666666667,
        slowestResource: {
          name: "image.png",
          duration: 200,
          transferSize: 2000,
        },
        resourceTypes: {
          script: 1,
          stylesheet: 1,
          image: 1,
          font: 0,
          document: 0,
          other: 0,
        },
      });
    });

    it("should return null when getEntriesByType is unavailable", () => {
      global.performance = { timing: {} } as any;

      // Access private method through any type
      const resourceTiming = (performanceModule as any).getResourceTiming();

      expect(resourceTiming).toBeNull();
    });

    it("should handle empty resources array", () => {
      global.performance.getEntriesByType = vi.fn().mockReturnValue([]);

      // Access private method through any type
      const resourceTiming = (performanceModule as any).getResourceTiming();

      expect(resourceTiming.totalResources).toBe(0);
      expect(resourceTiming.totalSize).toBe(0);
      expect(resourceTiming.averageLoadTime).toBeNaN();
    });
  });

  describe("categorizeResources", () => {
    it("should categorize resources correctly", () => {
      const mockResources = [
        { name: "script.js" },
        { name: "style.css" },
        { name: "image.png" },
        { name: "font.woff2" },
        { name: "https://example.com/page" },
        { name: "unknown.xyz" },
      ];

      // Access private method through any type
      const categories = (performanceModule as any).categorizeResources(
        mockResources
      );

      expect(categories).toEqual({
        script: 1,
        stylesheet: 1,
        image: 1,
        font: 1,
        document: 1,
        other: 1,
      });
    });

    it("should handle various file extensions", () => {
      const mockResources = [
        { name: "script.js" },
        { name: "script.min.js" },
        { name: "style.css" },
        { name: "style.min.css" },
        { name: "image.jpg" },
        { name: "image.jpeg" },
        { name: "image.png" },
        { name: "image.gif" },
        { name: "image.webp" },
        { name: "image.svg" },
        { name: "font.woff" },
        { name: "font.woff2" },
        { name: "font.ttf" },
        { name: "font.otf" },
        { name: "font.eot" },
      ];

      // Access private method through any type
      const categories = (performanceModule as any).categorizeResources(
        mockResources
      );

      expect(categories.script).toBe(2);
      expect(categories.stylesheet).toBe(2);
      expect(categories.image).toBe(6);
      expect(categories.font).toBe(5);
    });
  });

  describe("getMemoryUsage", () => {
    it("should return memory usage data when available", () => {
      // Access private method through any type
      const memoryUsage = (performanceModule as any).getMemoryUsage();

      expect(memoryUsage).toEqual({
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      });
    });

    it("should return null when memory API is unavailable", () => {
      global.performance = { timing: {} } as any;

      // Access private method through any type
      const memoryUsage = (performanceModule as any).getMemoryUsage();

      expect(memoryUsage).toBeNull();
    });
  });

  describe("getConnectionInfo", () => {
    it("should return connection info when available", () => {
      // Access private method through any type
      const connectionInfo = (performanceModule as any).getConnectionInfo();

      expect(connectionInfo).toEqual({
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        saveData: false,
      });
    });

    it("should return null when connection API is unavailable", () => {
      global.navigator = {} as any;

      // Access private method through any type
      const connectionInfo = (performanceModule as any).getConnectionInfo();

      expect(connectionInfo).toBeNull();
    });
  });

  describe("setupPerformanceObservers", () => {
    it("should set up performance observers when supported", () => {
      performanceModule.init();

      // PerformanceObserver should be called for longtask, layout-shift, and paint observers
      expect(global.PerformanceObserver).toHaveBeenCalled();
    });

    it("should handle PerformanceObserver not supported", () => {
      global.PerformanceObserver = undefined as any;

      expect(() => performanceModule.init()).not.toThrow();
    });

    it("should handle observer creation errors gracefully", () => {
      global.PerformanceObserver = vi.fn().mockImplementation(() => {
        throw new Error("Observer creation failed");
      }) as any;

      expect(() => performanceModule.init()).not.toThrow();
      // The error should be caught and logged as a warning
      expect(global.console.warn).toHaveBeenCalled();
    });
  });

  describe("integration", () => {
    it("should handle complete performance data collection", () => {
      // Mock all performance APIs
      global.performance = {
        timing: {
          navigationStart: 1000,
          loadEventEnd: 3000,
        },
        getEntriesByType: vi
          .fn()
          .mockReturnValue([
            { name: "script.js", duration: 100, transferSize: 1000 },
          ]),
        memory: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000,
        },
      } as any;

      performanceModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "perf",
        "perf",
        expect.objectContaining({
          pageLoadMs: 2000,
          navigationTiming: expect.any(Object),
          resourceTiming: expect.objectContaining({
            totalResources: 1,
            totalSize: 1000,
            averageLoadTime: 100,
          }),
          memoryUsage: expect.objectContaining({
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000,
            jsHeapSizeLimit: 4000000,
          }),
          connectionInfo: expect.objectContaining({
            effectiveType: "4g",
            downlink: 10,
            rtt: 50,
            saveData: false,
          }),
          timestamp: 1234567890,
        })
      );
    });
  });
});
