# Browser and Plugins Module

## 🔬 The Research and "Why" Behind Browser Fingerprinting

**The core idea is to collect the browser's self-reported identity and capabilities directly from the navigator object. This provides a foundational layer of context that, while easily spoofed on its own, becomes incredibly powerful when used to detect inconsistencies with other, more robust fingerprints.**

## 🧩 Browser Property Variations

The navigator object contains a wealth of information that varies based on the browser, its version, the underlying OS, and user settings.

### 🆔 Identity and Vendor

- **User-Agent**: The most well-known but least reliable identifier. It's a string that the browser sends to identify itself, but it can be trivially changed by users or extensions. Its primary value is for legacy checks and as a baseline for spoofing detection.
- **Vendor**: Often reveals the browser engine's origin (e.g., "Google Inc." for Chrome, "Apple Computer, Inc." for Safari)
- **Platform**: A strong indicator of the underlying operating system (e.g., "Win32", "MacIntel", "Linux armv8l"). A mismatch between platform and the User-Agent is a massive red flag.

### ⚙️ Hardware and Performance

- **hardwareConcurrency**: Reports the number of logical CPU cores available. This helps differentiate between low-end mobile devices and high-performance desktops
- **deviceMemory**: An approximate value for the device's RAM in gigabytes (e.g., 8). Another strong signal for classifying device tiers

### 🌍 Localization and Plugins

- **Languages**: The `navigator.languages` array shows the user's preferred languages in order, a strong signal for contextual and anti-fraud analysis
- **Plugins**: The list of installed browser plugins (`navigator.plugins`) was historically a very high-entropy signal. While less common in modern browsers (which favor extensions), the presence of legacy plugins like PDF viewers or Java applets can still be a unique identifier

## 🛡️ The Power of Inconsistency Detection

The true value of this module is not in trusting the data it collects, but in verifying it.

### 🚨 Spoofing Detection Examples

- **User-Agent vs. Platform**: A User-Agent claiming to be an iPhone but a platform of "Win32". **Verdict: High-Risk Spoofing**
- **User-Agent vs. WebGL**: A User-Agent claiming to be Chrome on Windows but a WebGL renderer string of "Apple GPU". **Verdict: High-Risk Spoofing**
- **User-Agent vs. Fonts**: A User-Agent claiming to be Linux but a font list containing Windows-exclusive fonts like "Calibri". **Verdict: High-Risk Spoofing**

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface BrowserEvent {
  eventId: string; // Unique identifier
  eventType: "fingerprint.browser";
  moduleName: "BrowserAndPluginsModule";
  timestamp: string; // ISO timestamp
  payload: BrowserFingerprint;
}
```

---

## 🖥️ Data Structures

### ✅ Successful Generation (`fingerprint.browser`)

```typescript
interface BrowserFingerprint {
  fingerprint: string; // SHA-256 hash of key properties

  // 🌐 Browser Identity
  identity: {
    userAgent: string; // Full user agent string
    vendor: string; // Browser vendor
    platform: string; // Operating system platform
    language: string; // Primary language
    languages: string[]; // Preferred languages array
    product: string; // Product name (usually "Gecko")
    productSub: string; // Product sub-version
    appName: string; // Application name
    appVersion: string; // Application version
    appCodeName: string; // Application code name

    // 🔍 Advanced Browser Properties
    oscpu?: string; // OS/CPU information
    buildID?: string; // Browser build identifier
    userAgentData?: {
      brands: Array<{ brand: string; version: string }>;
      mobile: boolean;
      platform: string;
    };
  };

  // 🔌 Plugins and Extensions
  plugins: {
    count: number; // Total plugin count
    names: string[]; // List of plugin names
    mimeTypes: string[]; // Supported MIME types
    enabled: boolean; // Plugins enabled/available

    // 🔍 Plugin Analysis
    categories: {
      pdf: boolean; // PDF viewer plugins
      flash: boolean; // Flash Player (legacy)
      java: boolean; // Java applets
      silverlight: boolean; // Microsoft Silverlight
      media: string[]; // Media player plugins
      security: string[]; // Security/antivirus plugins
    };
  };

  // ⚙️ Hardware & Performance
  hardware: {
    cpuCores: number; // from hardwareConcurrency
    deviceMemory?: number; // from deviceMemory (GB)
    maxTouchPoints: number; // Touch interface capability

    // 📊 Performance Indicators
    connectionType?: string; // Network connection type
    connectionSpeed?: string; // Effective connection speed

    // 🔋 Device Characteristics
    battery?: {
      level: number; // Battery level (0-1)
      charging: boolean; // Charging status
      chargingTime: number; // Time to charge
      dischargingTime: number; // Time to discharge
    };
  };

  // 🍪 Browser Capabilities
  capabilities: {
    cookieEnabled: boolean; // Cookie support
    javaEnabled: boolean; // Java applet support
    onLine: boolean; // Online status
    pdfViewerEnabled: boolean; // Built-in PDF viewer

    // 🌐 Web API Support
    webApis: {
      geolocation: boolean; // Geolocation API
      webgl: boolean; // WebGL support
      webgl2: boolean; // WebGL 2 support
      webRTC: boolean; // WebRTC support
      webAssembly: boolean; // WebAssembly support
      serviceWorker: boolean; // Service Worker support
      webAudio: boolean; // Web Audio API
      webSpeech: boolean; // Web Speech API
      webXR: boolean; // WebXR support
      bluetooth: boolean; // Web Bluetooth
      usb: boolean; // WebUSB
      nfc: boolean; // Web NFC
    };
  };

