# Browser Type Module

## 🔬 The Research and "Why" Behind Browser Fingerprinting

The core idea behind the Browser Type Module is to identify the user's browser, its rendering engine, and its specific capabilities. This information is crucial for building a unique device fingerprint and detecting anomalies that may indicate an automated bot or a spoofed environment.

## 🌐 Browser Characteristics as a Signal

Every browser, from major players like Chrome and Firefox to more niche ones, has a unique digital footprint. This module collects and analyzes these characteristics to create a strong signal.

## 🕵️ Anti-Fraud and Bot Detection

- **User Agent Anomalies**: The `userAgent` string is a primary source of information, but it can be easily spoofed. The real value comes from cross-referencing it with other, harder-to-forge data points.

- **Client Hints**: Modern browsers provide "Client Hints" which offer a more structured way to get information about the device, browser, and network. Inconsistencies between the `userAgent` and Client Hints are a very strong signal of spoofing.

- **Feature Support**: Bots and headless browsers often have incomplete or different support for various web features (e.g., specific JavaScript APIs, CSS properties). By checking for the presence and behavior of these features, the module can differentiate between a real browser and a simulated one.

## 🤖 How Bots Differ

- **Spoofed User Agents**: A bot might present a `userAgent` of a popular browser (e.g., Chrome) while its underlying feature support or hardware hints reveal it's actually a headless environment like Puppeteer.

- **Inconsistent Data**: A fraudster trying to spoof a desktop browser might fail to provide the correct screen dimensions, graphics card information, or memory details that are consistent with a real desktop environment.

## 🎛️ Implementation Strategy

The module's implementation is based on a multi-pronged approach to ensure a reliable and robust fingerprint.

- **User Agent Analysis**: The module first parses the traditional `userAgent` string to get a basic profile of the browser.

- **Client Hints**: It then uses the `navigator.userAgentData` API to collect a set of detailed, low-entropy browser and device hints.

- **Feature Detection**: The module performs checks for the presence of specific, less-common JavaScript APIs, HTML5 features, and CSS properties.

- **Data Consolidation**: The collected data from all these sources is combined and then dispatched as a single event.

This layered approach makes it very difficult for an attacker to spoof the entire fingerprint, as they would need to ensure consistency across all these different data points.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The browser-type module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface BrowserTypeBackendEvent {
  eventType: ""fingerprint.browser-type" | "browser-type.error"";
  payload: BrowserTypeData | BrowserTypeError;
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
    browser-type: BrowserTypeBackendEvent[]; // Array of browser-type events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for browser-type events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "fingerprint.browser-type", // or other browser-type event types
  "payload": {
    /* browser-type specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### BrowserType Event Example
```json
{
  "eventType": "fingerprint.browser-type",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects browser-type data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming browser-type events against these requirements:

- ✅ `eventType` must be valid browser-type event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface BrowserTypeEvent {
  eventId: string;
  eventType: "browserType" | "browserType.error";
  moduleName: "browserType";
  timestamp: string;
  payload: BrowserData | BrowserError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`browserType`)

```typescript
interface BrowserData {
  userAgent: string;
  browser: {
    name: string;
    version: string;
    majorVersion: string;
  };
  os: {
    name: string;
    version: string;
  };
  deviceType: "DESKTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
  screen: {
    width: number;
    height: number;
  };
  clientHints: {
    brands: Array<{ brand: string; version: string }>;
    mobile: boolean;
    platform: string;
    architecture: string;
    model: string;
    fullVersionList: string;
    bitness: string;
    platformVersion: string;
    uaFullVersion: string;
    wow64: boolean;
  };
}
```

#### ❌ Error Response (`browserType.error`)

```typescript
interface BrowserError {
  error: string;
  errorCode: "CLIENT_HINTS_NOT_SUPPORTED" | "UNKNOWN_BROWSER_TYPE";
  details: {
    message: string;
  };
}
```
