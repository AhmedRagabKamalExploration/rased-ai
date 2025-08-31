import { Collector, ModuleManager, SessionManager, IdentityManager, ConfigManager, type WebSDKConfig } from '@/managers';
import { featureModules } from '@/modules';
export class WebSDK {
    private static instance: WebSDK;
    private isStarted: boolean = false;
    private configManager = ConfigManager.getInstance();
    private identityManager = IdentityManager.getInstance();
    private sessionManager = SessionManager.getInstance();
    private moduleManager = ModuleManager.getInstance();
    private collector = Collector.getInstance();

    private constructor() {}

    public static getInstance(): WebSDK {
        if (!WebSDK.instance) {
            WebSDK.instance = new WebSDK();
        }
        return WebSDK.instance;
    }

    public async start(userConfig: Partial<WebSDKConfig>): Promise<void> {
        if (this.isStarted) {
            console.warn("[WebSDK] Start called more than once.");
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

            this.moduleManager.registerAndInit(featureModules);

            this.isStarted = true;
            console.log("[WebSDK] Started Successfully.");

        } catch (error) {
            console.error("[WebSDK] Failed to start:", error);
            this.shutdown(); // Clean up on failure
        }
    }

    public shutdown(): void {
        if (!this.isStarted) return;
        this.moduleManager.destroyAll();
        this.collector.stop();
        this.sessionManager.end();
        this.isStarted = false;
        console.log("[WebSDK] Shutdown complete.");
    }
}