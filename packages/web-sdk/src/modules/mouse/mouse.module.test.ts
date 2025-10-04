import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MouseBehaviourModule } from "./mouse.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(),
  },
}));

describe("MouseBehaviourModule", () => {
  let mouseModule: MouseBehaviourModule;
  let mockEventManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock event manager
    mockEventManager = {
      dispatch: vi.fn(),
    };

    // Mock EventManager.getInstance to return our mock
    vi.mocked(EventManager.getInstance).mockReturnValue(mockEventManager);

    // Mock document
    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
    };

    // Mock Date.now
    vi.spyOn(Date, "now").mockReturnValue(1000);

    mouseModule = new MouseBehaviourModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(mouseModule.moduleName).toBe("mouse");
    });
  });

  describe("init", () => {
    it("should initialize and add event listeners", () => {
      mouseModule.init();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] mouse: Initializing..."
      );

      expect(global.document.addEventListener).toHaveBeenCalledTimes(6);
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "mousemove",
        expect.any(Function),
        { capture: true }
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "mousedown",
        expect.any(Function),
        { capture: true }
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "mouseup",
        expect.any(Function),
        { capture: true }
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        { capture: true }
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "dblclick",
        expect.any(Function),
        { capture: true }
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "contextmenu",
        expect.any(Function),
        { capture: true }
      );
    });
  });

  describe("handleMouseEvent", () => {
    let mockMouseEvent: MouseEvent;

    beforeEach(() => {
      mockMouseEvent = {
        type: "mousedown",
        clientX: 100,
        clientY: 200,
        screenX: 150,
        screenY: 250,
        button: 0,
        target: {
          tagName: "BUTTON",
          id: "test-button",
          textContent: "Click me",
        },
      } as any;
    });

    it("should handle mousedown event", () => {
      mouseModule.init();

      // Access private method through any type
      const handleMouseEvent = (mouseModule as any).handleMouseEvent.bind(
        mouseModule
      );

      handleMouseEvent(mockMouseEvent);

      // Access private property through any type
      const privateProps = mouseModule as any;
      expect(privateProps.trajectory).toHaveLength(1);
      expect(privateProps.trajectory[0]).toEqual({
        x: 100,
        y: 200,
        t: 1000,
      });
    });

    it("should handle mousemove event with debouncing", () => {
      mouseModule.init();

      // Access private method through any type
      const handleMouseEvent = (mouseModule as any).handleMouseEvent.bind(
        mouseModule
      );

      (mockMouseEvent as any).type = "mousemove";
      handleMouseEvent(mockMouseEvent);

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "mouse",
        "mousemove",
        expect.objectContaining({
          mouse: {
            screenX: 150,
            screenY: 250,
            clientX: 100,
            clientY: 200,
          },
          pointCount: 1,
        })
      );
    });

    it("should debounce mousemove events", () => {
      mouseModule.init();

      // Access private method through any type
      const handleMouseEvent = (mouseModule as any).handleMouseEvent.bind(
        mouseModule
      );

      (mockMouseEvent as any).type = "mousemove";

      // First mousemove
      handleMouseEvent(mockMouseEvent);
      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(1);

      // Second mousemove within debounce period
      vi.spyOn(Date, "now").mockReturnValue(1025); // 25ms later
      handleMouseEvent(mockMouseEvent);
      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(1); // Still 1

      // Third mousemove after debounce period
      vi.spyOn(Date, "now").mockReturnValue(1060); // 60ms later
      handleMouseEvent(mockMouseEvent);
      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(2); // Now 2
    });

    it("should handle click event with trajectory analysis", () => {
      mouseModule.init();

      // Access private method through any type
      const handleMouseEvent = (mouseModule as any).handleMouseEvent.bind(
        mouseModule
      );

      // First mousedown to start trajectory
      (mockMouseEvent as any).type = "mousedown";
      handleMouseEvent(mockMouseEvent);

      // Then click
      (mockMouseEvent as any).type = "click";
      handleMouseEvent(mockMouseEvent);

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "mouse",
        "click",
        expect.objectContaining({
          target: {
            tag: "BUTTON",
            id: "test-button",
            text: "Click me",
          },
          mouse: {
            button: 0,
            screenX: 150,
            screenY: 250,
          },
          duration: 0,
          pathLength: 0,
          endSpeed: 0,
          straightness: 1,
          jerkiness: 0,
          incidenceAngle: 0,
        })
      );
    });

    it("should handle dblclick event", () => {
      mouseModule.init();

      // Access private method through any type
      const handleMouseEvent = (mouseModule as any).handleMouseEvent.bind(
        mouseModule
      );

      (mockMouseEvent as any).type = "dblclick";
      handleMouseEvent(mockMouseEvent);

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "mouse",
        "dblclick",
        expect.objectContaining({
          target: expect.any(Object),
          mouse: expect.any(Object),
        })
      );
    });

    it("should handle contextmenu event", () => {
      mouseModule.init();

      // Access private method through any type
      const handleMouseEvent = (mouseModule as any).handleMouseEvent.bind(
        mouseModule
      );

      (mockMouseEvent as any).type = "contextmenu";
      handleMouseEvent(mockMouseEvent);

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "mouse",
        "contextmenu",
        expect.objectContaining({
          target: expect.any(Object),
          mouse: expect.any(Object),
        })
      );
    });
  });

  describe("recordPoint", () => {
    it("should record point in trajectory", () => {
      // Access private method through any type
      const recordPoint = (mouseModule as any).recordPoint.bind(mouseModule);

      recordPoint(100, 200);

      // Access private property through any type
      const privateProps = mouseModule as any;
      expect(privateProps.trajectory).toHaveLength(1);
      expect(privateProps.trajectory[0]).toEqual({
        x: 100,
        y: 200,
        t: 1000,
      });
    });

    it("should not record duplicate points", () => {
      // Access private method through any type
      const recordPoint = (mouseModule as any).recordPoint.bind(mouseModule);

      recordPoint(100, 200);
      recordPoint(100, 200); // Same point

      // Access private property through any type
      const privateProps = mouseModule as any;
      expect(privateProps.trajectory).toHaveLength(1);
    });

    it("should limit trajectory to max points", () => {
      // Access private method through any type
      const recordPoint = (mouseModule as any).recordPoint.bind(mouseModule);

      // Add more than TRAJECTORY_MAX_POINTS (100)
      for (let i = 0; i < 105; i++) {
        recordPoint(i, i);
      }

      // Access private property through any type
      const privateProps = mouseModule as any;
      expect(privateProps.trajectory).toHaveLength(100);
      expect(privateProps.trajectory[0].x).toBe(5); // First 5 points should be removed
    });
  });

  describe("analyzeTrajectory", () => {
    it("should return default values for insufficient points", () => {
      // Access private method through any type
      const analyzeTrajectory = (mouseModule as any).analyzeTrajectory.bind(
        mouseModule
      );

      const analysis = analyzeTrajectory();

      expect(analysis).toEqual({
        duration: 0,
        pathLength: 0,
        endSpeed: 0,
        straightness: 1,
        jerkiness: 0,
        incidenceAngle: 0,
      });
    });

    it("should analyze trajectory with sufficient points", () => {
      // Access private method through any type
      const recordPoint = (mouseModule as any).recordPoint.bind(mouseModule);
      const analyzeTrajectory = (mouseModule as any).analyzeTrajectory.bind(
        mouseModule
      );

      // Create a trajectory
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(1000) // First point
        .mockReturnValueOnce(1100) // Second point
        .mockReturnValueOnce(1200) // Third point
        .mockReturnValueOnce(1300); // Fourth point

      recordPoint(0, 0);
      recordPoint(10, 0);
      recordPoint(20, 0);
      recordPoint(30, 0);

      const analysis = analyzeTrajectory();

      expect(analysis).toHaveProperty("duration");
      expect(analysis).toHaveProperty("pathLength");
      expect(analysis).toHaveProperty("endSpeed");
      expect(analysis).toHaveProperty("straightness");
      expect(analysis).toHaveProperty("jerkiness");
      expect(analysis).toHaveProperty("incidenceAngle");
      expect(analysis).toHaveProperty("pointCount");

      expect(analysis.duration).toBe(300); // 1300 - 1000
      expect(analysis.pointCount).toBe(4);
    });

    it("should calculate path length correctly", () => {
      // Access private method through any type
      const recordPoint = (mouseModule as any).recordPoint.bind(mouseModule);
      const analyzeTrajectory = (mouseModule as any).analyzeTrajectory.bind(
        mouseModule
      );

      // Create a simple trajectory: (0,0) -> (3,4) -> (6,8)
      // Distance between points: 5 + 5 = 10
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100)
        .mockReturnValueOnce(1200);

      recordPoint(0, 0);
      recordPoint(3, 4);
      recordPoint(6, 8);

      const analysis = analyzeTrajectory();

      expect(analysis.pathLength).toBe(10); // 5 + 5
    });

    it("should calculate straightness correctly", () => {
      // Access private method through any type
      const recordPoint = (mouseModule as any).recordPoint.bind(mouseModule);
      const analyzeTrajectory = (mouseModule as any).analyzeTrajectory.bind(
        mouseModule
      );

      // Create a straight line trajectory
      vi.spyOn(Date, "now")
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1100)
        .mockReturnValueOnce(1200);

      recordPoint(0, 0);
      recordPoint(5, 0);
      recordPoint(10, 0);

      const analysis = analyzeTrajectory();

      expect(analysis.straightness).toBe(1); // Perfectly straight
    });
  });

  describe("integration", () => {
    it("should handle complete mouse interaction flow", () => {
      mouseModule.init();

      // Access private method through any type
      const handleMouseEvent = (mouseModule as any).handleMouseEvent.bind(
        mouseModule
      );

      // Simulate a complete mouse interaction
      const mouseDownEvent = {
        type: "mousedown",
        clientX: 100,
        clientY: 200,
        screenX: 150,
        screenY: 250,
        button: 0,
        target: { tagName: "BUTTON", id: "test", textContent: "Click" },
      } as any;

      const mouseMoveEvent = {
        type: "mousemove",
        clientX: 110,
        clientY: 210,
        screenX: 160,
        screenY: 260,
        button: 0,
        target: { tagName: "BUTTON", id: "test", textContent: "Click" },
      } as any;

      const clickEvent = {
        type: "click",
        clientX: 110,
        clientY: 210,
        screenX: 160,
        screenY: 260,
        button: 0,
        target: { tagName: "BUTTON", id: "test", textContent: "Click" },
      } as any;

      handleMouseEvent(mouseDownEvent);
      handleMouseEvent(mouseMoveEvent);
      handleMouseEvent(clickEvent);

      // Should have dispatched mousemove and click events
      expect(mockEventManager.dispatch).toHaveBeenCalledTimes(2);
      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "mouse",
        "mousemove",
        expect.any(Object)
      );
      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "mouse",
        "click",
        expect.any(Object)
      );
    });
  });
});
