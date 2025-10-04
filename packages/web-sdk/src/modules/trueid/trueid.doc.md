# TrueId Canvas Fingerprinting Module

## 🔬 Research and "Why" Behind Canvas Fingerprinting

**Canvas fingerprinting leverages the HTML5 Canvas API to create a unique device signature by analyzing how different systems render identical graphics operations. This technique exploits subtle differences in graphics rendering that occur at the hardware, driver, and software levels.**

## 🎨 The Science Behind Canvas Fingerprinting

### 🖼️ Rendering Stack Variations

The final rendered image is influenced by multiple layers:

- **GPU Hardware**: Different manufacturers (NVIDIA, AMD, Intel) have unique rendering characteristics
- **Graphics Drivers**: Driver versions affect anti-aliasing, color processing, and pixel calculations
- **Operating System**: Windows, macOS, and Linux handle graphics differently
- **Browser Engine**: Chrome, Firefox, Safari have distinct rendering implementations

### 🔬 Pixel-Level Differences

Even identical graphics operations produce unique results:

- **Anti-aliasing Algorithms**: Edge smoothing varies between systems
- **Subpixel Rendering**: Text and line rendering differs across displays
- **Color Space Handling**: Different color profile interpretations
- **Floating-Point Precision**: Mathematical calculations introduce tiny variations

## 💡 Advanced Fingerprinting Techniques

### 🎭 Multi-Layer Canvas Analysis

Our implementation uses sophisticated rendering tests:

- **Text Rendering**: Font rasterization varies significantly
- **Complex Shapes**: Geometric rendering reveals GPU characteristics
- **Color Gradients**: Smooth transitions expose color handling differences
- **Transparency Effects**: Alpha blending algorithms differ

### 🔐 Anti-Spoofing Measures

- **Multiple Test Images**: Different rendering operations for comparison
- **Timestamp Integration**: Time-based elements prevent static spoofing
- **Dynamic Elements**: Randomized components that change per session
- **Consistency Verification**: Cross-validation of rendering patterns

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface TrueIdEvent {
  eventId: string; // Unique identifier
  eventType: "trueId" | "fingerprint.canvas.error";
  moduleName: "trueId";
  timestamp: string; // ISO timestamp
  payload: TrueIdData | CanvasError;
}
```

---

## 🎨 Data Structures

### ✅ Successful Generation (`trueId`)

```typescript
interface TrueIdFingerprint {
  // 🆔 Primary Identifiers
  trueId: string; // Short derived ID: "7927c99f-b986-4658-b0e5-5a672ec04776"
  fullHash: string; // Complete SHA-256 hash of all canvas data

  // 🖼️ Canvas Rendering Data
  canvas: {
    primaryImage: {
      dataUrl: string; // Base64 encoded PNG
      hash: string; // SHA-256 of image data
      dimensions: [number, number]; // [width, height]
      renderTime: number; // Milliseconds to render
    };

    textImage: {
      dataUrl: string; // Text rendering test
      hash: string;
      fontMetrics: {
        ascent: number;
        descent: number;
        width: number;
        characterSpacing: number[];
      };
    };

    geometryImage: {
      dataUrl: string; // Complex shapes test
      hash: string;
      shapeCount: number;
      pathComplexity: number;
    };

    gradientImage: {
      dataUrl: string; // Color gradient test
      hash: string;
      colorStops: number;
      smoothnessScore: number;
    };
  };

  // 🔍 Rendering Analysis
  analysis: {
    // 🎨 Rendering Characteristics
    antiAliasing: {
      detected: boolean;
      algorithm: string; // "subpixel", "grayscale", "none"
      quality: number; // 0-1 smoothness score
    };

    colorProfile: {
      gamut: string; // "srgb", "display-p3", "rec2020"
      bitDepth: number; // 8, 10, 12, 16
      alphaSupport: boolean;
    };

    fontRendering: {
      hinting: string; // "none", "slight", "medium", "full"
      subpixelPositioning: boolean;
      kerning: boolean;
      ligatures: boolean;
    };

    // 🖥️ Hardware Indicators
    hardware: {
      gpuAcceleration: boolean;
      hardwareDecoding: boolean;
      memoryConstraints: boolean;
      renderingBackend: string; // "software", "opengl", "vulkan", "metal"
    };

    // 📊 Performance Metrics
    performance: {
      totalRenderTime: number; // Total time for all tests
      pixelsPerSecond: number; // Rendering throughput
      memoryUsage: number; // Estimated canvas memory
      compositeOperations: number; // Blend mode tests passed
    };
  };

