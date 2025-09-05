import { OrganizationRepository } from "@/db/repositories/organization.repository";
import { SessionRepository } from "@/db/repositories/session.repository";
import { TransactionRepository } from "@/db/repositories/transaction.repository";
import { CryptoUtils } from "@/utils/crypto";
import type { Session } from "@/db/schema";

export class AuthService {
  private organizationRepo = new OrganizationRepository();
  private sessionRepo = new SessionRepository();
  private transactionRepo = new TransactionRepository();

  /**
   * Validates the domain origin against organization whitelist.
   */
  public async validateOrigin(
    organizationId: string,
    origin: string
  ): Promise<boolean> {
    if (!origin) return false;

    // Pass the full origin URL to the repository for proper parsing
    return await this.organizationRepo.validateDomain(organizationId, origin);
  }

  /**
   * Validates the handshake hash and generates a session token.
   */
  public async validateHandshakeAndGenerateToken(
    handshakeHash: string,
    organizationId: string,
    sessionId: string,
    transactionId: string,
    deviceId: string
  ): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
    try {
      // 1. Validate organization exists and is active
      const organization = await this.organizationRepo.findById(organizationId);
      if (!organization) {
        return { success: false, error: "Invalid organization" };
      }

      // 2. Validate handshake hash
      const isValidHash = CryptoUtils.validateHandshakeHash(
        handshakeHash,
        organizationId,
        transactionId,
        sessionId
      );

      if (!isValidHash) {
        return { success: false, error: "Invalid handshake hash" };
      }

      // 3. Validate transaction exists and belongs to session/org
      const isValidTransaction = await this.transactionRepo.validateTransaction(
        transactionId,
        sessionId,
        organizationId
      );

      if (!isValidTransaction) {
        return { success: false, error: "Invalid transaction context" };
      }

      // 4. Find or create session
      let session = await this.sessionRepo.findById(sessionId);

      if (!session) {
        // Create new session
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        session = await this.sessionRepo.create({
          id: sessionId,
          organizationId,
          deviceId,
          sessionToken: null,
          handshakeHash,
          isActive: true,
          expiresAt,
        });
      }

      // 5. Generate new session token
      const sessionToken = CryptoUtils.generateSessionToken();

      // 6. Update session with new token
      await this.sessionRepo.updateToken(sessionId, sessionToken);

      return { success: true, sessionToken };
    } catch (error) {
      console.error("[AuthService] Handshake validation error:", error);
      return { success: false, error: "Internal server error" };
    }
  }

  /**
   * Validates a session token and optionally rotates it.
   */
  public async validateAndRotateToken(
    sessionToken: string,
    organizationId: string,
    rotateToken = false
  ): Promise<{
    success: boolean;
    session?: Session;
    newToken?: string;
    error?: string;
  }> {
    try {
      // 1. Find session by token
      const session = await this.sessionRepo.findByToken(sessionToken);

      if (!session) {
        return { success: false, error: "Invalid or expired session token" };
      }

      // 2. Validate organization matches
      if (session.organizationId !== organizationId) {
        return { success: false, error: "Organization mismatch" };
      }

      // 3. Update last activity
      await this.sessionRepo.updateActivity(session.id);

      // 4. Optionally rotate token
      let newToken: string | undefined;
      if (rotateToken) {
        newToken = CryptoUtils.generateSessionToken();
        await this.sessionRepo.updateToken(session.id, newToken);
      }

      return {
        success: true,
        session,
        ...(newToken && { newToken }),
      };
    } catch (error) {
      console.error("[AuthService] Token validation error:", error);
      return { success: false, error: "Internal server error" };
    }
  }

  /**
   * Validates session token without rotation (for event submission).
   */
  public async validateSessionToken(
    sessionToken: string,
    organizationId: string
  ): Promise<{ success: boolean; session?: Session; error?: string }> {
    const result = await this.validateAndRotateToken(
      sessionToken,
      organizationId,
      false
    );
    return {
      success: result.success,
      session: result.session,
      error: result.error,
    };
  }
}
