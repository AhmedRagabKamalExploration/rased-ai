import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { SkipToContentModule } from "./skip-to-content.module";
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

describe("SkipToContentModule", () => {
  let skipToContentModule: SkipToContentModule;
  let mockDocument: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock document.querySelectorAll
    mockDocument = {
      querySelectorAll: vi.fn().mockReturnValue([]),
    };

    global.document = mockDocument;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    skipToContentModule = new SkipToContentModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(skipToContentModule.moduleName).toBe("skipToContent");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch skip-to-content data", () => {
      skipToContentModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "skipToContent",
        "skipToContent",
        expect.objectContaining({
          exists: expect.any(Boolean),
        })
      );
    });

    it("should handle detection errors gracefully", () => {
      // Mock querySelectorAll to throw error
      mockDocument.querySelectorAll.mockImplementation(() => {
        throw new Error("DOM query failed");
      });

      skipToContentModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "skipToContent",
        "skipToContent",
        expect.objectContaining({
          error: "Failed to run skip-to-content feature detection.",
        })
      );
    });
  });

  describe("detectSkipLink", () => {
    it("should detect skip link when found", () => {
      const mockLink = {
        textContent: "Skip to main content",
        getAttribute: vi.fn().mockReturnValue("#main"),
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      // Access private method through any type
      const result = (skipToContentModule as any).detectSkipLink();

      expect(result).toEqual({
        exists: true,
        text: "Skip to main content",
        href: "#main",
      });
    });

    it("should not detect skip link when not found", () => {
      const mockLink = {
        textContent: "Regular link",
        getAttribute: vi.fn().mockReturnValue("#other"),
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      // Access private method through any type
      const result = (skipToContentModule as any).detectSkipLink();

      expect(result).toEqual({
        exists: false,
      });
    });

    it("should detect skip link with different keywords", () => {
      const testCases = [
        { text: "Skip to navigation", href: "#nav" },
        { text: "Jump to content", href: "#content" },
        { text: "Go to main", href: "#main" },
      ];

      testCases.forEach(({ text, href }) => {
        const mockLink = {
          textContent: text,
          getAttribute: vi.fn().mockReturnValue(href),
        };

        mockDocument.querySelectorAll.mockReturnValue([mockLink]);

        // Access private method through any type
        const result = (skipToContentModule as any).detectSkipLink();

        expect(result).toEqual({
          exists: true,
          text: text,
          href: href,
        });
      });
    });

    it("should handle empty text content", () => {
      const mockLink = {
        textContent: "",
        getAttribute: vi.fn().mockReturnValue("#main"),
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      // Access private method through any type
      const result = (skipToContentModule as any).detectSkipLink();

      expect(result).toEqual({
        exists: false,
      });
    });

    it("should handle null text content", () => {
      const mockLink = {
        textContent: null,
        getAttribute: vi.fn().mockReturnValue("#main"),
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      // Access private method through any type
      const result = (skipToContentModule as any).detectSkipLink();

      expect(result).toEqual({
        exists: false,
      });
    });

    it("should handle missing href attribute", () => {
      const mockLink = {
        textContent: "Skip to content",
        getAttribute: vi.fn().mockReturnValue(null),
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      // Access private method through any type
      const result = (skipToContentModule as any).detectSkipLink();

      expect(result).toEqual({
        exists: true,
        text: "Skip to content",
        href: "",
      });
    });
  });

  describe("integration", () => {
    it("should handle complete skip-to-content detection flow", () => {
      const mockLink = {
        textContent: "Skip to main content",
        getAttribute: vi.fn().mockReturnValue("#main"),
      };

      mockDocument.querySelectorAll.mockReturnValue([mockLink]);

      skipToContentModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "skipToContent",
        "skipToContent",
        expect.objectContaining({
          exists: true,
          text: "Skip to main content",
          href: "#main",
        })
      );
    });

    it("should handle no skip links found", () => {
      mockDocument.querySelectorAll.mockReturnValue([]);

      skipToContentModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "skipToContent",
        "skipToContent",
        expect.objectContaining({
          exists: false,
        })
      );
    });
  });
});
