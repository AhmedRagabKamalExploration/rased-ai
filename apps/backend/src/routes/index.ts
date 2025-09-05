import { Hono } from "hono";
import { v1Routes } from "./v1";

export const apiRoutes = new Hono();

// Mount v1 routes
apiRoutes.route("/v1", v1Routes);

// Global API info endpoint
apiRoutes.get("/", (c) => {
  return c.json({
    api: "Rased AI Backend",
    versions: {
      v1: {
        status: "stable",
        endpoints: [
          "GET /v1/health",
          "GET /v1/config",
          "POST /v1/config",
          "GET /v1/config/validate",
          "GET /v1/token/:hash",
          "POST /v1/token/refresh",
          "POST /v1/token/validate",
          "DELETE /v1/token",
          "POST /v1/event",
          "POST /v1/event/complete",
          "GET /v1/event/stats/:transactionId",
          "GET /v1/event/health",
          "POST /v1/event/batch-validate",
        ],
      },
    },
    timestamp: new Date().toISOString(),
  });
});
