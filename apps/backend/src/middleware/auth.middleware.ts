import { Context, Next } from "hono";
import { AuthService } from "@/services/auth.service";

/**
 * Middleware to validate domain origin against organization whitelist.
 * This is the first line of defense against unauthorized API access.
 */
export const validateOrigin = async (c: Context, next: Next) => {
  const authService = new AuthService();

  // Get organization ID from headers or URL params
  const organizationId =
    c.req.header("x-organisationid") || c.req.param("organizationId");

  if (!organizationId) {
    return c.json({ error: "Missing organization ID" }, 400);
  }

  // Get origin from request headers
  const origin = c.req.header("origin") || c.req.header("referer");

  if (!origin) {
    return c.json({ error: "Missing origin header" }, 400);
  }

  // Validate origin against organization whitelist
  const isValidOrigin = await authService.validateOrigin(
    organizationId,
    origin
  );

  if (!isValidOrigin) {
    console.warn(
      `[Auth] Blocked request from unauthorized origin: ${origin} for org: ${organizationId}`
    );
    return c.json({ error: "Unauthorized origin" }, 403);
  }

  // Store validated organization ID for use in handlers
  c.set("organizationId", organizationId);
  c.set("origin", origin);

  await next();
};

/**
 * Middleware to validate session tokens for authenticated endpoints.
 */
export const validateSessionToken = async (c: Context, next: Next) => {
  const authService = new AuthService();

  const sessionToken = c.req.header("x-session-token");
  const organizationId =
    c.get("organizationId") || c.req.header("x-organisationid");

  if (!sessionToken) {
    return c.json({ error: "Missing session token" }, 401);
  }

  if (!organizationId) {
    return c.json({ error: "Missing organization ID" }, 400);
  }

  // Validate session token
  const tokenValidation = await authService.validateSessionToken(
    sessionToken,
    organizationId
  );

  if (!tokenValidation.success) {
    console.warn(`[Auth] Invalid session token for org: ${organizationId}`);
    return c.json(
      { error: tokenValidation.error || "Invalid session token" },
      401
    );
  }

  // Store session information for use in handlers
  c.set("session", tokenValidation.session);
  c.set("sessionToken", sessionToken);

  await next();
};

/**
 * Middleware to validate session tokens with automatic rotation for event endpoints.
 */
export const validateAndRotateToken = async (c: Context, next: Next) => {
  const authService = new AuthService();

  const sessionToken = c.req.header("x-session-token");
  const organizationId =
    c.get("organizationId") || c.req.header("x-organisationid");

  if (!sessionToken) {
    return c.json({ error: "Missing session token" }, 401);
  }

  if (!organizationId) {
    return c.json({ error: "Missing organization ID" }, 400);
  }

  // Validate session token with rotation
  const tokenValidation = await authService.validateAndRotateToken(
    sessionToken,
    organizationId,
    true // Enable token rotation
  );

  if (!tokenValidation.success) {
    console.warn(`[Auth] Invalid session token for org: ${organizationId}`);
    return c.json(
      { error: tokenValidation.error || "Invalid session token" },
      401
    );
  }

  // Store session information and new token for use in handlers
  c.set("session", tokenValidation.session);
  c.set("sessionToken", sessionToken);
  c.set("newToken", tokenValidation.newToken);

  await next();
};

/**
 * Middleware to validate required headers for token endpoint.
 */
export const validateTokenHeaders = async (c: Context, next: Next) => {
  const requiredHeaders = [
    "x-organisationid",
    "x-sessionid",
    "x-transactionid",
  ];
  const missingHeaders: string[] = [];

  for (const header of requiredHeaders) {
    if (!c.req.header(header)) {
      missingHeaders.push(header);
    }
  }

  if (missingHeaders.length > 0) {
    return c.json(
      {
        error: "Missing required headers",
        missing: missingHeaders,
      },
      400
    );
  }

  // Store header values for use in handlers
  c.set("organizationId", c.req.header("x-organisationid"));
  c.set("sessionId", c.req.header("x-sessionid"));
  c.set("transactionId", c.req.header("x-transactionid"));

  await next();
};

/**
 * CORS middleware for handling cross-origin requests.
 */
export const corsMiddleware = async (c: Context, next: Next) => {
  // Handle preflight requests
  if (c.req.method === "OPTIONS") {
    c.header("Access-Control-Allow-Origin", c.req.header("origin") || "*");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-organisationid, x-sessionid, x-transactionid, x-session-token"
    );
    c.header("Access-Control-Expose-Headers", "x-session-token");
    c.header("Access-Control-Max-Age", "86400");
    return new Response("", { status: 204 });
  }

  await next();

  // Add CORS headers to all responses
  c.header("Access-Control-Allow-Origin", c.req.header("origin") || "*");
  c.header("Access-Control-Expose-Headers", "x-session-token");
};

/**
 * Request logging middleware.
 */
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  const userAgent = c.req.header("user-agent") || "unknown";
  const organizationId = c.req.header("x-organisationid") || "unknown";

  console.log(`[Request] ${method} ${url} - Org: ${organizationId}`);

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  console.log(`[Response] ${method} ${url} - ${status} (${duration}ms)`);
};
