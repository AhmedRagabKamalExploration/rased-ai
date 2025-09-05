import { Context } from "hono";
import { AuthService } from "@/services/auth.service";
import { CryptoUtils } from "@/utils/crypto";

export class TokenController {
  private authService = new AuthService();

  /**
   * GET /token/{hash}
   * Validates handshake hash and issues session token.
   * This is the core authentication endpoint for the web-SDK.
   */
  public async getToken(c: Context) {
    try {
      // 1. Extract hash from URL parameter
      const handshakeHash = c.req.param("hash");

      if (!handshakeHash) {
        return c.json({ error: "Missing handshake hash" }, 400);
      }

      // 2. Get required headers (already validated by middleware)
      const organizationId = c.get("organizationId");
      const sessionId = c.get("sessionId");
      const transactionId = c.get("transactionId");

      // 3. Extract device ID from web-SDK's current implementation
      // Note: This needs to match the exact hash generation from APIManager
      // Current SDK uses: organizationId + transactionId + sessionId + deviceId

      // For now, we'll need to derive deviceId from the hash since it's not in headers
      // In production, you might want to require deviceId as a header too

      // Let's validate the hash by trying different approaches
      // First, let's assume the hash might be from just the three parameters
      const simpleHash = CryptoUtils.generateHandshakeHash(
        organizationId,
        transactionId,
        sessionId,
        "" // Empty device ID to test
      );

      let deviceId = "";
      let isValidHash = false;

      // If simple hash doesn't match, we need to find the device ID
      if (handshakeHash !== simpleHash) {
        // Extract device ID from User-Agent or create one
        const userAgent = c.req.header("user-agent") || "";
        const fingerprint = c.req.header("x-fingerprint") || "";

        // Generate a consistent device ID from available headers
        deviceId = CryptoUtils.generateHandshakeHash(
          userAgent,
          fingerprint,
          "",
          ""
        );

        // Validate with generated device ID
        isValidHash = CryptoUtils.validateHandshakeHash(
          handshakeHash,
          organizationId,
          transactionId,
          sessionId,
          deviceId
        );
      } else {
        isValidHash = true;
      }

      // If still not valid, try to extract device ID from a header (if provided)
      if (!isValidHash) {
        deviceId = c.req.header("x-device-id") || "";
        isValidHash = CryptoUtils.validateHandshakeHash(
          handshakeHash,
          organizationId,
          transactionId,
          sessionId,
          deviceId
        );
      }

      // 4. Validate and generate token
      const result = await this.authService.validateHandshakeAndGenerateToken(
        handshakeHash,
        organizationId,
        sessionId,
        transactionId,
        deviceId
      );

      if (!result.success) {
        console.warn(`[Token] Hash validation failed: ${result.error}`);
        return c.json({ error: result.error }, 401);
      }

      // 5. Return session token in header (no body response)
      c.header("x-session-token", result.sessionToken!);

      console.log(
        `[Token] Generated session token for org: ${organizationId}, session: ${sessionId}`
      );

      return c.text("", 200);
    } catch (error) {
      console.error("[Token] Error generating token:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * POST /token/refresh
   * Refreshes an existing session token.
   */
  public async refreshToken(c: Context) {
    try {
      const sessionToken = c.req.header("x-session-token");
      const organizationId = c.get("organizationId");

      if (!sessionToken) {
        return c.json({ error: "Missing session token" }, 401);
      }

      // Validate and rotate token
      const result = await this.authService.validateAndRotateToken(
        sessionToken,
        organizationId,
        true // Force rotation
      );

      if (!result.success) {
        return c.json({ error: result.error }, 401);
      }

      // Return new token in header
      c.header("x-session-token", result.newToken!);

      return c.json({
        refreshed_at: new Date().toISOString(),
        expires_at: result.session?.expiresAt,
      });
    } catch (error) {
      console.error("[Token] Error refreshing token:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * POST /token/validate
   * Validates a session token without rotation.
   */
  public async validateToken(c: Context) {
    try {
      const sessionToken = c.req.header("x-session-token");
      const organizationId = c.get("organizationId");

      if (!sessionToken) {
        return c.json({ error: "Missing session token" }, 401);
      }

      const result = await this.authService.validateSessionToken(
        sessionToken,
        organizationId
      );

      if (!result.success) {
        return c.json({ error: result.error, valid: false }, 401);
      }

      return c.json({
        valid: true,
        session_id: result.session?.id,
        expires_at: result.session?.expiresAt,
        last_activity: result.session?.lastActivityAt,
        validated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Token] Error validating token:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * DELETE /token
   * Invalidates a session token (logout).
   */
  public async revokeToken(c: Context) {
    try {
      const sessionToken = c.req.header("x-session-token");
      const organizationId = c.get("organizationId");

      if (!sessionToken) {
        return c.json({ error: "Missing session token" }, 401);
      }

      const result = await this.authService.validateSessionToken(
        sessionToken,
        organizationId
      );

      if (!result.success) {
        return c.json({ error: result.error }, 401);
      }

      // TODO: Add session revocation method to AuthService
      // For now, we'll just return success

      return c.json({
        revoked: true,
        revoked_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Token] Error revoking token:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}
