import { Hono } from "hono";
import {
  validateOrigin,
  validateSessionToken,
  validateAndRotateToken,
} from "@/middleware/auth.middleware";
import { EventController } from "@/controllers/event.controller";

const eventController = new EventController();

export const eventRoutes = new Hono();

// POST /v1/event - Main event ingestion endpoint with token rotation
eventRoutes.post(
  "/",
  validateOrigin,
  validateAndRotateToken,
  eventController.ingestEvents.bind(eventController)
);

// POST /v1/event/complete - Mark transaction as completed
eventRoutes.post(
  "/complete",
  validateOrigin,
  validateSessionToken,
  eventController.completeTransaction.bind(eventController)
);

// GET /v1/event/stats/:transactionId - Get event statistics for transaction
eventRoutes.get(
  "/stats/:transactionId",
  validateOrigin,
  validateSessionToken,
  eventController.getTransactionStats.bind(eventController)
);

// GET /v1/event/health - Health check for event processing
eventRoutes.get("/health", eventController.healthCheck.bind(eventController));

// POST /v1/event/batch-validate - Validate event batch structure
eventRoutes.post(
  "/batch-validate",
  validateOrigin,
  eventController.validateBatch.bind(eventController)
);
