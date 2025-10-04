# The Research and "Why" Behind Advanced WebGL Fingerprinting

**A basic WebGL fingerprint might just grab the "renderer" string. An advanced, best-practice implementation, however, goes much deeper to create a high-entropy, difficult-to-spoof signature. Here's the reasoning:**

## 🔍 Layered Parameter Collection

We collect data in layers, from easily accessible strings to obscure hardware limits.

### 📋 Basic Info

- **VENDOR**, **RENDERER**, and **VERSION** strings
- These are foundational but can sometimes be masked or spoofed by privacy tools

### 🎭 Unmasked Info

- We specifically request the `WEBGL_debug_renderer_info` extension
- When available, it provides the true, unmasked vendor and renderer strings, bypassing basic spoofing attempts
- **This is a very strong signal**

### ⚙️ Hardware Limits

- We query dozens of specific `gl.getParameter()` values, such as:
  - `MAX_TEXTURE_SIZE`
  - `MAX_VIEWPORT_DIMS`
  - `MAX_VERTEX_UNIFORM_VECTORS`
- These numbers directly reflect the capabilities of the physical GPU
- It's very difficult for a fraudster to create a consistent, fake set of all these parameters that matches a real device

## 🎨 The Render Test (The "Active" Fingerprint)

### 💡 The Concept

Instead of just asking the GPU what it can do, we command it to actually do something and then we analyze the result. We render a simple, precisely defined 3D scene (like a single colored triangle) to an off-screen canvas.

### 💪 Why It's Powerful

The final image is a product of the entire graphics stack:

- GPU hardware
- Driver version
- Operating system's graphics libraries
- Browser's implementation of WebGL

All contribute to the final pixel colors. Subtle differences in:

- Anti-aliasing algorithms
- Floating-point math precision
- Color processing

Create a **unique visual signature**.

### 🔒 The Hash

By converting this rendered image to a data URL and hashing it, we create a `renderHash`. This hash is:

- ✅ **Extremely stable** for a specific device
- ✅ **Varies significantly** between devices, even those that report the same renderer string
- ✅ **A robust and reliable signal**

# The Technical Implementation and Data Indicators

## 📊 Backend Data Contract

This section defines the exact data structures that each module emits, enabling backend systems to properly handle and store the incoming fingerprint data.

### 🏗️ Common Event Structure

All modules emit events through the EventManager with this consistent structure:

```typescript
interface BaseEvent {
  eventId: string; // Unique identifier: "3e063c84-96d1-4681-a286-33c22e3993ce"
  eventType: string; // Event type based on module and action
  moduleName: string; // Module identifier: "WebGL", "mouse", "screen", etc.
  timestamp: string; // ISO timestamp: "2025-09-03T05:07:45.832Z"
  payload: ModuleSpecificData; // Module-specific data structure
}
```

---

## 🎮 WebGL Fingerprint Module

### Event Types:

- `fingerprint.webgl` - Successful WebGL fingerprint collection
- `fingerprint.webgl.error` - WebGL fingerprinting failed
- `webgl` - WebGL not supported

### Data Structure:

#### Success Response (`fingerprint.webgl`):

```typescript
interface WebGLFingerprint {
  supported: true;
  renderHash: string; // "data:image/png;base64,iVBORw0KGgoAAAANSUhEUGAA..."
  paramsHash: string; // SHA-256 hash: "a585470439166c4f4a9b000a08388e211d724e12b2795c2633..."
  parameters: {
    // Basic WebGL Info
    vendor: string; // "WebKit WebGL"
    renderer: string; // "WebKit WebGL"
    version: string; // "WebGL 1.0 (OpenGL ES 2.0 Chromium)"
    shading_language_version: string; // "WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)"

    // Unmasked Info (if available)
    unmaskedVendor?: string; // "Google Inc. (Apple)"
    unmaskedRenderer?: string; // "ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Pro, Unspecified Version)"

    // Hardware Limits
    max_texture_size: number; // 16384
    max_viewport_dims: [number, number]; // [16384, 16384]
    max_vertex_attribs: number; // 16
    max_vertex_uniform_vectors: number; // 1024
    max_varying_vectors: number; // 30
    max_combined_texture_image_units: number; // 32
    max_vertex_texture_image_units: number; // 16
    max_texture_image_units: number; // 16
    max_renderbuffer_size: number; // 16384

    // Extensions
    supportedExtensions: string[]; // ["ANGLE_instanced_arrays", "EXT_blend_minmax", ...]
  };
}
```

#### Error Response (`fingerprint.webgl.error`):

```typescript
interface WebGLError {
  error: string; // "An unknown error occurred."
}
```

#### Not Supported (`webgl`):

```typescript
interface WebGLNotSupported {
  supported: false;
  error: string; // "WebGL not supported or enabled."
}
```


---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The webGL module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface WebGLBackendEvent {
  eventType: ""fingerprint.webGL" | "webGL.error"";
  payload: WebGLFingerprint | WebGLError;
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
    webGL: WebGLBackendEvent[]; // Array of webGL events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for webGL events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "fingerprint.webGL", // or other webGL event types
  "payload": {
    /* webGL specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### WebGL Event Example
```json
{
  "eventType": "fingerprint.webGL",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects webGL data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming webGL events against these requirements:

- ✅ `eventType` must be valid webGL event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema
