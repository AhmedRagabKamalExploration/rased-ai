import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Collector } from "./Collector";
import { MetadataManager } from "./MetadataManager";

// Mock MetadataManager
vi.mock("./MetadataManager", () => ({
  MetadataManager: {
    getInstance: vi.fn(),
  },
}));

describe("Collector", () => {
  let collector: Collector;
  let mockMetadataManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock metadata manager
    mockMetadataManager = {
      createMetadata: vi.fn().mockReturnValue({
        timestamp: 1234567890,
        sessionId: "session-123",
        userAgent: "test-agent",
      }),
    };

    // Mock MetadataManager.getInstance to return our mock
    (MetadataManager.getInstance as any).mockReturnValue(mockMetadataManager);

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
    };

    // Reset the singleton instance to ensure fresh state with mocked dependencies
    (Collector as any).instance = undefined;
    collector = Collector.getInstance();

    // Reset collector state
    collector.reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = Collector.getInstance();
      const instance2 = Collector.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("configure", () => {
    it("should configure collector with valid config", () => {
      const config = {
        batchSize: 10,
        flushInterval: 5000,
      };

      expect(() => collector.configure(config)).not.toThrow();
    });

    it("should configure collector with different values", () => {
      const config = {
        batchSize: 50,
        flushInterval: 10000,
      };

      expect(() => collector.configure(config)).not.toThrow();
    });
  });

  describe("add", () => {
    beforeEach(() => {
      collector.configure({
        batchSize: 3,
        flushInterval: 1000,
      });
    });

    it("should add event to queue", () => {
      const eventData = {
        moduleName: "test-module",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data" },
      };

      collector.add(eventData);

      // Access private queue through any type
      const queue = (collector as any).queue;
      expect(queue.has("test-module")).toBe(true);
      expect(queue.get("test-module")).toHaveLength(1);

      // Check that moduleName was removed from the event
      const storedEvent = queue.get("test-module")[0];
      expect(storedEvent.moduleName).toBeUndefined();
      expect(storedEvent.eventId).toBe("event-1");
    });

    it("should group events by module name", () => {
      // Configure collector first
      collector.configure({ batchSize: 10, flushInterval: 1000 });

      const event1 = {
        moduleName: "module1",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data1" },
      };

      const event2 = {
        moduleName: "module1",
        eventId: "event-2",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data2" },
      };

      const event3 = {
        moduleName: "module2",
        eventId: "event-3",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data3" },
      };

      collector.add(event1);
      collector.add(event2);
      collector.add(event3);

      const queue = (collector as any).queue;
      console.log("Queue keys:", Array.from(queue.keys()));
      console.log("Queue size:", queue.size);
      console.log("Queue contents:", Object.fromEntries(queue));

      expect(queue.has("module1")).toBe(true);
      expect(queue.has("module2")).toBe(true);
      expect(queue.get("module1")).toHaveLength(2);
      expect(queue.get("module2")).toHaveLength(1);
    });

    it("should flush when batch size is reached", () => {
      const flushSpy = vi.spyOn(collector as any, "flush");

      const eventData = {
        moduleName: "test-module",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data" },
      };

      // Add events up to batch size
      collector.add(eventData);
      collector.add({ ...eventData, eventId: "event-2" });
      collector.add({ ...eventData, eventId: "event-3" });

      expect(flushSpy).toHaveBeenCalled();
    });

    it("should not flush when batch size is not reached", () => {
      const flushSpy = vi.spyOn(collector as any, "flush");

      const eventData = {
        moduleName: "test-module",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data" },
      };

      // Add only 2 events (batch size is 3)
      collector.add(eventData);
      collector.add({ ...eventData, eventId: "event-2" });

      expect(flushSpy).not.toHaveBeenCalled();
    });

    it("should count total events across all modules for batch size check", () => {
      const flushSpy = vi.spyOn(collector as any, "flush");

      const eventData = {
        moduleName: "test-module",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data" },
      };

      // Add 2 events to module1 and 1 event to module2 (total = 3, batch size = 3)
      collector.add(eventData);
      collector.add({ ...eventData, eventId: "event-2" });
      collector.add({
        ...eventData,
        moduleName: "module2",
        eventId: "event-3",
      });

      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe("start", () => {
    beforeEach(() => {
      collector.configure({
        batchSize: 10,
        flushInterval: 1000,
      });
    });

    it("should start timer for periodic flushing", () => {
      vi.spyOn(collector as any, "flush");

      collector.start();

      // Access private timer through any type
      const timer = (collector as any).timer;
      expect(timer).toBeDefined();
      expect(typeof timer).toBe("object"); // setInterval returns a Timeout object
    });

    it("should call flush at intervals", async () => {
      const flushSpy = vi.spyOn(collector as any, "flush");

      collector.configure({
        batchSize: 10,
        flushInterval: 100, // Very short interval for testing
      });

      collector.start();

      // Wait for interval to trigger
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    beforeEach(() => {
      collector.configure({
        batchSize: 10,
        flushInterval: 1000,
      });
    });

    it("should stop timer and perform final flush", () => {
      const flushSpy = vi.spyOn(collector as any, "flush");

      collector.start();
      collector.stop();

      const timer = (collector as any).timer;
      expect(timer).toBeNull();
      expect(flushSpy).toHaveBeenCalled();
    });

    it("should handle stop when timer is not started", () => {
      const flushSpy = vi.spyOn(collector as any, "flush");

      collector.stop();

      expect(flushSpy).toHaveBeenCalled();
    });
  });

  describe("flush", () => {
    beforeEach(() => {
      collector.configure({
        batchSize: 10,
        flushInterval: 1000,
      });
    });

    it("should not flush when queue is empty", () => {
      vi.spyOn(collector as any, "flush");

      // Call flush directly when queue is empty
      (collector as any).flush();

      expect(global.console.log).not.toHaveBeenCalled();
    });

    it("should flush events and clear queue", () => {
      const eventData = {
        moduleName: "test-module",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data" },
      };

      collector.add(eventData);

      // Access private flush method
      (collector as any).flush();

      const queue = (collector as any).queue;
      expect(queue.size).toBe(0);
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining("Flushing batch with 1 modules...")
      );
    });

    it("should create batch with correct structure", () => {
      // Configure collector first
      collector.configure({ batchSize: 10, flushInterval: 1000 });

      const eventData = {
        moduleName: "test-module",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data" },
      };

      collector.add(eventData);

      // Access private flush method
      (collector as any).flush();

      expect(mockMetadataManager.createMetadata).toHaveBeenCalled();
      expect(global.console.log).toHaveBeenCalledWith(
        expect.objectContaining({
          batch: {
            content: {
              "test-module": [
                expect.objectContaining({
                  eventId: "event-1",
                  eventType: "test-event",
                  payload: { test: "data" },
                }),
              ],
            },
            metadata: {
              timestamp: 1234567890,
              sessionId: "session-123",
              userAgent: "test-agent",
            },
          },
        })
      );
    });

    it("should handle multiple modules in batch", () => {
      const event1 = {
        moduleName: "module1",
        eventId: "event-1",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data1" },
      };

      const event2 = {
        moduleName: "module2",
        eventId: "event-2",
        eventType: "test-event",
        timestamp: Date.now(),
        payload: { test: "data2" },
      };

      collector.add(event1);
      collector.add(event2);

      // Access private flush method
      (collector as any).flush();

      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining("Flushing batch with 2 modules...")
      );
    });
  });
});
