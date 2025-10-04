import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { EventManager } from "./EventManager";
import { Collector } from "./Collector";

// Mock Collector
vi.mock("./Collector", () => ({
  Collector: {
    getInstance: vi.fn(),
  },
}));

describe("EventManager", () => {
  let eventManager: EventManager;
  let mockCollector: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock collector
    mockCollector = {
      add: vi.fn(),
    };

    // Mock Collector.getInstance to return our mock
    (Collector.getInstance as any).mockReturnValue(mockCollector);

    // Mock Date.now
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    // Mock crypto.randomUUID
    global.crypto = {
      ...global.crypto,
      randomUUID: vi.fn().mockReturnValue("test-uuid-123"),
    };

    // Reset the singleton instance to ensure fresh state
    (EventManager as any).instance = undefined;
    eventManager = EventManager.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = EventManager.getInstance();
      const instance2 = EventManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("dispatch", () => {
    it("should dispatch event with correct structure", () => {
      const moduleName = "test-module";
      const eventType = "test-event";
      const payload = { test: "data" };

      eventManager.dispatch(moduleName, eventType, payload);

      expect(mockCollector.add).toHaveBeenCalledWith({
        eventId: "test-uuid-123",
        moduleName: "test-module",
        eventType: "test-event",
        timestamp: 1234567890,
        payload: { test: "data" },
      });
    });

    it("should generate unique event IDs for each dispatch", () => {
      const moduleName = "test-module";
      const eventType = "test-event";
      const payload = { test: "data" };

      // Mock different UUIDs for each call
      vi.mocked(global.crypto.randomUUID)
        .mockReturnValueOnce("uuid-1" as any)
        .mockReturnValueOnce("uuid-2" as any);

      eventManager.dispatch(moduleName, eventType, payload);
      eventManager.dispatch(moduleName, eventType, payload);

      expect(mockCollector.add).toHaveBeenCalledTimes(2);
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          eventId: "uuid-1",
        })
      );
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          eventId: "uuid-2",
        })
      );
    });

    it("should use current timestamp for each dispatch", () => {
      const moduleName = "test-module";
      const eventType = "test-event";
      const payload = { test: "data" };

      // Mock different timestamps
      vi.mocked(Date.now).mockReturnValueOnce(1000).mockReturnValueOnce(2000);

      eventManager.dispatch(moduleName, eventType, payload);
      eventManager.dispatch(moduleName, eventType, payload);

      expect(mockCollector.add).toHaveBeenCalledTimes(2);
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          timestamp: 1000,
        })
      );
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          timestamp: 2000,
        })
      );
    });

    it("should handle different module names", () => {
      const payload = { test: "data" };

      eventManager.dispatch("module1", "event1", payload);
      eventManager.dispatch("module2", "event2", payload);

      expect(mockCollector.add).toHaveBeenCalledTimes(2);
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          moduleName: "module1",
          eventType: "event1",
        })
      );
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          moduleName: "module2",
          eventType: "event2",
        })
      );
    });

    it("should handle different event types", () => {
      const moduleName = "test-module";
      const payload = { test: "data" };

      eventManager.dispatch(moduleName, "click", payload);
      eventManager.dispatch(moduleName, "scroll", payload);
      eventManager.dispatch(moduleName, "keydown", payload);

      expect(mockCollector.add).toHaveBeenCalledTimes(3);
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          eventType: "click",
        })
      );
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          eventType: "scroll",
        })
      );
      expect(mockCollector.add).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          eventType: "keydown",
        })
      );
    });

    it("should handle complex payload objects", () => {
      const moduleName = "test-module";
      const eventType = "test-event";
      const complexPayload = {
        nested: {
          data: [1, 2, 3],
          flag: true,
        },
        array: ["a", "b", "c"],
        number: 42,
        string: "test",
      };

      eventManager.dispatch(moduleName, eventType, complexPayload);

      expect(mockCollector.add).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: complexPayload,
        })
      );
    });

    it("should handle empty payload", () => {
      const moduleName = "test-module";
      const eventType = "test-event";
      const emptyPayload = {};

      eventManager.dispatch(moduleName, eventType, emptyPayload);

      expect(mockCollector.add).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: {},
        })
      );
    });

    it("should handle null payload", () => {
      const moduleName = "test-module";
      const eventType = "test-event";
      const nullPayload = null as any;

      eventManager.dispatch(moduleName, eventType, nullPayload);

      expect(mockCollector.add).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: null,
        })
      );
    });
  });
});
