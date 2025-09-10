import { BaseModule } from "@/modules/BaseModule";

export class ScreenModule extends BaseModule {
  public readonly moduleName: string = "screen";

  /**
   * Initializes the screen data collection. This is a synchronous, one-time snapshot.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const screenData = this.collectScreenData();
      // Dispatch the collected data immediately.
      this.eventManager.dispatch(this.moduleName, "screen", screenData);
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Failed to collect data.`, error);
      this.eventManager.dispatch(this.moduleName, "fingerprint.screen.error", {
        error: "Could not access screen or window properties.",
      });
    }
  }

  /**
   * Gathers a comprehensive set of properties from the `screen` and `window` objects.
   * Matches the exact structure from the obfuscated code.
   * @returns An object containing the screen fingerprint data.
   */
  private collectScreenData(): object {
    const isScreenAvailable = typeof screen !== "undefined";

    return {
      // Screen properties matching content.md structure
      devicePixelRatio: window.devicePixelRatio || 1,
      availHeight: isScreenAvailable ? screen.availHeight : 0,
      availLeft: isScreenAvailable ? (screen as any).availLeft || 0 : 0,
      availTop: isScreenAvailable ? (screen as any).availTop || 0 : 0,
      availWidth: isScreenAvailable ? screen.availWidth : 0,
      colorDepth: isScreenAvailable ? screen.colorDepth : 24,
      height: isScreenAvailable ? screen.height : 0,
      innerHeight: window.innerHeight || 0,
      innerWidth: window.innerWidth || 0,
      left: isScreenAvailable ? (screen as any).left || 0 : 0,
      pixelDepth: isScreenAvailable ? screen.pixelDepth : 24,
      top: isScreenAvailable ? (screen as any).top || 0 : 0,
      width: isScreenAvailable ? screen.width : 0,
      timestamp: Date.now(),
    };
  }
}
