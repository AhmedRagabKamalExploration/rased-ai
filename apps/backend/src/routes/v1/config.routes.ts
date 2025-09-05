import { Hono } from "hono";
import { ConfigController } from "@/controllers/config.controller";

const configController = new ConfigController();

export const configRoutes = new Hono();

// GET /v1/config - Generate SDK configuration
configRoutes.get("/", configController.getConfig.bind(configController));

// POST /v1/config - Create SDK configuration with custom parameters
configRoutes.post("/", configController.createConfig.bind(configController));

// GET /v1/config/validate - Validate existing configuration
configRoutes.get(
  "/validate",
  configController.validateConfig.bind(configController)
);
