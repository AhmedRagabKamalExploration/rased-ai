import {
  Collector,
  ModuleManager,
  SessionManager,
  IdentityManager,
  ConfigManager,
  APIManager,
  type SdkInitConfig,
  MetadataManager,
} from "@/managers";
import { featureModules } from "@/modules";

export class WebSDK {
  private static instance: WebSDK;
  private isStarted: boolean = false;
  private configManager = ConfigManager.getInstance();
  private identityManager = IdentityManager.getInstance();
  private sessionManager = SessionManager.getInstance();
  private moduleManager = ModuleManager.getInstance();
  private collector = Collector.getInstance();
  private apiManager = APIManager.getInstance();
  private metadataManager = MetadataManager.getInstance();

  private constructor() {}

  public static getInstance(): WebSDK {
    if (!WebSDK.instance) {
      WebSDK.instance = new WebSDK();
    }
    return WebSDK.instance;
  }
  public async start(userConfig: SdkInitConfig): Promise<void> {
    if (this.isStarted) {
      console.warn("[WebSDK] Start called more than once.");
      return;
    }

    try {
      // The order of operations is critical for this secure flow.
      // 1. Configure and validate the client-provided config first.
      this.configManager.configure(userConfig);

      // 2. Initialize IdentityManager next, as APIManager depends on the deviceId.
      await this.identityManager.initialize();

      // 3. Initialize APIManager to perform the secure token handshake.
      await this.apiManager.initialize();

      // 4. With a valid token, initialize all other services.
      const config = this.configManager.config;

      // 5. Initialize MetadataManager to track the session.
      this.metadataManager.updateMetadata(userConfig);

      this.sessionManager.start(config.sessionId, 15); // Using a default 15 min timeout
      this.collector.configure({ batchSize: 100, flushInterval: 1000 });
      this.collector.start();
      this.moduleManager.registerAndInit(featureModules);
      this.configManager.attachTrigger(this.shutdown.bind(this));

      this.isStarted = true;
      console.log("[WebSDK] Started Successfully.");
    } catch (error) {
      console.error("[WebSDK] Failed to start:", error);
      this.shutdown(); // Clean up on failure
    }
  }

  public shutdown(): void {
    if (!this.isStarted) return;
    console.log("[WebSDK] Final flush and shutdown triggered.");
    this.moduleManager.destroyAll();
    this.collector.stop();
    this.sessionManager.end();
    this.isStarted = false;
    console.log("[WebSDK] Shutdown complete.");
  }
}
