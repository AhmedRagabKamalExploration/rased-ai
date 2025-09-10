import {
  Collector,
  ModuleManager,
  SessionManager,
  IdentityManager,
  ConfigManager,
  APIManager,
  EncryptionManager,
  MetadataManager,
  TokenManager,
  type SdkInitConfig,
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
  private encryptionManager = EncryptionManager.getInstance();
  private metadataManager = MetadataManager.getInstance();
  private tokenManager = TokenManager.getInstance();

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

      // 2. Initialize MetadataManager with session information
      const config = this.configManager.config;
      this.metadataManager.updateMetadata({
        tenantId: config.organizationId,
        sessionId: config.sessionId,
        transactionId: config.transactionId,
        origin: window.location.origin,
        sdkVersion: "1.0.0",
      });

      // 3. Initialize IdentityManager next, as APIManager depends on the deviceId.
      await this.identityManager.initialize();

      // 4. Initialize TokenManager and generate initial tokens
      this.tokenManager.generateNonce();
      this.tokenManager.generateSessionToken();

      // 5. Initialize APIManager to perform the secure token handshake.
      await this.apiManager.initialize();

      // 6. With a valid token, initialize all other services.
      this.sessionManager.start(config.sessionId, 15); // Using a default 15 min timeout
      this.collector.configure({ batchSize: 100, flushInterval: 5000 });
      this.collector.start();
      this.moduleManager.registerAndInit(featureModules);
      this.configManager.attachTrigger(this.shutdown.bind(this));

      // 7. Set heartbeat state to active
      this.metadataManager.setHeartbeatState("active");

      this.isStarted = true;
      console.log("[WebSDK] Started Successfully with enhanced security.");
    } catch (error) {
      console.error("[WebSDK] Failed to start:", error);
      this.shutdown(); // Clean up on failure
    }
  }

  public shutdown(): void {
    if (!this.isStarted) return;
    console.log("[WebSDK] Final flush and shutdown triggered.");

    // Set heartbeat state to inactive
    this.metadataManager.setHeartbeatState("inactive");
    this.metadataManager.setStopCollectionEvent(true);

    // Clean up all managers
    this.moduleManager.destroyAll();
    this.collector.stop();
    this.sessionManager.end();

    // Clean up new managers
    this.encryptionManager.destroy();
    this.metadataManager.destroy();
    this.tokenManager.destroy();

    this.isStarted = false;
    console.log("[WebSDK] Shutdown complete.");
  }

  // Public methods to access the new managers
  public getMetadataManager(): MetadataManager {
    return this.metadataManager;
  }

  public getTokenManager(): TokenManager {
    return this.tokenManager;
  }

  public getEncryptionManager(): EncryptionManager {
    return this.encryptionManager;
  }

  public getAPIManager(): APIManager {
    return this.apiManager;
  }
}
