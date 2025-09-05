import { Hono } from "hono";
import {
  validateOrigin,
  validateTokenHeaders,
  validateSessionToken,
} from "@/middleware/auth.middleware";
import { TokenController } from "@/controllers/token.controller";

const tokenController = new TokenController();

export const tokenRoutes = new Hono();

// GET /v1/token/:hash - Main token endpoint (Web SDK authentication)
tokenRoutes.get(
  "/:hash",
  validateOrigin,
  validateTokenHeaders,
  tokenController.getToken.bind(tokenController)
);

// POST /v1/token/refresh - Refresh existing session token
tokenRoutes.post(
  "/refresh",
  validateOrigin,
  validateSessionToken,
  tokenController.refreshToken.bind(tokenController)
);

// POST /v1/token/validate - Validate session token without rotation
tokenRoutes.post(
  "/validate",
  validateOrigin,
  tokenController.validateToken.bind(tokenController)
);

// DELETE /v1/token - Revoke session token (logout)
tokenRoutes.delete(
  "/",
  validateOrigin,
  validateSessionToken,
  tokenController.revokeToken.bind(tokenController)
);
