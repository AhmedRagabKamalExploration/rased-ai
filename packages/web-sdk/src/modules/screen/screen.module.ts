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
   * @returns An object containing the screen fingerprint data.
   */
  private collectScreenData(): object {
    const isScreenAvailable = typeof screen !== "undefined";

    return {
      // --- Direct Screen Properties ---
      width: isScreenAvailable ? screen.width : -1,
      height: isScreenAvailable ? screen.height : -1,
      availWidth: isScreenAvailable ? screen.availWidth : -1,
      availHeight: isScreenAvailable ? screen.availHeight : -1,
      colorDepth: isScreenAvailable ? screen.colorDepth : -1,
      pixelDepth: isScreenAvailable ? screen.pixelDepth : -1,
      orientation:
        isScreenAvailable && screen.orientation
          ? screen.orientation.type
          : "N/A",

      // --- Direct Window Properties ---
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      devicePixelRatio: window.devicePixelRatio,

      // --- Derived Properties for Deeper Insight ---
      // Reveals OS taskbar size
      taskbarHeight: isScreenAvailable
        ? screen.height - screen.availHeight
        : -1,
      // Reveals browser toolbar/border size
      browserChromeWidth: window.outerWidth - window.innerWidth,
      browserChromeHeight: window.outerHeight - window.innerHeight,
    };
  }
}
