# Font Fingerprinting Module

## 🔬 The Research and "Why" Behind Font Fingerprinting

**The core idea is that the unique combination of fonts installed on a device serves as a highly effective and stable fingerprint. This collection is a direct reflection of the user's operating system, the software they've installed, and any personal customizations.**

## 📖 Font Stack Variations

A device's font library is influenced by multiple layers, each adding to its uniqueness:

### 🖥️ Operating System Level

- **Default Fonts**: Each OS (Windows 11, macOS Sonoma, Ubuntu, Android 14) ships with a distinct set of default system fonts
- **Version Differences**: Even minor OS updates can add, remove, or modify default fonts
- **Language Packs**: Installing different language packs often installs new, language-specific fonts

### 💾 Software Installation

- **Productivity Suites**: Software like Microsoft Office and Google Workspace installs its own set of proprietary fonts (e.g., Calibri, Cambria)
- **Creative Software**: Adobe Creative Suite is a major source of unique fonts, and its presence is a strong signal
- **Third-Party Applications**: Many other applications install fonts for their user interfaces

### 👤 User Customization

- **Manually Installed Fonts**: Designers, developers, and power users often install custom fonts for their work, creating a highly unique personal font library

## 🔍 Advanced Implementation Strategy

Detecting fonts reliably requires observing the browser's rendering behavior, as direct enumeration is often blocked for privacy reasons.

### 🚫 Simple Method (Unreliable)

- **Basic Approach**: Using `document.fonts` to enumerate available fonts
- **Limitations**: This API is often incomplete or restricted by modern browser privacy features (like in Firefox) and doesn't provide a full picture

### ✅ Advanced Method (Best Practice)

We infer the presence of a font by measuring the dimensions of a test string rendered with that font.

1. **Create a Baseline**: A hidden `<span>` element is created, and a test string (e.g., a pangram) is rendered using a generic fallback font like `monospace`. Its width and height are measured.

2. **Iterate and Test**: The module iterates through a predefined list of fonts. For each font, it applies the style `font-family: "Test Font", monospace`.

3. **Measure and Compare**: The dimensions of the `<span>` are re-measured. If the width or height differs from the baseline, it means the browser successfully rendered the "Test Font" instead of the fallback.

4. **Conclusion**: If the dimensions are different, the font is confirmed to be installed. This method is highly reliable as it directly observes the final rendered output.

