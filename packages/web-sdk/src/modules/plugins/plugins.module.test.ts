import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PluginsModule } from "./plugins.module";
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

describe("PluginsModule", () => {
  let pluginsModule: PluginsModule;
  let mockNavigator: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock navigator.plugins
    const mockPlugin1 = {
      name: "Chrome PDF Plugin",
      description: "Portable Document Format",
      filename: "internal-pdf-viewer",
      length: 2,
      0: {
        type: "application/pdf",
        description: "Portable Document Format",
        suffixes: "pdf",
      },
      1: {
        type: "text/pdf",
        description: "Portable Document Format",
        suffixes: "pdf",
      },
    };

    const mockPlugin2 = {
      name: "Chrome PDF Viewer",
      description: "Portable Document Format",
      filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
      length: 1,
      0: {
        type: "application/pdf",
        description: "Portable Document Format",
        suffixes: "pdf",
      },
    };

    mockNavigator = {
      plugins: [mockPlugin1, mockPlugin2],
    };

    global.navigator = mockNavigator;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    pluginsModule = new PluginsModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(pluginsModule.moduleName).toBe("plugins");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch plugins data", () => {
      pluginsModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "plugins",
        "plugins",
        expect.objectContaining({
          plugins: expect.any(Array),
          timestamp: expect.any(Number),
        })
      );
    });

    it("should handle collection errors gracefully", () => {
      // Mock navigator.plugins to throw error
      Object.defineProperty(global.navigator, "plugins", {
        get: () => {
          throw new Error("Plugins access denied");
        },
        configurable: true,
      });

      pluginsModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "plugins",
        "plugins.error",
        expect.objectContaining({
          error: "Plugin collection failed",
          errorCode: "PLUGIN_COLLECTION_FAILED",
          details: expect.objectContaining({
            message: "Plugins access denied",
          }),
        })
      );
    });
  });

  describe("collectPlugins", () => {
    it("should collect plugin data correctly", () => {
      // Access private method through any type
      const result = (pluginsModule as any).collectPlugins();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "Chrome PDF Plugin",
        description: "Portable Document Format",
        filename: "internal-pdf-viewer",
        mime: [
          {
            type: "application/pdf",
            description: "Portable Document Format",
            suffixes: "pdf",
          },
          {
            type: "text/pdf",
            description: "Portable Document Format",
            suffixes: "pdf",
          },
        ],
      });
      expect(result[1]).toEqual({
        name: "Chrome PDF Viewer",
        description: "Portable Document Format",
        filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
        mime: [
          {
            type: "application/pdf",
            description: "Portable Document Format",
            suffixes: "pdf",
          },
        ],
      });
    });

    it("should handle empty plugins array", () => {
      global.navigator = {
        plugins: [],
      };

      // Access private method through any type
      const result = (pluginsModule as any).collectPlugins();

      expect(result).toEqual([]);
    });

    it("should handle undefined plugins", () => {
      global.navigator = {
        plugins: undefined,
      };

      // Access private method through any type
      const result = (pluginsModule as any).collectPlugins();

      expect(result).toEqual([]);
    });

    it("should handle plugins with no MIME types", () => {
      const mockPlugin = {
        name: "Test Plugin",
        description: "Test Description",
        filename: "test.dll",
        length: 0,
      };

      global.navigator = {
        plugins: [mockPlugin],
      };

      // Access private method through any type
      const result = (pluginsModule as any).collectPlugins();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "Test Plugin",
        description: "Test Description",
        filename: "test.dll",
        mime: [],
      });
    });

    it("should collect MIME type data for each plugin", () => {
      const mockPlugin = {
        name: "Multi-MIME Plugin",
        description: "Plugin with multiple MIME types",
        filename: "multi-mime.dll",
        length: 3,
        0: {
          type: "image/jpeg",
          description: "JPEG image",
          suffixes: "jpg,jpeg",
        },
        1: {
          type: "image/png",
          description: "PNG image",
          suffixes: "png",
        },
        2: {
          type: "image/gif",
          description: "GIF image",
          suffixes: "gif",
        },
      };

      global.navigator = {
        plugins: [mockPlugin],
      };

      // Access private method through any type
      const result = (pluginsModule as any).collectPlugins();

      expect(result[0].mime).toHaveLength(3);
      expect(result[0].mime[0]).toEqual({
        type: "image/jpeg",
        description: "JPEG image",
        suffixes: "jpg,jpeg",
      });
      expect(result[0].mime[1]).toEqual({
        type: "image/png",
        description: "PNG image",
        suffixes: "png",
      });
      expect(result[0].mime[2]).toEqual({
        type: "image/gif",
        description: "GIF image",
        suffixes: "gif",
      });
    });
  });

  describe("integration", () => {
    it("should handle complete plugin collection flow", () => {
      pluginsModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "plugins",
        "plugins",
        expect.objectContaining({
          plugins: expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(String),
              description: expect.any(String),
              filename: expect.any(String),
              mime: expect.any(Array),
            }),
          ]),
          timestamp: expect.any(Number),
        })
      );
    });

    it("should handle different plugin scenarios", () => {
      // Test with different plugin configurations
      const mockPlugin = {
        name: "Custom Plugin",
        description: "Custom Description",
        filename: "custom.dll",
        length: 1,
        0: {
          type: "application/x-custom",
          description: "Custom file type",
          suffixes: "custom",
        },
      };

      global.navigator = {
        plugins: [mockPlugin],
      };

      pluginsModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "plugins",
        "plugins",
        expect.objectContaining({
          plugins: [
            {
              name: "Custom Plugin",
              description: "Custom Description",
              filename: "custom.dll",
              mime: [
                {
                  type: "application/x-custom",
                  description: "Custom file type",
                  suffixes: "custom",
                },
              ],
            },
          ],
          timestamp: expect.any(Number),
        })
      );
    });
  });
});
