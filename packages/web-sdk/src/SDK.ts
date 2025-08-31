// src/SDK.ts
import { Collector, ModuleManager, SessionManager, IdentityManager, ConfigManager, type SDKConfig } from '@/managers';

export class SDK {
    private static instance: SDK;
    private isStarted: boolean = false;
    private configManager = ConfigManager.getInstance();
    private identityManager = IdentityManager.getInstance();
    private sessionManager = SessionManager.getInstance();
    private moduleManager = ModuleManager.getInstance();
    private collector = Collector.getInstance();

    private constructor() {}

    public static getInstance(): SDK {
        if (!SDK.instance) {
            SDK.instance = new SDK();
        }
        return SDK.instance;
    }

    public async start(userConfig: Partial<SDKConfig>): Promise<void> {
        if (this.isStarted) {
            console.warn("[SDK] Start called more than once.");
            return;
        }

        try {
            this.configManager.configure(userConfig);
            const config = this.configManager.config;

            await this.identityManager.initialize();
            
            this.sessionManager.start(config.sessionTimeout ?? 15);
            
            this.collector.configure({
                batchSize: config.batchSize ?? 50,
                flushInterval: config.flushInterval ?? 5000,
            });
            this.collector.start();

            this.moduleManager.registerAndInit(config.modules);

            this.isStarted = true;
            console.log("[SDK] Started Successfully.");

        } catch (error) {
            console.error("[SDK] Failed to start:", error);
            this.shutdown(); // Clean up on failure
        }
    }

    public shutdown(): void {
        if (!this.isStarted) return;
        this.moduleManager.destroyAll();
        this.collector.stop();
        this.sessionManager.end();
        this.isStarted = false;
        console.log("[SDK] Shutdown complete.");
    }
}