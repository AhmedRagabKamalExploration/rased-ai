import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MetadataManager } from "./MetadataManager";
import { IdentityManager } from "./IdentityManager";

// Mock IdentityManager
vi.mock("./IdentityManager", () => ({
  IdentityManager: {
    getInstance: vi.fn(),
  },
}));

// Mock package.json
vi.mock("../../package.json", () => ({
  default: {
    version: "1.0.0",
  },
  version: "1.0.0",
}));

describe("MetadataManager", () => {
  let metadataManager: MetadataManager;
  let mockIdentityManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock crypto.randomUUID directly in this test
    global.crypto = {
      ...global.crypto,
      randomUUID: vi.fn().mockReturnValue("test-uuid-123"),
    };

    // Create mock identity manager
    mockIdentityManager = {
      getDeviceId: vi.fn().mockReturnValue("device-123"),
    };

    // Mock IdentityManager.getInstance to return our mock
    (IdentityManager.getInstance as any).mockReturnValue(mockIdentityManager);

    // Mock window.location
    global.window = {
      ...global.window,
      location: {
        origin: "https://example.com",
      },
    };

    // Mock console methods
    global.console = {
      ...console,
      warn: vi.fn(),
    };

    // Reset the singleton instance to ensure fresh state with mocked dependencies
    (MetadataManager as any).instance = undefined;
    metadataManager = MetadataManager.getInstance();
    // Don't call reset() as it might interfere with the mocked crypto.randomUUID()
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = MetadataManager.getInstance();
      const instance2 = MetadataManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("constructor", () => {
    it("should initialize with correct default values", () => {
      const collectionEventId = metadataManager.getCollectionEventId();
      expect(collectionEventId).toBe(
        "test-uuid-123" // This matches the mocked crypto.randomUUID() value
      );
      expect(metadataManager.getNextMessageId()).toBe(0);
    });
  });

  describe("getCollectionEventId", () => {
    it("should return the collection event ID", () => {
      const collectionEventId = metadataManager.getCollectionEventId();
      expect(collectionEventId).toBe("test-uuid-123"); // This matches the mocked crypto.randomUUID() value
    });
  });

  describe("getNextMessageId", () => {
    it("should return incremental message IDs", () => {
      expect(metadataManager.getNextMessageId()).toBe(0);
      expect(metadataManager.getNextMessageId()).toBe(1);
      expect(metadataManager.getNextMessageId()).toBe(2);
    });
  });

  describe("updateMetadata", () => {
    it("should update organization, transaction, and session IDs", () => {
      const config = {
        organizationId: "org-123",
        transactionId: "txn-456",
        sessionId: "session-789",
      };

      metadataManager.updateMetadata(config);

      // Access private properties through any type
      const privateProps = metadataManager as any;
      expect(privateProps.organizationId).toBe("org-123");
      expect(privateProps.transactionId).toBe("txn-456");
      expect(privateProps.sessionId).toBe("session-789");
    });
  });

  describe("createMetadata", () => {
    beforeEach(() => {
      metadataManager.updateMetadata({
        organizationId: "org-123",
        transactionId: "txn-456",
        sessionId: "session-789",
      });
    });

    it("should create metadata with correct structure", () => {
      const metadata = metadataManager.createMetadata();

      expect(metadata).toEqual({
        messageType: "BATCH",
        collectionEventId: "test-uuid-123", // This matches the mocked crypto.randomUUID() value
        organizationId: "org-123",
        transactionId: "txn-456",
        sessionId: "session-789",
        deviceSessionType: "INITIATING",
        deviceSessionId: "device-123",
        messageId: 0,
        transactionEventPageId: null,
        sdkVersion: "1.0.0",
        origin: "https://example.com",
        channels: "WEB",
        pageType: ["WEB_STANDARD"],
      });
    });

    it("should create metadata with custom transaction event page ID", () => {
      const metadata = metadataManager.createMetadata("page-123");

      expect(metadata.transactionEventPageId).toBe("page-123");
    });

    it("should increment message ID on each call", () => {
      const metadata1 = metadataManager.createMetadata();
      const metadata2 = metadataManager.createMetadata();

      expect(metadata1.messageId).toBe(0);
      expect(metadata2.messageId).toBe(1);
    });

    it("should warn when device ID is uninitialized", () => {
      mockIdentityManager.getDeviceId.mockReturnValue("uninitialized");

      metadataManager.createMetadata();

      expect(global.console.warn).toHaveBeenCalledWith(
        "[SDK] MetadataManager: Device ID is uninitialized. IdentityManager may not be properly initialized."
      );
    });

    it("should handle missing window object", () => {
      // Temporarily remove window
      const originalWindow = global.window;
      delete (global as any).window;

      const newMetadataManager = new (MetadataManager as any)();
      newMetadataManager.updateMetadata({
        organizationId: "org-123",
        transactionId: "txn-456",
        sessionId: "session-789",
      });

      const metadata = newMetadataManager.createMetadata();

      expect(metadata.origin).toBe("");

      // Restore window
      global.window = originalWindow;
    });
  });

  describe("rejoiningSession", () => {
    it("should update device session type and reset message counter", () => {
      // First create some metadata to increment the counter
      metadataManager.createMetadata();
      metadataManager.createMetadata();

      // Now rejoin session
      metadataManager.rejoiningSession();

      // Access private properties through any type
      const privateProps = metadataManager as any;
      expect(privateProps.deviceSessionType).toBe("REJOINING");
      expect(privateProps.messageCounter).toBe(0);

      // Verify message ID starts from 0 again
      const metadata = metadataManager.createMetadata();
      expect(metadata.messageId).toBe(0);
      expect(metadata.deviceSessionType).toBe("REJOINING");
    });
  });

  describe("integration", () => {
    it("should maintain state across multiple operations", () => {
      // Update metadata
      metadataManager.updateMetadata({
        organizationId: "org-123",
        transactionId: "txn-456",
        sessionId: "session-789",
      });

      // Create multiple metadata objects
      const metadata1 = metadataManager.createMetadata("page-1");
      const metadata2 = metadataManager.createMetadata("page-2");

      expect(metadata1.messageId).toBe(0);
      expect(metadata2.messageId).toBe(1);
      expect(metadata1.transactionEventPageId).toBe("page-1");
      expect(metadata2.transactionEventPageId).toBe("page-2");

      // Both should have same collection event ID
      expect(metadata1.collectionEventId).toBe(metadata2.collectionEventId);
    });
  });
});
