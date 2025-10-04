import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { APIManager } from "./APIManager";
import { ConfigManager } from "./ConfigManager";

// Mock ConfigManager
vi.mock("./ConfigManager", () => ({
  ConfigManager: {
    getInstance: vi.fn(),
  },
}));

describe("APIManager", () => {
  let apiManager: APIManager;
  let mockConfigManager: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock config manager
    mockConfigManager = {
      config: {
        baseApiUrl: "https://api.example.com",
        organizationId: "org-123",
        sessionId: "session-456",
        transactionId: "txn-789",
      },
    };

    // Mock ConfigManager.getInstance to return our mock
    (ConfigManager.getInstance as any).mockReturnValue(mockConfigManager);

    // Get fresh instance
    apiManager = APIManager.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = APIManager.getInstance();
      const instance2 = APIManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("initialize", () => {
    it("should successfully initialize and get session token", async () => {
      // Mock crypto.subtle.digest for this test
      const mockDigest = vi.fn().mockImplementation(async (_algorithm, data) => {
        const text = new TextDecoder().decode(data);
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = (text.charCodeAt(i % text.length) + i) % 256;
        }
        return hash;
      });

      global.crypto.subtle.digest = mockDigest;

      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("session-token-123"),
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await apiManager.initialize();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /^https:\/\/api\.example\.com\/token\/[a-f0-9]+$/
        ),
        {
          method: "GET",
          headers: {
            "x-organisationid": "org-123",
            "x-sessionid": "session-456",
            "x-transactionid": "txn-789",
          },
        }
      );
    });

    it("should throw error when response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 401,
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(apiManager.initialize()).rejects.toThrow(
        "Token handshake failed with status: 401"
      );
    });

    it("should throw error when session token is missing", async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(apiManager.initialize()).rejects.toThrow(
        "Server response did not include x-session-token header."
      );
    });

    it("should handle network errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(apiManager.initialize()).rejects.toThrow("Network error");
    });
  });

  describe("sendEvents", () => {
    beforeEach(async () => {
      // Initialize with a valid session token
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("session-token-123"),
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      await apiManager.initialize();
    });

    it("should send events successfully", async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("new-session-token-456"),
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const batch = { test: "data" };
      await apiManager.sendEvents(batch);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.example.com/event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-token": "session-token-123",
            "x-organisationid": "org-123",
          },
          body: JSON.stringify(batch),
        }
      );
    });

    it("should update session token when new token is received", async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("new-session-token-456"),
        },
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const batch = { test: "data" };
      await apiManager.sendEvents(batch);

      // Verify the new token was received
      expect(mockResponse.headers.get).toHaveBeenCalledWith("x-session-token");
    });

    it("should handle error when response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const batch = { test: "data" };

      // Should not throw, but log error
      await expect(apiManager.sendEvents(batch)).resolves.toBeUndefined();
    });

    it("should handle network errors gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const batch = { test: "data" };

      // Should not throw, but log error
      await expect(apiManager.sendEvents(batch)).resolves.toBeUndefined();
    });

    it("should not send events when no session token", async () => {
      // Create a new instance without initialization
      const newApiManager = new (APIManager as any)();

      const batch = { test: "data" };
      await newApiManager.sendEvents(batch);

      // Should not call fetch for events endpoint
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining("/event"),
        expect.any(Object)
      );
    });
  });

  describe("hash", () => {
    it("should test crypto mock directly", async () => {
      // Mock crypto.subtle.digest directly in this test
      const mockDigest = vi.fn().mockImplementation(async (_algorithm, data) => {
        const text = new TextDecoder().decode(data);
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = (text.charCodeAt(i % text.length) + i) % 256;
        }
        return hash;
      });

      global.crypto.subtle.digest = mockDigest;

      const testData = new TextEncoder().encode("test-string");
      const result = await global.crypto.subtle.digest("SHA-256", testData);
      console.log("Crypto mock result:", result);
      console.log("Result type:", typeof result);
      console.log("Result length:", result.byteLength);
    });

    it("should generate consistent hash for same input", async () => {
      // Mock crypto.subtle.digest for this test
      const mockDigest = vi.fn().mockImplementation(async (_algorithm, data) => {
        const text = new TextDecoder().decode(data);
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = (text.charCodeAt(i % text.length) + i) % 256;
        }
        return hash;
      });

      global.crypto.subtle.digest = mockDigest;

      const input = "test-string";

      // Access private method through any type
      const hash1 = await (apiManager as any).hash(input);
      const hash2 = await (apiManager as any).hash(input);

      console.log("Hash1:", hash1, "Length:", hash1.length);
      console.log("Hash2:", hash2, "Length:", hash2.length);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBe(64); // SHA-256 hex string length
    });

    it("should generate different hashes for different inputs", async () => {
      // Mock crypto.subtle.digest for this test
      const mockDigest = vi.fn().mockImplementation(async (_algorithm, data) => {
        const text = new TextDecoder().decode(data);
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = (text.charCodeAt(i % text.length) + i) % 256;
        }
        return hash;
      });

      global.crypto.subtle.digest = mockDigest;

      const input1 = "test-string-1";
      const input2 = "test-string-2";

      const hash1 = await (apiManager as any).hash(input1);
      const hash2 = await (apiManager as any).hash(input2);

      expect(hash1).not.toBe(hash2);
      expect(hash1.length).toBe(64);
      expect(hash2.length).toBe(64);
    });
  });
});
