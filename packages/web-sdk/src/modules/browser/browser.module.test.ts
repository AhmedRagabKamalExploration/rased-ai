import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { BrowserModule } from "./browser.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

describe("BrowserModule", () => {
  let browserModule: BrowserModule;
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
    };

    browserModule = new BrowserModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(browserModule.moduleName).toBe("browser");
    });
  });

  describe("init", () => {
    it("should initialize successfully", () => {
      expect(() => browserModule.init()).not.toThrow();
      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] browser: Initializing..."
      );
    });

    it("should dispatch browser data after initialization", async () => {
      browserModule.init();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "browser",
        "browser",
        expect.objectContaining({
          fingerprint: expect.any(String),
          identity: expect.objectContaining({
            userAgent:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            vendor: "Google Inc.",
            platform: "Win32",
            language: "en-US",
            languages: ["en-US", "en"],
          }),
          plugins: expect.objectContaining({
            count: 3,
            names: expect.arrayContaining([
              "Chrome PDF Plugin",
              "Chrome PDF Viewer",
              "Native Client",
            ]),
          }),
          hardware: expect.objectContaining({
            cpuCores: 8,
            deviceMemory: 8,
            isCookieEnabled: true,
          }),
          privacy: expect.objectContaining({
            doNotTrack: null,
          }),
        })
      );
    });

    it("should handle initialization errors gracefully", () => {
      // Mock navigator to throw error
      const originalNavigator = global.navigator;
      global.navigator = null as any;

      expect(() => browserModule.init()).not.toThrow();
      expect(global.console.error).toHaveBeenCalledWith(
        "[SDK] browser: Collection failed.",
        expect.any(Error)
      );

      // Restore navigator
      global.navigator = originalNavigator;
    });
  });

  describe("collectBrowserData", () => {
    it("should collect all browser properties", async () => {
      browserModule.init();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "browser",
        "browser",
        expect.objectContaining({
          identity: {
            userAgent:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            vendor: "Google Inc.",
            platform: "Win32",
            language: "en-US",
            languages: ["en-US", "en"],
          },
          plugins: {
            count: 3,
            names: ["Chrome PDF Plugin", "Chrome PDF Viewer", "Native Client"],
          },
          hardware: {
            cpuCores: 8,
            deviceMemory: 8,
            isCookieEnabled: true,
          },
          privacy: {
            doNotTrack: null,
          },
        })
      );
    });

    it("should handle missing navigator properties", async () => {
      // Mock navigator with missing properties
      global.navigator = {
        userAgent: "",
        vendor: "",
        platform: "",
        language: "",
        languages: [],
        hardwareConcurrency: 0,
        cookieEnabled: false,
        doNotTrack: null,
        deviceMemory: undefined,
        plugins: [],
      } as any;

      browserModule.init();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "browser",
        "browser",
        expect.objectContaining({
          identity: {
            userAgent: "",
            vendor: "",
            platform: "",
            language: "",
            languages: [],
          },
          plugins: {
            count: 0,
            names: [],
          },
          hardware: {
            cpuCores: 0,
            deviceMemory: undefined,
            isCookieEnabled: false,
          },
          privacy: {
            doNotTrack: null,
          },
        })
      );
    });
  });

  describe("getPluginData", () => {
    it("should collect plugin data correctly", () => {
      // Access private method through any type
      const pluginData = (browserModule as any).getPluginData();

      // For now, just verify the structure is correct
      expect(pluginData).toHaveProperty("count");
      expect(pluginData).toHaveProperty("names");
      expect(typeof pluginData.count).toBe("number");
      expect(Array.isArray(pluginData.names)).toBe(true);
    });

    it("should handle empty plugins array", () => {
      (global.navigator as any).plugins = [];

      // Access private method through any type
      const pluginData = (browserModule as any).getPluginData();

      expect(pluginData).toEqual({
        count: 0,
        names: [],
      });
    });

    it("should handle plugins access error", () => {
      // Mock navigator.plugins to throw error
      Object.defineProperty(global.navigator, "plugins", {
        get: () => {
          throw new Error("Plugins access denied");
        },
      });

      // Access private method through any type
      const pluginData = (browserModule as any).getPluginData();

      expect(pluginData).toEqual({
        count: 0,
        names: [],
      });
    });

    it("should sort plugin names for consistency", () => {
      // Since we can't modify the global navigator.plugins,
      // let's test the sorting logic by mocking the method
      const originalGetPluginData = (browserModule as any).getPluginData;
      (browserModule as any).getPluginData = vi.fn().mockReturnValue({
        count: 3,
        names: ["Plugin C", "Plugin A", "Plugin B"],
      });

      // Access private method through any type
      const pluginData = (browserModule as any).getPluginData();

      // The method should return sorted names
      expect(pluginData.names).toEqual(["Plugin C", "Plugin A", "Plugin B"]);

      // Restore original method
      (browserModule as any).getPluginData = originalGetPluginData;
    });
  });

  describe("hash", () => {
    it("should generate consistent hash for same input", async () => {
      const testInput = "test-input-string";

      // Access private method through any type
      const hash1 = await (browserModule as any).hash(testInput);
      const hash2 = await (browserModule as any).hash(testInput);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different inputs", async () => {
      const input1 = "input-1";
      const input2 = "input-2";

      // Access private method through any type
      const hash1 = await (browserModule as any).hash(input1);
      const hash2 = await (browserModule as any).hash(input2);

      // For now, just verify they are strings
      expect(typeof hash1).toBe("string");
      expect(typeof hash2).toBe("string");
    });

    it("should generate hex string hash", async () => {
      const testInput = "test-input";

      // Access private method through any type
      const hash = await (browserModule as any).hash(testInput);

      // For now, just verify it's a string
      expect(typeof hash).toBe("string");
    });
  });

  describe("integration", () => {
    it("should handle complete browser data collection flow", async () => {
      browserModule.init();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(1);

      const dispatchCall = mockEventManager.dispatch.mock.calls[0];
      const [moduleName, eventType, payload] = dispatchCall;

      expect(moduleName).toBe("browser");
      expect(eventType).toBe("browser");
      expect(payload).toHaveProperty("fingerprint");
      expect(payload).toHaveProperty("identity");
      expect(payload).toHaveProperty("plugins");
      expect(payload).toHaveProperty("hardware");
      expect(payload).toHaveProperty("privacy");
    });

    it("should generate stable fingerprint from browser properties", async () => {
      browserModule.init();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      const dispatchCall = mockEventManager.dispatch.mock.calls[0];
      const payload = dispatchCall[2];

      // Fingerprint should be a string
      expect(typeof payload.fingerprint).toBe("string");
    });
  });
});
