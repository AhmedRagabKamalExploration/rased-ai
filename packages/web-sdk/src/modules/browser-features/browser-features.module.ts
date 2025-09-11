import { BaseModule } from "@/modules/BaseModule";

export class BrowserFeaturesModule extends BaseModule {
  public readonly moduleName: string = "browserFeatures";

  /**
   * Initializes browser features collection.
   */
  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      const browserFeaturesData = this.collectBrowserFeatures();
      this.eventManager.dispatch(
        this.moduleName,
        "browserFeatures",
        browserFeaturesData
      );
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "browserFeatures.error", {
        error: "Browser features collection failed",
        errorCode: "COLLECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  private collectBrowserFeatures(): any {
    return {
      storage: this.checkStorageFeatures(),
      html5: this.checkHtml5Features(),
      es: this.checkESFeatures(),
      graphics: this.checkGraphicsFeatures(),
      network: this.checkNetworkFeatures(),
      css: this.checkCSSFeatures(),
      misc: this.checkMiscFeatures(),
      timestamp: Date.now(),
    };
  }

  private checkFeature(feature: string): 0 | 1 | null {
    return typeof (window as any)[feature] !== "undefined" ? 1 : 0;
  }

  private checkStorageFeatures(): (0 | 1 | null)[] {
    return [
      typeof localStorage !== "undefined" ? 1 : 0,
      typeof sessionStorage !== "undefined" ? 1 : 0,
      typeof indexedDB !== "undefined" ? 1 : 0,
      "getStorageUpdates" in (navigator as any) ? 1 : 0,
      "isLocalStorageSupported" in (window as any) ? 1 : 0,
      "isSessionStorageSupported" in (window as any) ? 1 : 0,
      "isIndexedDBSupported" in (window as any) ? 1 : 0,
    ];
  }

