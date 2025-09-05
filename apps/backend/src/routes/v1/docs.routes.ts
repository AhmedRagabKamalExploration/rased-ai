import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import {
  ConfigRequestSchema,
  ConfigResponseSchema,
  ConfigValidationRequestSchema,
  ConfigValidationResponseSchema,
  TokenRefreshResponseSchema,
  TokenValidationResponseSchema,
  TokenRevokeResponseSchema,
  EventBatchSchema,
  EventIngestResponseSchema,
  TransactionCompleteRequestSchema,
  TransactionCompleteResponseSchema,
  TransactionStatsResponseSchema,
  BatchValidationRequestSchema,
  BatchValidationResponseSchema,
  HealthResponseSchema,
  ErrorResponseSchema,
  TokenHeadersSchema,
  SessionTokenHeaderSchema,
  AuthHeaderSchema,
  ApiTags,
} from "@/schemas/openapi";
import { z } from "zod";
export const docsApp = new OpenAPIHono();

// =================================================================
// CONFIG API ROUTES
// =================================================================

const getConfigRoute = createRoute({
  method: "get",
  path: "/config",
  tags: [ApiTags.CONFIG],
  summary: "Generate SDK Configuration",
  description:
    "Server-to-server API to generate SDK configuration for client applications. Requires API key authentication.",
  request: {
    headers: AuthHeaderSchema,
    query: ConfigRequestSchema.partial(),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ConfigResponseSchema,
        },
      },
      description: "SDK configuration generated successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid or missing API key",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

const createConfigRoute = createRoute({
  method: "post",
  path: "/config",
  tags: [ApiTags.CONFIG],
  summary: "Create SDK Configuration",
  description:
    "Create SDK configuration with custom parameters in request body",
  request: {
    headers: AuthHeaderSchema,
    body: {
      content: {
        "application/json": {
          schema: ConfigRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ConfigResponseSchema,
        },
      },
      description: "SDK configuration created successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid or missing API key",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

const validateConfigRoute = createRoute({
  method: "get",
  path: "/config/validate",
  tags: [ApiTags.CONFIG],
  summary: "Validate Configuration",
  description: "Validate that a configuration is still active and valid",
  request: {
    query: ConfigValidationRequestSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ConfigValidationResponseSchema,
        },
      },
      description: "Configuration validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Missing required parameters",
    },
  },
});

// =================================================================
// TOKEN API ROUTES
// =================================================================

const getTokenRoute = createRoute({
  method: "get",
  path: "/token/{hash}",
  tags: [ApiTags.TOKEN],
  summary: "Get Session Token",
  description:
    "Validates handshake hash and issues session token for Web SDK authentication",
  request: {
    params: z.object({
      hash: z.string().describe("SHA-256 handshake hash"),
    }),
    headers: TokenHeadersSchema,
  },
  responses: {
    200: {
      headers: {
        "x-session-token": {
          schema: { type: "string" },
          description: "Generated session token",
        },
      },
      description: "Session token generated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid request or missing headers",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid handshake hash or unauthorized origin",
    },
    403: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Origin not whitelisted for organization",
    },
  },
});

const refreshTokenRoute = createRoute({
  method: "post",
  path: "/token/refresh",
  tags: [ApiTags.TOKEN],
  summary: "Refresh Session Token",
  description: "Refresh an existing session token",
  request: {
    headers: SessionTokenHeaderSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TokenRefreshResponseSchema,
        },
      },
      headers: {
        "x-session-token": {
          schema: { type: "string" },
          description: "New session token",
        },
      },
      description: "Token refreshed successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid or expired session token",
    },
  },
});

const validateTokenRoute = createRoute({
  method: "post",
  path: "/token/validate",
  tags: [ApiTags.TOKEN],
  summary: "Validate Session Token",
  description: "Validate a session token without rotation",
  request: {
    headers: SessionTokenHeaderSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TokenValidationResponseSchema,
        },
      },
      description: "Token validation result",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid or expired session token",
    },
  },
});

