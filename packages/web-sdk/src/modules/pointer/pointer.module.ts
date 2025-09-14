import { BaseModule } from "../BaseModule";

/**
 * Pointer Events Detection Module
 *
 * Monitors pointer events (mouse, touch, pen) to detect:
 * - Input device types and capabilities
 * - User interaction patterns
 * - Device fingerprinting data
 * - Behavioral analysis for fraud detection
 *
 * Based on analysis of obfuscated code implementation
 */
export class PointerModule extends BaseModule {
  public readonly moduleName = "pointer";

  private lastClientX: number = 0;
  private lastClientY: number = 0;
  private isInitialized: boolean = false;

  /**
   * Initialize pointer event monitoring
   */
  public init(): void {
    if (this.isInitialized) {
      return;
    }

    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    this.setupPointerEventListeners();
    this.isInitialized = true;

    console.log(
      `[SDK] ${this.moduleName}: Pointer event monitoring initialized`
    );
  }

  /**
   * Setup pointer event listeners based on obfuscated code pattern
   */
  private setupPointerEventListeners(): void {
    // Event types from obfuscated code analysis
    const eventTypes = [
      "pointerover",
      "pointerout",
      "pointerdown",
      "pointermove",
      "pointerup",
      "pointercancel",
      "lostpointercapture",
    ];

    // Add listeners for each event type
    eventTypes.forEach((eventType) => {
      this.addListener(
        document,
        eventType,
        (event: Event) => {
          this.handlePointerEvent(event as PointerEvent);
        },
        {
          passive: true,
          capture: true,
        }
      );
    });

    // Also listen for wheel and scroll events as per obfuscated code
    this.addListener(
      document,
      "wheel",
      (event: Event) => {
        this.handleWheelEvent(event as WheelEvent);
      },
      {
        passive: true,
        capture: true,
      }
    );

    this.addListener(
      document,
      "scroll",
      (event: Event) => {
        this.handleScrollEvent(event);
      },
      {
        passive: true,
        capture: true,
      }
    );
  }

  /**
   * Handle pointer events - matches obfuscated code pattern
   */
  private handlePointerEvent(event: PointerEvent): void {
    // Check if this is a new event (matching obfuscated code logic)
    if (this.shouldProcessEvent(event)) {
      this.processPointerEvent(event);
    }
  }

  /**
   * Handle wheel events
   */
  private handleWheelEvent(event: WheelEvent): void {
    this.processWheelEvent(event);
  }

  /**
   * Handle scroll events
   */
  private handleScrollEvent(event: Event): void {
    this.processScrollEvent(event);
  }

  /**
   * Check if event should be processed (matching obfuscated code logic)
   */
  private shouldProcessEvent(event: PointerEvent): boolean {
    // Check if this is a new event or coordinates changed
    return (
      event.type === "pointerdown" ||
      this.lastClientX !== event.clientX ||
      this.lastClientY !== event.clientY
    );
  }

  /**
   * Process pointer event and create payload (matching obfuscated code structure)
   */
  private processPointerEvent(event: PointerEvent): void {
    // Update last coordinates
    this.lastClientX = event.clientX;
    this.lastClientY = event.clientY;

    // Create payload matching obfuscated code structure
    const payload = this.createPointerPayload(event);

    // Dispatch event
    this.eventManager.dispatch(this.moduleName, "pointer", payload);
  }

  /**
   * Process wheel event
   */
  private processWheelEvent(event: WheelEvent): void {
    const payload = {
      eventType: "wheel",
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ,
      deltaMode: event.deltaMode,
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      timestamp: performance.now(),
    };

    this.eventManager.dispatch(this.moduleName, "pointer", payload);
  }

  /**
   * Process scroll event
   */
  private processScrollEvent(_event: Event): void {
    const payload = {
      eventType: "scroll",
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      timestamp: performance.now(),
    };

    this.eventManager.dispatch(this.moduleName, "pointer", payload);
  }

  /**
   * Create pointer event payload (matching obfuscated code structure)
   */
  private createPointerPayload(event: PointerEvent): any {
    // Map event types to match obfuscated code
    const eventTypeMap: { [key: string]: string } = {
      pointerover: "POINTER_OVER",
      pointerout: "POINTER_OUT",
      pointerdown: "POINTER_DOWN",
      pointermove: "POINTER_MOVE",
      pointerup: "POINTER_UP",
      pointercancel: "POINTER_CANCEL",
      lostpointercapture: "LOST_POINTER_CAPTURE",
    };

    // Map pointer types to match obfuscated code
    const pointerTypeMap: { [key: number]: string } = {
      2: "mouse",
      3: "pen",
      4: "touch",
      5: "kinect",
    };

    const mappedEventType = eventTypeMap[event.type] || event.type;
    const mappedPointerType =
      pointerTypeMap[event.pointerType as any] || event.pointerType;

    // Create payload matching obfuscated code structure
    const payload = {
      eventType: mappedEventType,
      button: event.button,
      buttons: event.buttons,
      pressure: event.pressure,
      tangentialPressure: event.tangentialPressure,
      tiltX: event.tiltX,
      tiltY: event.tiltY,
      twist: event.twist,
      pointerType: mappedPointerType,
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      x: event.x,
      y: event.y,
      movementX: event.movementX,
      movementY: event.movementY,
      pointerId: event.pointerId,
      isPrimary: event.isPrimary,
      width: event.width,
      height: event.height,
      timestamp: performance.now(),
    };

    return payload;
  }

  /**
   * Get current pointer state
   */
  public getPointerState(): {
    lastClientX: number;
    lastClientY: number;
    isInitialized: boolean;
  } {
    return {
      lastClientX: this.lastClientX,
      lastClientY: this.lastClientY,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Reset pointer monitoring
   */
  public reset(): void {
    this.lastClientX = 0;
    this.lastClientY = 0;
    this.isInitialized = false;
  }

  /**
   * Cleanup and destroy module
   */
  public destroy(): void {
    this.reset();
    console.log(`[SDK] ${this.moduleName}: Pointer event monitoring destroyed`);
  }
}
