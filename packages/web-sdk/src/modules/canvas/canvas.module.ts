import { BaseModule } from "../BaseModule";

/**
 * Canvas Fingerprinting Module
 *
 * Implements canvas fingerprinting techniques based on obfuscated code analysis:
 * - 2D Canvas text and geometric rendering
 * - Canvas blending support detection
 * - Canvas winding rule testing
 * - WebGL fingerprinting capabilities
 * - Image format support detection
 *
 * Generates unique device fingerprints for fraud detection
 */
export class CanvasModule extends BaseModule {
  public readonly moduleName = "canvas";

  private isInitialized: boolean = false;
  private canvas2D: HTMLCanvasElement | null = null;
  private canvasWebGL: HTMLCanvasElement | null = null;

  /**
   * Initialize canvas fingerprinting
   */
  public init(): void {
    if (this.isInitialized) {
      return;
    }

    console.log(
      `[SDK] ${this.moduleName}: Initializing canvas fingerprinting...`
    );
    this.setupCanvasFingerprinting();
    this.isInitialized = true;

    console.log(`[SDK] ${this.moduleName}: Canvas fingerprinting initialized`);
  }

  /**
   * Setup canvas fingerprinting based on obfuscated code implementation
   */
  private setupCanvasFingerprinting(): void {
    try {
      // Generate 2D canvas fingerprint
      const canvas2DFingerprint = this.generate2DCanvasFingerprint();

      // Generate WebGL fingerprint
      const webGLFingerprint = this.generateWebGLFingerprint();

      // Generate canvas capabilities fingerprint
      const capabilitiesFingerprint = this.generateCapabilitiesFingerprint();

      // Combine all fingerprints
      const combinedFingerprint = this.combineFingerprints(
        canvas2DFingerprint,
        webGLFingerprint,
        capabilitiesFingerprint
      );

      // Generate final hash output matching obfuscated code format
      const fingerprintData =
        this.generateFingerprintHashes(combinedFingerprint);

      // Dispatch the fingerprint data
      this.eventManager.dispatch(this.moduleName, "canvas", fingerprintData);
    } catch (error) {
      console.error(
        `[SDK] ${this.moduleName}: Canvas fingerprinting failed:`,
        error
      );
      // Dispatch error state
      this.eventManager.dispatch(this.moduleName, "canvas", {
        short: "error",
        long: "canvas_fingerprinting_failed",
      });
    }
  }