---

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The font module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface FontBackendEvent {
  eventType: ""fingerprint.font" | "font.error"";
  payload: FontFingerprint | FontError;
  timestamp: number; // Unix timestamp in milliseconds
}
```

### 📦 Batch Event Structure

Events are sent as part of a batch to the backend API endpoint `POST /v1/event`:

```typescript
interface EventBatch {
  deviceId: string; // Unique device identifier
  batchId: string; // Unique batch identifier
  batchTimestamp: string; // ISO 8601 timestamp
  modules: {
    font: FontBackendEvent[]; // Array of font events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for font events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "fingerprint.font", // or other font event types
  "payload": {
    /* font specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Font Event Example
```json
{
  "eventType": "fingerprint.font",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects font data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming font events against these requirements:

- ✅ `eventType` must be valid font event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface FontEvent {
  eventId: string; // Unique identifier
  eventType: "fingerprint.font" | "fingerprint.font.error";
  moduleName: "FontFingerprintModule";
  timestamp: string; // ISO timestamp
  payload: FontFingerprint | FontError;
}
```

---

## 📝 Data Structures

### ✅ Successful Generation (`fingerprint.font`)

```typescript
interface FontFingerprint {
  supported: true;
  fingerprint: string; // SHA-256 hash of the installed fonts list

  // 📈 Font Analysis
  analysis: {
    installedFonts: string[]; // An array of detected font names
    totalFontsChecked: number; // The total number of fonts in the probe list
    detectionMethod: "dimension-measurement";
    processingTime: number; // Time in ms to perform the check

    // 🔍 Detection Statistics
    systemFonts: string[]; // OS default fonts detected
    officeFonts: string[]; // Microsoft Office fonts detected
    adobeFonts: string[]; // Adobe Creative Suite fonts detected
    googleFonts: string[]; // Google Fonts detected
    customFonts: string[]; // Non-standard fonts detected

    // 📊 Font Categories
    fontCategories: {
      serif: number; // Count of serif fonts
      sansSerif: number; // Count of sans-serif fonts
      monospace: number; // Count of monospace fonts
      display: number; // Count of display fonts
      script: number; // Count of script fonts
    };

    // 🎯 Uniqueness Indicators
    rareFonts: string[]; // Fonts found in <5% of devices
    signatureFonts: string[]; // Fonts indicating specific software
    languageSpecific: string[]; // Non-Latin script fonts
  };

  // 🖥️ System Context
  context: {
    // Baseline dimensions used for comparison
    baselineDimensions: {
      width: number;
      height: number;
    };
    // The generic font family used for the baseline
    fallbackFont: "monospace" | "sans-serif" | "serif";

    // 📏 Measurement Environment
    testString: string; // String used for measurement
    testElement: {
      fontSize: string; // Font size used for testing
      fontWeight: string; // Font weight used
      letterSpacing: string; // Letter spacing applied
    };

    // 🌐 Browser Environment
    fontLoadingAPI: boolean; // document.fonts API availability
    fontFaceObserver: boolean; // FontFaceObserver support
    canvasTextMetrics: boolean; // Canvas text measurement support
  };

  // 🔐 Privacy Indicators
  privacy: {
    privacyMode: boolean; // Privacy browser detected
    fontBlocking: boolean; // Font enumeration blocked
    standardizedFonts: boolean; // Forced standard font set
    fontSubstitution: boolean; // Font substitution detected
  };
}
```

### ❌ Error Response (`fingerprint.font.error`)

```typescript
interface FontError {
  error: string; // e.g., "DOM measurement failed"
  errorCode: "MEASUREMENT_FAILED" | "DOM_ACCESS_DENIED" | "UNEXPECTED_ERROR";
  details: {
    // Information about the environment during the error
    userAgent: string;
    documentReadyState: string;
    domAccess: boolean; // DOM manipulation allowed
    measurementSupport: boolean; // Element measurement possible
  };
  fallbackData?: {
    basicFontSupport: boolean; // Basic font rendering works
    standardFonts: string[]; // Known standard fonts
    browserFontList: string[]; // Fonts from document.fonts if available
  };
}
```

🔐 Anti-Spoofing and Detection
🚨 Spoofing Indicators
Unrealistic Combinations: Detecting a font list that doesn't match the reported OS (e.g., reporting "Calibri" and "Cambria" but having a macOS User-Agent).

Extremely Low or High Font Count: An abnormally low number of fonts might indicate a privacy browser, while an impossibly high number could be a sign of tampering.

Timing Anomalies: If the test completes too quickly, it may indicate a script that is providing a fake list instead of performing the actual DOM measurements.

🛡️ Countermeasures
Curated Font List: Use a diverse list of fonts known to be associated with specific OS versions and software to cross-validate against the navigator.platform and User-Agent.

Cross-Validation: The results from this module should be used in combination with other fingerprints (like WebGL and Screen) to build a consistent picture of the device.

📈 Privacy and Performance
🔒 Privacy Considerations
No File System Access: The module does not and cannot access the user's file system. It only observes the browser's rendering output in a sandboxed environment.

Privacy Browser Behavior: Be aware that privacy-focused browsers (like Brave and Tor Browser) actively combat this technique by standardizing the reported dimensions, which will result in a generic, non-unique fingerprint. This lack of uniqueness is, in itself, a valuable signal.

⚡ Performance Optimization
Asynchronous Execution: The font checking process can take 50-200ms. It is performed asynchronously using requestIdleCallback or a simple setTimeout to ensure it does not block the main UI thread during page load.

DOM Efficiency: The test uses a single, detached DOM element that is reused for all measurements to minimize layout thrashing and performance impact.
