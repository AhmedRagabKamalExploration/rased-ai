import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AdblockModule } from "./adblock.module";
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

describe("AdblockModule", () => {
  let adblockModule: AdblockModule;
  let mockDocument: any;
  let mockWindow: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock document methods
    mockDocument = {
      createElement: vi.fn().mockImplementation((tagName) => {
        if (tagName === "div") {
          return {
            className: "",
            style: {},
            offsetHeight: 1,
            offsetParent: {},
            appendChild: vi.fn(),
            removeChild: vi.fn(),
          };
        }
        if (tagName === "script") {
          return {
            onerror: null,
            onload: null,
            src: "",
            appendChild: vi.fn(),
          };
        }
        return {};
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      head: {
        appendChild: vi.fn(),
      },
    };

    global.document = mockDocument;

    // Mock window methods
    mockWindow = {
      getComputedStyle: vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue("block"),
      }),
    };

    global.window = mockWindow;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    adblockModule = new AdblockModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(adblockModule.moduleName).toBe("adblock");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch adblock data", async () => {
      // Mock DOM check to return false (no adblocker)
      const mockElement = {
        className: "",
        style: {},
        offsetHeight: 1,
        offsetParent: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockElement);

      // Mock resource check to resolve false
      const mockScript = {
        onerror: null,
        onload: null,
        src: "",
        appendChild: vi.fn(),
      };
      mockDocument.createElement.mockImplementation((tagName) => {
        if (tagName === "script") return mockScript;
        return mockElement;
      });

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, "setTimeout").mockImplementation((callback) => {
        callback();
        return 1 as any;
      });

      await adblockModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "adblock",
        "adblock",
        expect.objectContaining({
          hasAdblocker: false,
          timestamp: expect.any(Number),
          detectionMethod: "dom-manipulation-and-resource-check",
        })
      );
    });

    it("should handle initialization errors gracefully", async () => {
      // Mock DOM check to throw error
      mockDocument.createElement.mockImplementation(() => {
        throw new Error("DOM manipulation failed");
      });

      await adblockModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "adblock",
        "adblock.error",
        expect.objectContaining({
          error: "DOM manipulation failed",
          errorCode: "UNEXPECTED_ERROR",
          details: expect.objectContaining({
            browserName: expect.any(String),
            privacyMode: expect.any(Boolean),
            domManipulationBlocked: false,
          }),
        })
      );
    });
  });

  describe("detectAdblocker", () => {
    it("should detect adblocker when DOM check returns true", async () => {
      // Mock DOM check to return true (adblocker detected)
      const mockElement = {
        className: "",
        style: {},
        offsetHeight: 0, // This indicates adblocker
        offsetParent: null,
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockElement);

      // Mock resource check to resolve false
      const mockScript = {
        onerror: null,
        onload: null,
        src: "",
        appendChild: vi.fn(),
      };
      mockDocument.createElement.mockImplementation((tagName) => {
        if (tagName === "script") return mockScript;
        return mockElement;
      });

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, "setTimeout").mockImplementation((callback) => {
        callback();
        return 1 as any;
      });

      await adblockModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "adblock",
        "adblock",
        expect.objectContaining({
          hasAdblocker: true,
        })
      );
    });

    it("should detect adblocker when resource check returns true", async () => {
      // Mock DOM check to return false
      const mockElement = {
        className: "",
        style: {},
        offsetHeight: 1,
        offsetParent: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockElement);

      // Mock resource check to trigger onerror (adblocker detected)
      const mockScript = {
        onerror: null,
        onload: null,
        src: "",
        appendChild: vi.fn(),
      };
      mockDocument.createElement.mockImplementation((tagName) => {
        if (tagName === "script") {
          // Simulate onerror being called
          setTimeout(() => {
            if (mockScript.onerror) {
              mockScript.onerror(new Event("error"));
            }
          }, 0);
          return mockScript;
        }
        return mockElement;
      });

      await adblockModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "adblock",
        "adblock",
        expect.objectContaining({
          hasAdblocker: true,
        })
      );
    });
  });

  describe("checkDomManipulation", () => {
    it("should return true when element is blocked", () => {
      // Mock element that appears blocked
      const mockElement = {
        className: "",
        style: {},
        offsetHeight: 0,
        offsetParent: null,
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockElement);

      // Access private method through any type
      const result = (adblockModule as any).checkDomManipulation();

      expect(result).toBe(true);
      expect(mockDocument.body.appendChild).toHaveBeenCalled();
      expect(mockDocument.body.removeChild).toHaveBeenCalled();
    });

    it("should return false when element is not blocked", () => {
      // Mock element that appears normal
      const mockElement = {
        className: "",
        style: {},
        offsetHeight: 1,
        offsetParent: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockElement);

      // Access private method through any type
      const result = (adblockModule as any).checkDomManipulation();

      expect(result).toBe(false);
    });
  });

  describe("checkResourceLoading", () => {
    it("should resolve true when script fails to load", async () => {
      const mockScript = {
        onerror: null,
        onload: null,
        src: "",
        appendChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockScript);

      // Access private method through any type
      const promise = (adblockModule as any).checkResourceLoading();

      // Simulate onerror being called
      if (mockScript.onerror) {
        mockScript.onerror(new Event("error"));
      }

      const result = await promise;
      expect(result).toBe(true);
    });

    it("should resolve false when script loads successfully", async () => {
      const mockScript = {
        onerror: null,
        onload: null,
        src: "",
        appendChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockScript);

      // Access private method through any type
      const promise = (adblockModule as any).checkResourceLoading();

      // Simulate onload being called
      if (mockScript.onload) {
        mockScript.onload(new Event("load"));
      }

      const result = await promise;
      expect(result).toBe(false);
    });

    it("should resolve false on timeout", async () => {
      const mockScript = {
        onerror: null,
        onload: null,
        src: "",
        appendChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockScript);

      // Mock setTimeout to resolve after timeout
      vi.spyOn(global, "setTimeout").mockImplementation((callback) => {
        callback();
        return 1 as any;
      });

      // Access private method through any type
      const result = await (adblockModule as any).checkResourceLoading();

      expect(result).toBe(false);
    });
  });

  describe("integration", () => {
    it("should handle complete adblock detection flow", async () => {
      // Mock DOM check to return false
      const mockElement = {
        className: "",
        style: {},
        offsetHeight: 1,
        offsetParent: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      mockDocument.createElement.mockReturnValue(mockElement);

      // Mock resource check to resolve false
      const mockScript = {
        onerror: null,
        onload: null,
        src: "",
        appendChild: vi.fn(),
      };
      mockDocument.createElement.mockImplementation((tagName) => {
        if (tagName === "script") return mockScript;
        return mockElement;
      });

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, "setTimeout").mockImplementation((callback) => {
        callback();
        return 1 as any;
      });

      await adblockModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "adblock",
        "adblock",
        expect.objectContaining({
          hasAdblocker: false,
          timestamp: expect.any(Number),
          detectionMethod: "dom-manipulation-and-resource-check",
        })
      );
    });
  });
});
