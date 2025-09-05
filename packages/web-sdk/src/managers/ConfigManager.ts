export interface SdkInitConfig {
  baseApiUrl: string;
  organizationId: string;
  sessionId: string;
  transactionId: string;
  trigger: string; // The raw JSON string for the trigger
}

// A parsed version of the trigger config for internal use
interface TriggerConfig {
  selector: string;
  eventName: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private _config!: SdkInitConfig;
  private _triggerConfig: TriggerConfig | null = null;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public get config(): SdkInitConfig {
    return this._config;
  }

  public configure(userConfig: SdkInitConfig): void {
    // Presence validation for all required fields
    if (!userConfig.baseApiUrl)
      throw new Error("[SDK] Config Error: `baseApiUrl` is mandatory.");
    if (!userConfig.organizationId)
      throw new Error("[SDK] Config Error: `organizationId` is mandatory.");
    if (!userConfig.sessionId)
      throw new Error("[SDK] Config Error: `sessionId` is mandatory.");
    if (!userConfig.transactionId)
      throw new Error("[SDK] Config Error: `transactionId` is mandatory.");
    if (!userConfig.trigger)
      throw new Error("[SDK] Config Error: `trigger` is mandatory.");

    this._config = userConfig;
    this.parseTriggerConfig();
    console.log("[SDK] Client configuration validated successfully.");
  }

  private parseTriggerConfig(): void {
    try {
      // Safely parse the JSON string from the config
      const parsed = JSON.parse(this._config.trigger);
      // Example format: {"#trigger":"submit"}
      const selector = Object.keys(parsed)[0];
      const eventName = parsed[selector];
      if (selector && eventName) {
        this._triggerConfig = { selector, eventName };
      }
    } catch (error) {
      console.error("[SDK] Failed to parse trigger configuration.", error);
      this._triggerConfig = null;
    }
  }

  public attachTrigger(finalFlushCallback: () => void): void {
    if (!this._triggerConfig) return;

    const { selector, eventName } = this._triggerConfig;
    const triggerElement = document.querySelector(selector);

    if (triggerElement) {
      console.log(
        `[SDK] Attaching final flush trigger ('${eventName}') to element:`,
        triggerElement
      );
      triggerElement.addEventListener(eventName, finalFlushCallback, {
        once: true,
      });
    } else {
      console.warn(
        `[SDK] Config Warning: The element for trigger selector "${selector}" was not found.`
      );
    }
  }
}