  /**
   * Generate 2D Canvas fingerprint (based on obfuscated code lxm function)
   */
  private generate2DCanvasFingerprint(): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("2D canvas context not available");
    }

    // Set canvas size
    canvas.width = 2000;
    canvas.height = 200;

    // Text rendering test (matching obfuscated code)
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.font = "13px 'Arial'";
    ctx.fillText("Cwm qrlkjrld@oXel", 2, 15);

    // Complex text with emoji (matching obfuscated code)
    ctx.fillStyle = "rgba(102, 204, 0, 0.2)";
    ctx.font = "18pt Arial";
    ctx.fillText("chuTNey deceIve oRal, madman Nomad CNMmw 😁", 2, 15);

    // Geometric shapes test
    ctx.fillStyle = "#997600";
    ctx.fillRect(125, 1, 62, 20);

    // Arc and path tests (matching obfuscated code)
    ctx.fillStyle = "#113399";
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    // Additional arc test
    ctx.fillStyle = "#663399";
    ctx.beginPath();
    ctx.arc(75, 100, 50, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    // Complex path test
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.arc(75, 75, 25, 0, 2 * Math.PI, true);
    ctx.fill();

    return canvas.toDataURL();
  }

  /**
   * Generate WebGL fingerprint (based on obfuscated code PBm class)
   */
  private generateWebGLFingerprint(): string {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      return "webgl_not_supported";
    }

    this.canvasWebGL = canvas;

    try {
      // Cast to WebGLRenderingContext since we know it's WebGL
      const webgl = gl as WebGLRenderingContext;

      // Basic WebGL context info
      const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");
      const renderer = debugInfo
        ? webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "unknown";
      const vendor = debugInfo
        ? webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : "unknown";

      // Create a simple shader program
      const vertexShader = this.createShader(
        webgl,
        webgl.VERTEX_SHADER,
        `
        attribute vec4 position;
        void main() {
          gl_Position = position;
        }
      `
      );

      const fragmentShader = this.createShader(
        webgl,
        webgl.FRAGMENT_SHADER,
        `
        precision mediump float;
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
      `
      );

      if (!vertexShader || !fragmentShader) {
        return "webgl_shader_failed";
      }

      const program = this.createProgram(webgl, vertexShader, fragmentShader);

      if (!program) {
        return "webgl_shader_failed";
      }

      // Create a simple triangle
      const positions = new Float32Array([-1, -1, 1, -1, 0, 1]);

      const buffer = webgl.createBuffer();
      webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
      webgl.bufferData(webgl.ARRAY_BUFFER, positions, webgl.STATIC_DRAW);

      webgl.useProgram(program);
      const positionLocation = webgl.getAttribLocation(program, "position");
      webgl.enableVertexAttribArray(positionLocation);
      webgl.vertexAttribPointer(positionLocation, 2, webgl.FLOAT, false, 0, 0);

      // Render
      webgl.clearColor(0, 0, 0, 1);
      webgl.clear(webgl.COLOR_BUFFER_BIT);
      webgl.drawArrays(webgl.TRIANGLES, 0, 3);

      // Get pixel data
      const pixels = new Uint8Array(
        webgl.drawingBufferWidth * webgl.drawingBufferHeight * 4
      );
      webgl.readPixels(
        0,
        0,
        webgl.drawingBufferWidth,
        webgl.drawingBufferHeight,
        webgl.RGBA,
        webgl.UNSIGNED_BYTE,
        pixels
      );

      return canvas.toDataURL() + "|" + renderer + "|" + vendor;
    } catch (error) {
      return "webgl_error";
    }
  }

  /**
   * Generate canvas capabilities fingerprint
   */
  private generateCapabilitiesFingerprint(): string {
    const capabilities: string[] = [];

    // Canvas blending support test
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.globalCompositeOperation = "screen";
        capabilities.push(
          "blending:" + (ctx.globalCompositeOperation === "screen")
        );
      }
    } catch (e) {
      capabilities.push("blending:false");
    }

    // Canvas text support test
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx && typeof ctx.fillText === "function") {
        capabilities.push("text:true");
      } else {
        capabilities.push("text:false");
      }
    } catch (e) {
      capabilities.push("text:false");
    }

    // Canvas winding support test
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.rect(0, 0, 160, 10);
        ctx.rect(2, 2, 6, 6);
        const windingSupport = ctx.isPointInPath(5, 5, "evenodd");
        capabilities.push("winding:" + windingSupport);
      }
    } catch (e) {
      capabilities.push("winding:false");
    }

    // Canvas toDataURL format support
    try {
      const canvas = document.createElement("canvas");
      const pngSupport =
        canvas.toDataURL("image/png").indexOf("data:image/png") === 0;
      capabilities.push("png:" + pngSupport);
    } catch (e) {
      capabilities.push("png:false");
    }

    try {
      const canvas = document.createElement("canvas");
      const webpSupport =
        canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
      capabilities.push("webp:" + webpSupport);
    } catch (e) {
      capabilities.push("webp:false");
    }

    return capabilities.join("|");
  }

  /**
   * Combine all fingerprints into a single string
   */
  private combineFingerprints(
    canvas2D: string,
    webGL: string,
    capabilities: string
  ): string {
    return `${canvas2D}|${webGL}|${capabilities}`;
  }

  /**
   * Generate fingerprint hashes matching obfuscated code format
   */
  private generateFingerprintHashes(fingerprint: string): {
    short: string;
    long: string;
  } {
    // Generate short hash (32 characters)
    const shortHash = this.simpleHash(fingerprint, 32);

    // Generate long hash (64 characters)
    const longHash = this.simpleHash(fingerprint, 64);

    return {
      short: shortHash,
      long: longHash,
    };
  }

  /**
   * Simple hash function (matching obfuscated code pattern)
   */
  private simpleHash(str: string, length: number): string {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to hex string
    let result = Math.abs(hash).toString(16);

    // Pad or truncate to desired length
    while (result.length < length) {
      result = this.simpleHash(result + str, 1) + result;
    }

    return result.substring(0, length);
  }

  /**
   * Create WebGL shader
   */
  private createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Create WebGL program
   */
  private createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  /**
   * Get current canvas state
   */
  public getCanvasState(): {
    isInitialized: boolean;
    has2DCanvas: boolean;
    hasWebGLCanvas: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      has2DCanvas: this.canvas2D !== null,
      hasWebGLCanvas: this.canvasWebGL !== null,
    };
  }

  /**
   * Force regenerate fingerprint
   */
  public regenerateFingerprint(): void {
    if (this.isInitialized) {
      this.setupCanvasFingerprinting();
    }
  }

  /**
   * Cleanup and destroy module
   */
  public destroy(): void {
    this.canvas2D = null;
    this.canvasWebGL = null;
    this.isInitialized = false;
    console.log(`[SDK] ${this.moduleName}: Canvas fingerprinting destroyed`);
  }
}
