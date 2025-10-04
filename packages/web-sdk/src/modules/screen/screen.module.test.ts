import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ScreenModule } from "./screen.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

describe("ScreenModule", () => {
  let screenModule: ScreenModule;
  let mockEventManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock event manager
    mockEventManager = {
      dispatch: vi.fn(),
    };

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock window
    global.window = {
      devicePixelRatio: 2,
      innerHeight: 1080,
      innerWidth: 1920,
    } as any;

    // Mock screen
    global.screen = {
      availHeight: 1040,
      availLeft: 0 as any,
      availTop: 0 as any,
      availWidth: 1920,
      colorDepth: 24,
      height: 1080,
      pixelDepth: 24,
      width: 1920,
      left: 0,
      top: 0,
    } as any;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    // Mock Date.now
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    screenModule = new ScreenModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(screenModule.moduleName).toBe("screen");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch screen data", () => {
      screenModule.init();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] screen: Initializing..."
      );

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "screen",
        "screen",
        expect.objectContaining({
          devicePixelRatio: 2,
          availHeight: 1040,
          availLeft: 0,
          availTop: 0,
          availWidth: 1920,
          colorDepth: 24,
          height: 1080,
          innerHeight: 1080,
          innerWidth: 1920,
          left: 0,
          pixelDepth: 24,
          top: 0,
          width: 1920,
          timestamp: 1234567890,
        })
      );
    });

    it("should handle screen collection errors gracefully", () => {
      // Mock screen to throw error
      const originalScreen = global.screen;
      global.screen = null as any;

      screenModule.init();

      expect(global.console.error).toHaveBeenCalledWith(
        "[SDK] screen: Failed to collect data.",
        expect.any(Error)
      );

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "screen",
        "fingerprint.screen.error",
        {
          error: "Could not access screen or window properties.",
        }
      );

      // Restore screen
      global.screen = originalScreen;
    });
  });

  describe("collectScreenData", () => {
    it("should collect all screen properties when available", () => {
      // Access private method through any type
      const screenData = (screenModule as any).collectScreenData();

      expect(screenData).toEqual({
        devicePixelRatio: 2,
        availHeight: 1040,
        availLeft: 0,
        availTop: 0,
        availWidth: 1920,
        colorDepth: 24,
        height: 1080,
        innerHeight: 1080,
        innerWidth: 1920,
        left: 0,
        pixelDepth: 24,
        top: 0,
        width: 1920,
        timestamp: 1234567890,
      });
    });

    it("should handle missing screen object", () => {
      const originalScreen = global.screen;
      global.screen = undefined as any;

      // Access private method through any type
      const screenData = (screenModule as any).collectScreenData();

      expect(screenData).toEqual({
        devicePixelRatio: 2,
        availHeight: 0,
        availLeft: 0,
        availTop: 0,
        availWidth: 0,
        colorDepth: 24,
        height: 0,
        innerHeight: 1080,
        innerWidth: 1920,
        left: 0,
        pixelDepth: 24,
        top: 0,
        width: 0,
        timestamp: 1234567890,
      });

      // Restore screen
      global.screen = originalScreen;
    });

    it("should handle missing window properties", () => {
      global.window = {
        devicePixelRatio: undefined,
        innerHeight: undefined,
        innerWidth: undefined,
      } as any;

      // Access private method through any type
      const screenData = (screenModule as any).collectScreenData();

      expect(screenData.devicePixelRatio).toBe(1);
      expect(screenData.innerHeight).toBe(0);
      expect(screenData.innerWidth).toBe(0);
    });

    it("should handle missing screen properties", () => {
      global.screen = {
        availHeight: 0,
        availLeft: 0,
        availTop: 0,
        availWidth: 0,
        colorDepth: 24,
        height: 0,
        pixelDepth: 24,
        width: 0,
        left: 0,
        top: 0,
      } as any;

      // Access private method through any type
      const screenData = (screenModule as any).collectScreenData();

      expect(screenData.availHeight).toBe(0);
      expect(screenData.availLeft).toBe(0);
      expect(screenData.availTop).toBe(0);
      expect(screenData.availWidth).toBe(0);
      expect(screenData.colorDepth).toBe(24);
      expect(screenData.height).toBe(0);
      expect(screenData.pixelDepth).toBe(24);
      expect(screenData.width).toBe(0);
      expect(screenData.left).toBe(0);
      expect(screenData.top).toBe(0);
    });

    it("should include current timestamp", () => {
      const customTimestamp = 9876543210;
      vi.spyOn(Date, "now").mockReturnValue(customTimestamp);

      // Access private method through any type
      const screenData = (screenModule as any).collectScreenData();

      expect(screenData.timestamp).toBe(customTimestamp);
    });
  });

  describe("integration", () => {
    it("should handle complete screen data collection flow", () => {
      screenModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(1);

      const dispatchCall = mockEventManager.dispatch.mock.calls[0];
      const [moduleName, eventType, payload] = dispatchCall;

      expect(moduleName).toBe("screen");
      expect(eventType).toBe("screen");
      expect(payload).toHaveProperty("devicePixelRatio");
      expect(payload).toHaveProperty("availHeight");
      expect(payload).toHaveProperty("availWidth");
      expect(payload).toHaveProperty("colorDepth");
      expect(payload).toHaveProperty("height");
      expect(payload).toHaveProperty("width");
      expect(payload).toHaveProperty("innerHeight");
      expect(payload).toHaveProperty("innerWidth");
      expect(payload).toHaveProperty("timestamp");
    });

    it("should handle different screen configurations", () => {
      // Test with different screen configuration
      global.screen = {
        availHeight: 768,
        availLeft: 100,
        availTop: 50,
        availWidth: 1024,
        colorDepth: 32,
        height: 768,
        pixelDepth: 32,
        width: 1024,
        left: 100,
        top: 50,
      } as any;

      global.window = {
        devicePixelRatio: 1.5,
        innerHeight: 768,
        innerWidth: 1024,
      } as any;

      screenModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "screen",
        "screen",
        expect.objectContaining({
          devicePixelRatio: 1.5,
          availHeight: 768,
          availLeft: 100,
          availTop: 50,
          availWidth: 1024,
          colorDepth: 32,
          height: 768,
          innerHeight: 768,
          innerWidth: 1024,
          left: 100,
          pixelDepth: 32,
          top: 50,
          width: 1024,
        })
      );
    });
  });
});
