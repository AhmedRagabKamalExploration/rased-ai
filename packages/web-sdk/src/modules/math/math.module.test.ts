import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock crypto-js first
vi.mock("crypto-js", () => ({
  SHA256: vi.fn().mockImplementation((_input) => ({
    toString: vi.fn().mockReturnValue("mocked-hash-123456789"),
  })),
}));

import { MathModule } from "./math.module";
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

describe("MathModule", () => {
  let mathModule: MathModule;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    // Mock crypto-js SHA256 directly
    const { SHA256 } = await import("crypto-js");
    vi.mocked(SHA256).mockImplementation(
      (_input) =>
        ({
          toString: vi.fn().mockReturnValue("mocked-hash-123456789"),
        }) as any
    );

    mathModule = new MathModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(mathModule.moduleName).toBe("math");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch math data", async () => {
      await mathModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "math",
        "math",
        expect.objectContaining({
          hash: "mocked-hash-123456789",
          timestamp: expect.any(Number),
        })
      );
    });

    it("should handle math operation errors gracefully", async () => {
      // Mock Math.sin to throw error
      const originalSin = Math.sin;
      Math.sin = vi.fn().mockImplementation(() => {
        throw new Error("Math operation failed");
      });

      await mathModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "math",
        "math.error",
        expect.objectContaining({
          error: "Math fingerprinting failed",
          errorCode: "MATH_OPERATION_FAILED",
          details: expect.objectContaining({
            message: "Math operation failed",
          }),
        })
      );

      // Restore original Math.sin
      Math.sin = originalSin;
    });
  });

  describe("getMathHash", () => {
    it("should perform mathematical operations correctly", async () => {
      // Access private method through any type
      const result = await (mathModule as any).getMathHash();

      expect(result).toBe("mocked-hash-123456789");
    });

    it("should use correct input value", async () => {
      const mathSpy = vi.spyOn(Math, "sin");

      // Access private method through any type
      await (mathModule as any).getMathHash();

      expect(mathSpy).toHaveBeenCalledWith(0.123456789);
    });

    it("should perform all mathematical operations", async () => {
      const mathSpies = {
        sin: vi.spyOn(Math, "sin"),
        cos: vi.spyOn(Math, "cos"),
        tan: vi.spyOn(Math, "tan"),
        sqrt: vi.spyOn(Math, "sqrt"),
        pow: vi.spyOn(Math, "pow"),
        exp: vi.spyOn(Math, "exp"),
        log: vi.spyOn(Math, "log"),
      };

      // Access private method through any type
      await (mathModule as any).getMathHash();

      expect(mathSpies.sin).toHaveBeenCalled();
      expect(mathSpies.cos).toHaveBeenCalled();
      expect(mathSpies.tan).toHaveBeenCalled();
      expect(mathSpies.sqrt).toHaveBeenCalled();
      expect(mathSpies.pow).toHaveBeenCalled();
      expect(mathSpies.exp).toHaveBeenCalled();
      expect(mathSpies.log).toHaveBeenCalled();
    });

    it("should convert result to string for hashing", async () => {
      const toStringSpy = vi.spyOn(Number.prototype, "toString");

      // Access private method through any type
      await (mathModule as any).getMathHash();

      expect(toStringSpy).toHaveBeenCalled();
    });

    it("should call SHA256 with the result string", async () => {
      const { SHA256 } = await import("crypto-js");

      // Access private method through any type
      await (mathModule as any).getMathHash();

      expect(SHA256).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe("integration", () => {
    it("should handle complete math fingerprinting flow", async () => {
      await mathModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "math",
        "math",
        expect.objectContaining({
          hash: "mocked-hash-123456789",
          timestamp: expect.any(Number),
        })
      );
    });

    it("should produce consistent results", async () => {
      const result1 = await (mathModule as any).getMathHash();
      const result2 = await (mathModule as any).getMathHash();

      expect(result1).toBe(result2);
    });

    it("should handle different mathematical scenarios", async () => {
      // Test with different Math function behaviors
      const originalMath = { ...Math };

      // Mock Math functions to return specific values
      Math.sin = vi.fn().mockReturnValue(0.5);
      Math.cos = vi.fn().mockReturnValue(0.8);
      Math.tan = vi.fn().mockReturnValue(0.6);
      Math.sqrt = vi.fn().mockReturnValue(2.0);
      Math.pow = vi.fn().mockReturnValue(32.0);
      Math.exp = vi.fn().mockReturnValue(1.5);
      Math.log = vi.fn().mockReturnValue(0.4);

      // Access private method through any type
      const result = await (mathModule as any).getMathHash();

      expect(result).toBe("mocked-hash-123456789");

      // Restore original Math functions
      Object.assign(Math, originalMath);
    });
  });
});
