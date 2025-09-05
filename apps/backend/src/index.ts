import { Hono } from "hono";
import { corsMiddleware, requestLogger } from "@/middleware/auth.middleware";
import { apiRoutes } from "@/routes";
import { docsApp } from "@/routes/v1/docs.routes";

// Initialize Hono app
const app = new Hono();

// Global middleware
app.use("*", corsMiddleware);
app.use("*", requestLogger);

// Root health check endpoint
app.get("/", (c) => {
  return c.json({
    service: "rased-ai-backend",
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    available_versions: ["v1"],
    documentation: {
      swagger_ui: "/docs",
      openapi_spec: "/docs/doc",
      description: "Interactive API documentation with examples and testing",
    },
  });
});

// Legacy health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    services: {
      database: "connected",
      auth: "operational",
      events: "operational",
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount API documentation
app.route("/docs", docsApp);

// Mount all API routes
app.route("/", apiRoutes);

// =================================================================
// ERROR HANDLING
// =================================================================

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested endpoint does not exist",
      documentation: {
        interactive_docs: "/docs",
        api_info: "/",
        current_version: "v1",
      },
      example_endpoints: [
        "GET /v1/health",
        "GET /v1/config",
        "GET /v1/token/:hash",
        "POST /v1/event",
      ],
    },
    404
  );
});

// Global error handler
app.onError((err, c) => {
  console.error("[App] Unhandled error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    },
    500
  );
});

// =================================================================
// SERVER CONFIGURATION
// =================================================================

const port = parseInt(process.env.PORT || "8000");

console.log(`🚀 Rased AI Backend starting on http://localhost:${port}`);
console.log(`📊 API Version: v1`);
console.log(`📚 Swagger Documentation: http://localhost:${port}/docs`);
console.log(`📊 Available endpoints:`);
console.log(`   GET  /                          - API information`);
console.log(`   GET  /docs                      - Swagger UI documentation`);
console.log(`   GET  /v1/health                 - V1 health check`);
console.log(`   GET  /v1/config                 - Generate SDK config`);
console.log(`   GET  /v1/token/:hash            - Get session token`);
console.log(`   POST /v1/event                  - Ingest events`);

export default {
  port,
  fetch: app.fetch,
};