  // 🔐 Security Measures
  validation: {
    consistencyCheck: boolean; // Multiple renders match
    timeBasedHash: string; // Includes timestamp element
    randomSeed: string; // Session-specific random component
    spoofingIndicators: {
      staticResponse: boolean; // Always same result
      perfectPixels: boolean; // Too precise to be real
      missingVariation: boolean; // No natural rendering differences
      suspiciousPerformance: boolean; // Unusually fast/slow
    };
  };

  // 🌍 Environment Context
  environment: {
    canvasSupport: string; // "full", "limited", "webgl-only"
    maxCanvasSize: [number, number]; // Browser limits
    availableFormats: string[]; // "png", "jpeg", "webp"
    fontAvailability: {
      systemFonts: string[]; // Detected system fonts
      webFonts: string[]; // Loaded web fonts
      fallbackUsed: boolean; // Font fallback occurred
    };
  };

  // 📈 Uniqueness Metrics
  uniqueness: {
    globalRarity: number; // 0-1 how rare this fingerprint is
    componentScores: {
      textRendering: number; // Uniqueness of text rendering
      geometryRendering: number; // Uniqueness of shape rendering
      colorHandling: number; // Uniqueness of color processing
      performance: number; // Uniqueness of performance metrics
    };
    entropyBits: number; // Estimated entropy in bits
    collisionProbability: number; // Estimated collision chance
  };
}
```

### ❌ Error Response (`fingerprint.canvas.error`)

```typescript
interface CanvasError {
  error: string; // "Canvas fingerprinting failed."
  errorCode: string; // "CANVAS_BLOCKED" | "RENDERING_FAILED" | "TIMEOUT"
  details: {
    stage: string; // Which stage failed
    canvasSupport: boolean; // Basic canvas availability
    securityRestrictions: string[]; // Browser/extension blocks
    fallbackAttempted: boolean; // Tried alternative methods
  };
  partialData?: {
    basicCanvas: boolean; // Simple canvas works
    textRendering: boolean; // Text rendering works
    imageData: boolean; // Pixel data accessible
  };
}
```

---

## 🧮 Advanced Canvas Techniques

### 🎨 Multi-Test Rendering Strategy

#### 🔤 Text Rendering Test

```typescript
interface TextRenderingTest {
  testString: string; // "TrueId Fingerprint Test 123!@#"
  fonts: string[]; // Multiple font families tested
  sizes: number[]; // Different font sizes
  styles: string[]; // "normal", "bold", "italic"
  effects: string[]; // "shadow", "outline", "gradient"

  // Measurements
  characterWidths: number[]; // Individual character widths
  lineHeight: number; // Vertical spacing
  baseline: number; // Text baseline position
  kerningPairs: number[]; // Character pair spacing
}
```

#### 🔺 Geometric Rendering Test

```typescript
interface GeometryRenderingTest {
  shapes: {
    circles: number; // Perfect circles
    ellipses: number; // Stretched circles
    polygons: number; // Multi-sided shapes
    curves: number; // Bezier curves
    lines: number; // Various line styles
  };

  transforms: {
    rotation: number[]; // Rotation angles tested
    scaling: number[]; // Scale factors
    skewing: number[]; // Skew transformations
    translation: [number, number][]; // Position offsets
  };

  strokeStyles: {
    widths: number[]; // Line thickness variations
    caps: string[]; // "butt", "round", "square"
    joins: string[]; // "miter", "round", "bevel"
    dashPatterns: number[][]; // Dashed line patterns
  };
}
```

#### 🌈 Color and Gradient Test

```typescript
interface ColorRenderingTest {
  gradients: {
    linear: number; // Linear gradient count
    radial: number; // Radial gradient count
    conic: number; // Conic gradient count
    complex: number; // Multi-stop gradients
  };

  colorSpaces: {
    rgb: boolean; // RGB color space
    hsl: boolean; // HSL color space
    lab: boolean; // LAB color space
    p3: boolean; // Display P3 wide gamut
  };

  blendModes: string[]; // Composite operations tested
  transparency: number[]; // Alpha levels tested
  shadows: {
    blur: number[]; // Shadow blur values
    offset: [number, number][]; // Shadow positions
    colors: string[]; // Shadow colors
  };
}
```

---

## 🔐 Anti-Fingerprinting Detection

### 🚨 Privacy Tool Detection

```typescript
interface AntiTrackingIndicators {
  // Browser-based protection
  firefoxResistance: boolean; // Firefox fingerprint resistance
  braveShields: boolean; // Brave privacy shields
  safariITP: boolean; // Safari Intelligent Tracking Prevention

  // Extension-based protection
  canvasBlocker: boolean; // Canvas Blocker extension
  privacyBadger: boolean; // Privacy Badger
  uBlockOrigin: boolean; // uBlock Origin canvas blocking

  // Spoofing indicators
  staticFingerprint: boolean; // Same result every time
  commonSpoofValues: boolean; // Known fake values
  impossibleCombination: boolean; // Contradictory properties
  timingAnomalies: boolean; // Suspicious render times
}
```

### 🛡️ Countermeasures

- **Multiple Canvas Tests**: Different rendering operations
- **Timing Analysis**: Render time patterns
- **Consistency Checks**: Cross-validation between tests
- **Dynamic Elements**: Change test parameters per session
- **Hardware Logic**: Verify realistic hardware combinations

---

## 📈 Privacy and Performance

### 🔒 Privacy Considerations

- **No Personal Data**: Only technical rendering characteristics
- **Anonymous Hashing**: Raw pixel data not stored
- **Temporary Canvas**: Created and destroyed per test
- **No Tracking**: Fingerprint used for detection only

### ⚡ Performance Optimization

```typescript
interface PerformanceConfig {
  canvasSize: [number, number]; // Default: [300, 150]
  testTimeout: number; // Default: 5000ms
  maxTests: number; // Default: 4 types
  enableWebGL: boolean; // Default: false (separate module)
  cacheResults: boolean; // Default: true for session
}
```

### 📊 Success Metrics

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The trueid module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface TrueIdBackendEvent {
  eventType: ""fingerprint.trueid" | "trueid.error"";
  payload: TrueIdData | TrueIdError;
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
    trueid: TrueIdBackendEvent[]; // Array of trueid events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for trueid events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "fingerprint.trueid", // or other trueid event types
  "payload": {
    /* trueid specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### TrueId Event Example
```json
{
  "eventType": "fingerprint.trueid",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects trueid data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming trueid events against these requirements:

- ✅ `eventType` must be valid trueid event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


- **Render Success Rate**: >98% in modern browsers
- **Uniqueness Rate**: >99.5% device discrimination
- **Stability**: Same device produces identical hash
- **Performance**: <100ms total execution time

---

## 🎯 Integration and Usage

### 🔧 Configuration Options

```typescript
interface TrueIdConfig {
  enableTextTest: boolean; // Default: true
  enableGeometryTest: boolean; // Default: true
  enableGradientTest: boolean; // Default: true
  enableTimingAnalysis: boolean; // Default: true

  // Privacy settings
  respectDoNotTrack: boolean; // Default: true
  limitedMode: boolean; // Reduced fingerprinting
  hashOnly: boolean; // Don't store raw canvas data

  // Performance settings
  timeoutMs: number; // Default: 5000
  maxCanvasSize: number; // Default: 300x150
  enableCaching: boolean; // Default: true
}
```

### 🔍 Quality Assurance

```typescript
interface QualityMetrics {
  renderConsistency: number; // 0-1 same device repeatability
  crossBrowserStability: number; // 0-1 stability across browsers
  hardwareDiscrimination: number; // 0-1 different device detection
  spoofingResistance: number; // 0-1 anti-spoofing effectiveness
}
```
