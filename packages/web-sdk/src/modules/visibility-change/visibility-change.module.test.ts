import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { VisibilityChangeModule } from "./visibility-change.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
const mockEventManager = {
  dispatch: vi.fn(),
};

vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(() => mockEventManager),
  },
}));

describe("VisibilityChangeModule", () => {
  let visibilityChangeModule: VisibilityChangeModule;
  let mockDocument: any;
  let mockPerformance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock document using Object.defineProperty
    mockDocument = {
      hidden: false,
      visibilityState: "visible",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(global, "document", {
      value: mockDocument,
      writable: true,
      configurable: true,
    });

    // Mock performance
    mockPerformance = {
      now: vi.fn().mockReturnValue(1234567890),
    };

    Object.defineProperty(global, "performance", {
      value: mockPerformance,
      writable: true,
      configurable: true,
    });

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    visibilityChangeModule = new VisibilityChangeModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(visibilityChangeModule.moduleName).toBe("visibilityChange");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch initial visibility state", () => {
      visibilityChangeModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "visibilityChange",
        "visibilityChange",
        expect.objectContaining({
          visibilityState: "visible",
          changeCount: 0,
          timestamp: expect.any(Number),
          browserSupport: true,
          isInitialState: true,
        })
      );
    });

    it("should set up visibility change listeners", () => {
      visibilityChangeModule.init();

      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
        undefined
      );
    });

    it("should handle initialization errors gracefully", () => {
      // Mock document to throw error
      Object.defineProperty(global, "document", {
        get: () => {
          throw new Error("Document access failed");
        },
        configurable: true,
      });

      visibilityChangeModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "visibilityChange",
        "visibilityChange.error",
        expect.objectContaining({
          error: "Visibility change detection failed",
          errorCode: "COLLECTION_FAILED",
          details: expect.objectContaining({
            message: "Document access failed",
          }),
        })
      );
    });
  });

  describe("setupVisibilityListeners", () => {
    it("should use standard Page Visibility API when available", () => {
      visibilityChangeModule.init();

      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
        undefined
      );
    });

    it("should use msHidden for Internet Explorer", () => {
      const mockIEDocument = {
        msHidden: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      Object.defineProperty(global, "document", {
        value: mockIEDocument,
        writable: true,
        configurable: true,
      });

      visibilityChangeModule.init();

      expect(mockIEDocument.addEventListener).toHaveBeenCalledWith(
        "msvisibilitychange",
        expect.any(Function),
        undefined
      );
    });

    it("should use webkitHidden for WebKit browsers", () => {
      const mockWebKitDocument = {
        webkitHidden: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      Object.defineProperty(global, "document", {
        value: mockWebKitDocument,
        writable: true,
        configurable: true,
      });

      visibilityChangeModule.init();

      expect(mockWebKitDocument.addEventListener).toHaveBeenCalledWith(
        "webkitvisibilitychange",
        expect.any(Function),
        undefined
      );
    });

    it("should handle unsupported browsers", () => {
      const mockUnsupportedDocument = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      Object.defineProperty(global, "document", {
        value: mockUnsupportedDocument,
        writable: true,
        configurable: true,
      });

      visibilityChangeModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "visibilityChange",
        "visibilityChange",
        expect.objectContaining({
          visibilityState: "unsupported",
          changeCount: 0,
          timestamp: expect.any(Number),
          browserSupport: false,
        })
      );
    });
  });

  describe("getCurrentVisibilityState", () => {
    it("should return visible when document is not hidden", () => {
      // Access private method through any type
      const result = (
        visibilityChangeModule as any
      ).getCurrentVisibilityState();

      expect(result).toBe("visible");
    });

    it("should return hidden when document is hidden", () => {
      mockDocument.hidden = true;

      // Access private method through any type
      const result = (
        visibilityChangeModule as any
      ).getCurrentVisibilityState();

      expect(result).toBe("hidden");
    });

    it("should return visibilityState when available", () => {
      mockDocument.hidden = false;
      mockDocument.visibilityState = "prerender";

      // Access private method through any type
      const result = (
        visibilityChangeModule as any
      ).getCurrentVisibilityState();

      expect(result).toBe("prerender");
    });

    it("should handle undefined document", () => {
      Object.defineProperty(global, "document", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Access private method through any type
      const result = (
        visibilityChangeModule as any
      ).getCurrentVisibilityState();

      expect(result).toBe("unknown");
    });
  });

  describe("getHighPrecisionTime", () => {
    it("should use performance.now() when available", () => {
      // Access private method through any type
      const result = (visibilityChangeModule as any).getHighPrecisionTime();

      expect(result).toBe(1234567890);
      expect(mockPerformance.now).toHaveBeenCalled();
    });

    it("should fallback to Date.now() when performance.now() fails", () => {
      mockPerformance.now = vi.fn().mockImplementation(() => {
        throw new Error("Performance API not available");
      });

      // Mock Date.now() to return a specific value
      const mockDateNow = vi.spyOn(Date, "now").mockReturnValue(1234567890);

      // Access private method through any type
      const result = (visibilityChangeModule as any).getHighPrecisionTime();

      expect(result).toBe(1234567890); // Date.now() mock
      expect(mockDateNow).toHaveBeenCalled();
    });
  });

  describe("getVisibilityStats", () => {
    it("should return current visibility statistics", () => {
      const stats = visibilityChangeModule.getVisibilityStats();

      expect(stats).toEqual({
        currentState: "unknown",
        changeCount: 0,
        lastChangeTime: 0,
      });
    });
  });

  describe("integration", () => {
    it("should handle complete visibility change detection flow", () => {
      visibilityChangeModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "visibilityChange",
        "visibilityChange",
        expect.objectContaining({
          visibilityState: "visible",
          changeCount: 0,
          timestamp: expect.any(Number),
          browserSupport: true,
          isInitialState: true,
        })
      );
    });

    it("should handle visibility state changes", () => {
      visibilityChangeModule.init();

      // Simulate visibility change
      const handleVisibilityChange =
        mockDocument.addEventListener.mock.calls[0][1];
      mockDocument.hidden = true;
      handleVisibilityChange();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "visibilityChange",
        "visibilityChange",
        expect.objectContaining({
          visibilityState: "hidden",
          changeCount: 1,
          timestamp: expect.any(Number),
          browserSupport: true,
          isInitialState: false,
        })
      );
    });
  });
});
