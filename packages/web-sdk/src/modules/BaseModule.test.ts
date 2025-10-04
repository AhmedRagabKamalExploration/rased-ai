import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { BaseModule } from "./BaseModule";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

// Create a concrete implementation for testing
class TestModule extends BaseModule {
  public readonly moduleName: string = "test-module";
  public initCalled = false;

  public init(): void {
    this.initCalled = true;
  }
}

describe("BaseModule", () => {
  let testModule: TestModule;
  let mockEventManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock event manager
    mockEventManager = {
      dispatch: vi.fn(),
    };

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock document methods
    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    testModule = new TestModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with event manager", () => {
      expect(testModule.eventManager).toBe(mockEventManager);
    });

    it("should initialize with empty listeners array", () => {
      // Access private property through any type
      const privateProps = testModule as any;
      expect(privateProps.listeners).toEqual([]);
    });
  });

  describe("moduleName", () => {
    it("should have module name", () => {
      expect(testModule.moduleName).toBe("test-module");
    });
  });

  describe("init", () => {
    it("should be implemented by concrete classes", () => {
      expect(testModule.initCalled).toBe(false);
      testModule.init();
      expect(testModule.initCalled).toBe(true);
    });
  });

  describe("addListener", () => {
    it("should add event listener and track it", () => {
      const mockTarget = {
        addEventListener: vi.fn(),
      };
      const mockListener = vi.fn();

      testModule.addListener(mockTarget as any, "click", mockListener);

      expect(mockTarget.addEventListener).toHaveBeenCalledWith(
        "click",
        mockListener,
        undefined
      );

      // Access private property through any type
      const privateProps = testModule as any;
      expect(privateProps.listeners).toHaveLength(1);
      expect(privateProps.listeners[0]).toEqual({
        target: mockTarget,
        type: "click",
        listener: mockListener,
      });
    });

    it("should add listener with options", () => {
      const mockTarget = {
        addEventListener: vi.fn(),
      };
      const mockListener = vi.fn();
      const options = { once: true, passive: true };

      testModule.addListener(
        mockTarget as any,
        "scroll",
        mockListener,
        options
      );

      expect(mockTarget.addEventListener).toHaveBeenCalledWith(
        "scroll",
        mockListener,
        options
      );

      // Access private property through any type
      const privateProps = testModule as any;
      expect(privateProps.listeners).toHaveLength(1);
    });

    it("should track multiple listeners", () => {
      const mockTarget1 = { addEventListener: vi.fn() };
      const mockTarget2 = { addEventListener: vi.fn() };
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      testModule.addListener(mockTarget1 as any, "click", mockListener1);
      testModule.addListener(mockTarget2 as any, "scroll", mockListener2);

      // Access private property through any type
      const privateProps = testModule as any;
      expect(privateProps.listeners).toHaveLength(2);
      expect(privateProps.listeners[0].target).toBe(mockTarget1);
      expect(privateProps.listeners[1].target).toBe(mockTarget2);
    });
  });

  describe("destroy", () => {
    it("should remove all tracked listeners", () => {
      const mockTarget1 = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      const mockTarget2 = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      testModule.addListener(mockTarget1 as any, "click", mockListener1);
      testModule.addListener(mockTarget2 as any, "scroll", mockListener2);

      testModule.destroy();

      expect(mockTarget1.removeEventListener).toHaveBeenCalledWith(
        "click",
        mockListener1
      );
      expect(mockTarget2.removeEventListener).toHaveBeenCalledWith(
        "scroll",
        mockListener2
      );

      // Access private property through any type
      const privateProps = testModule as any;
      expect(privateProps.listeners).toEqual([]);
    });

    it("should handle destroy when no listeners exist", () => {
      expect(() => testModule.destroy()).not.toThrow();

      // Access private property through any type
      const privateProps = testModule as any;
      expect(privateProps.listeners).toEqual([]);
    });

    it("should handle destroy when listeners have errors", () => {
      const mockTarget = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn().mockImplementation(() => {
          throw new Error("Remove listener error");
        }),
      };
      const mockListener = vi.fn();

      testModule.addListener(mockTarget as any, "click", mockListener);

      // Should not throw even if removeEventListener fails
      expect(() => testModule.destroy()).not.toThrow();
    });
  });

  describe("integration", () => {
    it("should handle complete listener lifecycle", () => {
      const mockTarget = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      const mockListener = vi.fn();

      // Add listener
      testModule.addListener(mockTarget as any, "click", mockListener);

      // Access private property through any type
      let privateProps = testModule as any;
      expect(privateProps.listeners).toHaveLength(1);

      // Destroy module
      testModule.destroy();

      expect(mockTarget.removeEventListener).toHaveBeenCalledWith(
        "click",
        mockListener
      );

      privateProps = testModule as any;
      expect(privateProps.listeners).toEqual([]);
    });

    it("should handle multiple add-destroy cycles", () => {
      const mockTarget = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      // First cycle
      testModule.addListener(mockTarget as any, "click", mockListener1);
      testModule.destroy();

      // Second cycle
      testModule.addListener(mockTarget as any, "scroll", mockListener2);

      // Access private property through any type
      let privateProps = testModule as any;
      expect(privateProps.listeners).toHaveLength(1);
      expect(privateProps.listeners[0].type).toBe("scroll");

      testModule.destroy();

      privateProps = testModule as any;
      expect(privateProps.listeners).toEqual([]);
    });
  });

  describe("abstract methods", () => {
    it("should require concrete classes to implement init", () => {
      // This test ensures that BaseModule is abstract
      // In TypeScript, we can't directly test abstract classes,
      // but we can verify that concrete implementations work
      expect(typeof testModule.init).toBe("function");
    });

    it("should require concrete classes to define moduleName", () => {
      expect(testModule.moduleName).toBeDefined();
      expect(typeof testModule.moduleName).toBe("string");
    });
  });
});
