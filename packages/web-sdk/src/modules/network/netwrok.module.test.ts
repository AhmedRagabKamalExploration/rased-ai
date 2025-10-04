import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NetworkModule } from "./netwrok.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

describe("NetworkModule", () => {
  let networkModule: NetworkModule;
  let mockEventManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock event manager
    mockEventManager = {
      dispatch: vi.fn(),
    };

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock navigator
    global.navigator = {
      onLine: true,
      connection: {
        type: "wifi",
        effectiveType: "4g",
        rtt: 50,
        downlink: 10,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    } as any;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
    };

    networkModule = new NetworkModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(networkModule.moduleName).toBe("network");
    });
  });

  describe("constructor", () => {
    it("should initialize connection from navigator", () => {
      // Access private property through any type
      const privateProps = networkModule as any;
      expect(privateProps.connection).toBeDefined();
      expect(privateProps.connection.type).toBe("wifi");
      expect(privateProps.connection.effectiveType).toBe("4g");
    });

    it("should handle missing connection API", () => {
      global.navigator = { onLine: true } as any;

      const newNetworkModule = new NetworkModule();

      // Access private property through any type
      const privateProps = newNetworkModule as any;
      expect(privateProps.connection).toBeNull();
    });

    it("should try different connection property names", () => {
      global.navigator = {
        onLine: true,
        mozConnection: {
          type: "cellular",
          effectiveType: "3g",
          rtt: 100,
          downlink: 5,
        },
      } as any;

      const newNetworkModule = new NetworkModule();

      // Access private property through any type
      const privateProps = newNetworkModule as any;
      expect(privateProps.connection).toBeDefined();
      expect(privateProps.connection.type).toBe("cellular");
    });
  });

  describe("init", () => {
    it("should initialize with connection API available", () => {
      networkModule.init();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] network: Initializing..."
      );

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: true,
          connectionType: "wifi",
          effectiveType: "4g",
          roundTripTime: 50,
          downlink: 10,
        }
      );

      // Should add change listener
      expect((global.navigator as any).connection.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
        undefined
      );
    });

    it("should handle missing connection API gracefully", () => {
      global.navigator = { onLine: false } as any;

      const newNetworkModule = new NetworkModule();
      newNetworkModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: false,
          unsupported: true,
        }
      );
    });

    it("should handle offline state", () => {
      (global.navigator as any).onLine = false;

      networkModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: false,
          connectionType: "wifi",
          effectiveType: "4g",
          roundTripTime: 50,
          downlink: 10,
        }
      );
    });
  });

  describe("dispatchNetworkState", () => {
    it("should dispatch current network state", () => {
      // Access private method through any type
      const dispatchNetworkState = (
        networkModule as any
      ).dispatchNetworkState.bind(networkModule);

      dispatchNetworkState();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: true,
          connectionType: "wifi",
          effectiveType: "4g",
          roundTripTime: 50,
          downlink: 10,
        }
      );
    });

    it("should handle missing connection properties", () => {
      (global.navigator as any).connection = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as any;

      const newNetworkModule = new NetworkModule();

      // Access private method through any type
      const dispatchNetworkState = (
        newNetworkModule as any
      ).dispatchNetworkState.bind(newNetworkModule);

      dispatchNetworkState();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: true,
          connectionType: undefined,
          effectiveType: undefined,
          roundTripTime: undefined,
          downlink: undefined,
        }
      );
    });

    it("should handle null connection", () => {
      global.navigator = { onLine: true } as any;

      const newNetworkModule = new NetworkModule();

      // Access private method through any type
      const dispatchNetworkState = (
        newNetworkModule as any
      ).dispatchNetworkState.bind(newNetworkModule);

      dispatchNetworkState();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: true,
          connectionType: undefined,
          effectiveType: undefined,
          roundTripTime: undefined,
          downlink: undefined,
        }
      );
    });
  });

  describe("connection change handling", () => {
    it("should dispatch network state on connection change", () => {
      networkModule.init();

      // Simulate connection change
      const changeHandler =
        (global.navigator as any).connection.addEventListener.mock.calls[0][1];
      changeHandler();

      // Should dispatch twice: once on init, once on change
      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(2);
    });

    it("should handle connection type changes", () => {
      networkModule.init();

      // Change connection type
      (global.navigator as any).connection.type = "cellular";
      (global.navigator as any).connection.effectiveType = "3g";

      // Simulate connection change
      const changeHandler =
        (global.navigator as any).connection.addEventListener.mock.calls[0][1];
      changeHandler();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: true,
          connectionType: "cellular",
          effectiveType: "3g",
          roundTripTime: 50,
          downlink: 10,
        }
      );
    });

    it("should handle online/offline state changes", () => {
      networkModule.init();

      // Change online state
      (global.navigator as any).onLine = false;

      // Simulate connection change
      const changeHandler =
        (global.navigator as any).connection.addEventListener.mock.calls[0][1];
      changeHandler();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: false,
          connectionType: "wifi",
          effectiveType: "4g",
          roundTripTime: 50,
          downlink: 10,
        }
      );
    });
  });

  describe("integration", () => {
    it("should handle complete network monitoring flow", () => {
      networkModule.init();

      // Verify initial dispatch
      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: true,
          connectionType: "wifi",
          effectiveType: "4g",
          roundTripTime: 50,
          downlink: 10,
        }
      );

      // Verify change listener was added
      expect((global.navigator as any).connection.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
        undefined
      );
    });

    it("should handle different connection types", () => {
      const connectionTypes = [
        "bluetooth",
        "cellular",
        "ethernet",
        "wifi",
        "wimax",
        "other",
        "none",
        "unknown",
      ];

      connectionTypes.forEach((type) => {
        (global.navigator as any).connection.type = type;

        const newNetworkModule = new NetworkModule();
        newNetworkModule.init();

        expect(mockEventManager.dispatch).toHaveBeenCalledWith(
          "network",
          "network",
          expect.objectContaining({
            connectionType: type,
          })
        );
      });
    });

    it("should handle different effective types", () => {
      const effectiveTypes = ["slow-2g", "2g", "3g", "4g"];

      effectiveTypes.forEach((effectiveType) => {
        (global.navigator as any).connection.effectiveType = effectiveType;

        const newNetworkModule = new NetworkModule();
        newNetworkModule.init();

        expect(mockEventManager.dispatch).toHaveBeenCalledWith(
          "network",
          "network",
          expect.objectContaining({
            effectiveType: effectiveType,
          })
        );
      });
    });

    it("should handle various connection metrics", () => {
      (global.navigator as any).connection = {
        type: "ethernet",
        effectiveType: "4g",
        rtt: 25,
        downlink: 50,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as any;

      const newNetworkModule = new NetworkModule();
      newNetworkModule.init();

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "network",
        "network",
        {
          isOnline: true,
          connectionType: "ethernet",
          effectiveType: "4g",
          roundTripTime: 25,
          downlink: 50,
        }
      );
    });
  });
});
