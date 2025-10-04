import { describe, it, expect } from "vitest";

describe("Managers Index", () => {
  it("should export all manager classes", async () => {
    // Import the index file to test exports
    const managers = await import("./index");

    // Check that all expected managers are exported
    expect(managers).toHaveProperty("APIManager");
    expect(managers).toHaveProperty("ConfigManager");
    expect(managers).toHaveProperty("EventManager");
    expect(managers).toHaveProperty("Collector");
    expect(managers).toHaveProperty("MetadataManager");
    expect(managers).toHaveProperty("SessionManager");
    expect(managers).toHaveProperty("TokenManager");
    expect(managers).toHaveProperty("IdentityManager");
    expect(managers).toHaveProperty("EncryptionManager");
    expect(managers).toHaveProperty("ModuleManager");

    // Verify they are classes/constructors
    expect(typeof managers.APIManager).toBe("function");
    expect(typeof managers.ConfigManager).toBe("function");
    expect(typeof managers.EventManager).toBe("function");
    expect(typeof managers.Collector).toBe("function");
    expect(typeof managers.MetadataManager).toBe("function");
    expect(typeof managers.SessionManager).toBe("function");
    expect(typeof managers.TokenManager).toBe("function");
    expect(typeof managers.IdentityManager).toBe("function");
    expect(typeof managers.EncryptionManager).toBe("function");
    expect(typeof managers.ModuleManager).toBe("function");
  });

  it("should export ConfigManager interface", async () => {
    const managers = await import("./index");

    // The interface should be available for type checking
    expect(managers).toHaveProperty("ConfigManager");
  });
});
