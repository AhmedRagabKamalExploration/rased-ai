import { BaseModule } from "@/modules/BaseModule";

export class ClientHintsModule extends BaseModule {
  public readonly moduleName: string = "clientHints";

  /**
   * Initializes client hints collection. This is an async operation that
   * retrieves both low- and high-entropy hints.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const clientHintsData = await this.collectClientHintsData();
      this.eventManager.dispatch(
        this.moduleName,
        "clientHints",
        clientHintsData
      );
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "clientHints.error", {
        error: "Client hints collection failed",
        errorCode: "UNSUPPORTED_API",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Collects detailed client hints data from the browser.
   */
  private async collectClientHintsData(): Promise<any> {
    const uaData = (navigator as any).userAgentData;
    let highEntropyHints: any = {};

    // Request high-entropy hints if the API is available
    if (uaData && uaData.getHighEntropyValues) {
      try {
        highEntropyHints = await uaData.getHighEntropyValues([
          "architecture",
          "bitness",
          "model",
          "platformVersion",
          "uaFullVersion",
          "wow64",
          "fullVersionList",
        ]);
      } catch (error) {
        console.warn("[SDK] Could not retrieve high-entropy hints.");
      }
    }

    // Gather connection data
    const connection = (navigator as any).connection || {};

    return {
      cpuArch: highEntropyHints.architecture || null,
      chOsVersion: highEntropyHints.platformVersion || null,
      chConnection: connection.effectiveType || null,
      chBitness: highEntropyHints.bitness || null,
      chOs: uaData ? uaData.platform : null,
      chModel: highEntropyHints.model || null,
      chMobile: uaData ? uaData.mobile : false,
      chRtt: connection.rtt || null,
      chDownlink: connection.downlink || null,
      chFullVersionList: JSON.stringify(uaData ? uaData.brands : []),
      chWow64: highEntropyHints.wow64 || 0,
      chMobileNullable: uaData ? (uaData.mobile ? 1 : 0) : 0,
      chSaveData: connection.saveData ? 1 : 0,
      timestamp: Date.now(),
    };
  }
}
