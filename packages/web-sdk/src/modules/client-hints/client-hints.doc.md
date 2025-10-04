# Client Hints Module

## 🔬 The Research and "Why" Behind Client Hints

The core idea behind Client Hints is to provide a more privacy-preserving and structured alternative to the monolithic User-Agent string. For anti-fraud and fingerprinting purposes, Client Hints offer a more reliable and extensible set of data points about the user's device, browser, and network. This data is harder to spoof than the User-Agent string and provides a stronger signal for identifying devices.

## 💡 How Client Hints Work

Client Hints are a collection of HTTP request headers and a JavaScript API (`navigator.userAgentData`) that allow a server to request specific, low-entropy information from a browser. High-entropy information, which is more useful for fingerprinting but more sensitive, requires explicit user consent or a specific API call.

## 🕵️ Anti-Fraud and Bot Detection

- **Low Entropy Hints**: These include basic browser brand, platform (OS), and whether the device is mobile. This data is available by default and is a good starting point for a fingerprint.

- **High Entropy Hints**: To get more detailed information, such as the full OS version, device model, or CPU architecture, the SDK must explicitly request it using the asynchronous `getHighEntropyValues()` method. This data is highly valuable for fingerprinting because it's difficult for an attacker to make all the pieces consistent across a spoofed environment. For example, a bot might try to claim it's a Chrome browser on macOS but might fail to provide a consistent CPU architecture or OS version, a key indicator of spoofing.

- **Network Data**: Client Hints can also expose network-related data like the connection type (4g), round-trip time (rtt), and downlink speed. Anomalies in this data can reveal that a user is behind a high-speed VPN or a server with an unnaturally fast connection, which is common for bots.

## 🧩 Data Consolidation

This module's strength lies in its ability to collect multiple types of hints and consolidate them into a single payload. The combination of data from `navigator.userAgentData` and `navigator.connection` creates a rich profile that is highly effective for anti-fraud analysis.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The client-hints module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface ClientHintsBackendEvent {
  eventType: ""context.client-hints" | "client-hints.error"";
  payload: ClientHintsData | ClientHintsError;
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
    client-hints: ClientHintsBackendEvent[]; // Array of client-hints events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for client-hints events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.client-hints", // or other client-hints event types
  "payload": {
    /* client-hints specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### ClientHints Event Example
```json
{
  "eventType": "context.client-hints",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects client-hints data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming client-hints events against these requirements:

- ✅ `eventType` must be valid client-hints event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface ClientHintsEvent {
  eventId: string;
  eventType: "clientHints" | "clientHints.error";
  moduleName: "clientHints";
  timestamp: string;
  payload: ClientHintsData | ClientHintsError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`clientHints`)

```typescript
interface ClientHintsData {
  cpuArch: string; // The device's CPU architecture
  chOsVersion: string; // The full OS version
  chConnection: string; // The effective connection type
  chBitness: string; // The OS bitness (e.g., "64")
  chOs: string; // The OS name (e.g., "macOS", "Windows")
  chModel: string; // The device model
  chMobile: boolean; // Whether the device is a mobile device
  chRtt: number; // The round-trip time of the connection
  chDownlink: number; // The downlink speed
  chFullVersionList: string; // Detailed version list of the browser brands
  chWow64: number; // Whether the browser is running in WOW64 mode (Windows-specific)
  chMobileNullable: number; // An integer representation of the mobile status
  chSaveData: number; // A flag for data-saver mode
  timestamp: number;
}
```

#### ❌ Error Response (`clientHints.error`)

```typescript
interface ClientHintsError {
  error: string;
  errorCode: "UNSUPPORTED_API" | "COLLECTION_FAILED";
  details: {
    message: string;
  };
}
```