const revokeTokenRoute = createRoute({
  method: "delete",
  path: "/token",
  tags: [ApiTags.TOKEN],
  summary: "Revoke Session Token",
  description: "Revoke a session token (logout)",
  request: {
    headers: SessionTokenHeaderSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TokenRevokeResponseSchema,
        },
      },
      description: "Token revoked successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid or expired session token",
    },
  },
});

// =================================================================
// EVENT API ROUTES
// =================================================================

const ingestEventsRoute = createRoute({
  method: "post",
  path: "/event",
  tags: [ApiTags.EVENT],
  summary: "Ingest Event Batch",
  description:
    "Submit behavioral data batch from Web SDK with automatic token rotation",
  request: {
    headers: SessionTokenHeaderSchema,
    body: {
      content: {
        "application/json": {
          schema: EventBatchSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EventIngestResponseSchema,
        },
      },
      headers: {
        "x-session-token": {
          schema: { type: "string" },
          description: "New rotated session token",
        },
      },
      description: "Events ingested successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid batch structure or missing transaction",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid or expired session token",
    },
  },
});

const completeTransactionRoute = createRoute({
  method: "post",
  path: "/event/complete",
  tags: [ApiTags.EVENT],
  summary: "Complete Transaction",
  description: "Mark a transaction as completed and get final statistics",
  request: {
    headers: SessionTokenHeaderSchema,
    body: {
      content: {
        "application/json": {
          schema: TransactionCompleteRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TransactionCompleteResponseSchema,
        },
      },
      description: "Transaction completed successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid transaction ID",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid session token",
    },
  },
});

const getTransactionStatsRoute = createRoute({
  method: "get",
  path: "/event/stats/{transactionId}",
  tags: [ApiTags.EVENT],
  summary: "Get Transaction Statistics",
  description: "Retrieve event statistics for a specific transaction",
  request: {
    params: z.object({
      transactionId: z.string().describe("Transaction ID"),
    }),
    headers: SessionTokenHeaderSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TransactionStatsResponseSchema,
        },
      },
      description: "Transaction statistics retrieved successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Missing transaction ID",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid session token",
    },
    403: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Transaction access denied",
    },
  },
});

const eventHealthRoute = createRoute({
  method: "get",
  path: "/event/health",
  tags: [ApiTags.HEALTH],
  summary: "Event Service Health",
  description: "Health check for event processing system",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
      description: "Service is healthy",
    },
    503: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Service is unhealthy",
    },
  },
});

const validateBatchRoute = createRoute({
  method: "post",
  path: "/event/batch-validate",
  tags: [ApiTags.EVENT],
  summary: "Validate Event Batch",
  description: "Validate event batch structure without processing",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BatchValidationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: BatchValidationResponseSchema,
        },
      },
      description: "Batch validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid JSON body",
    },
  },
});

// V1 Health Check
const v1HealthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: [ApiTags.HEALTH],
  summary: "V1 API Health Check",
  description: "Health check for V1 API services",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HealthResponseSchema.extend({
            version: z.string(),
            services: z.object({
              config: z.string(),
              token: z.string(),
              event: z.string(),
            }),
          }),
        },
      },
      description: "V1 API is healthy",
    },
  },
});

// =================================================================
// SWAGGER SETUP
// =================================================================

// OpenAPI documentation
docsApp.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Rased AI Backend API",
    description:
      "Secure backend API for behavioral analytics and fraud detection",
    contact: {
      name: "Rased AI",
      url: "https://github.com/rased-ai",
    },
  },
  servers: [
    {
      url: "http://localhost:8000/v1",
      description: "Development server (v1)",
    },
    {
      url: "https://api.rased.ai/v1",
      description: "Production server (v1)",
    },
  ],
});

// Register OpenAPI routes (these are just for documentation generation)
docsApp.openapi(getConfigRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(createConfigRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(validateConfigRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);

docsApp.openapi(getTokenRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(refreshTokenRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(validateTokenRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(revokeTokenRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);

docsApp.openapi(ingestEventsRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(completeTransactionRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(getTransactionStatsRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(eventHealthRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);
docsApp.openapi(validateBatchRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);

docsApp.openapi(v1HealthRoute, (c) =>
  c.json({ message: "Documentation endpoint" })
);

// Swagger UI
docsApp.get("/", swaggerUI({ url: "/doc" }));
