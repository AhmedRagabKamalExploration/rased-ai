import { BaseModule } from "@/modules/BaseModule";

export class DeviceOrientationModule extends BaseModule {
  public readonly moduleName: string = "device-orientation";

  private readonly debounceMs = 500; // Dispatch updates at most every 500ms
  private lastDispatchTime = 0;

  public init(): void {
    // Feature detect before adding listeners
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      // iOS 13+ requires explicit permission
      // In a real app, you might show a button to trigger this.
      // For passive collection, we can't do much if permission is needed.
      console.log(
        `[SDK] ${this.moduleName}: iOS 13+ device, permission required.`
      );
    } else {
      console.log(`[SDK] ${this.moduleName}: Initializing...`);
      this.addListener(
        window,
        "deviceorientation",
        this.handleOrientation.bind(this)
      );
      this.addListener(window, "devicemotion", this.handleMotion.bind(this));
    }
  }

  private handleOrientation(event: Event): void {
    const now = Date.now();
    if (now - this.lastDispatchTime < this.debounceMs) return;
    this.lastDispatchTime = now;

    const { absolute, alpha, beta, gamma } = event as DeviceOrientationEvent;
    this.eventManager.dispatch(this.moduleName, "device-orientation", {
      absolute,
      alpha,
      beta,
      gamma,
    });
  }

  private handleMotion(event: Event): void {
    const now = Date.now();
    if (now - this.lastDispatchTime < this.debounceMs) return;
    this.lastDispatchTime = now;

    const {
      acceleration,
      accelerationIncludingGravity,
      rotationRate,
      interval,
    } = event as DeviceMotionEvent;
    this.eventManager.dispatch(this.moduleName, "device-motion", {
      acceleration: {
        x: acceleration?.x,
        y: acceleration?.y,
        z: acceleration?.z,
      },
      accelerationIncludingGravity: {
        x: accelerationIncludingGravity?.x,
        y: accelerationIncludingGravity?.y,
        z: accelerationIncludingGravity?.z,
      },
      rotationRate: {
        alpha: rotationRate?.alpha,
        beta: rotationRate?.beta,
        gamma: rotationRate?.gamma,
      },
      interval,
    });
  }
}
