import { BaseModule } from "@/modules/BaseModule";

export class WebGLModule extends BaseModule {
  public readonly moduleName: string = "WebGL";

  /**
   * Initializes the WebGL fingerprinting process.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    // The process is asynchronous, so we wrap it to handle errors gracefully.
    this.generateFingerprint().catch((error) => {
      console.error(`[SDK] ${this.moduleName}: Fingerprinting failed.`, error);
      this.eventManager.dispatch(this.moduleName, "fingerprint.webgl.error", {
        error: (error as Error).message || "An unknown error occurred.",
      });
    });
  }

  private async generateFingerprint(): Promise<void> {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      // This is a valuable signal in itself.
      this.eventManager.dispatch(this.moduleName, "webgl", {
        supported: false,
        error: "WebGL not supported or enabled.",
      });
      return;
    }

    const webglContext = gl as WebGLRenderingContext;

    // 1. Collect static hardware and driver parameters.
    const staticParams = this.getWebGLParameters(webglContext);

    // 2. Perform an active render test to get a visual signature.
    const renderHash = this.getRenderHash(webglContext, canvas);

    // 3. Hash the static parameters for a combined signature.
    const paramsHash = await this.hash(JSON.stringify(staticParams));

    this.eventManager.dispatch(this.moduleName, "webgl", {
      supported: true,
      renderHash,
      paramsHash,
      parameters: staticParams,
    });
  }

  /**
   * Renders a simple scene and returns a hash of the resulting image data.
   */
  private getRenderHash(
    gl: WebGLRenderingContext,
    canvas: HTMLCanvasElement
  ): string {
    try {
      const vertexShaderSource = `
                attribute vec2 a_position;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `;
      const fragmentShaderSource = `
                precision mediump float;
                void main() {
                    gl_FragColor = vec4(0.2, 0.4, 0.6, 1.0);
                }
            `;

      const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);

      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const positions = new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.0, 0.5]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionAttributeLocation = gl.getAttribLocation(
        program,
        "a_position"
      );
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.clearColor(0.8, 0.8, 0.8, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      return canvas.toDataURL();
    } catch (e) {
      return "render-failed";
    }
  }

  /**
   * Collects a wide variety of static WebGL parameters.
   */
  private getWebGLParameters(gl: WebGLRenderingContext): Record<string, any> {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const params: Record<string, any> = {};

    // Collect standard and debug renderer info
    params.vendor = gl.getParameter(gl.VENDOR);
    params.renderer = gl.getParameter(gl.RENDERER);
    if (debugInfo) {
      params.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      params.unmaskedRenderer = gl.getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL
      );
    }

    // Collect various hardware limits and capabilities
    const glParams = [
      "VERSION",
      "SHADING_LANGUAGE_VERSION",
      "MAX_TEXTURE_SIZE",
      "MAX_VIEWPORT_DIMS",
      "MAX_VERTEX_ATTRIBS",
      "MAX_VERTEX_UNIFORM_VECTORS",
      "MAX_VARYING_VECTORS",
      "MAX_COMBINED_TEXTURE_IMAGE_UNITS",
      "MAX_VERTEX_TEXTURE_IMAGE_UNITS",
      "MAX_TEXTURE_IMAGE_UNITS",
      "MAX_RENDERBUFFER_SIZE",
    ];
    glParams.forEach((p) => {
      const param = (gl as any)[p];
      if (param) {
        params[p.toLowerCase()] = gl.getParameter(param);
      }
    });

    // Get the list of supported extensions
    params.supportedExtensions = gl.getSupportedExtensions();

    return params;
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
