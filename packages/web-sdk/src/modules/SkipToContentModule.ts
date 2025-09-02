import { BaseModule } from "./BaseModule";

const SKIP_LINK_KEYWORDS_REGEX = /skip|main|content|navigation/i;

export class SkipToContentModule extends BaseModule {
  /**
   * Initializes the SkipToContent feature detection process.
   */
  public init(): void {
    console.log("[SDK] SkipToContentModule: Initializing feature detection...");
    try {
      // The detection is synchronous, so no need for async/await.
      const detectionResult = this.detectSkipLink();

      console.log(`[SDK] SkipToContentModule: Detection complete.`);
      this.eventManager.dispatch("skipToContent", detectionResult);
    } catch (error) {
      console.error("[SDK] SkipToContentModule: Detection failed.", error);
      this.eventManager.dispatch("skipToContent", {
        error: "Failed to run skip-to-content feature detection.",
      });
    }
  }

  /**
   * Scans the DOM for an anchor tag that looks like a "Skip to Content" link.
   * @returns An object indicating if a link was found and its details.
   */
  private detectSkipLink(): { exists: boolean; text?: string; href?: string } {
    // Query for all anchor links that link to a fragment on the current page.
    // This is a strong indicator for in-page navigation.
    const potentialLinks = document.querySelectorAll('a[href^="#"]');

    for (const link of Array.from(potentialLinks)) {
      const linkText = (link.textContent || "").trim();

      // Check if the link's text content matches our keywords.
      if (SKIP_LINK_KEYWORDS_REGEX.test(linkText)) {
        // We found a very likely candidate.
        return {
          exists: true,
          text: linkText,
          href: link.getAttribute("href") || "",
        };
      }
    }

    // If we finish the loop without finding a match, the feature does not exist.
    return { exists: false };
  }
}
