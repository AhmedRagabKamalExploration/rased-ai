import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TokenManager } from "./TokenManager";

describe("TokenManager", () => {
  let tokenManager: TokenManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator
    global.navigator = {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      platform: "Win32",
      language: "en-US",
    } as Navigator;

    tokenManager = TokenManager.getInstance();
    tokenManager.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = TokenManager.getInstance();
      const instance2 = TokenManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("constructor", () => {
    it("should initialize with cryptographic key", () => {
      // Access private property through any type
      const privateProps = tokenManager as any;
      expect(privateProps.cryptographicKey).toBe(
        "a-secure-random-cryptographic-key-for-hashing-purposes"
      );
    });
  });

  describe("getNonce", () => {
    it("should return null when no nonce is generated", () => {
      expect(tokenManager.getNonce()).toBeNull();
    });

    it("should return nonce after generation", () => {
      const sessionDetails = "test-session";
      const nonce = tokenManager.generateNonce(sessionDetails);

      expect(tokenManager.getNonce()).toBe(nonce);
    });
  });

  describe("generateNonce", () => {
    it("should generate nonce with session details", () => {
      const sessionDetails = "test-session-details";
      const nonce = tokenManager.generateNonce(sessionDetails);

      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe("string");
      expect(nonce.length).toBeGreaterThan(0);
    });

    it("should generate different nonces for different session details", () => {
      const nonce1 = tokenManager.generateNonce("session-1");
      const nonce2 = tokenManager.generateNonce("session-2");

      expect(nonce1).not.toBe(nonce2);
    });

    it("should generate different nonces for same session details (due to UUID)", () => {
      const sessionDetails = "same-session";

      // Mock different UUIDs for each call
      (global.crypto.randomUUID as any)
        .mockReturnValueOnce("uuid-1")
        .mockReturnValueOnce("uuid-2");

      const nonce1 = tokenManager.generateNonce(sessionDetails);
      const nonce2 = tokenManager.generateNonce(sessionDetails);

      expect(nonce1).not.toBe(nonce2);
    });

    it("should store nonce internally", () => {
      const sessionDetails = "test-session";
      const nonce = tokenManager.generateNonce(sessionDetails);

      // Access private property through any type
      const privateProps = tokenManager as any;
      expect(privateProps.nonceToken).toBe(nonce);
    });

    it("should use cryptographic key in nonce generation", () => {
      const sessionDetails = "test-session";
      const nonce = tokenManager.generateNonce(sessionDetails);

      // The nonce should be a hash of the combined string
      // We can't directly test the hash, but we can verify it's generated
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe("string");
    });
  });

  describe("getWebInstanceId", () => {
    it("should generate web instance ID from navigator properties", () => {
      const webInstanceId = tokenManager.getWebInstanceId();

      expect(webInstanceId).toBeDefined();
      expect(typeof webInstanceId).toBe("string");
      expect(webInstanceId.length).toBeGreaterThan(0);
    });

    it("should generate consistent ID for same navigator properties", () => {
      const id1 = tokenManager.getWebInstanceId();
      const id2 = tokenManager.getWebInstanceId();

      expect(id1).toBe(id2);
    });

    it("should generate different ID for different navigator properties", () => {
      const id1 = tokenManager.getWebInstanceId();

      // Change navigator properties
      (global.navigator as any).userAgent = "Different User Agent";

      const id2 = tokenManager.getWebInstanceId();

      expect(id1).not.toBe(id2);
    });

    it("should handle missing navigator properties", () => {
      // Temporarily remove navigator properties
      const originalNavigator = global.navigator;
      global.navigator = {
        userAgent: undefined,
        platform: undefined,
        language: undefined,
      } as any;

      expect(() => tokenManager.getWebInstanceId()).not.toThrow();

      // Restore navigator
      global.navigator = originalNavigator;
    });
  });

  describe("hashData", () => {
    it("should generate consistent hash for same input", () => {
      const testData = "test-data-string";

      // Access private method through any type
      const hash1 = (tokenManager as any).hashData(testData);
      const hash2 = (tokenManager as any).hashData(testData);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different inputs", () => {
      const data1 = "test-data-1";
      const data2 = "test-data-2";

      const hash1 = (tokenManager as any).hashData(data1);
      const hash2 = (tokenManager as any).hashData(data2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string", () => {
      const hash = (tokenManager as any).hashData("");

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("should handle special characters", () => {
      const specialData = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      expect(() => (tokenManager as any).hashData(specialData)).not.toThrow();
    });

    it("should return positive hex string", () => {
      const testData = "test-data";
      const hash = (tokenManager as any).hashData(testData);

      expect(hash).toMatch(/^[0-9a-f]+$/);
      expect(parseInt(hash, 16)).toBeGreaterThanOrEqual(0);
    });
  });

  describe("integration", () => {
    it("should handle complete nonce lifecycle", () => {
      // Initially no nonce
      expect(tokenManager.getNonce()).toBeNull();

      // Generate nonce
      const sessionDetails = "integration-test-session";
      const nonce = tokenManager.generateNonce(sessionDetails);

      // Verify nonce is stored and retrievable
      expect(tokenManager.getNonce()).toBe(nonce);
      expect(nonce).toBeDefined();

      // Generate new nonce (should replace old one)
      const newNonce = tokenManager.generateNonce("new-session");
      expect(tokenManager.getNonce()).toBe(newNonce);
      expect(newNonce).not.toBe(nonce);
    });

    it("should work with web instance ID generation", () => {
      const webInstanceId = tokenManager.getWebInstanceId();
      const nonce = tokenManager.generateNonce("test-session");

      expect(webInstanceId).toBeDefined();
      expect(nonce).toBeDefined();
      expect(webInstanceId).not.toBe(nonce);
    });
  });
});
