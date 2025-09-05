import { createHash, randomBytes } from "crypto";

export class CryptoUtils {
  /**
   * Generates a secure handshake hash from the given components.
   * This should match the hash generation in the web-SDK.
   */
  public static generateHandshakeHash(
    organizationId: string,
    transactionId: string,
    sessionId: string,
    deviceId: string
  ): string {
    const handshakeString = `${organizationId}${transactionId}${sessionId}${deviceId}`;
    return createHash("sha256").update(handshakeString).digest("hex");
  }

  /**
   * Validates that the provided hash matches the expected hash
   * for the given parameters.
   */
  public static validateHandshakeHash(
    providedHash: string,
    organizationId: string,
    transactionId: string,
    sessionId: string,
    deviceId: string
  ): boolean {
    const expectedHash = this.generateHandshakeHash(
      organizationId,
      transactionId,
      sessionId,
      deviceId
    );
    return providedHash === expectedHash;
  }

  /**
   * Generates a cryptographically secure session token.
   */
  public static generateSessionToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Generates a unique batch ID for event tracking.
   */
  public static generateBatchId(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Generates a secure API key for organizations.
   */
  public static generateApiKey(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Validates that a token meets minimum security requirements.
   */
  public static validateTokenFormat(token: string): boolean {
    // Check if token is hexadecimal and of appropriate length
    return /^[a-f0-9]{64}$/i.test(token);
  }

  /**
   * Creates a time-based hash for additional security measures.
   */
  public static createTimestampHash(data: string, timestamp: number): string {
    const timestampedData = `${data}:${timestamp}`;
    return createHash("sha256").update(timestampedData).digest("hex");
  }

  /**
   * Validates a timestamp-based hash within a time window.
   */
  public static validateTimestampHash(
    providedHash: string,
    data: string,
    timestamp: number,
    windowMs: number = 30000 // 30 seconds default
  ): boolean {
    const now = Date.now();
    const timeDiff = Math.abs(now - timestamp);

    if (timeDiff > windowMs) {
      return false;
    }

    const expectedHash = this.createTimestampHash(data, timestamp);
    return providedHash === expectedHash;
  }
}
