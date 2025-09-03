# Screen Fingerprinting Module

## 🔬 Research and "Why" Behind Screen Fingerprinting

**Screen fingerprinting captures the unique display characteristics of a user's device, creating a stable identifier that's extremely difficult to spoof while remaining consistent across browser sessions.**

## 🖥️ The Science Behind Screen Fingerprinting

### 📐 Display Uniqueness

- **Resolution Combinations**: Specific width/height pairs are surprisingly unique
- **Color Depth Variations**: Different devices support different color bit depths
- **Pixel Density**: Device pixel ratio reveals high-DPI displays
- **Available Space**: Browser chrome and OS elements create unique viewport dimensions

### 🎯 Why Screen Data Matters

- **Device Classification**: Distinguishes between mobile, tablet, desktop, and TV
- **Hardware Identification**: Different manufacturers have signature display characteristics
- **OS Detection**: Window management differs between operating systems
- **Browser Fingerprinting**: Different browsers report slightly different values

## 📊 Fingerprinting Stability

### ✅ Highly Stable Indicators

- **Physical Resolution**: Rarely changes unless hardware is modified
- **Color Depth**: Hardware-dependent, very stable
- **Device Pixel Ratio**: Consistent for specific device models
- **Screen Orientation Support**: Device capability, not user preference

### ⚠️ Variable Indicators

- **Available Dimensions**: Changes with browser zoom, window size
- **Current Orientation**: Mobile devices rotate
- **Window Positioning**: Desktop users resize windows

## 🔍 Advanced Detection Capabilities

### 🕵️ Multi-Monitor Detection

- **Negative Coordinates**: Detect screens positioned left/above primary
- **Extended Dimensions**: Total desktop space calculation
- **Resolution Mismatches**: Primary vs. secondary screen differences

### 📱 Mobile Device Indicators

- **Orientation Events**: Rotation capability detection
- **Touch Support**: Combined with screen size for device classification
- **Viewport Meta**: How mobile browsers handle responsive design

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface ScreenEvent {
  eventId: string; // Unique identifier
  eventType: "screen" | "fingerprint.screen.error";
  moduleName: "screen";
  timestamp: string; // ISO timestamp
  payload: ScreenData | ScreenError;
}
```

---

## 📱 Data Structures

### ✅ Successful Collection (`screen`)

```typescript
interface ScreenFingerprint {
  // 🖥️ Physical Screen Properties
  screen: {
    width: number; // Physical screen width (e.g., 1728)
    height: number; // Physical screen height (e.g., 1117)
    availWidth: number; // Available screen width (minus taskbar)
    availHeight: number; // Available screen height (minus taskbar)
    colorDepth: number; // Color bit depth (e.g., 24, 30, 32)
    pixelDepth: number; // Pixel bit depth (usually same as colorDepth)
  };

  // 🪟 Browser Window Properties
  window: {
    innerWidth: number; // Viewport width excluding scrollbars
    innerHeight: number; // Viewport height excluding scrollbars
    outerWidth: number; // Browser window width including chrome
    outerHeight: number; // Browser window height including chrome
    screenX: number; // Window position X relative to screen
    screenY: number; // Window position Y relative to screen
  };

  // 📐 Device Characteristics
  device: {
    devicePixelRatio: number; // Pixel density (1, 1.5, 2, 3, etc.)
    orientation?: {
      angle: number; // Rotation angle (0, 90, 180, 270)
      type: string; // "portrait-primary", "landscape-primary", etc.
    };
    touchSupport: boolean; // Touch interface availability
    maxTouchPoints: number; // Multi-touch capability
  };

  // 🔢 Calculated Metrics
  calculated: {
    screenRatio: number; // width/height aspect ratio
    availableRatio: number; // availWidth/availHeight ratio
    windowRatio: number; // innerWidth/innerHeight ratio
    pixelDensityClass: string; // "standard", "retina", "ultra-high"
    screenCategory: string; // "mobile", "tablet", "desktop", "ultrawide"

    // 🖥️ Multi-monitor Indicators
    hasMultipleScreens: boolean; // Detected multiple monitors
    screenPosition: string; // "primary", "secondary", "extended"
    totalDesktopArea: number; // Estimated total screen real estate

    // 📊 Browser Environment
    chromeHeight: number; // outerHeight - innerHeight
    chromeWidth: number; // outerWidth - innerWidth
    scrollbarWidth: number; // Estimated scrollbar thickness
    zoomLevel: number; // Estimated browser zoom level

    // 🎯 Uniqueness Scores
    resolutionUniqueness: number; // Rarity score (0-1)
    configurationHash: string; // SHA-256 of key properties
  };