  // 🛡️ Privacy and Security
  privacy: {
    doNotTrack: string | null; // "1", "0", or "unspecified"
    globalPrivacyControl?: boolean; // GPC header support

    // 🔒 Security Features
    security: {
      cookieSameSite: boolean; // SameSite cookie support
      referrerPolicy: string; // Default referrer policy
      mixedContent: boolean; // Mixed content handling
      csp: boolean; // Content Security Policy support
    };

    // 🚫 Privacy Indicators
    privacyMode: {
      incognito: boolean; // Private browsing detected
      trackingPrevention: boolean; // Tracking prevention active
      adBlocker: boolean; // Ad blocker detected
      scriptBlocking: boolean; // Script blocking active
    };
  };

  // 🌍 Localization
  localization: {
    timezone: string; // User timezone
    timezoneOffset: number; // UTC offset in minutes
    locale: string; // System locale
    dateFormat: string; // Preferred date format
    numberFormat: string; // Number formatting
    currency: string; // Default currency
  };

  // 📊 Browser Metrics
  metrics: {
    viewportSize: [number, number]; // [width, height]
    screenSize: [number, number]; // Physical screen dimensions
    pixelRatio: number; // Device pixel ratio
    colorDepth: number; // Color bit depth

    // ⏱️ Performance Timing
    timing: {
      navigationStart: number; // Navigation start time
      domLoading: number; // DOM loading start
      domInteractive: number; // DOM interactive
      domComplete: number; // DOM complete
      loadEventEnd: number; // Load event end
    };
  };
}
```

---

## 🔍 Advanced Browser Analysis

### 🕵️ Cross-Validation Techniques

```typescript
interface ConsistencyCheck {
  // Platform consistency
  platformAlignment: {
    userAgentVsPlatform: boolean; // UA matches navigator.platform
    userAgentVsScreen: boolean; // UA matches screen characteristics
    userAgentVsPlugins: boolean; // UA matches expected plugins
  };

  // Hardware consistency
  hardwareAlignment: {
    memoryVsCpuCores: boolean; // Realistic memory/CPU combination
    touchVsMobile: boolean; // Touch support matches mobile UA
    batteryVsMobile: boolean; // Battery API matches mobile device
  };

  // Software consistency
  softwareAlignment: {
    pluginsVsOS: boolean; // Plugins match operating system
    webApisVsBrowser: boolean; // API support matches browser version
    languageVsLocation: boolean; // Language matches geographic indicators
  };
}
```

### 🚨 Anomaly Detection

```typescript
interface BrowserAnomalies {
  // Spoofing indicators
  spoofingSignals: {
    perfectUserAgent: boolean; // Too generic/common UA
    missingProperties: string[]; // Expected properties absent
    contradictoryData: string[]; // Conflicting information
    unusualCombinations: string[]; // Rare property combinations
  };

  // Bot indicators
  automationSignals: {
    webDriverPresent: boolean; // WebDriver automation detected
    headlessBrowser: boolean; // Headless browser indicators
    phantomjsSignature: boolean; // PhantomJS detection
    seleniumArtifacts: boolean; // Selenium automation
  };

  // Privacy tool detection
  privacyTools: {
    torBrowser: boolean; // Tor Browser fingerprint
    braveShields: boolean; // Brave privacy shields
    firefoxPrivacy: boolean; // Firefox privacy features
    vpnDetection: boolean; // VPN/proxy indicators
  };
}
```

---

## 📈 Privacy and Performance

### 🔒 Privacy Considerations

- **Low Uniqueness**: Most of the properties collected here are not unique on their own and are shared by large groups of users. Their power comes from combination and cross-validation
- **Deprecation**: Some properties, like `navigator.plugins`, are being deprecated by browsers to reduce the fingerprinting surface. The module should be designed to handle their absence gracefully
- **Respect Privacy Settings**: Honor Do Not Track and Global Privacy Control signals

### ⚡ Performance Optimization

- **Synchronous Collection**: All data is available immediately from the navigator object, so this module is extremely fast and has no performance overhead
- **Instant Execution**: The `init()` method can be executed synchronously without delays
- **Memory Efficient**: Uses native browser APIs with minimal memory footprint

### 📊 Success Metrics

- **Collection Speed**: <5ms execution time
- **Browser Compatibility**: 99%+ support across modern browsers
- **Data Completeness**: 95%+ property availability
- **Cross-Validation Accuracy**: 98%+ spoofing detection rate

---

## 🎛️ Configuration Options

### 🔧 Collection Settings

```typescript
interface BrowserFingerprintConfig {
  enableBasicInfo: boolean; // Default: true
  enablePluginDetection: boolean; // Default: true
  enableHardwareInfo: boolean; // Default: true
  enableWebApiDetection: boolean; // Default: true
  enablePerformanceMetrics: boolean; // Default: false

  // Privacy controls
  respectDoNotTrack: boolean; // Default: true
  respectGPC: boolean; // Default: true
  anonymizeData: boolean; // Default: false

  // Analysis depth
  enableConsistencyChecks: boolean; // Default: true
  enableAnomalyDetection: boolean; // Default: true
  enablePrivacyToolDetection: boolean; // Default: true
}
```
