import { describe, it, expect } from "vitest";

describe("Modules Index", () => {
  it("should export all module classes", async () => {
    // Import the index file to test exports
    const modules = await import("./index");

    // Check that all expected modules are exported
    expect(modules).toHaveProperty("BrowserModule");
    expect(modules).toHaveProperty("ScreenModule");
    expect(modules).toHaveProperty("MouseBehaviourModule");
    expect(modules).toHaveProperty("KeyboardModule");
    expect(modules).toHaveProperty("PerformanceModule");
    expect(modules).toHaveProperty("NetworkModule");
    expect(modules).toHaveProperty("TimezoneModule");
    expect(modules).toHaveProperty("DeviceModule");

    // Verify they are classes/constructors
    expect(typeof modules.BrowserModule).toBe("function");
    expect(typeof modules.ScreenModule).toBe("function");
    expect(typeof modules.MouseBehaviourModule).toBe("function");
    expect(typeof modules.KeyboardModule).toBe("function");
    expect(typeof modules.PerformanceModule).toBe("function");
    expect(typeof modules.NetworkModule).toBe("function");
    expect(typeof modules.TimezoneModule).toBe("function");
    expect(typeof modules.DeviceModule).toBe("function");
  });

  it("should export BaseModule", async () => {
    const modules = await import("./index");

    expect(modules).toHaveProperty("BaseModule");
    expect(typeof modules.BaseModule).toBe("function");
  });
});
