import { BaseModule } from "@/modules/BaseModule";

export class BrowserTypeModule extends BaseModule {
  public readonly moduleName: string = "browserType";

  /**
   * Initializes browser type detection by collecting user agent and client hints.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const browserData = await this.getBrowserData();
      this.eventManager.dispatch(this.moduleName, "browserType", browserData);
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "browserType.error", {
        error: "Browser type detection failed",
        errorCode: "UNEXPECTED_ERROR",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Gathers comprehensive browser data, prioritizing Client Hints for accuracy.
   */
  private async getBrowserData(): Promise<any> {
    const userAgent = navigator.userAgent;
    const clientHints = await this.getClientHints();
    const browserDetails = this.parseUserAgent(userAgent);

    return {
      userAgent,
      browser: browserDetails.browser,
      os: browserDetails.os,
      deviceType: this.getDeviceType(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      clientHints,
      timestamp: Date.now(),
    };
  }

  /**
   * Attempts to get a comprehensive set of Client Hints.
   */
  private async getClientHints(): Promise<object> {
    if ("userAgentData" in navigator) {
      try {
        const uaData = (navigator as any).userAgentData;
        const hints = await uaData.getHighEntropyValues([
          "platformVersion",
          "model",
          "architecture",
          "bitness",
          "uaFullVersion",
          "wow64",
        ]);
        return {
          brands: uaData.brands,
          mobile: uaData.mobile,
          platform: uaData.platform,
          ...hints,
        };
      } catch (error) {
        console.warn(
          "[SDK] Client Hints collection failed, falling back to basic data."
        );
      }
    }
    return {
      brands: [],
      mobile: false,
      platform: navigator.platform,
      architecture: "unknown",
      bitness: "unknown",
      fullVersionList: navigator.appVersion,
      platformVersion: "unknown",
      uaFullVersion: "unknown",
      wow64: false,
      model: "unknown",
    };
  }

  /**
   * A basic fallback parser for the User Agent string.
   */
  private parseUserAgent(userAgent: string): { browser: any; os: any } {
    // This is a simplified parser. A production version would use a library.
    const match =
      /(Chrome|Firefox|Safari|Edge|Opera)\/?\s*([0-9.]+)/.exec(userAgent) || [];
    let browserName = "unknown";
    let browserVersion = "unknown";

    if (match[1]) {
      browserName = match[1];
      browserVersion = match[2] || "unknown";
    }

    const osMatch =
      /(Windows NT|Macintosh|Linux|Android|iPhone|iPad)/.exec(userAgent) || [];
    const osName = osMatch[1] || "unknown";

    return {
      browser: {
        name: browserName,
        version: browserVersion,
        majorVersion: browserVersion.split(".")[0],
      },
      os: {
        name: osName,
        version: "unknown",
      },
    };
  }

  /**
   * Determines the device type based on user agent and screen dimensions.
   */
  private getDeviceType(): "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN" {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("mobile") || userAgent.includes("android")) {
      return "MOBILE";
    }
    if (userAgent.includes("ipad") || userAgent.includes("tablet")) {
      return "TABLET";
    }
    return "DESKTOP";
  }
}
