import { ConfigManager } from "./ConfigManager";
import { TokenManager } from "./TokenManager";
import { EncryptionManager } from "./EncryptionManager";
import { MetadataManager } from "./MetadataManager";

export class APIManager {
  private static instance: APIManager;
  private configManager = ConfigManager.getInstance();
  private tokenManager = TokenManager.getInstance();
  private encryptionManager = EncryptionManager.getInstance();
  private metadataManager = MetadataManager.getInstance();

  private constructor() {}

  public static getInstance(): APIManager {
    if (!APIManager.instance) {
      APIManager.instance = new APIManager();
    }
    return APIManager.instance;
  }

  /**
   * Performs the initial handshake to get the first session token.
   * This is a critical step for authorizing the SDK.
   */
  public async initialize(): Promise<void> {
    const { baseApiUrl, organizationId, sessionId, transactionId } =
      this.configManager.config;

    // Generate nonce token for secure communication
    const nonceToken = this.tokenManager.generateNonce();

    // The handshake hash is a unique fingerprint for this specific transaction request.
    const handshakeString = `${organizationId}${transactionId}${sessionId}${nonceToken}`;
    const handshakeHash = await this.hash(handshakeString);

    const tokenUrl = `${baseApiUrl}/token/${handshakeHash}`;

    console.log(`[SDK] APIManager: Requesting session token with nonce.`);

    try {
      const response = await fetch(tokenUrl, {
        method: "GET",
        headers: {
          "x-organisationid": organizationId,
          "x-sessionid": sessionId,
          "x-transactionid": transactionId,
          "x-nonce-token": nonceToken,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Token handshake failed with status: ${response.status}`
        );
      }
      const sessionToken = response.headers.get("x-session-token");
      if (!sessionToken) {
        throw new Error(
          "Server response did not include x-session-token header."
        );
      }

      // Store session token in TokenManager
      this.tokenManager.setAuthToken(sessionToken, 3600000); // 1 hour

      console.log("[SDK] APIManager: Session token acquired successfully.");
    } catch (error) {
      console.error("[SDK] APIManager: Initialization failed.", error);
      throw error;
    }
  }

  /**
   * Sends a batch of events to the backend, handling token rotation and encryption.
   * @param batch The batch object from the Collector.
   */
  public async sendEvents(batch: object): Promise<void> {
    const sessionToken = this.tokenManager.getAuthToken();
    if (!sessionToken) {
      console.error("[SDK] APIManager: Cannot send events, no session token.");
      return;
    }

    const { baseApiUrl, organizationId } = this.configManager.config;
    const eventsUrl = `${baseApiUrl}/event`;

    try {
      // Encrypt the batch data before sending
      const encryptedBatch = this.encryptionManager.encrypt(batch);

      // Get current metadata for the request
      const metadata = this.metadataManager.exportMetadataForBatch();

      // Generate new nonce for this request
      const nonceToken = this.tokenManager.generateNonce();

      const response = await fetch(eventsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": sessionToken,
          "x-organisationid": organizationId,
          "x-nonce-token": nonceToken,
          "x-metadata": JSON.stringify(metadata),
        },
        body: JSON.stringify({
          encryptedData: encryptedBatch,
          metadata: metadata,
          nonce: nonceToken,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Event submission failed with status: ${response.status}`
        );
      }

      // Handle token rotation
      const newToken = response.headers.get("x-session-token");
      if (newToken && newToken !== sessionToken) {
        this.tokenManager.setAuthToken(newToken, 3600000);
        console.log(
          "[SDK] APIManager: New session token received and updated."
        );
      }

      // Process any queued messages that were waiting for nonce
      const processedMessages = this.tokenManager.processNonceQueue();
      if (processedMessages.length > 0) {
        console.log(
          `[SDK] APIManager: Processed ${processedMessages.length} queued messages.`
        );
      }
    } catch (error) {
      console.error("[SDK] APIManager: Failed to send events.", error);

      // Queue the batch for retry if nonce is available
      if (this.tokenManager.getNonceToken()) {
        this.tokenManager.queueForNonce(batch);
      }
    }
  }

  /**
   * Sends configuration data to the backend.
   * @param configData Configuration data to send.
   */
  public async sendConfig(configData: object): Promise<void> {
    const sessionToken = this.tokenManager.getAuthToken();
    if (!sessionToken) {
      console.error("[SDK] APIManager: Cannot send config, no session token.");
      return;
    }

    const { baseApiUrl, organizationId } = this.configManager.config;
    const configUrl = `${baseApiUrl}/config`;

    try {
      const encryptedConfig = this.encryptionManager.encrypt(configData);
      const nonceToken = this.tokenManager.generateNonce();

      const response = await fetch(configUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": sessionToken,
          "x-organisationid": organizationId,
          "x-nonce-token": nonceToken,
        },
        body: JSON.stringify({
          encryptedData: encryptedConfig,
          nonce: nonceToken,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Config submission failed with status: ${response.status}`
        );
      }

      console.log("[SDK] APIManager: Configuration sent successfully.");
    } catch (error) {
      console.error("[SDK] APIManager: Failed to send config.", error);
    }
  }

  /**
   * Gets the current token status and queue information.
   */
  public getStatus(): {
    hasSessionToken: boolean;
    hasNonceToken: boolean;
    queueStatus: { nonceQueue: number; failedQueue: number };
    tokenSummary: string;
  } {
    return {
      hasSessionToken: !!this.tokenManager.getAuthToken(),
      hasNonceToken: !!this.tokenManager.getNonceToken(),
      queueStatus: this.tokenManager.getQueueStatus(),
      tokenSummary: this.tokenManager.getTokenSummary(),
    };
  }

  /**
   * Forces refresh of all tokens.
   */
  public async refreshTokens(): Promise<void> {
    try {
      this.tokenManager.forceRefreshAllTokens();
      console.log("[SDK] APIManager: All tokens refreshed.");
    } catch (error) {
      console.error("[SDK] APIManager: Failed to refresh tokens.", error);
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