  private checkHtml5Features(): (0 | 1 | null)[] {
    const d = document.createElement("div");
    const c = document.createElement("canvas");
    return [
      "geolocation" in navigator ? 1 : 0,
      "canvas" in window ? 1 : 0,
      typeof c.getContext("2d") !== "undefined" ? 1 : 0,
      "postMessage" in window ? 1 : 0,
      "webgl" in d ? 1 : 0,
      "webgl2" in d ? 1 : 0,
      "history" in window ? 1 : 0,
      "localStorage" in window ? 1 : 0,
      "sessionStorage" in window ? 1 : 0,
      "Worker" in window ? 1 : 0,
      "applicationCache" in window ? 1 : 0,
      "FileReader" in window ? 1 : 0,
      "File" in window ? 1 : 0,
      "Blob" in window ? 1 : 0,
      "atob" in window ? 1 : 0,
      "btoa" in window ? 1 : 0,
      "onhashchange" in window ? 1 : 0,
      "onbeforeunload" in window ? 1 : 0,
      "devicePixelRatio" in window ? 1 : 0,
      "WebP" in window ? 1 : 0,
      "WebAssembly" in window ? 1 : 0,
      "speechSynthesis" in window ? 1 : 0,
      "speechSynthesis" in window ? 1 : 0,
      "IntersectionObserver" in window ? 1 : 0,
      "ResizeObserver" in window ? 1 : 0,
      "WebSockets" in window ? 1 : 0,
      "XMLHttpRequest" in window ? 1 : 0,
      "fetch" in window ? 1 : 0,
      "Promise" in window ? 1 : 0,
      "CSS" in window ? 1 : 0,
      "console" in window ? 1 : 0,
      "performance" in window ? 1 : 0,
      "requestAnimationFrame" in window ? 1 : 0,
      "PointerEvent" in window ? 1 : 0,
      "ClipboardEvent" in window ? 1 : 0,
      "FocusEvent" in window ? 1 : 0,
      "TouchEvent" in window ? 1 : 0,
      "WheelEvent" in window ? 1 : 0,
      "CustomEvent" in window ? 1 : 0,
      "StorageEvent" in window ? 1 : 0,
      "VisualViewport" in window ? 1 : 0,
      "document" in window ? 1 : 0,
      "document.currentScript" in document ? 1 : 0,
      "document.querySelector" in document ? 1 : 0,
      "document.querySelectorAll" in document ? 1 : 0,
      "document.getElementById" in document ? 1 : 0,
      "document.createElement" in document ? 1 : 0,
      "document.body" in document ? 1 : 0,
      "document.head" in document ? 1 : 0,
      "document.location" in document ? 1 : 0,
      "document.title" in document ? 1 : 0,
      "document.characterSet" in document ? 1 : 0,
      "document.compatMode" in document ? 1 : 0,
      "document.cookie" in document ? 1 : 0,
      "document.domain" in document ? 1 : 0,
      "document.documentURI" in document ? 1 : 0,
      "document.referrer" in document ? 1 : 0,
      "document.lastModified" in document ? 1 : 0,
      "document.URL" in document ? 1 : 0,
      "document.write" in document ? 1 : 0,
      "document.defaultView" in document ? 1 : 0,
      "document.implementation" in document ? 1 : 0,
      "document.xmlEncoding" in document ? 1 : 0,
      "document.xmlVersion" in document ? 1 : 0,
      "document.xmlStandalone" in document ? 1 : 0,
      "document.doctype" in document ? 1 : 0,
      "document.documentMode" in document ? 1 : 0,
      "document.forms" in document ? 1 : 0,
      "document.images" in document ? 1 : 0,
      "document.links" in document ? 1 : 0,
      "document.scripts" in document ? 1 : 0,
      "document.styleSheets" in document ? 1 : 0,
      "document.activeElement" in document ? 1 : 0,
      "document.body.ontouchstart" in document.body ? 1 : 0,
      "document.documentElement.ontouchstart" in document.documentElement
        ? 1
        : 0,
      "document.head.ontouchstart" in document.head ? 1 : 0,
      "window.ontouchstart" in window ? 1 : 0,
      "DeviceOrientationEvent" in window ? 1 : 0,
      "DeviceMotionEvent" in window ? 1 : 0,
      "Gamepad" in window ? 1 : 0,
      "MediaSource" in window ? 1 : 0,
      "AudioContext" in window ? 1 : 0,
      "Audio" in window ? 1 : 0,
      "WorkerGlobalScope" in window ? 1 : 0,
      "ServiceWorker" in window ? 1 : 0,
      "PushManager" in window ? 1 : 0,
      "PaymentRequest" in window ? 1 : 0,
      "performance.getEntriesByType" in performance ? 1 : 0,
      "performance.mark" in performance ? 1 : 0,
    ];
  }

  private checkESFeatures(): (0 | 1 | null)[] {
    return [
      typeof Object.assign !== "undefined" ? 1 : 0,
      typeof Symbol !== "undefined" ? 1 : 0,
      typeof Promise !== "undefined" ? 1 : 0,
      typeof Map !== "undefined" ? 1 : 0,
      typeof Set !== "undefined" ? 1 : 0,
      typeof WeakMap !== "undefined" ? 1 : 0,
      typeof WeakSet !== "undefined" ? 1 : 0,
      typeof Array.from !== "undefined" ? 1 : 0,
      typeof Array.prototype.includes !== "undefined" ? 1 : 0,
      typeof String.prototype.includes !== "undefined" ? 1 : 0,
      typeof String.prototype.startsWith !== "undefined" ? 1 : 0,
      typeof String.prototype.endsWith !== "undefined" ? 1 : 0,
      typeof Object.values !== "undefined" ? 1 : 0,
      typeof Object.entries !== "undefined" ? 1 : 0,
      typeof Object.keys !== "undefined" ? 1 : 0,
      typeof Number.isNaN !== "undefined" ? 1 : 0,
      typeof Math.log10 !== "undefined" ? 1 : 0,
    ];
  }

