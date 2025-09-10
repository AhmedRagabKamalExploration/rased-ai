import { BaseModule } from "@/modules/BaseModule";

export class TimezoneModule extends BaseModule {
  public readonly moduleName: string = "timezone";

  /**
   * Initializes timezone data collection.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const timezoneData = this.collectTimezoneData();
      this.eventManager.dispatch(this.moduleName, "timezone", timezoneData);
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "timezone.error", {
        error: "Timezone data collection failed",
        errorCode: "UNEXPECTED_ERROR",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Collects data about the user's timezone, including offset and DST status.
   * @returns An object with timezone data.
   */
  private collectTimezoneData(): any {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const timezoneOffset = now.getTimezoneOffset();

    // Check for daylight savings time by comparing offsets in January and July.
    const isDaylightSavingsTime =
      jan.getTimezoneOffset() !== jul.getTimezoneOffset();

    return {
      isDaylightSavingsTime,
      timezoneOffset,
      timestamp: Date.now(),
    };
  }
}
