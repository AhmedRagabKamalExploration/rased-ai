import { ConfigManager } from "./ConfigManager";
import { IdentityManager } from "./IdentityManager";

export class APIManager {
  private static instance: APIManager;
  private sessionToken: string | null = null;
  private configManager = ConfigManager.getInstance();
  private identityManager = IdentityManager.getInstance();

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
    const deviceId = this.identityManager.getDeviceId();

    // The handshake hash is a unique fingerprint for this specific transaction request.
    const handshakeString = `${organizationId}${transactionId}${sessionId}${deviceId}`;
    const handshakeHash = await this.hash(handshakeString);

    const tokenUrl = `${baseApiUrl}/v1/token/${handshakeHash}`;

    console.log(`[SDK] APIManager: Requesting session token.`);

    try {
      const response = await fetch(tokenUrl, {
        method: "GET",
        headers: {
          "x-organisationid": organizationId,
          "x-sessionid": sessionId,
          "x-transactionid": transactionId,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Token handshake failed with status: ${response.status}`
        );
      }
      const token = response.headers.get("x-session-token");
      if (!token) {
        throw new Error(
          "Server response did not include x-session-token header."
        );
      }
      this.sessionToken = token;
      console.log("[SDK] APIManager: Session token acquired successfully.");
    } catch (error) {
      console.error("[SDK] APIManager: Initialization failed.", error);
      throw error;
    }
  }

  /**
   * Sends a batch of events to the backend, handling token rotation.
   * @param batch The batch object from the Collector.
   */
  public async sendEvents(batch: object): Promise<void> {
    if (!this.sessionToken) {
      console.error("[SDK] APIManager: Cannot send events, no session token.");
      return;
    }

    const { baseApiUrl, organizationId } = this.configManager.config;
    const eventsUrl = `${baseApiUrl}/v1/event`;

    try {
      const response = await fetch(eventsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": this.sessionToken,
          "x-organisationid": organizationId,
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        throw new Error(
          `Event submission failed with status: ${response.status}`
        );
      }

      // Best Practice: Token Rotation for enhanced security
      const newToken = response.headers.get("x-session-token");
      if (newToken && newToken !== this.sessionToken) {
        this.sessionToken = newToken;
        console.log(
          "[SDK] APIManager: New session token received and updated."
        );
      }
    } catch (error) {
      console.error("[SDK] APIManager: Failed to send events.", error);
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
