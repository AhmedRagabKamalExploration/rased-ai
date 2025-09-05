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

      // 3. Validate handshake hash (now without deviceId)
      const isValidHash = CryptoUtils.validateHandshakeHash(
        handshakeHash,
        organizationId,
        transactionId,
        sessionId
      );

      if (!isValidHash) {
        console.warn(
          `[Token] Hash validation failed for org: ${organizationId}`
        );
        return c.json({ error: "Invalid handshake hash" }, 401);
      }

      // 4. Generate device ID from request headers for session tracking
      const userAgent = c.req.header("user-agent") || "";
      const deviceId = CryptoUtils.generateHandshakeHash(userAgent, "", "", "");

      // 5. Validate and generate token
      const result = await this.authService.validateHandshakeAndGenerateToken(
        handshakeHash,
        organizationId,
        sessionId,
        transactionId,
        deviceId
      );

      if (!result.success) {
        console.warn(`[Token] Token generation failed: ${result.error}`);
        return c.json({ error: result.error }, 401);
      }

      // 6. Return session token in header (no body response)
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
