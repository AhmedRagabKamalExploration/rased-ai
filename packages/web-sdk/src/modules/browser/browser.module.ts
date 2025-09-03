import { BaseModule } from "@/modules/BaseModule";

export class BrowserModule extends BaseModule {
  public readonly moduleName: string = "browser";

  /**
   * Initializes the Browser and Plugins data collection.
   * This is a synchronous operation.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      this.collectBrowserData();
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      // In this module, errors are highly unlikely but we handle them just in case.
    }
  }

  private collectBrowserData() {
    // 1. Collect raw data from the navigator object
    const userAgent = navigator.userAgent || "";
    const vendor = navigator.vendor || "";
    const platform = navigator.platform || "";
    const language = navigator.language || "";
    const languages = [...(navigator.languages || [])];
    const cpuCores = navigator.hardwareConcurrency || 0;
    const isCookieEnabled = navigator.cookieEnabled || false;
    const doNotTrack = navigator.doNotTrack || null;
    const deviceMemory = (navigator as any).deviceMemory || undefined;

    // 2. Safely collect plugin information
    const plugins = this.getPluginData();

    // 3. Create a stable string from the key properties to be hashed
    const hashInput = `${userAgent}${vendor}${platform}${languages.join(",")}${cpuCores}${plugins.names.join(",")}`;

    // This module is synchronous, so we can't await a hash here.
    // We will dispatch the raw data and let the backend decide on hashing.
    // Alternatively, for consistency, we can wrap the dispatch in an async IIFE.
    (async () => {
      const fingerprint = await this.hash(hashInput);

      const payload = {
        fingerprint,
        identity: { userAgent, vendor, platform, language, languages },
        plugins,
        hardware: { cpuCores, deviceMemory, isCookieEnabled },
        privacy: { doNotTrack },
      };

      this.eventManager.dispatch(this.moduleName, "browser", payload);
    })();
  }

  private getPluginData(): { count: number; names: string[] } {
    try {
      const pluginArray = Array.from(navigator.plugins || []);
      return {
        count: pluginArray.length,
        names: pluginArray.map((p) => p.name).sort(), // Sort for consistency
      };
    } catch (e) {
      return { count: 0, names: [] };
    }
  }

  private async hash(data: string): Promise<string> {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    );
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
