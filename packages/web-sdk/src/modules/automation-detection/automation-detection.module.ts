import { BaseModule } from "../BaseModule";

/**
 * Automation Detection Module
 *
 * Implements comprehensive automation detection based on obfuscated code analysis:
 * - WebDriver detection (navigator.webdriver, document attributes)
 * - Selenium detection (selenium-specific properties and functions)
 * - PhantomJS detection (phantom-specific APIs)
 * - Chrome DevTools Protocol detection (CDP properties)
 * - Additional automation tool detection
 * - Behavioral analysis for automation patterns
 *
 * Based on BotIndicatorsModule (TGm) from obfuscated code
 */
export class AutomationDetectionModule extends BaseModule {
  public readonly moduleName = "automation-detection";

  private isInitialized: boolean = false;
  private detectionResults: {
    webdriver: boolean;
    selenium: boolean;
    phantomjs: boolean;
    chromeDevTools: boolean;
    additionalTools: boolean;
    behavioralAnalysis: boolean;
    overallAutomation: boolean;
  } = {
    webdriver: false,
    selenium: false,
    phantomjs: false,
    chromeDevTools: false,
    additionalTools: false,
    behavioralAnalysis: false,
    overallAutomation: false,
  };

  /**
   * Initialize automation detection
   */
  public init(): void {
    if (this.isInitialized) {
      return;
    }

    console.log(
      `[SDK] ${this.moduleName}: Initializing automation detection...`
    );
    this.performAutomationDetection();
    this.isInitialized = true;

    console.log(`[SDK] ${this.moduleName}: Automation detection initialized`);
  }

