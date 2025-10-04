# Adblock Detection Module

## 🔬 The Research and "Why" Behind Adblock Detection

The core idea is to detect if a user has an ad-blocking extension or a privacy-focused browser setting that blocks or hides content based on its class names or IDs. The presence of these tools is a valuable signal that can be correlated with other data points to form a clearer picture of the user's intent and environment.

## 🚫 Ad Blocking as a Behavioral Signal

Ad blocking behavior is not inherently malicious, but it provides a critical data point for anti-fraud systems.

## 🤖 Bots/Fraudsters

- **Evasion Tactics**: Bots and automated scripts often use ad blockers to hide tracking scripts, including those designed to detect them.

- **Fingerprinting Interference**: Ad blockers can block third-party resources or alter the DOM, potentially interfering with other fingerprinting modules and causing inconsistent results.

- **Headless Environments**: Some headless browser configurations used by bots come pre-configured with ad blocking enabled by default.

## 👤 Legitimate Users

- **Privacy Conscious**: Users who intentionally install ad blockers are often focused on their privacy and security.

- **Performance Focused**: Some users install these extensions to improve page load times and reduce data usage.

- **Signal Correlation**: For a human user, the `hasAdblocker: true` signal will typically correlate with other human-like signals from modules like mouse behavior and device orientation.

## 🎛️ Advanced Implementation Strategy

The most reliable way to detect ad blockers is not to try and load an actual ad, but to programmatically simulate an ad element and see if it is blocked or hidden by the browser.

### ✅ Advanced Method (Best Practice)

The module creates a simple DOM element with a set of class names and styles commonly targeted by ad blockers. It then immediately measures the element's properties to see if it has been blocked or hidden.

- **Element Creation**: A hidden `<div>` element is created with a class name like `ad-banner` or `ad-container`, which are on the block lists of most ad blockers.

- **Property Inspection**: The module checks if the element's `offsetHeight` or `offsetWidth` is 0, or if its `display` property in the computed style is `none`.

- **Conclusion**: If the element is hidden or has zero dimensions, the module reports `hasAdblocker: true`.

- **Immediate Cleanup**: The element is immediately removed from the DOM to ensure it does not affect the page's layout or user experience.

## 🔇 Silent and Safe

- **No Network Requests**: This method does not make any external network requests, ensuring it remains silent and fast.

- **Zero Performance Impact**: The operation is synchronous and completes in microseconds, with no noticeable performance overhead.

- **Privacy-Safe**: No personal information is collected, only a boolean signal of a browser's state.

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface AdblockEvent {
  eventId: string; // Unique identifier
  eventType: "adblock" | "adblock.error";
  moduleName: "adblock";
  timestamp: string; // ISO timestamp
  payload: AdblockData | AdblockError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`adblock`)

```typescript
interface AdblockData {
  hasAdblocker: boolean; // True if a blocker was detected
  detectionMethod: string; // e.g., "dom-manipulation-check"
  timestamp: number; // The timestamp of the detection
  checkedAttributes: string[]; // e.g., ["offsetHeight", "computedStyle"]
}
```

#### ❌ Error Response (`adblock.error`)

```typescript
interface AdblockError {
  error: string; // "Adblock detection failed."
  errorCode: "DOM_ACCESS_DENIED" | "INJECTION_BLOCKED" | "UNEXPECTED_ERROR";
  details: {
    browserName: string; // e.g., "Firefox"
    privacyMode: boolean; // Incognito mode detected
    domManipulationBlocked: boolean; // Whether element creation was blocked
  };
}
```

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The adblock module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface AdblockBackendEvent {
  eventType: "adblock" | "adblock.error";
  payload: AdblockData | AdblockError;
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
    adblock: AdblockBackendEvent[]; // Array of adblock events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for adblock events:

#### Database Schema (events table)

```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx",
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "adblock", // or "adblock.error"
  "payload": {
    "hasAdblocker": boolean,
    "detectionMethod": string,
    "timestamp": number,
    "checkedAttributes": string[]
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Successful Detection Event

```json
{
  "eventType": "adblock",
  "payload": {
    "hasAdblocker": true,
    "detectionMethod": "dom-manipulation-and-resource-check",
    "timestamp": 1642248000000,
    "checkedAttributes": ["offsetHeight", "computedStyle", "resourceLoading"]
  },
  "timestamp": 1642248000000
}
```

#### Error Event

```json
{
  "eventType": "adblock.error",
  "payload": {
    "error": "WebRTC API not supported",
    "errorCode": "UNEXPECTED_ERROR",
    "details": {
      "browserName": "Mozilla/5.0...",
      "privacyMode": false,
      "domManipulationBlocked": false
    }
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module detects adblock status during initialization
2. **Event Creation**: Creates event with proper structure and timestamp
3. **Batching**: Event added to current batch with other module events
4. **Transmission**: Batch sent to backend via `POST /v1/event`
5. **Storage**: Backend stores individual events in database
6. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming adblock events against these requirements:

- ✅ `eventType` must be "adblock" or "adblock.error"
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ `hasAdblocker` must be boolean (for success events)
- ✅ `error` must be string (for error events)
- ✅ `detectionMethod` must be string (for success events)
