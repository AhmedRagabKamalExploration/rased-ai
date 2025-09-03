import { BaseModule } from "@/modules/BaseModule";

// Use the specific 8x8 pixel image for fingerprinting. The browser will cache this.
const FINGERPRINT_IMAGE_URL = "https://i.postimg.cc/VvvhX1wp/pixil-frame-0.png";

export class TrueIdModule extends BaseModule {
  public readonly moduleName = "trueId";
  /**
   * Initializes the TrueId generation process.
   */
  public init(): void {
    console.log("[SDK] TrueId: Initializing...");
    this.generateTrueId().catch((error) => {
      console.error("[SDK] TrueIdModule: Failed to generate TrueId.", error);
      this.eventManager.dispatch(this.moduleName, "trueId", {
        error: "Canvas fingerprinting failed.",
      });
    });
  }

  private async generateTrueId(): Promise<void> {
    try {
      // 1. Fetch the image. This will be served from cache on subsequent visits.
      const image = await this.loadImage(FINGERPRINT_IMAGE_URL);

      // 2. Generate a representative string by processing the color of each rendered pixel.
      const fingerprintString = this.generateFingerprintFromPixels(image);

      // 3. Hash the resulting fingerprint string to create the full hash.
      const fullHash = await this.hash(fingerprintString);

      // 4. Derive a more sophisticated short ID from the full hash.
      const trueId = this.deriveShortIdFromHash(fullHash);

      console.log(`[SDK] TrueIdModule: Generated TrueId: ${trueId}`);

      // 5. Dispatch the result, including both the short ID and the full hash.
      this.eventManager.dispatch(this.moduleName, "trueId", {
        trueId,
        fullHash,
      });
    } catch (error) {
      // This ensures that even if this module fails, the SDK doesn't crash.
      throw new Error(`Canvas rendering failed: ${error}`);
    }
  }

  /**
   * Creates an HTMLImageElement and returns a Promise that resolves when it's loaded.
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Necessary for tainted canvases if the CDN supports it.
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error(`Failed to load fingerprint image from ${url}`));
      img.src = url;
    });
  }

  /**
   * Renders an image to a hidden canvas and creates a unique fingerprint string
   * by deriving a character from the color value of each pixel.
   */
  private generateFingerprintFromPixels(image: HTMLImageElement): string {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      throw new Error("Canvas 2D context is not available.");
    }

    // Draw the image to the canvas. This is the core of the fingerprinting process.
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixelCount = imageData.length / 4;
    const fingerprintChars: string[] = [];

    // Iterate over each pixel to generate a character based on its color.
    for (let i = 0; i < pixelCount; i++) {
      const r = imageData[i * 4];
      const g = imageData[i * 4 + 1];
      const b = imageData[i * 4 + 2];

      // Calculate a value based on the color's perceived brightness (luminance).
      // This is more stable and representative than using raw RGBA values.
      const luminance = Math.floor(r * 0.299 + g * 0.587 + b * 0.114);

      // Convert the luminance value into a single hexadecimal character (0-f).
      const char = (luminance % 16).toString(16);
      fingerprintChars.push(char);
    }

    // Join the characters to form the final pre-hash fingerprint string.
    return fingerprintChars.join("");
  }

  /**
   * Derives a stable 8-character ID from a 64-character hash by processing it in chunks.
   */
  private deriveShortIdFromHash(hash: string): string {
    if (hash.length !== 64) {
      // Fallback for unexpected hash lengths, though this should not happen with SHA-256.
      return hash.substring(0, 8);
    }

    const shortIdChars: string[] = [];
    // Split the 64-char hash into 8 chunks of 8 characters each.
    for (let i = 0; i < 8; i++) {
      const chunk = hash.substring(i * 8, (i + 1) * 8);

      // Use a bitwise XOR operation on the integer value of each character in the chunk.
      // This combines the chunk into a single representative number (0-15).
      let xorValue = 0;
      for (let j = 0; j < chunk.length; j++) {
        xorValue ^= parseInt(chunk[j], 16);
      }

      // Convert the resulting number back to a hexadecimal character.
      shortIdChars.push(xorValue.toString(16));
    }

    return shortIdChars.join("");
  }

  /**
   * Hashes a string using the browser's built-in SHA-256 crypto API.
   */
  private async hash(data: string): Promise<string> {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    );
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
