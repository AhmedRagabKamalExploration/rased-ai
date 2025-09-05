import { Context } from "hono";
import { OrganizationRepository } from "@/db/repositories/organization.repository";
import { SessionRepository } from "@/db/repositories/session.repository";
import { TransactionRepository } from "@/db/repositories/transaction.repository";
import { randomUUID } from "crypto";

export class ConfigController {
  private organizationRepo = new OrganizationRepository();
  private sessionRepo = new SessionRepository();
  private transactionRepo = new TransactionRepository();

  /**
   * GET /config
   * Server-to-server API for clients to get SDK configuration.
   * Requires API key authentication.
   */
  public async getConfig(c: Context) {
    try {
      // 1. Authenticate using API key (from Authorization header)
      const authHeader = c.req.header("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
          { error: "Missing or invalid authorization header" },
          401
        );
      }

      const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

      // 2. Find organization by API key
      const organization = await this.organizationRepo.findBySecretKey(apiKey);

      if (!organization) {
        return c.json({ error: "Invalid API key" }, 401);
      }

      // 3. Get optional parameters from query string or body
      const deviceId = c.req.query("device_id") || randomUUID();
      const sessionDuration = parseInt(
        c.req.query("session_duration") || "900"
      ); // 15 minutes default

      // 4. Create or find existing session for this device
      let session = await this.sessionRepo.findActiveByOrgAndDevice(
        organization.id,
        deviceId
      );

      if (!session) {
        // Create new session
        const sessionId = `ssn-${randomUUID()}`;
        const expiresAt = new Date(Date.now() + sessionDuration * 1000);

        session = await this.sessionRepo.create({
          id: sessionId,
          organizationId: organization.id,
          deviceId,
          sessionToken: null,
          handshakeHash: null,
          isActive: true,
          expiresAt,
        });
      }

      // 5. Create new transaction for this request
      const transactionId = `txn-${randomUUID()}`;

      const transaction = await this.transactionRepo.create({
        id: transactionId,
        sessionId: session.id,
        organizationId: organization.id,
        status: "pending",
      });

      // 6. Generate trigger configuration (customizable per organization)
      const trigger = c.req.query("trigger") || '{"#trigger":"submit"}';

      // 7. Return configuration for web-SDK initialization
      const config = {
        base_api_url:
          c.req.query("base_api_url") || `${c.req.url.split("/config")[0]}`,
        organization_id: organization.id,
        session_id: session.id,
        transaction_id: transaction.id,
        trigger,
        expires_at: session.expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      };

      console.log(
        `[Config] Generated config for org: ${organization.id}, session: ${session.id}, transaction: ${transaction.id}`
      );

      return c.json(config);
    } catch (error) {
      console.error("[Config] Error generating configuration:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * POST /config
   * Alternative endpoint that accepts configuration parameters in request body.
   */
  public async createConfig(c: Context) {
    try {
      // 1. Authenticate using API key
      const authHeader = c.req.header("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
          { error: "Missing or invalid authorization header" },
          401
        );
      }

      const apiKey = authHeader.substring(7);

      // 2. Find organization by API key
      const organization = await this.organizationRepo.findBySecretKey(apiKey);

      if (!organization) {
        return c.json({ error: "Invalid API key" }, 401);
      }

      // 3. Parse request body
      const body = await c.req.json().catch(() => ({}));

      const {
        device_id = randomUUID(),
        session_duration = 900, // 15 minutes
        trigger = '{"#trigger":"submit"}',
        base_api_url,
        metadata = {},
      } = body;

      // 4. Create or find existing session
      let session = await this.sessionRepo.findActiveByOrgAndDevice(
        organization.id,
        device_id
      );

      if (!session) {
        const sessionId = `ssn-${randomUUID()}`;
        const expiresAt = new Date(Date.now() + session_duration * 1000);

        session = await this.sessionRepo.create({
          id: sessionId,
          organizationId: organization.id,
          deviceId: device_id,
          sessionToken: null,
          handshakeHash: null,
          isActive: true,
          expiresAt,
        });
      }

      // 5. Create new transaction
      const transactionId = `txn-${randomUUID()}`;

      const transaction = await this.transactionRepo.create({
        id: transactionId,
        sessionId: session.id,
        organizationId: organization.id,
        status: "pending",
        metadata,
      });

      // 6. Return configuration
      const config = {
        base_api_url: base_api_url || `${new URL(c.req.url).origin}`,
        organization_id: organization.id,
        session_id: session.id,
        transaction_id: transaction.id,
        device_id,
        trigger,
        expires_at: session.expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        metadata,
      };

      console.log(
        `[Config] Created config for org: ${organization.id}, session: ${session.id}, transaction: ${transaction.id}`
      );

      return c.json(config, 201);
    } catch (error) {
      console.error("[Config] Error creating configuration:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * GET /config/validate
   * Endpoint to validate that a configuration is still valid.
   */
  public async validateConfig(c: Context) {
    try {
      const organizationId = c.req.query("organization_id");
      const sessionId = c.req.query("session_id");
      const transactionId = c.req.query("transaction_id");

      if (!organizationId || !sessionId || !transactionId) {
        return c.json(
          {
            error: "Missing required parameters",
            required: ["organization_id", "session_id", "transaction_id"],
          },
          400
        );
      }

      // Check if session is still active
      const session = await this.sessionRepo.findById(sessionId);
      const transaction = await this.transactionRepo.findById(transactionId);

      const isValid = !!(
        session &&
        session.isActive &&
        session.expiresAt > new Date() &&
        transaction &&
        transaction.sessionId === sessionId &&
        transaction.organizationId === organizationId
      );

      return c.json({
        valid: isValid,
        session_active: !!session?.isActive,
        session_expired: session ? session.expiresAt <= new Date() : true,
        transaction_exists: !!transaction,
        checked_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Config] Error validating configuration:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}
