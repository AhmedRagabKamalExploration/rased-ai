# Device Fingerprinting Module

## 🔬 The Research and "Why" Behind Advanced Device Fingerprinting

The core idea behind device fingerprinting is to collect a combination of hardware and software characteristics that, when aggregated, form a unique identifier for a device. This identifier is highly stable and difficult for a bot or malicious actor to spoof.

## 💻 Device Properties as a Signal

The data collected by this module provides fundamental details about the user's device and its environment. These data points are critical for several reasons:

## 🕵️ Anti-Fraud and Bot Detection

- **Consistency Checks**: The data from this module can be cross-referenced with other modules, like the BrowserType or Screen modules. For example, a mismatch between the reported userAgent (e.g., "iPhone") and the hardwareConcurrency (e.g., 12 cores, typical of a high-end desktop) can be a strong signal of a spoofed or virtualized environment.

- **Headless Browser Detection**: Headless browsers often report generic or inconsistent values for properties like gpuVendor or deviceMemory, which do not match real-world devices.

- **Hardware Uniqueness**: The combination of gpuVendor, gpuModel, hardwareConcurrency, and deviceMemory is statistically unique to a very high degree, making it a reliable part of a stable device fingerprint.

## 🖼️ GPU Fingerprinting (WebGL)

A key part of this module is the collection of GPU data. Different graphics drivers and hardware report slightly different strings for their vendor and renderer names. This provides a high-entropy data point that is extremely difficult to forge without a real GPU.

## 🎛️ Implementation Strategy

The module uses a multi-faceted approach to collect data from various browser APIs. The data is collected once at initialization to create a snapshot of the device's capabilities.

- **System Information**: The module uses navigator properties (hardwareConcurrency, language, languages, platform, userAgent) to gather basic system and browser details.

- **GPU Information**: It uses a temporary, off-screen canvas element and the WebGL context to read the UNMASKED_VENDOR_WEBGL and UNMASKED_RENDERER_WEBGL strings. This is a standard and effective method for GPU fingerprinting.

- **Memory & Color**: It retrieves properties like deviceMemory and window.matchMedia for colorGamut to get additional hardware details.

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface DeviceEvent {
  eventId: string;
  eventType: "device" | "device.error";
  moduleName: "device";
  timestamp: string;
  payload: DeviceData | DeviceError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`device`)

```typescript
interface DeviceData {
  hardwareConcurrency: number;
  language: string;
  languages: string[];
  platform: string;
  userAgent: string;
  gpuVendor: string;
  gpuModel: string;
  colorGamut: string;
  deviceMemory: number | undefined;
}
```

#### ❌ Error Response (`device.error`)

```typescript
interface DeviceError {
  error: string;
  errorCode: "UNSUPPORTED_API" | "GPU_INFO_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The device module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface DeviceBackendEvent {
  eventType: "device" | "device.error";
  payload: DeviceData | DeviceError;
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
    device: DeviceBackendEvent[]; // Array of device events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for device events:

#### Database Schema (events table)

```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx",
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "device", // or "device.error"
  "payload": {
    "systemInfo": { /* system information */ },
    "gpuInfo": { /* GPU information */ },
    "hardwareInfo": { /* hardware capabilities */ },
    "displayInfo": { /* display properties */ },
    "memoryInfo": { /* memory information */ }
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Device Fingerprint Event

```json
{
  "eventType": "device",
  "payload": {
    "systemInfo": {
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "platform": "Win32",
      "language": "en-US",
      "languages": ["en-US", "en"],
      "cookieEnabled": true,
      "doNotTrack": "1",
      "onLine": true
    },
    "gpuInfo": {
      "vendor": "Google Inc. (Intel)",
      "renderer": "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
      "version": "OpenGL ES 2.0 (ANGLE 2.1.0)",
      "shadingLanguageVersion": "WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)",
      "maxTextureSize": 16384,
      "maxViewportDims": [16384, 16384],
      "aliasedLineWidthRange": [1, 1],
      "aliasedPointSizeRange": [1, 1024],
      "maxVertexAttribs": 16,
      "maxVaryingVectors": 8,
      "maxFragmentUniformVectors": 1024,
      "maxVertexUniformVectors": 1024,
      "maxVertexTextureImageUnits": 16,
      "maxCombinedTextureImageUnits": 32,
      "maxTextureImageUnits": 16,
      "maxRenderbufferSize": 16384,
      "maxCubeMapTextureSize": 16384,
      "maxAnisotropy": 16,
      "maxDrawBuffers": 4,
      "maxColorAttachments": 4,
      "maxSamples": 4
    },
    "hardwareInfo": {
      "hardwareConcurrency": 8,
      "deviceMemory": 16,
      "maxTouchPoints": 0,
      "colorGamut": "srgb",
      "colorDepth": 24,
      "pixelDepth": 24
    },
    "displayInfo": {
      "screenWidth": 1920,
      "screenHeight": 1080,
      "screenColorDepth": 24,
      "screenPixelDepth": 24,
      "availWidth": 1920,
      "availHeight": 1040,
      "devicePixelRatio": 1,
      "orientation": "landscape-primary"
    },
    "memoryInfo": {
      "usedJSHeapSize": 10485760,
      "totalJSHeapSize": 20971520,
      "jsHeapSizeLimit": 4294705152
    }
  },
  "timestamp": 1642248000000
}
```

#### Error Event

```json
{
  "eventType": "device.error",
  "payload": {
    "error": "WebGL context creation failed",
    "errorCode": "GPU_INFO_FAILED",
    "details": {
      "message": "Unable to create WebGL context for GPU fingerprinting"
    }
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects device fingerprint data during initialization
2. **Analysis**: GPU and hardware information analysis performed
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for device identification

### 📊 Backend Event Validation

The backend validates incoming device events against these requirements:

- ✅ `eventType` must be "device" or "device.error"
- ✅ `payload.systemInfo` must contain userAgent, platform, language
- ✅ `payload.gpuInfo` must contain vendor, renderer, version
- ✅ `payload.hardwareInfo` must contain hardwareConcurrency, deviceMemory
- ✅ `payload.displayInfo` must contain screen dimensions and properties
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All numeric values must be valid numbers
- ✅ All string values must be non-empty
