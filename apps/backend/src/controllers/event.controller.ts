import { Context } from "hono";
import { EventService } from "@/services/event.service";
import { TransactionRepository } from "@/db/repositories/transaction.repository";
import type { Session } from "@/db/schema";

export class EventController {
  private eventService = new EventService();
  private transactionRepo = new TransactionRepository();

  /**
   * POST /event
   * Ingests batch events from web-SDK with token rotation.
   */
  public async ingestEvents(c: Context) {
    try {
      // 1. Get session and organization from middleware
      const session = c.get("session") as Session;
      const organizationId = c.get("organizationId") as string;
      const newToken = c.get("newToken") as string;

      // 2. Parse request body
      const batch = await c.req.json().catch(() => null);

      if (!batch) {
        return c.json({ error: "Invalid JSON body" }, 400);
      }

      // 3. Validate batch structure
      const validation = this.eventService.validateBatchStructure(batch);

      if (!validation.valid) {
        return c.json({ error: validation.error }, 400);
      }

      // 4. Extract transaction ID from current active transaction for this session
      // We need to determine which transaction this batch belongs to
      const transactions = await this.transactionRepo.findBySessionId(
        session.id
      );
      const activeTransaction = transactions.find(
        (t) => t.status === "active" || t.status === "pending"
      );

      if (!activeTransaction) {
        return c.json(
          { error: "No active transaction found for session" },
          400
        );
      }

      // 5. Process the event batch
      const result = await this.eventService.processBatch(
        batch,
        activeTransaction.id,
        session.id,
        organizationId
      );

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      // 6. Set new token in response header (token rotation)
      if (newToken) {
        c.header("x-session-token", newToken);
      }

      // 7. Return success response
      const response = {
        success: true,
        events_processed: result.eventsStored,
        batch_id: batch.batchId,
        transaction_id: activeTransaction.id,
        processed_at: new Date().toISOString(),
      };

      console.log(
        `[Event] Processed ${result.eventsStored} events for transaction ${activeTransaction.id}`
      );

      return c.json(response, 200);
    } catch (error) {
      console.error("[Event] Error processing events:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * POST /event/complete
   * Marks a transaction as completed and performs final processing.
   */
  public async completeTransaction(c: Context) {
    try {
      const session = c.get("session") as Session;
      const organizationId = c.get("organizationId") as string;

      // Parse request body for transaction ID
      const body = await c.req.json().catch(() => ({}));
      const { transaction_id } = body;

      if (!transaction_id) {
        return c.json({ error: "Missing transaction_id" }, 400);
      }

      // Validate transaction belongs to session and organization
      const isValid = await this.transactionRepo.validateTransaction(
        transaction_id,
        session.id,
        organizationId
      );

      if (!isValid) {
        return c.json({ error: "Invalid transaction" }, 400);
      }

      // Complete the transaction
      const success =
        await this.eventService.completeTransaction(transaction_id);

      if (!success) {
        return c.json({ error: "Failed to complete transaction" }, 500);
      }

      // Get final transaction stats
      const stats = await this.eventService.getTransactionStats(transaction_id);

      return c.json({
        success: true,
        transaction_id,
        completed_at: new Date().toISOString(),
        final_stats: stats,
      });
    } catch (error) {
      console.error("[Event] Error completing transaction:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * GET /event/stats/:transactionId
   * Gets event statistics for a specific transaction.
   */
  public async getTransactionStats(c: Context) {
    try {
      const transactionId = c.req.param("transactionId");
      const session = c.get("session") as Session;
      const organizationId = c.get("organizationId") as string;

      if (!transactionId) {
        return c.json({ error: "Missing transaction ID" }, 400);
      }

      // Validate transaction belongs to session and organization
      const isValid = await this.transactionRepo.validateTransaction(
        transactionId,
        session.id,
        organizationId
      );

      if (!isValid) {
        return c.json({ error: "Invalid transaction" }, 403);
      }

      // Get transaction stats
      const stats = await this.eventService.getTransactionStats(transactionId);

      return c.json({
        transaction_id: transactionId,
        ...stats,
        retrieved_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Event] Error retrieving stats:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }

  /**
   * GET /event/health
   * Health check endpoint for event processing system.
   */
  public async healthCheck(c: Context) {
    try {
      return c.json({
        status: "healthy",
        service: "event-ingestion",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
    } catch (error) {
      console.error("[Event] Health check error:", error);
      return c.json(
        {
          status: "unhealthy",
          error: "Service unavailable",
        },
        503
      );
    }
  }

  /**
   * POST /event/batch-validate
   * Validates event batch structure without processing.
   */
  public async validateBatch(c: Context) {
    try {
      const batch = await c.req.json().catch(() => null);

      if (!batch) {
        return c.json({ error: "Invalid JSON body" }, 400);
      }

      const validation = this.eventService.validateBatchStructure(batch);

      return c.json({
        valid: validation.valid,
        error: validation.error,
        batch_info: validation.valid
          ? {
              device_id: batch.deviceId,
              batch_id: batch.batchId,
              module_count: Object.keys(batch.modules).length,
              total_events: Object.values(batch.modules).reduce(
                (sum: number, events: any) =>
                  sum + (Array.isArray(events) ? events.length : 0),
                0
              ),
            }
          : null,
        validated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Event] Batch validation error:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
}
