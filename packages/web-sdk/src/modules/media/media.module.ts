import { BaseModule } from "@/modules/BaseModule";

export class MediaModule extends BaseModule {
  public readonly moduleName: string = "media";

  /**
   * Initializes media device data collection.
   * This is an async operation as it relies on a promise-based API.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const mediaData = await this.collectMediaData();
      this.eventManager.dispatch(this.moduleName, "media", mediaData);
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "media.error", {
        error: "Media device data collection failed",
        errorCode: "ENUMERATION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Collects detailed information about all available media devices.
   */
  private async collectMediaData(): Promise<any> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error("MediaDevices API not supported in this browser.");
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioInput: any[] = [];
    const audioOutput: any[] = [];
    const videoInput: any[] = [];
    let audioInputCounter = 1;
    let audioOutputCounter = 1;
    let videoInputCounter = 1;

    devices.forEach((device) => {
      // Use generic labels if the real label is empty (e.g., before permission is granted).
      const label =
        device.label ||
        this.generateGenericLabel(
          device.kind,
          device.deviceId,
          audioInputCounter,
          audioOutputCounter,
          videoInputCounter
        );

      const mediaDevice = {
        id: device.deviceId,
        kind: device.kind,
        isCustomLabel: !!device.label,
        label: label,
      };

      if (device.kind === "audioinput") {
        audioInput.push(mediaDevice);
        audioInputCounter++;
      } else if (device.kind === "audiooutput") {
        audioOutput.push(mediaDevice);
        audioOutputCounter++;
      } else if (device.kind === "videoinput") {
        videoInput.push(mediaDevice);
        videoInputCounter++;
      }
    });

    return {
      audioInput,
      audioOutput,
      videoInput,
      hasMicrophone: audioInput.length > 0,
      hasSpeakers: audioOutput.length > 0,
      hasWebcam: videoInput.length > 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Generates a predictable generic label for a media device.
   */
  private generateGenericLabel(
    kind: string,
    deviceId: string,
    audioInputCounter: number,
    audioOutputCounter: number,
    videoInputCounter: number
  ): string {
    if (kind === "audioinput") {
      return `Microphone ${audioInputCounter}`;
    }
    if (kind === "audiooutput") {
      return `Speaker ${audioOutputCounter}`;
    }
    if (kind === "videoinput") {
      return `Camera ${videoInputCounter}`;
    }
    return `Unknown Device ${deviceId.substring(0, 8)}`;
  }
}
