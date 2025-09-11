import { BaseModule } from "@/modules/BaseModule";

export class ReferrerUrlModule extends BaseModule {
  public readonly moduleName: string = "referrerUrl";

  /**
   * Initializes referrer URL data collection.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const referrerUrl = this.getReferrerUrl();
      this.eventManager.dispatch(this.moduleName, "referrerUrl", {
        referrerUrl: referrerUrl,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "referrerUrl.error", {
        error: "Referrer URL collection failed",
        errorCode: "COLLECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Retrieves the referrer URL from the document.
   * @returns The referrer URL string.
   */
  private getReferrerUrl(): string {
    return document.referrer || "direct"; // Default to "direct" if no referrer is found.
  }
}
