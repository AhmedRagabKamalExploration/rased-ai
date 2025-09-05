import { Hono } from "hono";
import { configRoutes } from "./config.routes";
import { tokenRoutes } from "./token.routes";
import { eventRoutes } from "./event.routes";

export const v1Routes = new Hono();

// Mount all v1 route modules
v1Routes.route("/config", configRoutes);
v1Routes.route("/token", tokenRoutes);
v1Routes.route("/event", eventRoutes);

// V1 API health check
v1Routes.get("/health", (c) => {
  return c.json({
    version: "v1",
    status: "healthy",
    services: {
      config: "operational",
      token: "operational",
      event: "operational",
    },
    timestamp: new Date().toISOString(),
  });
});
