// src/managers/ConfigManager.ts
import { BaseModule } from "@/modules/BaseModule";

export interface WebSDKConfig {
  apiKey: string;
  modules: (new () => BaseModule)[];
  sessionTimeout?: number; // in minutes
  batchSize?: number;
  flushInterval?: number; // in milliseconds
}

const DEFAULT_CONFIG = {
  sessionTimeout: 15, // 15 minutes
  batchSize: 100,
  flushInterval: 5000, // 5 seconds
};

export class ConfigManager {
  private static instance: ConfigManager;
  private _config!: WebSDKConfig;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public get config(): WebSDKConfig {
    return this._config;
  }

  public configure(userConfig: Partial<WebSDKConfig>): void {
    const mergedConfig = { ...DEFAULT_CONFIG, ...userConfig };

    if (!mergedConfig.apiKey) {
      throw new Error("[SDK] Configuration Error: `apiKey` is mandatory.");
    }

    this._config = mergedConfig as WebSDKConfig;
    console.log("[SDK] Configuration validated successfully.");
  }
}
