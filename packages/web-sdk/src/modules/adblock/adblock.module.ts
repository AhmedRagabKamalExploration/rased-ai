import { BaseModule } from "@/modules/BaseModule";

export class AdblockModule extends BaseModule {
  public readonly moduleName: string = "adblock";

  /**
   * Initializes the adblock detection process.
   * This is now an async operation to handle resource-based checks.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const result = await this.detectAdblocker();
      this.eventManager.dispatch(this.moduleName, "adblock", {
        hasAdblocker: result,
        timestamp: Date.now(),
        detectionMethod: "dom-manipulation-and-resource-check",
      });
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Failed to collect data.`, error);
      this.eventManager.dispatch(this.moduleName, "adblock.error", {
        error: (error as Error).message,
        errorCode: "UNEXPECTED_ERROR",
        details: {
          browserName: navigator.userAgent,
          privacyMode: navigator.doNotTrack === "1",
          domManipulationBlocked: false,
        },
      });
    }
  }

  /**
   * Detects if an ad blocker is active using a combination of methods.
   * @returns {Promise<boolean>} A promise that resolves to true if an ad blocker is detected.
   */
  private async detectAdblocker(): Promise<boolean> {
    // Check 1: DOM-based check (fast, but can be bypassed)
    const domCheckResult = this.checkDomManipulation();

    // Check 2: Resource-based check (slower, but highly reliable)
    const resourceCheckResult = await this.checkResourceLoading();

    // If either check passes, we'll assume an ad blocker is present.
    return domCheckResult || resourceCheckResult;
  }

  /**
   * Performs a synchronous DOM manipulation check.
   */
  private checkDomManipulation(): boolean {
    const adblockTestClass = "ad-banner ad-container ad-wrapper";
    const testElement = document.createElement("div");
    testElement.className = adblockTestClass;
    testElement.style.position = "absolute";
    testElement.style.left = "-9999px";
    testElement.style.height = "1px";
    testElement.style.width = "1px";

    document.body.appendChild(testElement);
    const isBlocked =
      testElement.offsetHeight === 0 ||
      testElement.offsetParent === null ||
      window.getComputedStyle(testElement).getPropertyValue("display") ===
        "none";

    document.body.removeChild(testElement);
    return isBlocked;
  }

  /**
   * Performs an asynchronous check by trying to load a commonly blocked script.
   */
  private checkResourceLoading(): Promise<boolean> {
    return new Promise((resolve) => {
      const blockedUrl =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      const testScript = document.createElement("script");

      // Adblockers often block scripts from this URL. If they do, the 'onerror' event fires.
      testScript.onerror = () => {
        console.log("[AdblockModule] Resource check: Blocked script detected.");
        resolve(true); // Ad blocker detected
      };

      // If the script loads successfully, there's no ad blocker.
      testScript.onload = () => {
        console.log(
          "[AdblockModule] Resource check: Script loaded successfully."
        );
        resolve(false); // No ad blocker detected
      };

      // Set a timeout in case the ad blocker prevents both events from firing.
      setTimeout(() => {
        resolve(false);
      }, 2000); // Wait up to 2 seconds for a response.

      testScript.src = blockedUrl;
      document.head.appendChild(testScript);
    });
  }
}
