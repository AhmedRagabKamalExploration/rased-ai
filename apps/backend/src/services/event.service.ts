import { EventRepository } from "@/db/repositories/event.repository";
import { TransactionRepository } from "@/db/repositories/transaction.repository";
import { CryptoUtils } from "@/utils/crypto";
import type { NewEvent } from "@/db/schema";

interface EventBatch {
  deviceId: string;
  batchId: string;
  batchTimestamp: string;
  modules: Record<string, any[]>;
}

export class EventService {
  private eventRepo = new EventRepository();
  private transactionRepo = new TransactionRepository();

  /**
   * Processes and stores a batch of events from the web-SDK.
   */
  public async processBatch(
    batch: EventBatch,
    transactionId: string,
    sessionId: string,
    organizationId: string
  ): Promise<{ success: boolean; eventsStored: number; error?: string }> {
    try {
      // 1. Validate transaction exists
      const transaction = await this.transactionRepo.findById(transactionId);
      if (!transaction) {
        return {
          success: false,
          eventsStored: 0,
          error: "Invalid transaction",
        };
      }

      // 2. Validate transaction belongs to the correct session and organization
      if (
        transaction.sessionId !== sessionId ||
        transaction.organizationId !== organizationId
      ) {
        return {
          success: false,
          eventsStored: 0,
          error: "Transaction context mismatch",
        };
      }

      // 3. Transform modules into individual events
      const events: NewEvent[] = [];
      const receivedAt = new Date();

      for (const [moduleName, moduleEvents] of Object.entries(batch.modules)) {
        for (const eventData of moduleEvents) {
          events.push({
            id: CryptoUtils.generateBatchId() + `-${events.length}`,
            transactionId,
            organizationId,
            sessionId,
            deviceId: batch.deviceId,
            batchId: batch.batchId,
            eventType: moduleName,
            payload: eventData,
            receivedAt,
          });
        }
      }

      // 4. Store events in batch
      const storedEvents = await this.eventRepo.createBatch(events);

      // 5. Update transaction status to active if it's still pending
      if (transaction.status === "pending") {
        await this.transactionRepo.updateStatus(transactionId, "active");
      }

      console.log(
        `[EventService] Stored ${storedEvents.length} events for transaction ${transactionId}`
      );

      return {
        success: true,
        eventsStored: storedEvents.length,
      };
    } catch (error) {
      console.error("[EventService] Batch processing error:", error);
      return {
        success: false,
        eventsStored: 0,
        error: "Failed to process events",
      };
    }
  }

  /**
   * Gets event statistics for a transaction.
   */
  public async getTransactionStats(transactionId: string): Promise<{
    totalEvents: number;
    eventTypes: { [key: string]: number };
    lastEventTime?: Date;
  }> {
    try {
      const stats =
        await this.eventRepo.getEventStatsByTransaction(transactionId);
      const events = await this.eventRepo.findByTransactionId(transactionId);

      const lastEventTime =
        events.length > 0 ? events[0].receivedAt : undefined;

      return {
        ...stats,
        lastEventTime,
      };
    } catch (error) {
      console.error("[EventService] Stats retrieval error:", error);
      return { totalEvents: 0, eventTypes: {} };
    }
  }

  /**
   * Validates event batch structure.
   */
  public validateBatchStructure(batch: any): {
    valid: boolean;
    error?: string;
  } {
    if (!batch || typeof batch !== "object") {
      return { valid: false, error: "Invalid batch format" };
    }

    if (!batch.deviceId || typeof batch.deviceId !== "string") {
      return { valid: false, error: "Missing or invalid deviceId" };
    }

    if (!batch.batchId || typeof batch.batchId !== "string") {
      return { valid: false, error: "Missing or invalid batchId" };
    }

    if (!batch.batchTimestamp || typeof batch.batchTimestamp !== "string") {
      return { valid: false, error: "Missing or invalid batchTimestamp" };
    }

    if (!batch.modules || typeof batch.modules !== "object") {
      return { valid: false, error: "Missing or invalid modules" };
    }

    // Validate each module has an array of events
    for (const [moduleName, moduleEvents] of Object.entries(batch.modules)) {
      if (!Array.isArray(moduleEvents)) {
        return {
          valid: false,
          error: `Module ${moduleName} events must be an array`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Marks a transaction as completed.
   */
  public async completeTransaction(transactionId: string): Promise<boolean> {
    try {
      const result = await this.transactionRepo.updateStatus(
        transactionId,
        "completed",
        new Date()
      );
      return !!result;
    } catch (error) {
      console.error("[EventService] Transaction completion error:", error);
      return false;
    }
  }
}
