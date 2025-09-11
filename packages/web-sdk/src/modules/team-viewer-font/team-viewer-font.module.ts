import { BaseModule } from "@/modules/BaseModule";

export class TeamViewerFontModule extends BaseModule {
  public readonly moduleName: string = "teamViewerFont";

  /**
   * Initializes team viewer font detection.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const teamViewerFonts = this.detectTeamViewerFonts();
      this.eventManager.dispatch(this.moduleName, "teamViewerFont", {
        teamViewerFonts,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "teamViewerFont.error", {
        error: "TeamViewer font detection failed",
        errorCode: "COLLECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Detects the presence of fonts injected by remote desktop software like TeamViewer.
   * @returns An array of detected font names.
   */
  private detectTeamViewerFonts(): string[] {
    const detectedFonts: string[] = [];
    const teamViewerFontNames = [
      "TeamViewerFont",
      // Add other known remote desktop font names here if discovered
    ];

    if ("fonts" in document) {
      for (const fontFace of document.fonts.values()) {
        if (teamViewerFontNames.includes(fontFace.family)) {
          detectedFonts.push(fontFace.family);
        }
      }
    } else {
      // Fallback for older browsers
      // A more complex fallback would be needed here, but for now we'll assume it's not supported.
    }

    return detectedFonts;
  }
}
