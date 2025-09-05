import { db } from "@/db";
import { sessions } from "../schema";
import { eq, and, gt } from "drizzle-orm";
import type { Session, NewSession } from "../schema";

export class SessionRepository {
  public async findById(id: string): Promise<Session | undefined> {
    return db.query.sessions.findFirst({
      where: and(
        eq(sessions.id, id),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date())
      ),
    });
  }

  public async findByToken(token: string): Promise<Session | undefined> {
    return db.query.sessions.findFirst({
      where: and(
        eq(sessions.sessionToken, token),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date())
      ),
    });
  }

  public async findByHash(handshakeHash: string): Promise<Session | undefined> {
    return db.query.sessions.findFirst({
      where: and(
        eq(sessions.handshakeHash, handshakeHash),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date())
      ),
    });
  }

  public async create(data: NewSession): Promise<Session> {
    const result = await db.insert(sessions).values(data).returning();
    return result[0];
  }

  public async updateToken(
    sessionId: string,
    newToken: string
  ): Promise<Session | null> {
    const result = await db
      .update(sessions)
      .set({
        sessionToken: newToken,
        lastActivityAt: new Date(),
      })
      .where(eq(sessions.id, sessionId))
      .returning();
    return result[0] || null;
  }

  public async updateActivity(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  public async deactivate(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.id, sessionId));
  }

  public async findActiveByOrgAndDevice(
    organizationId: string,
    deviceId: string
  ): Promise<Session | undefined> {
    return db.query.sessions.findFirst({
      where: and(
        eq(sessions.organizationId, organizationId),
        eq(sessions.deviceId, deviceId),
        eq(sessions.isActive, true),
        gt(sessions.expiresAt, new Date())
      ),
    });
  }
}
