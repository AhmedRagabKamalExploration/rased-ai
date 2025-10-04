import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WebSDK } from "./web-SDK";
import { ConfigManager } from "@/managers/ConfigManager";
import { IdentityManager } from "@/managers/IdentityManager";
import { SessionManager } from "@/managers/SessionManager";
import { ModuleManager } from "@/managers/ModuleManager";
import { Collector } from "@/managers/Collector";
import { APIManager } from "@/managers/APIManager";
import { MetadataManager } from "@/managers/MetadataManager";
import { featureModules } from "@/modules";

// Mock individual manager files
vi.mock("@/managers/ConfigManager", () => ({
  ConfigManager: {
    getInstance: vi.fn(),
  },
}));

vi.mock("@/managers/IdentityManager", () => ({
  IdentityManager: {
    getInstance: vi.fn(),
  },
}));

vi.mock("@/managers/SessionManager", () => ({
  SessionManager: {
    getInstance: vi.fn(),
  },
}));

vi.mock("@/managers/ModuleManager", () => ({
  ModuleManager: {
    getInstance: vi.fn(),
  },
}));

vi.mock("@/managers/Collector", () => ({
  Collector: {
    getInstance: vi.fn(),
  },
}));

vi.mock("@/managers/APIManager", () => ({
  APIManager: {
    getInstance: vi.fn(),
  },
}));

vi.mock("@/managers/MetadataManager", () => ({
  MetadataManager: {
    getInstance: vi.fn(),
  },
}));

// Mock modules
vi.mock("@/modules", () => ({
  featureModules: [class MockModule {}],
}));

