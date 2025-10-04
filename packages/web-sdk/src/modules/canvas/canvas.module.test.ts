import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { CanvasModule } from "./canvas.module";
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

describe("CanvasModule", () => {
  let canvasModule: CanvasModule;
  let mockDocument: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock document.createElement for canvas
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({
        fillText: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 100 }),
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8]),
        }),
      }),
      toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
    };

    mockDocument = {
      createElement: vi.fn().mockImplementation((tagName) => {
        if (tagName === "canvas") return mockCanvas;
        return {};
      }),
    };

    global.document = mockDocument;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    canvasModule = new CanvasModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(canvasModule.moduleName).toBe("canvas");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch canvas data", () => {
      canvasModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "canvas",
        "canvas",
        expect.objectContaining({
          short: expect.any(String),
          long: expect.any(String),
        })
      );
    });

    it("should handle canvas creation errors gracefully", () => {
      // Mock createElement to throw error
      mockDocument.createElement.mockImplementation(() => {
        throw new Error("Canvas creation failed");
      });

      canvasModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "canvas",
        "canvas",
        expect.objectContaining({
          short: "error",
          long: "canvas_fingerprinting_failed",
        })
      );
    });
  });

  describe("integration", () => {
    it("should handle complete canvas fingerprinting flow", () => {
      canvasModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "canvas",
        "canvas",
        expect.objectContaining({
          short: expect.any(String),
          long: expect.any(String),
        })
      );
    });
  });
});
