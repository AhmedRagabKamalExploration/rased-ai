import { BaseModule } from "@/modules/BaseModule";
import { SHA256 } from "crypto-js";

export class BrowserSpeechModule extends BaseModule {
  public readonly moduleName: string = "browserSpeech";

  /**
   * Initializes the browser speech fingerprinting process.
   * This is an async operation because `getVoices()` is asynchronous.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const hash = await this.getSpeechHash();
      this.eventManager.dispatch(this.moduleName, "browserSpeech", {
        hash,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "browserSpeech.error", {
        error: "Browser speech fingerprinting failed",
        errorCode: "SPEECH_API_UNSUPPORTED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Generates a hash from the list of available browser voices.
   */
  private async getSpeechHash(): Promise<string> {
    if (
      typeof window.speechSynthesis === "undefined" ||
      typeof window.speechSynthesis.getVoices === "undefined"
    ) {
      throw new Error("Web Speech API not supported.");
    }

    // Ensure voices are loaded before trying to get them.
    await new Promise((resolve) => {
      window.speechSynthesis.onvoiceschanged = () => resolve(null);
      // Fallback for browsers that don't fire the event
      setTimeout(() => resolve(null), 1000);
    });

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      throw new Error("No speech voices found.");
    }

    // Create a deterministic string from the voices' properties.
    const voiceString = voices
      .map((voice) => `${voice.name}:${voice.lang}:${voice.default}`)
      .sort() // Ensure the order is consistent for a stable hash
      .join("|");

    const hash = SHA256(voiceString).toString();
    return hash;
  }
}