  private checkGraphicsFeatures(): (0 | 1 | null)[] {
    const c = document.createElement("canvas");
    return [
      "CanvasRenderingContext2D" in window ? 1 : 0,
      "CanvasGradient" in window ? 1 : 0,
      "CanvasPattern" in window ? 1 : 0,
      "Image" in window ? 1 : 0,
      "ImageData" in window ? 1 : 0,
      "Path2D" in window ? 1 : 0,
      "SVGElement" in window ? 1 : 0,
      "WebGLRenderingContext" in window ? 1 : 0,
      "WebGL2RenderingContext" in window ? 1 : 0,
      "OffscreenCanvas" in window ? 1 : 0,
      "ImageBitmap" in window ? 1 : 0,
      "createImageBitmap" in window ? 1 : 0,
      "ImageBitmapRenderingContext" in window ? 1 : 0,
      "ImageCapture" in window ? 1 : 0,
      "Path2D" in window ? 1 : 0,
      "getComputedStyle" in window ? 1 : 0,
      "matchMedia" in window ? 1 : 0,
      "CSS" in window ? 1 : 0,
    ];
  }

  private checkNetworkFeatures(): (0 | 1 | null)[] {
    return [
      "fetch" in window ? 1 : 0,
      "XMLHttpRequest" in window ? 1 : 0,
      "WebSocket" in window ? 1 : 0,
      "EventSource" in window ? 1 : 0,
      "navigator.sendBeacon" in navigator ? 1 : 0,
      "navigator.onLine" in navigator ? 1 : 0,
      "navigator.connection" in navigator ? 1 : 0,
      "PerformanceObserver" in window ? 1 : 0,
      "PerformanceResourceTiming" in window ? 1 : 0,
      "URL" in window ? 1 : 0,
      "URLSearchParams" in window ? 1 : 0,
      "Headers" in window ? 1 : 0,
      "Request" in window ? 1 : 0,
      "Response" in window ? 1 : 0,
      "Worker" in window ? 1 : 0,
      "ServiceWorker" in window ? 1 : 0,
      "PushManager" in window ? 1 : 0,
      "RTCPeerConnection" in window ? 1 : 0,
      "RTCIceCandidate" in window ? 1 : 0,
    ];
  }

  private checkCSSFeatures(): (0 | 1 | null)[] {
    const d = document.createElement("div").style;
    const s = document.createElement("style");
    document.head.appendChild(s);
    const ss = s.sheet as CSSStyleSheet;

    const testFeatures: string[] = [
      "flex",
      "grid",
      "transition",
      "animation",
      "transform",
      "filter",
      "backdropFilter",
      "mask",
      "shapeOutside",
      "clipPath",
      "columns",
      "columnCount",
      "columnGap",
      "webkitOverflowScrolling",
      "mozOsxFontSmoothing",
      "webkitFontSmoothing",
      "appearance",
      "userSelect",
      "boxSizing",
      "borderImage",
      "outlineOffset",
      "backgroundClip",
      "backgroundOrigin",
      "backgroundSize",
      "fontFeatureSettings",
      "fontVariantLigatures",
      "fontKerning",
      "font-size-adjust",
      "mixBlendMode",
      "isolation",
      "willChange",
      "scrollSnapType",
      "paintOrder",
      "textSizeAdjust",
      "webkitTapHighlightColor",
      "webkitTouchCallout",
      "webkitUserSelect",
      "webkitBoxReflect",
      "webkitBoxShadow",
      "webkitTextFillColor",
      "webkitTextStroke",
      "webkitTextStrokeColor",
      "webkitTextStrokeWidth",
      "webkitTransform",
      "webkitTransition",
      "webkitAnimation",
      "webkitAppearance",
      "webkitUserDrag",
      "webkitBackgroundClip",
      "webkitBackgroundOrigin",
      "webkitBackgroundSize",
      "webkitBorderImage",
      "webkitColumnBreakAfter",
      "webkitColumnBreakBefore",
      "webkitColumnBreakInside",
      "webkitColumnRule",
      "webkitColumnRuleColor",
      "webkitColumnRuleStyle",
      "webkitColumnRuleWidth",
      "webkitColumnCount",
      "webkitColumnGap",
      "webkitColumns",
      "webkitFlex",
      "webkitFlexDirection",
      "webkitFlexFlow",
      "webkitFlexWrap",
      "webkitJustifyContent",
      "webkitAlignItems",
      "webkitAlignContent",
      "webkitAlignSelf",
      "webkitOrder",
      "webkitTransform",
      "webkitTransformOrigin",
      "webkitTransition",
      "webkitTransitionDuration",
      "webkitTransitionProperty",
      "webkitTransitionTimingFunction",
    ];

    const results: (0 | 1 | null)[] = testFeatures.map((feature) =>
      feature in d ? 1 : 0
    );

    return results;
  }

