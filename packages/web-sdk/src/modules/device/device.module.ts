import { BaseModule } from "@/modules/BaseModule";

export class DeviceModule extends BaseModule {
  public readonly moduleName: string = "device";

  /**
   * Initializes device information collection.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const deviceData = await this.getDeviceData();
      this.eventManager.dispatch(this.moduleName, "device", deviceData);
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "device.error", {
        error: "Device data collection failed",
        errorCode: "UNEXPECTED_ERROR",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Gathers comprehensive device data, including GPU information.
   */
  private async getDeviceData(): Promise<any> {
    const gpuInfo = this.getGPUInfo();
    const colorGamut = this.getColorGamut();

    return {
      hardwareConcurrency: navigator.hardwareConcurrency,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      gpuVendor: gpuInfo.vendor,
      gpuModel: gpuInfo.model,
      colorGamut: colorGamut,
      deviceMemory: (navigator as any).deviceMemory || undefined,
      timestamp: Date.now(),
    };
  }

  /**
   * Extracts GPU vendor and model using a temporary WebGL canvas.
   */
  private getGPUInfo(): { vendor: string; model: string } {
    let vendor = "unknown";
    let model = "unknown";

    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext);

      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || vendor;
          model = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || model;
        } else {
          // Fallback if the debug extension is not available
          vendor = gl.getParameter(gl.VENDOR) || vendor;
          model = gl.getParameter(gl.RENDERER) || model;
        }
      }
    } catch (error) {
      console.warn("[DeviceModule] Failed to get WebGL GPU info.", error);
    }

    return { vendor, model };
  }

  /**
   * Detects the color gamut supported by the display.
   */
  private getColorGamut(): string {
    if ("matchMedia" in window) {
      if (window.matchMedia("(color-gamut: rec2020)").matches) {
        return "rec2020";
      }
      if (window.matchMedia("(color-gamut: p3)").matches) {
        return "p3";
      }
      if (window.matchMedia("(color-gamut: srgb)").matches) {
        return "srgb";
      }
    }
    return "unknown";
  }
}
