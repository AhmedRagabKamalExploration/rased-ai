import { BaseModule } from "@/modules/BaseModule";

// A curated list of fonts to check for.
// Includes common, OS-specific, and software-specific fonts.
const FONT_PROBE_LIST = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Times",
  "Courier New",
  "Courier",
  "Verdana",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Impact",
  "Calibri",
  "Cambria",
  "Constantia",
  "Lucida Bright",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Segoe UI",
  "Tahoma",
  "Candara",
  "Geneva",
  "Optima",
  "Helvetica Neue",
  "Menlo",
  "Monaco",
  "Source Code Pro",
  "Consolas",
  "Roboto",
  "Noto Sans",
  "Ubuntu",
];

export class FontModule extends BaseModule {
  public readonly moduleName: string = "font";

  /**
   * Initializes the Font fingerprinting process.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    // We use a timeout to ensure this doesn't block the main thread.
    setTimeout(() => {
      this.generateFingerprint().catch((error) => {
        console.error(
          `[SDK] ${this.moduleName}: Fingerprinting failed.`,
          error
        );
        this.eventManager.dispatch(this.moduleName, "font.error", {
          error: (error as Error).message || "An unknown error occurred.",
        });
      });
    }, 50); // Delay slightly to not interfere with initial page render.
  }

  private async generateFingerprint(): Promise<void> {
    const startTime = performance.now();
    const testString = "abcdefghijklmnopqrstuvwxyz0123456789";
    const fallbackFont = "monospace";

    // Create a hidden container for our measurements
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.visibility = "hidden";

    const probe = document.createElement("span");
    probe.textContent = testString;
    probe.style.fontSize = "72px"; // Use a large font size to amplify differences

    container.appendChild(probe);
    document.body.appendChild(container);

    try {
      // 1. Measure the baseline dimensions using the fallback font
      probe.style.fontFamily = fallbackFont;
      const baselineDimensions = {
        width: probe.offsetWidth,
        height: probe.offsetHeight,
      };

      // 2. Iterate and detect which fonts are installed
      const installedFonts = FONT_PROBE_LIST.filter((font) => {
        probe.style.fontFamily = `'${font}', ${fallbackFont}`;
        const newDimensions = {
          width: probe.offsetWidth,
          height: probe.offsetHeight,
        };
        // If the dimensions are different, the font is present
        return (
          newDimensions.width !== baselineDimensions.width ||
          newDimensions.height !== baselineDimensions.height
        );
      });

      const endTime = performance.now();

      const fingerprint = await this.hash(installedFonts.join(","));

      this.eventManager.dispatch(this.moduleName, "font", {
        supported: true,
        fingerprint,
        analysis: {
          installedFonts,
          totalFontsChecked: FONT_PROBE_LIST.length,
          detectionMethod: "dimension-measurement",
          processingTime: Math.round(endTime - startTime),
        },
        context: {
          baselineDimensions,
          fallbackFont,
        },
      });
    } finally {
      // 3. CRITICAL: Clean up the DOM element
      document.body.removeChild(container);
    }
  }

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
