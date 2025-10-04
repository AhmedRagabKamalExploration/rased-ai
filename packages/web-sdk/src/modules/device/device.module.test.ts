import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { DeviceModule } from "./device.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

describe("DeviceModule", () => {
  let deviceModule: DeviceModule;
  let mockEventManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock event manager
    mockEventManager = {
      dispatch: vi.fn(),
    };

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock navigator
    global.navigator = {
      hardwareConcurrency: 8,
      language: "en-US",
      languages: ["en-US", "en"],
      platform: "Win32",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      deviceMemory: 8,
    } as any;

    // Mock document
    global.document = {
      createElement: vi.fn().mockReturnValue({
        getContext: vi.fn().mockReturnValue({
          getExtension: vi.fn().mockReturnValue({
            UNMASKED_VENDOR_WEBGL: "vendor-param",
            UNMASKED_RENDERER_WEBGL: "renderer-param",
          }),
          getParameter: vi.fn().mockImplementation((param) => {
            if (param === "vendor-param") return "NVIDIA Corporation";
            if (param === "renderer-param") return "GeForce RTX 3080";
            if (param === 37445) return "NVIDIA Corporation"; // VENDOR
            if (param === 37446) return "GeForce RTX 3080"; // RENDERER
            return "unknown";
          }),
        }),
      }),
    } as any;

    // Mock window.matchMedia
    global.window = {
      matchMedia: vi.fn().mockImplementation((query) => ({
        matches: query === "(color-gamut: p3)",
      })),
    } as any;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    // Mock Date.now
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    deviceModule = new DeviceModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(deviceModule.moduleName).toBe("device");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch device data", async () => {
      await deviceModule.init();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] device: Initializing..."
      );

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "device",
        "device",
        expect.objectContaining({
          hardwareConcurrency: 8,
          language: "en-US",
          languages: ["en-US", "en"],
          platform: "Win32",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          gpuVendor: "NVIDIA Corporation",
          gpuModel: "GeForce RTX 3080",
          colorGamut: "p3",
          deviceMemory: 8,
          timestamp: 1234567890,
        })
      );
    });

    it("should handle initialization errors gracefully", async () => {
      // Mock navigator to throw error
      global.navigator = null as any;

      await deviceModule.init();

      expect(global.console.error).toHaveBeenCalledWith(
        "[SDK] device: Collection failed.",
        expect.any(Error)
      );

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "device",
        "device.error",
        {
          error: "Device data collection failed",
          errorCode: "UNEXPECTED_ERROR",
          details: {
            message: expect.any(String),
          },
        }
      );
    });
  });

  describe("getDeviceData", () => {
    it("should collect device data correctly", async () => {
      // Access private method through any type
      const deviceData = await (deviceModule as any).getDeviceData();

      expect(deviceData).toEqual({
        hardwareConcurrency: 8,
        language: "en-US",
        languages: ["en-US", "en"],
        platform: "Win32",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        gpuVendor: "NVIDIA Corporation",
        gpuModel: "GeForce RTX 3080",
        colorGamut: "p3",
        deviceMemory: 8,
        timestamp: 1234567890,
      });
    });

    it("should handle missing device memory", async () => {
      (global.navigator as any).deviceMemory = undefined;

      // Access private method through any type
      const deviceData = await (deviceModule as any).getDeviceData();

      expect(deviceData.deviceMemory).toBeUndefined();
    });

    it("should handle missing navigator properties", async () => {
      global.navigator = {
        hardwareConcurrency: undefined,
        language: undefined,
        languages: undefined,
        platform: undefined,
        userAgent: undefined,
      } as any;

      // Access private method through any type
      const deviceData = await (deviceModule as any).getDeviceData();

      expect(deviceData.hardwareConcurrency).toBeUndefined();
      expect(deviceData.language).toBeUndefined();
      expect(deviceData.languages).toBeUndefined();
      expect(deviceData.platform).toBeUndefined();
      expect(deviceData.userAgent).toBeUndefined();
    });
  });

  describe("getGPUInfo", () => {
    it("should extract GPU info using WebGL debug extension", () => {
      // Access private method through any type
      const gpuInfo = (deviceModule as any).getGPUInfo();

      expect(gpuInfo).toEqual({
        vendor: "NVIDIA Corporation",
        model: "GeForce RTX 3080",
      });
    });

    it("should fallback to basic WebGL parameters when debug extension unavailable", () => {
      // Mock WebGL context without debug extension
      global.document.createElement = vi.fn().mockReturnValue({
        getContext: vi.fn().mockReturnValue({
          getExtension: vi.fn().mockReturnValue(null), // No debug extension
          VENDOR: 37445, // WebGL VENDOR constant
          RENDERER: 37446, // WebGL RENDERER constant
          getParameter: vi.fn().mockImplementation((param) => {
            if (param === 37445) return "AMD Corporation"; // VENDOR
            if (param === 37446) return "Radeon RX 6800"; // RENDERER
            return "unknown";
          }),
        }),
      });

      // Access private method through any type
      const gpuInfo = (deviceModule as any).getGPUInfo();

      expect(gpuInfo).toEqual({
        vendor: "AMD Corporation",
        model: "Radeon RX 6800",
      });
    });

    it("should handle WebGL context creation failure", () => {
      // Mock document.createElement to throw error
      global.document.createElement = vi.fn().mockImplementation(() => {
        throw new Error("Canvas creation failed");
      });

      // Access private method through any type
      const gpuInfo = (deviceModule as any).getGPUInfo();

      expect(gpuInfo).toEqual({
        vendor: "unknown",
        model: "unknown",
      });

      expect(global.console.warn).toHaveBeenCalledWith(
        "[DeviceModule] Failed to get WebGL GPU info.",
        expect.any(Error)
      );
    });

    it("should handle WebGL context unavailable", () => {
      // Mock getContext to return null
      global.document.createElement = vi.fn().mockReturnValue({
        getContext: vi.fn().mockReturnValue(null),
      });

      // Access private method through any type
      const gpuInfo = (deviceModule as any).getGPUInfo();

      expect(gpuInfo).toEqual({
        vendor: "unknown",
        model: "unknown",
      });
    });

    it("should handle experimental WebGL context", () => {
      // Mock experimental WebGL context
      global.document.createElement = vi.fn().mockReturnValue({
        getContext: vi.fn().mockImplementation((contextType) => {
          if (contextType === "webgl") return null;
          if (contextType === "experimental-webgl")
            return {
              getExtension: vi.fn().mockReturnValue({
                UNMASKED_VENDOR_WEBGL: "vendor-param",
                UNMASKED_RENDERER_WEBGL: "renderer-param",
              }),
              getParameter: vi.fn().mockImplementation((param) => {
                if (param === "vendor-param") return "Intel Corporation";
                if (param === "renderer-param") return "Intel HD Graphics";
                return "unknown";
              }),
            };
          return null;
        }),
      });

      // Access private method through any type
      const gpuInfo = (deviceModule as any).getGPUInfo();

      expect(gpuInfo).toEqual({
        vendor: "Intel Corporation",
        model: "Intel HD Graphics",
      });
    });
  });

  describe("getColorGamut", () => {
    it("should detect p3 color gamut", () => {
      global.window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(color-gamut: p3)",
      }));

      // Access private method through any type
      const colorGamut = (deviceModule as any).getColorGamut();

      expect(colorGamut).toBe("p3");
    });

    it("should detect rec2020 color gamut", () => {
      global.window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(color-gamut: rec2020)",
      }));

      // Access private method through any type
      const colorGamut = (deviceModule as any).getColorGamut();

      expect(colorGamut).toBe("rec2020");
    });

    it("should detect srgb color gamut", () => {
      global.window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(color-gamut: srgb)",
      }));

      // Access private method through any type
      const colorGamut = (deviceModule as any).getColorGamut();

      expect(colorGamut).toBe("srgb");
    });

    it("should return unknown when no color gamut matches", () => {
      global.window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }));

      // Access private method through any type
      const colorGamut = (deviceModule as any).getColorGamut();

      expect(colorGamut).toBe("unknown");
    });

    it("should return unknown when matchMedia is unavailable", () => {
      global.window = {} as any;

      // Access private method through any type
      const colorGamut = (deviceModule as any).getColorGamut();

      expect(colorGamut).toBe("unknown");
    });
  });

  describe("integration", () => {
    it("should handle complete device data collection flow", async () => {
      await deviceModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(1);

      const dispatchCall = mockEventManager.dispatch.mock.calls[0];
      const [moduleName, eventType, payload] = dispatchCall;

      expect(moduleName).toBe("device");
      expect(eventType).toBe("device");
      expect(payload).toHaveProperty("hardwareConcurrency");
      expect(payload).toHaveProperty("language");
      expect(payload).toHaveProperty("languages");
      expect(payload).toHaveProperty("platform");
      expect(payload).toHaveProperty("userAgent");
      expect(payload).toHaveProperty("gpuVendor");
      expect(payload).toHaveProperty("gpuModel");
      expect(payload).toHaveProperty("colorGamut");
      expect(payload).toHaveProperty("deviceMemory");
      expect(payload).toHaveProperty("timestamp");
    });

    it("should handle different GPU scenarios", async () => {
      const gpuScenarios = [
        { vendor: "NVIDIA Corporation", model: "GeForce RTX 3080" },
        { vendor: "AMD Corporation", model: "Radeon RX 6800" },
        { vendor: "Intel Corporation", model: "Intel HD Graphics" },
        { vendor: "unknown", model: "unknown" },
      ];

      for (const scenario of gpuScenarios) {
        global.document.createElement = vi.fn().mockReturnValue({
          getContext: vi.fn().mockReturnValue({
            getExtension: vi.fn().mockReturnValue({
              UNMASKED_VENDOR_WEBGL: "vendor-param",
              UNMASKED_RENDERER_WEBGL: "renderer-param",
            }),
            getParameter: vi.fn().mockImplementation((param) => {
              if (param === "vendor-param") return scenario.vendor;
              if (param === "renderer-param") return scenario.model;
              return "unknown";
            }),
          }),
        });

        const newDeviceModule = new DeviceModule();
        await newDeviceModule.init();

        expect(mockEventManager.dispatch).toHaveBeenCalledWith(
          "device",
          "device",
          expect.objectContaining({
            gpuVendor: scenario.vendor,
            gpuModel: scenario.model,
          })
        );
      }
    });

    it("should handle different color gamut scenarios", async () => {
      const colorGamutScenarios = [
        { query: "(color-gamut: rec2020)", expected: "rec2020" },
        { query: "(color-gamut: p3)", expected: "p3" },
        { query: "(color-gamut: srgb)", expected: "srgb" },
        { query: "no-match", expected: "unknown" },
      ];

      for (const scenario of colorGamutScenarios) {
        global.window.matchMedia = vi.fn().mockImplementation((query) => ({
          matches: query === scenario.query,
        }));

        const newDeviceModule = new DeviceModule();
        await newDeviceModule.init();

        expect(mockEventManager.dispatch).toHaveBeenCalledWith(
          "device",
          "device",
          expect.objectContaining({
            colorGamut: scenario.expected,
          })
        );
      }
    });
  });
});
