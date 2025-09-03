import { BaseModule } from "@/modules/BaseModule";

export class AudioModule extends BaseModule {
  public readonly moduleName: string = "audio";

  /**
   * Initializes the Audio fingerprinting process.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    // The process is asynchronous, so we wrap it to handle errors gracefully.
    this.generateFingerprint().catch((error) => {
      console.error(`[SDK] ${this.moduleName}: Fingerprinting failed.`, error);
      this.eventManager.dispatch(this.moduleName, "audio.error", {
        error: (error as Error).message || "An unknown error occurred.",
      });
    });
  }

  private async generateFingerprint(): Promise<void> {
    // Use the OfflineAudioContext to process audio without playing any sound.
    const AudioContext =
      window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;

    if (!AudioContext) {
      this.eventManager.dispatch(this.moduleName, "audio", {
        supported: false,
        error: "Web Audio API not supported.",
      });
      return;
    }

    // Create a context with a standard sample rate and duration.
    const context = new AudioContext(1, 44100, 44100);

    // 1. Create the Oscillator (the sound source)
    const oscillator = context.createOscillator();
    oscillator.type = "triangle"; // Use a standard wave type
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    // 2. Create a DynamicsCompressor to process the sound
    const compressor = context.createDynamicsCompressor();
    // Set standard compressor properties
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    compressor.knee.setValueAtTime(40, context.currentTime);
    compressor.ratio.setValueAtTime(12, context.currentTime);
    compressor.attack.setValueAtTime(0, context.currentTime);
    compressor.release.setValueAtTime(0.25, context.currentTime);

    // 3. Connect the nodes in a chain: Oscillator -> Compressor -> Destination
    oscillator.connect(compressor);
    compressor.connect(context.destination);

    // 4. Start the audio processing
    oscillator.start(0);
    const buffer = await context.startRendering();

    // 5. Analyze the resulting audio buffer to create the fingerprint
    let fingerprint = 0;
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Sum the absolute values of the samples. This is a common and effective method.
      fingerprint += Math.abs(data[i]);
    }

    const finalFingerprint = await this.hash(fingerprint.toString());

    this.eventManager.dispatch(this.moduleName, "audio", {
      supported: true,
      fingerprint: finalFingerprint,
    });
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
