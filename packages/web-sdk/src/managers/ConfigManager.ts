// src/managers/ConfigManager.ts
import { BaseModule } from '@/modules/BaseModule';

export interface SDKConfig {
    apiKey: string;
    modules: (new () => BaseModule)[];
    sessionTimeout?: number; // in minutes
    batchSize?: number;
    flushInterval?: number; // in milliseconds
}

const DEFAULT_CONFIG = {
    sessionTimeout: 15, // 15 minutes
    batchSize: 50,
    flushInterval: 5000, // 5 seconds
};

export class ConfigManager {
    private static instance: ConfigManager;
    private _config!: SDKConfig;

    private constructor() {}

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public get config(): SDKConfig {
        return this._config;
    }

    public configure(userConfig: Partial<SDKConfig>): void {
        const mergedConfig = { ...DEFAULT_CONFIG, ...userConfig };

        if (!mergedConfig.apiKey) {
            throw new Error("[SDK] Configuration Error: `apiKey` is mandatory.");
        }
        if (!mergedConfig.modules || mergedConfig.modules.length === 0) {
            throw new Error("[SDK] Configuration Error: `modules` array must be provided and contain at least one module.");
        }

        this._config = mergedConfig as SDKConfig;
        console.log("[SDK] Configuration validated successfully.");
    }
}