describe("WebSDK", () => {
  let webSDK: WebSDK;
  let mockConfigManager: any;
  let mockIdentityManager: any;
  let mockSessionManager: any;
  let mockModuleManager: any;
  let mockCollector: any;
  let mockApiManager: any;
  let mockMetadataManager: any;

  const validConfig = {
    baseApiUrl: "https://api.example.com",
    organizationId: "org-123",
    sessionId: "session-456",
    transactionId: "txn-789",
    trigger: '{"#submit-button": "click"}',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock managers
    mockConfigManager = {
      configure: vi.fn(),
      config: {
        sessionId: "session-456", // Match the test expectation
        organizationId: "org-123",
        transactionId: "txn-123",
      },
      attachTrigger: vi.fn(),
    };

    mockIdentityManager = {
      initialize: vi.fn().mockResolvedValue(undefined),
    };

    mockSessionManager = {
      start: vi.fn(),
      end: vi.fn(),
    };

    mockModuleManager = {
      registerAndInit: vi.fn(),
      destroyAll: vi.fn(),
    };

    mockCollector = {
      configure: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockApiManager = {
      initialize: vi.fn().mockResolvedValue(undefined),
    };

    mockMetadataManager = {
      updateMetadata: vi.fn(),
    };

    // Mock manager getInstance methods
    (ConfigManager.getInstance as any).mockReturnValue(mockConfigManager);
    (IdentityManager.getInstance as any).mockReturnValue(mockIdentityManager);
    (SessionManager.getInstance as any).mockReturnValue(mockSessionManager);
    (ModuleManager.getInstance as any).mockReturnValue(mockModuleManager);
    (Collector.getInstance as any).mockReturnValue(mockCollector);
    (APIManager.getInstance as any).mockReturnValue(mockApiManager);
    (MetadataManager.getInstance as any).mockReturnValue(mockMetadataManager);

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    // Reset the singleton instance to ensure clean state
    (WebSDK as any).instance = undefined;
    webSDK = WebSDK.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = WebSDK.getInstance();
      const instance2 = WebSDK.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("start", () => {
    it("should start successfully with valid config", async () => {
      await webSDK.start(validConfig);

      expect(mockConfigManager.configure).toHaveBeenCalledWith(validConfig);
      expect(mockIdentityManager.initialize).toHaveBeenCalled();
      expect(mockApiManager.initialize).toHaveBeenCalled();
      expect(mockMetadataManager.updateMetadata).toHaveBeenCalledWith(
        validConfig
      );
      expect(mockSessionManager.start).toHaveBeenCalledWith("session-456", 15);
      expect(mockCollector.configure).toHaveBeenCalledWith({
        batchSize: 100,
        flushInterval: 1000,
      });
      expect(mockCollector.start).toHaveBeenCalled();
      expect(mockModuleManager.registerAndInit).toHaveBeenCalledWith(
        featureModules
      );
      expect(mockConfigManager.attachTrigger).toHaveBeenCalledWith(
        expect.any(Function)
      );

      expect(global.console.log).toHaveBeenCalledWith(
        "[WebSDK] Started Successfully."
      );
    });

    it("should not start if already started", async () => {
      await webSDK.start(validConfig);

      // Try to start again
      await webSDK.start(validConfig);

      expect(global.console.warn).toHaveBeenCalledWith(
        "[WebSDK] Start called more than once."
      );
      expect(mockConfigManager.configure).toHaveBeenCalledTimes(1);
    });

    it("should handle config validation errors", async () => {
      mockConfigManager.configure.mockImplementation(() => {
        throw new Error("Invalid config");
      });

      await webSDK.start(validConfig);

      expect(global.console.error).toHaveBeenCalledWith(
        "[WebSDK] Failed to start:",
        expect.any(Error)
      );
      // The shutdown method should be called, which calls cleanup methods
      expect(mockModuleManager.destroyAll).toHaveBeenCalled();
      expect(mockCollector.stop).toHaveBeenCalled();
      expect(mockSessionManager.end).toHaveBeenCalled();
    });

    it("should handle identity manager initialization errors", async () => {
      mockIdentityManager.initialize.mockRejectedValue(
        new Error("Identity init failed")
      );

      await webSDK.start(validConfig);

      expect(global.console.error).toHaveBeenCalledWith(
        "[WebSDK] Failed to start:",
        expect.any(Error)
      );
      expect(mockModuleManager.destroyAll).toHaveBeenCalled();
      expect(mockCollector.stop).toHaveBeenCalled();
      expect(mockSessionManager.end).toHaveBeenCalled();
    });

    it("should handle API manager initialization errors", async () => {
      mockApiManager.initialize.mockRejectedValue(new Error("API init failed"));

      await webSDK.start(validConfig);

      expect(global.console.error).toHaveBeenCalledWith(
        "[WebSDK] Failed to start:",
        expect.any(Error)
      );
      expect(mockModuleManager.destroyAll).toHaveBeenCalled();
      expect(mockCollector.stop).toHaveBeenCalled();
      expect(mockSessionManager.end).toHaveBeenCalled();
    });

    it("should handle module manager errors", async () => {
      mockModuleManager.registerAndInit.mockImplementation(() => {
        throw new Error("Module init failed");
      });

      await webSDK.start(validConfig);

      expect(global.console.error).toHaveBeenCalledWith(
        "[WebSDK] Failed to start:",
        expect.any(Error)
      );
      expect(mockModuleManager.destroyAll).toHaveBeenCalled();
      expect(mockCollector.stop).toHaveBeenCalled();
      expect(mockSessionManager.end).toHaveBeenCalled();
    });

    it("should set isStarted flag correctly", async () => {
      // Access private property through any type
      let privateProps = webSDK as any;
      expect(privateProps.isStarted).toBe(false);

      await webSDK.start(validConfig);

      privateProps = webSDK as any;
      expect(privateProps.isStarted).toBe(true);
    });
  });

  describe("shutdown", () => {
    it("should shutdown successfully when started", async () => {
      await webSDK.start(validConfig);

      webSDK.shutdown();

      expect(global.console.log).toHaveBeenCalledWith(
        "[WebSDK] Final flush and shutdown triggered."
      );
      expect(mockModuleManager.destroyAll).toHaveBeenCalled();
      expect(mockCollector.stop).toHaveBeenCalled();
      expect(mockSessionManager.end).toHaveBeenCalled();
      expect(global.console.log).toHaveBeenCalledWith(
        "[WebSDK] Shutdown complete."
      );

      // Access private property through any type
      const privateProps = webSDK as any;
      expect(privateProps.isStarted).toBe(false);
    });

    it("should not shutdown when not started", () => {
      webSDK.shutdown();

      expect(mockModuleManager.destroyAll).not.toHaveBeenCalled();
      expect(mockCollector.stop).not.toHaveBeenCalled();
      expect(mockSessionManager.end).not.toHaveBeenCalled();
    });

    it("should be called by trigger callback", async () => {
      await webSDK.start(validConfig);

      // Get the trigger callback that was attached
      const triggerCallback = mockConfigManager.attachTrigger.mock.calls[0][0];

      // Call the trigger callback
      triggerCallback();

      expect(mockModuleManager.destroyAll).toHaveBeenCalled();
      expect(mockCollector.stop).toHaveBeenCalled();
      expect(mockSessionManager.end).toHaveBeenCalled();
    });
  });

  describe("integration", () => {
    it("should handle complete start-shutdown cycle", async () => {
      const config = {
        baseApiUrl: "https://api.example.com",
        organizationId: "org-123",
        sessionId: "session-456",
        transactionId: "txn-789",
        trigger: '{"#submit-button": "click"}',
      };

      // Start SDK
      await webSDK.start(config);

      // Verify all managers were initialized
      expect(mockConfigManager.configure).toHaveBeenCalledWith(config);
      expect(mockIdentityManager.initialize).toHaveBeenCalled();
      expect(mockApiManager.initialize).toHaveBeenCalled();
      expect(mockMetadataManager.updateMetadata).toHaveBeenCalledWith(config);
      expect(mockSessionManager.start).toHaveBeenCalledWith("session-456", 15);
      expect(mockCollector.configure).toHaveBeenCalledWith({
        batchSize: 100,
        flushInterval: 1000,
      });
      expect(mockCollector.start).toHaveBeenCalled();
      expect(mockModuleManager.registerAndInit).toHaveBeenCalledWith(
        featureModules
      );

      // Shutdown SDK
      webSDK.shutdown();

      // Verify cleanup
      expect(mockModuleManager.destroyAll).toHaveBeenCalled();
      expect(mockCollector.stop).toHaveBeenCalled();
      expect(mockSessionManager.end).toHaveBeenCalled();
    });

    it("should handle multiple start attempts gracefully", async () => {
      const config = {
        baseApiUrl: "https://api.example.com",
        organizationId: "org-123",
        sessionId: "session-456",
        transactionId: "txn-789",
        trigger: '{"#submit-button": "click"}',
      };

      // First start
      await webSDK.start(config);

      // Second start (should be ignored)
      await webSDK.start(config);

      // Verify managers were only initialized once
      expect(mockConfigManager.configure).toHaveBeenCalledTimes(1);
      expect(mockIdentityManager.initialize).toHaveBeenCalledTimes(1);
      expect(mockApiManager.initialize).toHaveBeenCalledTimes(1);
    });

    it("should handle shutdown after multiple start attempts", async () => {
      const config = {
        baseApiUrl: "https://api.example.com",
        organizationId: "org-123",
        sessionId: "session-456",
        transactionId: "txn-789",
        trigger: '{"#submit-button": "click"}',
      };

      // Start multiple times
      await webSDK.start(config);
      await webSDK.start(config);

      // Shutdown should still work
      webSDK.shutdown();

      expect(mockModuleManager.destroyAll).toHaveBeenCalledTimes(1);
      expect(mockCollector.stop).toHaveBeenCalledTimes(1);
      expect(mockSessionManager.end).toHaveBeenCalledTimes(1);
    });
  });
});
