# Private Browser Module

## 🔬 The Research and "Why" Behind Private Browser Detection

The core idea behind detecting private browsing mode is to identify subtle differences in how browsers behave when operating in a privacy-focused state. While private modes are designed to prevent local data storage, they often do so by enforcing unique restrictions or behaviors that are not present in a normal browsing session. Detecting these anomalies is a key signal for anti-fraud systems.

## 🕵️ Private Browsing as a Signal

The detection of private browsing mode is not about violating a user's privacy but rather about understanding the context of their session. This information, when combined with other data points, can be a powerful tool for fraud detection.

## 🚩 Anti-Fraud and Bot Detection

- **Ephemerality**: Private browsing sessions are designed to be ephemeral. This means that a user's local storage, history, and cache are cleared after the session. From a security perspective, this is similar to a user who consistently clears their browser data. A high rate of "new" users from the same device (as detected by other fingerprinting modules) could be a signal of this behavior.

- **Bot Behavior**: Automated scripts and bots often operate in private or headless modes. The ability to detect this state can help distinguish between a real human user and an automated script.

- **Suspicious Activity**: Some fraudulent activities, such as card testing or account hijacking, are performed in private browsing mode to prevent a digital trail from being left behind. Detecting this mode on sensitive pages can be a red flag.

## 🎛️ Implementation Strategy

The module's implementation is based on a series of non-intrusive tests that check for the tell-tale signs of private browsing mode. Since different browsers implement private mode in different ways, a robust solution must use multiple detection methods.

- **localStorage Write Test**: A common method is to attempt to write to `localStorage` and `sessionStorage`. In some older browsers in private mode, this operation would fail, or the data would not persist.

- **Quota Limitation**: Some browsers, like Safari, may set a very low storage quota for `localStorage` in private mode. By attempting to write a large amount of data and checking for a `QuotaExceededError`, the module can detect this behavior.

- **IndexedDB Test**: The IndexedDB API is another reliable target. By attempting to open and interact with an IndexedDB database and checking for failures, the module can detect private browsing mode in some browsers.

The module combines these checks to provide a single, consistent signal.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The private-browser module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface PrivateBrowserBackendEvent {
  eventType: ""detection.private-browser" | "private-browser.error"";
  payload: PrivateBrowserData | PrivateBrowserError;
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
    private-browser: PrivateBrowserBackendEvent[]; // Array of private-browser events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for private-browser events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "detection.private-browser", // or other private-browser event types
  "payload": {
    /* private-browser specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### PrivateBrowser Event Example
```json
{
  "eventType": "detection.private-browser",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects private-browser data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming private-browser events against these requirements:

- ✅ `eventType` must be valid private-browser event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface PrivateBrowserEvent {
  eventId: string;
  eventType: "isPrivateBrowser" | "privateBrowser.error";
  moduleName: "isPrivateBrowser";
  timestamp: string;
  payload: PrivateBrowserData | PrivateBrowserError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`isPrivateBrowser`)

```typescript
interface PrivateBrowserData {
  isPrivateBrowser: boolean;
  detectionMethod: number; // A number indicating which test succeeded
  timestamp: number;
}
```

#### ❌ Error Response (`privateBrowser.error`)

```typescript
interface PrivateBrowserError {
  error: string;
  errorCode: "DETECTION_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```

## How isPrivateBrowser Works

The `isPrivateBrowser` functionality in the obfuscated JavaScript file implements private browsing detection using multiple detection methods. Here's how it works:

### Detection Methods Used:

#### File System API Check (Method 1)

- Uses `webkitRequestFileSystem` to attempt creating a file system
- In private mode, this throws a `DOMException` with code 1 or 10
- If the exception is caught, it indicates private browsing mode

#### localStorage Quota Check (Method 2)

- Attempts to write to `localStorage` and then remove the item
- In private mode (especially Safari), this throws a `QuotaExceededError`
- This is particularly effective for Safari's private browsing mode

#### IndexedDB Check (Method 3)

- Attempts to open an IndexedDB database named "test-db"
- In private mode, IndexedDB operations are restricted and will fail
- If the database operation fails, it indicates private browsing mode