  // 🌍 Environment Context
  environment: {
    userAgent: string; // Browser identification string
    platform: string; // Operating system
    language: string; // Browser language setting
    timezone: string; // Local timezone

    // 🎨 Color Profile
    colorGamut: string; // "srgb", "p3", "rec2020"
    hdrSupport: boolean; // High dynamic range capability
    contrastRatio: number; // Accessibility contrast preference
  };
}
```

### ❌ Error Response (`fingerprint.screen.error`)

```typescript
interface ScreenError {
  error: string; // "Could not access screen or window properties."
  availableProperties: string[]; // Properties that were accessible
  failedProperties: string[]; // Properties that failed to read
  browserLimitations: string[]; // Known browser-specific restrictions
}
```

---

## 🧮 Advanced Calculations

### 📐 Aspect Ratio Classification

```typescript
function classifyAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  if (ratio < 1.2) return "square";
  if (ratio < 1.5) return "standard";
  if (ratio < 1.8) return "widescreen";
  if (ratio < 2.2) return "ultrawide";
  return "super-ultrawide";
}
```

### 📱 Device Category Detection

```typescript
function detectDeviceCategory(screen: ScreenData): string {
  const { width, height, devicePixelRatio, touchSupport } = screen;
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);

  if (touchSupport && maxDimension < 768) return "mobile";
  if (touchSupport && maxDimension < 1200) return "tablet";
  if (minDimension > 1800) return "desktop-large";
  if (maxDimension > 2560) return "ultrawide";
  return "desktop";
}
```

### 🎯 Uniqueness Scoring

```typescript
function calculateUniquenessScore(resolution: [number, number]): number {
  // Based on statistical analysis of common resolutions
  const commonResolutions = [
    [1920, 1080],
    [1366, 768],
    [1536, 864],
    [1440, 900],
    [1280, 720],
    [1600, 900],
    [2560, 1440],
    [3840, 2160],
  ];

  const isCommon = commonResolutions.some(
    ([w, h]) =>
      Math.abs(w - resolution[0]) < 10 && Math.abs(h - resolution[1]) < 10
  );

  return isCommon ? 0.2 : 0.8; // Higher score for unique resolutions
}
```

---

## 🔍 Fingerprinting Indicators

### 🎯 High-Entropy Signals

- **Exact Resolution**: `1728x1117` is more unique than `1920x1080`
- **Pixel Ratio**: `2.5` is rarer than `1.0` or `2.0`
- **Color Depth**: `30-bit` color is less common than `24-bit`
- **Available Space**: Specific taskbar/dock configurations

### 🔒 Stable Device Identifiers

- **Physical Display**: Hardware-bound characteristics
- **Graphics Capabilities**: GPU-dependent features
- **OS Integration**: Platform-specific behaviors
- **Browser Engine**: Rendering differences

### ⚠️ Anti-Fingerprinting Considerations

- **Firefox Resistance**: Rounded values, limited precision
- **Privacy Browsers**: May return common/fake values
- **Mobile Privacy**: iOS Safari limitations
- **Extension Interference**: Privacy tools may modify values

---

## 📈 Privacy and Compliance

### 🔒 Data Protection

- **No Personal Data**: Only technical specifications collected
- **Anonymous Analysis**: No user identification possible
- **Temporary Storage**: Data not retained long-term
- **Aggregation Focus**: Individual profiles not created

### 🌍 Browser Compatibility

```typescript
interface BrowserSupport {
  chrome: "full"; // All properties available
  firefox: "limited"; // Some properties rounded/blocked
  safari: "partial"; // iOS restrictions on window properties
  edge: "full"; // Same as Chrome (Chromium-based)
  opera: "full"; // Chromium-based support
}
```

### ⚡ Performance Impact

- **Synchronous Collection**: Immediate property access
- **Minimal Processing**: Simple arithmetic calculations
- **Zero Network**: No external requests required
- **Low Memory**: Temporary objects only

---

## 🎛️ Configuration Options

### 📊 Collection Settings

```typescript
interface ScreenTrackingConfig {
  collectExtendedMetrics: boolean; // Default: true
  calculateUniqueness: boolean; // Default: true
  detectMultiMonitor: boolean; // Default: true
  includeEnvironment: boolean; // Default: false (privacy)
  precisionLevel: "standard" | "high"; // Default: "standard"
}
```

### 🔧 Privacy Controls

```typescript
interface PrivacySettings {
  roundValues: boolean; // Default: false
  limitPrecision: number; // Default: 1 (no rounding)
  excludeSensitiveData: boolean; // Default: true
  respectDoNotTrack: boolean; // Default: true
}
```

---

## 📊 Analytics and Detection

### 🔍 Bot Detection Signals

- **Common Bot Resolutions**: `1024x768`, `800x600` (outdated)
- **Perfect Values**: Exact multiples, no fractional pixels
- **Missing Properties**: Headless browsers may lack orientation
- **Impossible Combinations**: Conflicting property values

### 📈 Device Intelligence

- **User Segmentation**: Mobile vs. desktop behavior
- **Accessibility Needs**: Large screens, high contrast
- **Geographic Indicators**: Region-specific device preferences
- **Technology Adoption**: Latest display technologies

### 🎯 Fraud Prevention

- **Device Consistency**: Screen matches other fingerprints
- **Session Stability**: Properties don't change unexpectedly
- **Hardware Logic**: Realistic property combinations
- **Browser Compatibility**: Expected values for user agent
