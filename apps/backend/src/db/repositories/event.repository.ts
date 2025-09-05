import { db } from "@/db";
import { events } from "../schema";
import { eq, desc } from "drizzle-orm";
import type { Event, NewEvent } from "../schema";

export class EventRepository {
  public async create(data: NewEvent): Promise<Event> {
    const result = await db.insert(events).values(data).returning();
    return result[0];
  }

  public async createBatch(eventData: NewEvent[]): Promise<Event[]> {
    if (eventData.length === 0) return [];

    const result = await db.insert(events).values(eventData).returning();
    return result;
  }

  public async findByTransactionId(transactionId: string): Promise<Event[]> {
    return db.query.events.findMany({
      where: eq(events.transactionId, transactionId),
      orderBy: [desc(events.receivedAt)],
    });
  }

  public async findBySessionId(sessionId: string): Promise<Event[]> {
    return db.query.events.findMany({
      where: eq(events.sessionId, sessionId),
      orderBy: [desc(events.receivedAt)],
    });
  }

  public async findByBatchId(batchId: string): Promise<Event[]> {
    return db.query.events.findMany({
      where: eq(events.batchId, batchId),
      orderBy: [desc(events.receivedAt)],
    });
  }

  public async findByOrganizationId(
    organizationId: string,
    limit = 100
  ): Promise<Event[]> {
    return db.query.events.findMany({
      where: eq(events.organizationId, organizationId),
      orderBy: [desc(events.receivedAt)],
      limit,
    });
  }

  public async getEventStatsByTransaction(transactionId: string): Promise<{
    totalEvents: number;
    eventTypes: { [key: string]: number };
  }> {
    const transactionEvents = await this.findByTransactionId(transactionId);

    const eventTypes: { [key: string]: number } = {};
    transactionEvents.forEach((event) => {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    });

    return {
      totalEvents: transactionEvents.length,
      eventTypes,
    };
  }
}
