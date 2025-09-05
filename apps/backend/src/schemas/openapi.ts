import { z } from "zod";

// =================================================================
// COMMON SCHEMAS
// =================================================================

export const ErrorResponseSchema = z.object({
  error: z.string().describe("Error message"),
  message: z.string().optional().describe("Detailed error description"),
  details: z.any().optional().describe("Additional error details"),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// =================================================================
// CONFIG API SCHEMAS
// =================================================================

export const ConfigRequestSchema = z.object({
  device_id: z.string().uuid().optional().describe("Unique device identifier"),
  session_duration: z
    .number()
    .min(60)
    .max(3600)
    .optional()
    .describe("Session duration in seconds (60-3600)"),
  trigger: z
    .string()
    .optional()
    .describe("JSON string for trigger configuration"),
  base_api_url: z
    .string()
    .url()
    .optional()
    .describe("Base API URL for the SDK"),
  metadata: z
    .record(z.any())
    .optional()
    .describe("Additional metadata for the transaction"),
});

export const ConfigResponseSchema = z.object({
  base_api_url: z
    .string()
    .url()
    .describe("Base API URL for SDK initialization"),
  organization_id: z.string().describe("Organization identifier"),
  session_id: z.string().describe("Session identifier"),
  transaction_id: z.string().describe("Transaction identifier"),
  device_id: z.string().optional().describe("Device identifier"),
  trigger: z.string().describe("Trigger configuration as JSON string"),
  expires_at: z.string().datetime().describe("Session expiration timestamp"),
  created_at: z
    .string()
    .datetime()
    .describe("Configuration creation timestamp"),
  metadata: z
    .record(z.any())
    .optional()
    .describe("Additional transaction metadata"),
});

export const ConfigValidationRequestSchema = z.object({
  organization_id: z.string().describe("Organization ID to validate"),
  session_id: z.string().describe("Session ID to validate"),
  transaction_id: z.string().describe("Transaction ID to validate"),
});

export const ConfigValidationResponseSchema = z.object({
  valid: z.boolean().describe("Whether the configuration is valid"),
  session_active: z.boolean().describe("Whether the session is active"),
  session_expired: z.boolean().describe("Whether the session has expired"),
  transaction_exists: z.boolean().describe("Whether the transaction exists"),
  checked_at: z.string().datetime().describe("Validation timestamp"),
});

// =================================================================
// TOKEN API SCHEMAS
// =================================================================

export const TokenRefreshResponseSchema = z.object({
  refreshed_at: z.string().datetime().describe("Token refresh timestamp"),
  expires_at: z.string().datetime().optional().describe("New token expiration"),
});

export const TokenValidationResponseSchema = z.object({
  valid: z.boolean().describe("Whether the token is valid"),
  session_id: z.string().optional().describe("Associated session ID"),
  expires_at: z.string().datetime().optional().describe("Token expiration"),
  last_activity: z
    .string()
    .datetime()
    .optional()
    .describe("Last activity timestamp"),
  validated_at: z.string().datetime().describe("Validation timestamp"),
});

export const TokenRevokeResponseSchema = z.object({
  revoked: z.boolean().describe("Whether the token was revoked"),
  revoked_at: z.string().datetime().describe("Revocation timestamp"),
});

// =================================================================
// EVENT API SCHEMAS
// =================================================================

export const EventBatchSchema = z.object({
  deviceId: z.string().describe("Device identifier"),
  batchId: z.string().describe("Unique batch identifier"),
  batchTimestamp: z.string().datetime().describe("Batch creation timestamp"),
  modules: z
    .record(z.array(z.record(z.any())))
    .describe("Event data organized by module type"),
});

export const EventIngestResponseSchema = z.object({
  success: z.boolean().describe("Whether ingestion was successful"),
  events_processed: z.number().describe("Number of events processed"),
  batch_id: z.string().describe("Batch identifier"),
  transaction_id: z.string().describe("Associated transaction ID"),
  processed_at: z.string().datetime().describe("Processing timestamp"),
});

export const TransactionCompleteRequestSchema = z.object({
  transaction_id: z.string().describe("Transaction ID to complete"),
});

export const TransactionCompleteResponseSchema = z.object({
  success: z.boolean().describe("Whether completion was successful"),
  transaction_id: z.string().describe("Completed transaction ID"),
  completed_at: z.string().datetime().describe("Completion timestamp"),
  final_stats: z.object({
    totalEvents: z.number().describe("Total events in transaction"),
    eventTypes: z.record(z.number()).describe("Count of events by type"),
    lastEventTime: z
      .string()
      .datetime()
      .optional()
      .describe("Last event timestamp"),
  }),
});

export const TransactionStatsResponseSchema = z.object({
  transaction_id: z.string().describe("Transaction identifier"),
  totalEvents: z.number().describe("Total number of events"),
  eventTypes: z.record(z.number()).describe("Event count by module type"),
  lastEventTime: z
    .string()
    .datetime()
    .optional()
    .describe("Timestamp of last event"),
  retrieved_at: z.string().datetime().describe("Stats retrieval timestamp"),
});

export const BatchValidationRequestSchema = EventBatchSchema;

export const BatchValidationResponseSchema = z.object({
  valid: z.boolean().describe("Whether the batch structure is valid"),
  error: z.string().optional().describe("Validation error message"),
  batch_info: z
    .object({
      device_id: z.string(),
      batch_id: z.string(),
      module_count: z.number(),
      total_events: z.number(),
    })
    .optional()
    .describe("Batch information if valid"),
  validated_at: z.string().datetime().describe("Validation timestamp"),
});

export const HealthResponseSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]).describe("Service health status"),
  service: z.string().optional().describe("Service name"),
  timestamp: z.string().datetime().describe("Health check timestamp"),
  version: z.string().optional().describe("Service version"),
});

// =================================================================
// HEADERS SCHEMAS
// =================================================================

export const TokenHeadersSchema = z.object({
  "x-organisationid": z.string().describe("Organization ID"),
  "x-sessionid": z.string().describe("Session ID"),
  "x-transactionid": z.string().describe("Transaction ID"),
});

export const SessionTokenHeaderSchema = z.object({
  "x-session-token": z.string().describe("Session token"),
  "x-organisationid": z.string().describe("Organization ID"),
});

export const AuthHeaderSchema = z.object({
  authorization: z.string().describe("Bearer token (API key)"),
});

// =================================================================
// OPENAPI TAGS
// =================================================================

export const ApiTags = {
  CONFIG: "Configuration",
  TOKEN: "Authentication",
  EVENT: "Event Ingestion",
  HEALTH: "Health & Monitoring",
} as const;
