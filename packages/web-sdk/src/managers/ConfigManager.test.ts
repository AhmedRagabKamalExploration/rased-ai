import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ConfigManager, SdkInitConfig } from "./ConfigManager";

describe("ConfigManager", () => {
  let configManager: ConfigManager;
  let mockDocument: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock document
    mockDocument = {
      querySelector: vi.fn(),
      addEventListener: vi.fn(),
    };

    global.document = mockDocument;

    configManager = ConfigManager.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("configure", () => {
    const validConfig: SdkInitConfig = {
      baseApiUrl: "https://api.example.com",
      organizationId: "org-123",
      sessionId: "session-456",
      transactionId: "txn-789",
      trigger: '{"#submit-button": "click"}',
    };

    it("should configure successfully with valid config", () => {
      expect(() => configManager.configure(validConfig)).not.toThrow();
      expect(configManager.config).toEqual(validConfig);
    });

    it("should throw error when baseApiUrl is missing", () => {
      const invalidConfig = { ...validConfig, baseApiUrl: "" };

      expect(() => configManager.configure(invalidConfig)).toThrow(
        "[SDK] Config Error: `baseApiUrl` is mandatory."
      );
    });

    it("should throw error when organizationId is missing", () => {
      const invalidConfig = { ...validConfig, organizationId: "" };

      expect(() => configManager.configure(invalidConfig)).toThrow(
        "[SDK] Config Error: `organizationId` is mandatory."
      );
    });

    it("should throw error when sessionId is missing", () => {
      const invalidConfig = { ...validConfig, sessionId: "" };

      expect(() => configManager.configure(invalidConfig)).toThrow(
        "[SDK] Config Error: `sessionId` is mandatory."
      );
    });

    it("should throw error when transactionId is missing", () => {
      const invalidConfig = { ...validConfig, transactionId: "" };

      expect(() => configManager.configure(invalidConfig)).toThrow(
        "[SDK] Config Error: `transactionId` is mandatory."
      );
    });

    it("should throw error when trigger is missing", () => {
      const invalidConfig = { ...validConfig, trigger: "" };

      expect(() => configManager.configure(invalidConfig)).toThrow(
        "[SDK] Config Error: `trigger` is mandatory."
      );
    });

    it("should parse trigger config correctly", () => {
      configManager.configure(validConfig);

      // Access private property through any type
      const triggerConfig = (configManager as any)._triggerConfig;
      expect(triggerConfig).toEqual({
        selector: "#submit-button",
        eventName: "click",
      });
    });

    it("should handle invalid JSON in trigger config", () => {
      const invalidTriggerConfig = { ...validConfig, trigger: "invalid-json" };

      expect(() => configManager.configure(invalidTriggerConfig)).not.toThrow();

      // Access private property through any type
      const triggerConfig = (configManager as any)._triggerConfig;
      expect(triggerConfig).toBeNull();
    });

    it("should handle empty trigger config", () => {
      const emptyTriggerConfig = { ...validConfig, trigger: "{}" };

      expect(() => configManager.configure(emptyTriggerConfig)).not.toThrow();

      // Access private property through any type
      const triggerConfig = (configManager as any)._triggerConfig;
      expect(triggerConfig).toBeNull();
    });
  });

  describe("attachTrigger", () => {
    const validConfig: SdkInitConfig = {
      baseApiUrl: "https://api.example.com",
      organizationId: "org-123",
      sessionId: "session-456",
      transactionId: "txn-789",
      trigger: '{"#submit-button": "click"}',
    };

    beforeEach(() => {
      configManager.configure(validConfig);
    });

    it("should attach trigger when element exists", () => {
      const mockElement = {
        addEventListener: vi.fn(),
      };

      mockDocument.querySelector.mockReturnValue(mockElement);

      const callback = vi.fn();
      configManager.attachTrigger(callback);

      expect(mockDocument.querySelector).toHaveBeenCalledWith("#submit-button");
      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        "click",
        callback,
        {
          once: true,
        }
      );
    });

    it("should not attach trigger when element does not exist", () => {
      mockDocument.querySelector.mockReturnValue(null);

      const callback = vi.fn();
      configManager.attachTrigger(callback);

      expect(mockDocument.querySelector).toHaveBeenCalledWith("#submit-button");
      expect(callback).not.toHaveBeenCalled();
    });

    it("should not attach trigger when trigger config is null", () => {
      // Configure with invalid trigger to make _triggerConfig null
      const invalidTriggerConfig = { ...validConfig, trigger: "invalid-json" };
      configManager.configure(invalidTriggerConfig);

      const callback = vi.fn();
      configManager.attachTrigger(callback);

      expect(mockDocument.querySelector).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle different trigger formats", () => {
      const configWithClassTrigger = {
        ...validConfig,
        trigger: '{"button.submit": "click"}',
      };
      configManager.configure(configWithClassTrigger);

      const mockElement = {
        addEventListener: vi.fn(),
      };

      mockDocument.querySelector.mockReturnValue(mockElement);

      const callback = vi.fn();
      configManager.attachTrigger(callback);

      expect(mockDocument.querySelector).toHaveBeenCalledWith("button.submit");
      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        "click",
        callback,
        {
          once: true,
        }
      );
    });
  });

  describe("config getter", () => {
    it("should return configured config", () => {
      const testConfig: SdkInitConfig = {
        baseApiUrl: "https://api.example.com",
        organizationId: "org-123",
        sessionId: "session-456",
        transactionId: "txn-789",
        trigger: '{"#submit-button": "click"}',
      };

      configManager.configure(testConfig);
      expect(configManager.config).toEqual(testConfig);
    });
  });
});
