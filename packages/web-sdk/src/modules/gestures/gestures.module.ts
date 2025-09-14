import { BaseModule } from "@/modules/BaseModule";

// Import Hammer.js from the libs directory
import "@/libs/hammer";

// Gesture event types mapping (from obfuscated code analysis)
const GESTURE_EVENTS = {
  singletap: "SINGLE_TAP",
  doubletap: "DOUBLE_TAP",
  tripletap: "TRIPLE_TAP",
  pan: "PAN",
  panleft: "PAN_LEFT",
  panright: "PAN_RIGHT",
  panup: "PAN_UP",
  pandown: "PAN_DOWN",
  swipe: "SWIPE",
  swipeleft: "SWIPE_LEFT",
  swiperight: "SWIPE_RIGHT",
  swipeup: "SWIPE_UP",
  swipedown: "SWIPE_DOWN",
  pinch: "PINCH",
  rotate: "ROTATE",
} as const;

type GestureType = keyof typeof GESTURE_EVENTS;
type GestureEventType = (typeof GESTURE_EVENTS)[GestureType];

interface GestureData {
  gestureType: GestureEventType;
  originalType: string;
  timestamp: number;
  duration: number;
  center: { x: number; y: number };
  deltaX: number;
  deltaY: number;
  distance: number;
  angle: number;
  velocity: number;
  velocityX: number;
  velocityY: number;
  scale?: number;
  rotation?: number;
  direction?: string;
  pointCount: number;
  pressure?: number;
  radius?: { x: number; y: number };
  target: {
    tag: string;
    id?: string;
    className?: string;
  };
  isMultiTouch: boolean;
  fingerCount: number;
}

export class GesturesModule extends BaseModule {
  public readonly moduleName: string = "gestures";
  private hammer: any = null;
  private gestureCount: number = 0;
  private lastGestureTime: number = 0;

  /**
   * Initializes the gestures detection module using Hammer.js
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);

    try {
      this.setupHammerGestures();
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "gestures.error", {
        error: "Gestures detection failed",
        errorCode: "COLLECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Sets up Hammer.js gesture recognition (matching obfuscated code pattern)
   */
  private setupHammerGestures(): void {
    // Ensure Hammer is available on the global scope
    const Hammer = (window as any).Hammer;
    if (!Hammer) {
      throw new Error("Hammer.js is not loaded on the window object.");
    }

    // Create Hammer manager with exact same configuration as obfuscated code
    this.hammer = new Hammer.Manager(document.body, {
      recognizers: [
        // Tap gestures
        [Hammer.Tap, { event: "singletap", taps: 1 }],
        [Hammer.Tap, { event: "doubletap", taps: 2 }],
        [Hammer.Tap, { event: "tripletap", taps: 3 }],

        // Pan gesture with exact same defaults as obfuscated code
        [
          Hammer.Pan,
          {
            event: "pan",
            threshold: 10,
            pointers: 1,
            direction: 30, // DIRECTION_ALL
          },
        ],

        // Swipe gesture with exact same defaults as obfuscated code
        [
          Hammer.Swipe,
          {
            event: "swipe",
            threshold: 10,
            velocity: 0.3,
            direction: 30, // DIRECTION_ALL
            pointers: 1,
          },
        ],

        // Multi-touch gestures
        [Hammer.Pinch, { event: "pinch", threshold: 0, pointers: 2 }],
        [Hammer.Rotate, { event: "rotate", threshold: 0, pointers: 2 }],
      ],
      domEvents: true,
      touchAction: "auto",
    });

    // Add event listeners for all gesture types (matching obfuscated code)
    Object.keys(GESTURE_EVENTS).forEach((gestureType) => {
      this.hammer.on(gestureType, this.handleGesture.bind(this));
    });

    // Add directional event listeners (this is the key!)
    this.hammer.on("pan", this.handleGesture.bind(this));
    this.hammer.on("panleft", this.handleGesture.bind(this));
    this.hammer.on("panright", this.handleGesture.bind(this));
    this.hammer.on("panup", this.handleGesture.bind(this));
    this.hammer.on("pandown", this.handleGesture.bind(this));
    this.hammer.on("swipe", this.handleGesture.bind(this));
    this.hammer.on("swipeleft", this.handleGesture.bind(this));
    this.hammer.on("swiperight", this.handleGesture.bind(this));
    this.hammer.on("swipeup", this.handleGesture.bind(this));
    this.hammer.on("swipedown", this.handleGesture.bind(this));
  }

