import { describe, it, expect } from "vitest";

describe("Main Index", () => {
  it("should export WebSDK class", async () => {
    // Import the main index file
    const main = await import("./index");

    expect(main).toHaveProperty("WebSDK");
    expect(typeof main.WebSDK).toBe("function");
  });

  it("should export WebSDK as default", async () => {
    // Import the main index file
    const main = await import("./index");

    expect(main).toHaveProperty("default");
    expect(main.default).toBe(main.WebSDK);
  });

  it("should be able to instantiate WebSDK", async () => {
    const { WebSDK } = await import("./index");

    const sdk = WebSDK.getInstance();

    expect(sdk).toBeDefined();
    expect(sdk).toBeInstanceOf(WebSDK);
  });
});