  /**
   * Perform comprehensive automation detection
   */
  private performAutomationDetection(): void {
    try {
      // WebDriver detection
      this.detectionResults.webdriver = this.detectWebDriver();

      // Selenium detection
      this.detectionResults.selenium = this.detectSelenium();

      // PhantomJS detection
      this.detectionResults.phantomjs = this.detectPhantomJS();

      // Chrome DevTools Protocol detection
      this.detectionResults.chromeDevTools = this.detectChromeDevTools();

      // Additional automation tools detection
      this.detectionResults.additionalTools = this.detectAdditionalTools();

      // Behavioral analysis
      this.detectionResults.behavioralAnalysis =
        this.performBehavioralAnalysis();

      // Overall automation detection
      this.detectionResults.overallAutomation =
        this.calculateOverallAutomation();

      // Dispatch detection results
      this.eventManager.dispatch(
        this.moduleName,
        "automation",
        this.detectionResults
      );
    } catch (error) {
      console.error(
        `[SDK] ${this.moduleName}: Automation detection failed:`,
        error
      );
      // Dispatch error state
      this.eventManager.dispatch(this.moduleName, "automation", {
        error: "automation_detection_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Detect WebDriver automation (based on obfuscated code analysis)
   * Note: Modern browsers set navigator.webdriver=true even in normal mode
   * So we need additional checks to distinguish real automation
   */
  private detectWebDriver(): boolean {
    try {
      // Check if navigator.webdriver is true
      if (navigator.webdriver === true) {
        // Additional checks to distinguish real automation from false positives

        // Check for WebDriver-specific properties that indicate real automation
        const webdriverIndicators = [
          // Chrome DevTools Protocol indicators
          (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise,
          (window as any).__$webdriverAsyncExecutor,

          // Selenium indicators
          (window as any).seleniumKey,
          (navigator as any).callSelenium,
          (window as any)._selenium,

          // Other automation indicators
          (window as any).__fxdriver_unwrapped,
          (window as any).__webdriverFunc,
          (window as any).__driver_evaluate,

          // Check for automation-specific functions
          typeof (window as any).webdriver !== "undefined",
          typeof (navigator as any).webdriver !== "undefined",
        ];

        // If any real automation indicator exists, it's likely automation
        const hasRealAutomation = webdriverIndicators.some(
          (indicator) => indicator !== undefined && indicator !== null
        );

        if (hasRealAutomation) {
          return true;
        }

        // Check document.documentElement.getAttribute("webdriver")
        const webdriverAttr =
          document.documentElement.getAttribute("webdriver");
        if (webdriverAttr !== null && webdriverAttr !== "") {
          return true;
        }

        // Check for headless browser indicators
        const headlessIndicators = [
          navigator.userAgent.includes("HeadlessChrome"),
          navigator.userAgent.includes("PhantomJS"),
          (window as any).callPhantom,
          (navigator as any).__phantomas,
        ];

        if (headlessIndicators.some((indicator) => indicator)) {
          return true;
        }

        // If only navigator.webdriver is true but no other indicators,
        // it's likely a false positive in modern browsers
        return false;
      }

      // Check document.documentElement.getAttribute("webdriver")
      const webdriverAttr = document.documentElement.getAttribute("webdriver");
      if (webdriverAttr !== null && webdriverAttr !== "") {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: WebDriver detection error:`,
        error
      );
      return false;
    }
  }

  /**
   * Detect Selenium automation (based on obfuscated code analysis)
   */
  private detectSelenium(): boolean {
    try {
      // Check for selenium-specific properties
      const seleniumIndicators = [
        // Selenium global properties
        (window as any).seleniumKey,
        (navigator as any).callSelenium,
        (navigator as any).calledSelenium,
        (window as any)._selenium,

        // Selenium function references
        (window as any).__fxdriver_unwrapped,
        (window as any).__fxdriver_evaluate,
        (window as any).__lastWatirPrompt,
        (window as any).__selenium_evaluate,
        (window as any).__webdriverFuncgeb,
        (window as any).__webdriverFunc,
        (window as any).__driver_evaluate,
        (window as any).__driver_unwrapped,
      ];

      // Check if any selenium indicator exists
      for (const indicator of seleniumIndicators) {
        if (indicator !== undefined && indicator !== null) {
          return true;
        }
      }

      // Check for selenium in navigator properties
      if ((navigator as any).selenium !== undefined) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Selenium detection error:`,
        error
      );
      return false;
    }
  }

  /**
   * Detect PhantomJS automation (based on obfuscated code analysis)
   */
  private detectPhantomJS(): boolean {
    try {
      // Check for PhantomJS-specific properties
      const phantomIndicators = [
        (window as any).callPhantom,
        (navigator as any).__phantomas,
        (window as any).phantom,
      ];

      // Check if any phantom indicator exists
      for (const indicator of phantomIndicators) {
        if (indicator !== undefined && indicator !== null) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: PhantomJS detection error:`,
        error
      );
      return false;
    }
  }

  /**
   * Detect Chrome DevTools Protocol automation (based on obfuscated code analysis)
   */
  private detectChromeDevTools(): boolean {
    try {
      // Check for Chrome DevTools Protocol properties
      const cdpIndicators = [
        (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise,
        (window as any).__$webdriverAsyncExecutor,
        (window as any).__webdriverFunc,
        (window as any).__webdriverFuncgeb,
        (window as any).__webdriver_evaluate,
        (window as any).__webdriver_unwrapped,
      ];

      // Check if any CDP indicator exists
      for (const indicator of cdpIndicators) {
        if (indicator !== undefined && indicator !== null) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Chrome DevTools detection error:`,
        error
      );
      return false;
    }
  }

  /**
   * Detect additional automation tools (based on obfuscated code analysis)
   */
  private detectAdditionalTools(): boolean {
    try {
      // Check for additional automation tool properties
      const additionalIndicators = [
        // Puppeteer indicators
        (window as any).__puppeteer,
        (window as any).__playwright,

        // Playwright indicators
        (window as any).playwright,

        // Other automation tools
        (window as any).__nightmare,
        (window as any).__taiko,
        (window as any).__cypress,
        (window as any).__testcafe,

        // Headless browser indicators
        (navigator as any).headless,
        (window as any).headless,
      ];

      // Check if any additional indicator exists
      for (const indicator of additionalIndicators) {
        if (indicator !== undefined && indicator !== null) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Additional tools detection error:`,
        error
      );
      return false;
    }
  }

  /**
   * Perform behavioral analysis for automation detection
   */
  private performBehavioralAnalysis(): boolean {
    try {
      // Check for automation-like behavior patterns
      const behavioralIndicators = this.checkBehavioralIndicators();

      // Check for timing patterns
      const timingPatterns = this.checkTimingPatterns();

      // Check for interaction patterns
      const interactionPatterns = this.checkInteractionPatterns();

      // Check for automation-specific behavior
      const automationBehavior = this.checkAutomationBehavior();

      return (
        behavioralIndicators ||
        timingPatterns ||
        interactionPatterns ||
        automationBehavior
      );
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Behavioral analysis error:`,
        error
      );
      return false;
    }
  }

  /**
   * Check for automation-specific behavior patterns
   */
  private checkAutomationBehavior(): boolean {
    try {
      // Check for automation-specific patterns
      const automationPatterns = [
        // Check if performance.now() returns suspicious values (often 0 in automation)
        typeof performance !== "undefined" && performance.now() === 0,

        // Check if requestAnimationFrame behaves suspiciously
        typeof requestAnimationFrame === "function" &&
          requestAnimationFrame(() => {}) === 0,

        // Check for missing or suspicious navigator properties
        navigator.userAgent === "",
        navigator.platform === "",
        navigator.language === "",

        // Check for automation-specific window properties
        typeof (window as any).webdriver !== "undefined",
        typeof (window as any).selenium !== "undefined",
        typeof (window as any).phantom !== "undefined",

        // Check for automation-specific document properties
        document.documentElement.getAttribute("webdriver") !== null,
        document.documentElement.getAttribute("selenium") !== null,

        // Check for automation-specific console properties
        typeof (console as any).webdriver !== "undefined",
        typeof (console as any).selenium !== "undefined",
      ];

      // If any automation pattern is detected
      return automationPatterns.some((pattern) => pattern);
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Automation behavior check error:`,
        error
      );
      return false;
    }
  }

  /**
   * Check for behavioral indicators of automation
   */
  private checkBehavioralIndicators(): boolean {
    try {
      // Check for missing human-like properties
      const missingHumanProperties = [
        // Check if performance.now() is available (often missing in headless browsers)
        typeof performance !== "undefined" &&
          typeof performance.now === "function",

        // Check if requestAnimationFrame is available
        typeof requestAnimationFrame === "function",

        // Check if setTimeout is available
        typeof setTimeout === "function",
      ];

      // If any essential browser APIs are missing, it might be automation
      const missingAPIs = missingHumanProperties.filter(
        (available) => !available
      );
      if (missingAPIs.length > 0) {
        return true;
      }

      // Check for automation-like navigator properties
      const navigatorProperties = [
        navigator.userAgent,
        navigator.platform,
        navigator.language,
        navigator.cookieEnabled,
      ];

      // If navigator properties are missing or suspicious, it might be automation
      const suspiciousProperties = navigatorProperties.filter(
        (prop) => prop === undefined || prop === null || prop === ""
      );

      if (suspiciousProperties.length > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Behavioral indicators check error:`,
        error
      );
      return false;
    }
  }

  /**
   * Check for timing patterns that indicate automation
   */
  private checkTimingPatterns(): boolean {
    try {
      // Check if performance timing is available
      if (typeof performance !== "undefined" && performance.timing) {
        const timing = performance.timing;

        // Check for suspicious timing patterns
        const suspiciousTiming = [
          // Very fast page load times (might indicate automation)
          timing.loadEventEnd - timing.navigationStart < 100,

          // Missing timing events (might indicate automation)
          timing.domContentLoadedEventEnd === 0,
          timing.loadEventEnd === 0,
        ];

        // If any suspicious timing pattern is detected
        if (suspiciousTiming.some((pattern) => pattern)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Timing patterns check error:`,
        error
      );
      return false;
    }
  }

  /**
   * Check for interaction patterns that indicate automation
   */
  private checkInteractionPatterns(): boolean {
    try {
      // Check for missing interaction capabilities
      const interactionCapabilities = [
        // Check if mouse events are available
        typeof MouseEvent !== "undefined",

        // Check if touch events are available
        typeof TouchEvent !== "undefined",

        // Check if keyboard events are available
        typeof KeyboardEvent !== "undefined",
      ];

      // If essential interaction capabilities are missing, it might be automation
      const missingCapabilities = interactionCapabilities.filter(
        (capable) => !capable
      );
      if (missingCapabilities.length > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Interaction patterns check error:`,
        error
      );
      return false;
    }
  }

  /**
   * Calculate overall automation detection result
   */
  private calculateOverallAutomation(): boolean {
    const {
      webdriver,
      selenium,
      phantomjs,
      chromeDevTools,
      additionalTools,
      behavioralAnalysis,
    } = this.detectionResults;

    // If any specific automation tool is detected, return true
    if (
      webdriver ||
      selenium ||
      phantomjs ||
      chromeDevTools ||
      additionalTools
    ) {
      return true;
    }

    // If behavioral analysis indicates automation, return true
    if (behavioralAnalysis) {
      return true;
    }

    // Additional check: if navigator.webdriver is true but no other indicators,
    // it's likely a false positive in modern browsers
    if (navigator.webdriver === true && !this.hasRealAutomationIndicators()) {
      return false;
    }

    return false;
  }

  /**
   * Check if there are real automation indicators beyond just navigator.webdriver
   */
  private hasRealAutomationIndicators(): boolean {
    try {
      const realIndicators = [
        // Selenium indicators
        (window as any).seleniumKey,
        (navigator as any).callSelenium,
        (window as any)._selenium,
        (window as any).__fxdriver_unwrapped,
        (window as any).__fxdriver_evaluate,
        (window as any).__selenium_evaluate,

        // PhantomJS indicators
        (window as any).callPhantom,
        (navigator as any).__phantomas,
        (window as any).phantom,

        // Chrome DevTools Protocol indicators
        (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise,
        (window as any).__$webdriverAsyncExecutor,
        (window as any).__webdriverFunc,
        (window as any).__webdriverFuncgeb,

        // Other automation indicators
        (window as any).__driver_evaluate,
        (window as any).__driver_unwrapped,
        (window as any).__webdriver_evaluate,
        (window as any).__webdriver_unwrapped,

        // Headless browser indicators
        navigator.userAgent.includes("HeadlessChrome"),
        navigator.userAgent.includes("PhantomJS"),

        // Document attributes
        document.documentElement.getAttribute("webdriver") !== null,
        document.documentElement.getAttribute("selenium") !== null,
      ];

      return realIndicators.some(
        (indicator) =>
          indicator !== undefined && indicator !== null && indicator !== ""
      );
    } catch (error) {
      console.warn(
        `[SDK] ${this.moduleName}: Real automation indicators check error:`,
        error
      );
      return false;
    }
  }

  /**
   * Get current detection results
   */
  public getDetectionResults(): typeof this.detectionResults {
    return { ...this.detectionResults };
  }

  /**
   * Force re-run automation detection
   */
  public reRunDetection(): void {
    if (this.isInitialized) {
      this.performAutomationDetection();
    }
  }

  /**
   * Check if automation was detected
   */
  public isAutomationDetected(): boolean {
    return this.detectionResults.overallAutomation;
  }

  /**
   * Get detailed detection report
   */
  public getDetailedReport(): {
    overall: boolean;
    details: {
      webdriver: boolean;
      selenium: boolean;
      phantomjs: boolean;
      chromeDevTools: boolean;
      additionalTools: boolean;
      behavioralAnalysis: boolean;
      overallAutomation: boolean;
    };
    debug: {
      navigatorWebdriver: boolean;
      hasRealAutomationIndicators: boolean;
      userAgent: string;
      webdriverAttr: string | null;
    };
    timestamp: number;
  } {
    return {
      overall: this.detectionResults.overallAutomation,
      details: { ...this.detectionResults },
      debug: {
        navigatorWebdriver: navigator.webdriver === true,
        hasRealAutomationIndicators: this.hasRealAutomationIndicators(),
        userAgent: navigator.userAgent,
        webdriverAttr: document.documentElement.getAttribute("webdriver"),
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Cleanup and destroy module
   */
  public destroy(): void {
    this.detectionResults = {
      webdriver: false,
      selenium: false,
      phantomjs: false,
      chromeDevTools: false,
      additionalTools: false,
      behavioralAnalysis: false,
      overallAutomation: false,
    };
    this.isInitialized = false;
    console.log(`[SDK] ${this.moduleName}: Automation detection destroyed`);
  }
}