  /**
   * Handles Hammer.js gesture events (simplified like obfuscated code)
   */
  private handleGesture(event: any): void {
    this.gestureCount++;
    this.lastGestureTime = performance.now();

    // Extract basic gesture data like obfuscated code
    const gestureData: GestureData = {
      gestureType:
        GESTURE_EVENTS[event.type as GestureType] || event.type.toUpperCase(),
      originalType: event.type,
      timestamp: performance.now(),
      duration: event.deltaTime || 0,
      center: {
        x: event.center?.x || 0,
        y: event.center?.y || 0,
      },
      deltaX: event.deltaX || 0,
      deltaY: event.deltaY || 0,
      distance: event.distance || 0,
      angle: event.angle || 0,
      velocity: event.velocity || 0,
      velocityX: event.velocityX || 0,
      velocityY: event.velocityY || 0,
      scale: event.scale || 1,
      rotation: event.rotation || 0,
      direction:
        event.direction || this.calculateDirection(event.deltaX, event.deltaY),
      pointCount: event.pointers?.length || 1,
      pressure: this.extractPressure(event),
      radius: this.extractRadius(event),
      target: this.extractTarget(event),
      isMultiTouch: (event.pointers?.length || 1) > 1,
      fingerCount: event.pointers?.length || 1,
    };

    // Debug logging for testing (matching obfuscated code structure)
    console.log(`[SDK] ${this.moduleName}: Gesture detected:`, {
      type: gestureData.gestureType,
      originalType: gestureData.originalType,
      center: gestureData.center,
      distance: gestureData.distance,
      velocity: gestureData.velocity,
      pointCount: gestureData.pointCount,
      isMultiTouch: gestureData.isMultiTouch,
      platform: this.detectPlatform(),
      // Additional debug info matching obfuscated code
      deltaX: gestureData.deltaX,
      deltaY: gestureData.deltaY,
      angle: gestureData.angle,
      direction: gestureData.direction,
      duration: gestureData.duration,
      // Raw event data like obfuscated code
      eventType: event.eventType,
      isFirst: event.isFirst,
      isFinal: event.isFinal,
      maxPointers: event.maxPointers,
      offsetDirection: event.offsetDirection,
      overallVelocity: event.overallVelocity,
      overallVelocityX: event.overallVelocityX,
      overallVelocityY: event.overallVelocityY,
      pointerType: event.pointerType,
      rotation: event.rotation,
      scale: event.scale,
      timeStamp: event.timeStamp,
    });

    // Dispatch gesture event
    this.eventManager.dispatch(this.moduleName, "gesture", {
      ...gestureData,
      gestureCount: this.gestureCount,
      timeSinceLastGesture:
        this.lastGestureTime > 0
          ? gestureData.timestamp - this.lastGestureTime
          : 0,
    });
  }

  /**
   * Detects the current platform for debugging
   */
  private detectPlatform(): string {
    if (typeof window === "undefined") return "unknown";

    const userAgent = navigator.userAgent.toLowerCase();
    const isMac = userAgent.includes("mac");
    const isChrome = userAgent.includes("chrome");
    const isTouch = "ontouchstart" in window;

    if (isMac && isChrome) {
      return isTouch ? "macos-chrome-touch" : "macos-chrome-mouse";
    }

    return isTouch ? "mobile" : "desktop";
  }

  /**
   * Calculates gesture direction from delta values
   */
  private calculateDirection(deltaX: number, deltaY: number): string {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? "right" : "left";
    } else {
      return deltaY > 0 ? "down" : "up";
    }
  }

  /**
   * Extracts pressure data from event
   */
  private extractPressure(event: any): number {
    if (event.pointers && event.pointers.length > 0) {
      return event.pointers[0].force || 0;
    }
    return 0;
  }

  /**
   * Extracts radius data from event
   */
  private extractRadius(event: any): { x: number; y: number } {
    if (event.pointers && event.pointers.length > 0) {
      return {
        x: event.pointers[0].radiusX || 0,
        y: event.pointers[0].radiusY || 0,
      };
    }
    return { x: 0, y: 0 };
  }

  /**
   * Extracts target element information
   */
  private extractTarget(event: any): {
    tag: string;
    id?: string;
    className?: string;
  } {
    const target = event.target || event.srcEvent?.target;
    if (target) {
      return {
        tag: target.tagName?.toLowerCase() || "unknown",
        id: target.id || undefined,
        className: target.className || undefined,
      };
    }
    return { tag: "unknown" };
  }

  /**
   * Cleans up the gesture detection when the module is destroyed
   */
  public destroy(): void {
    // Remove all listeners added by this module
    super.destroy();

    // Destroy Hammer.js instance
    if (this.hammer) {
      this.hammer.destroy();
      this.hammer = null;
    }

    // Reset state
    this.gestureCount = 0;
    this.lastGestureTime = 0;
  }
}