  private checkMiscFeatures(): (0 | 1 | null)[] {
    return [
      "screen" in window ? 1 : 0,
      "navigator" in window ? 1 : 0,
      "navigator.hardwareConcurrency" in navigator ? 1 : 0,
      "navigator.deviceMemory" in navigator ? 1 : 0,
      "navigator.userAgent" in navigator ? 1 : 0,
      "navigator.languages" in navigator ? 1 : 0,
      "navigator.platform" in navigator ? 1 : 0,
      "navigator.cookieEnabled" in navigator ? 1 : 0,
      "navigator.maxTouchPoints" in navigator ? 1 : 0,
      "navigator.product" in navigator ? 1 : 0,
      "navigator.appName" in navigator ? 1 : 0,
      "navigator.appVersion" in navigator ? 1 : 0,
      "navigator.doNotTrack" in navigator ? 1 : 0,
      "navigator.onLine" in navigator ? 1 : 0,
      "navigator.plugins" in navigator ? 1 : 0,
      "navigator.mimeTypes" in navigator ? 1 : 0,
      "navigator.vendor" in navigator ? 1 : 0,
      "navigator.buildID" in navigator ? 1 : 0,
      "navigator.appCodeName" in navigator ? 1 : 0,
      "navigator.productSub" in navigator ? 1 : 0,
      "console" in window ? 1 : 0,
      "console.log" in console ? 1 : 0,
      "console.warn" in console ? 1 : 0,
      "console.error" in console ? 1 : 0,
      "console.table" in console ? 1 : 0,
      "crypto" in window ? 1 : 0,
      "crypto.getRandomValues" in window.crypto ? 1 : 0,
      "crypto.subtle" in window.crypto ? 1 : 0,
      "atob" in window ? 1 : 0,
      "btoa" in window ? 1 : 0,
      "DOMParser" in window ? 1 : 0,
      "XMLSerializer" in window ? 1 : 0,
      "alert" in window ? 1 : 0,
      "confirm" in window ? 1 : 0,
      "prompt" in window ? 1 : 0,
      "DeviceMotionEvent" in window ? 1 : 0,
      "DeviceOrientationEvent" in window ? 1 : 0,
      "Touch" in window ? 1 : 0,
      "TouchEvent" in window ? 1 : 0,
      "Worker" in window ? 1 : 0,
      "Image" in window ? 1 : 0,
      "ImageBitmap" in window ? 1 : 0,
      "ImageBitmapRenderingContext" in window ? 1 : 0,
      "createImageBitmap" in window ? 1 : 0,
      "Request" in window ? 1 : 0,
      "Response" in window ? 1 : 0,
      "PerformanceObserver" in window ? 1 : 0,
      "PerformanceEntry" in window ? 1 : 0,
      "IntersectionObserver" in window ? 1 : 0,
      "ResizeObserver" in window ? 1 : 0,
      "MutationObserver" in window ? 1 : 0,
      "OffscreenCanvas" in window ? 1 : 0,
      "URL" in window ? 1 : 0,
      "URLSearchParams" in window ? 1 : 0,
    ];
  }
}
