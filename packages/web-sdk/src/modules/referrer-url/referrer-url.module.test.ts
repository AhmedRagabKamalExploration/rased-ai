import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ReferrerUrlModule } from "./referrer-url.module";
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

describe("ReferrerUrlModule", () => {
  let referrerUrlModule: ReferrerUrlModule;
  let mockDocument: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock document
    mockDocument = {
      referrer: "https://google.com",
    };

    global.document = mockDocument;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    referrerUrlModule = new ReferrerUrlModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(referrerUrlModule.moduleName).toBe("referrerUrl");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch referrer URL data", () => {
      referrerUrlModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "referrerUrl",
        "referrerUrl",
        expect.objectContaining({
          referrerUrl: "https://google.com",
          timestamp: expect.any(Number),
        })
      );
    });

    it("should handle collection errors gracefully", () => {
      // Mock document.referrer to throw error
      Object.defineProperty(global.document, "referrer", {
        get: () => {
          throw new Error("Referrer access denied");
        },
        configurable: true,
      });

      referrerUrlModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "referrerUrl",
        "referrerUrl.error",
        expect.objectContaining({
          error: "Referrer URL collection failed",
          errorCode: "COLLECTION_FAILED",
          details: expect.objectContaining({
            message: "Referrer access denied",
          }),
        })
      );
    });
  });

  describe("getReferrerUrl", () => {
    it("should return referrer URL when available", () => {
      // Access private method through any type
      const result = (referrerUrlModule as any).getReferrerUrl();

      expect(result).toBe("https://google.com");
    });

    it("should return 'direct' when no referrer is available", () => {
      global.document = {
        referrer: "",
      };

      // Access private method through any type
      const result = (referrerUrlModule as any).getReferrerUrl();

      expect(result).toBe("direct");
    });

    it("should return 'direct' when referrer is null", () => {
      global.document = {
        referrer: null,
      };

      // Access private method through any type
      const result = (referrerUrlModule as any).getReferrerUrl();

      expect(result).toBe("direct");
    });

    it("should return 'direct' when referrer is undefined", () => {
      global.document = {
        referrer: undefined,
      };

      // Access private method through any type
      const result = (referrerUrlModule as any).getReferrerUrl();

      expect(result).toBe("direct");
    });

    it("should return actual referrer URL when present", () => {
      global.document = {
        referrer: "https://example.com/page",
      };

      // Access private method through any type
      const result = (referrerUrlModule as any).getReferrerUrl();

      expect(result).toBe("https://example.com/page");
    });
  });

  describe("integration", () => {
    it("should handle complete referrer URL collection flow", () => {
      referrerUrlModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "referrerUrl",
        "referrerUrl",
        expect.objectContaining({
          referrerUrl: "https://google.com",
          timestamp: expect.any(Number),
        })
      );
    });

    it("should handle different referrer scenarios", () => {
      const testCases = [
        { referrer: "https://google.com", expected: "https://google.com" },
        { referrer: "https://bing.com", expected: "https://bing.com" },
        { referrer: "", expected: "direct" },
        { referrer: null, expected: "direct" },
        { referrer: undefined, expected: "direct" },
      ];

      testCases.forEach(({ referrer, expected }) => {
        global.document = { referrer };

        const newModule = new ReferrerUrlModule();
        newModule.init();

        expect(mockEventManager.dispatch).toHaveBeenCalledWith(
          "referrerUrl",
          "referrerUrl",
          expect.objectContaining({
            referrerUrl: expected,
            timestamp: expect.any(Number),
          })
        );
      });
    });

    it("should handle empty string referrer", () => {
      global.document = {
        referrer: "",
      };

      referrerUrlModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "referrerUrl",
        "referrerUrl",
        expect.objectContaining({
          referrerUrl: "direct",
          timestamp: expect.any(Number),
        })
      );
    });
  });
});
