# Referrer URL Module

## 🔬 The Research and "Why" Behind Referrer URL Collection

The core idea behind collecting the referrer URL is to understand the origin of a user's visit. This single data point provides invaluable context about how a user arrived at your site, which is a critical signal for analyzing user behavior, detecting anomalies, and identifying fraudulent activity.

## 🔗 Referrer as a Signal

The referrer URL is a highly reliable and non-intrusive way to gather information about a user's browsing journey.

## 🕵️ Anti-Fraud and Bot Detection

- **Source Consistency**: A user's referrer should be logically consistent with their navigation path. For example, a user arriving at a checkout page from a product page is a normal path. A user arriving directly at a checkout page from a malicious domain is a red flag.

- **Direct Traffic**: A user with no referrer URL often indicates direct traffic, which is a common behavior. However, it can also be a sign of a bot that is designed to clear its referrer header to hide its origin.

- **Click-Jacking**: In a click-jacking attack, a legitimate site is embedded in a malicious iframe. The referrer URL of the malicious site is a key signal that can help detect this attack.

- **Behavioral Analysis**: By analyzing patterns of referrer URLs, an anti-fraud system can build a model of normal user behavior and flag deviations.

## 🎛️ Implementation Strategy

The module's implementation is straightforward and relies on the browser's built-in `document.referrer` property.

- **Data Collection**: The module simply reads the `document.referrer` property.

- **Data Dispatch**: The collected URL is then dispatched as a single event, allowing the backend to analyze it in conjunction with other data points.

- **Handling No-Referrer**: The module is designed to handle cases where there is no referrer URL (e.g., direct traffic, new tab, or a browser setting that blocks it).

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The referrer-url module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface ReferrerUrlBackendEvent {
  eventType: ""context.referrer-url" | "referrer-url.error"";
  payload: ReferrerUrlData | ReferrerUrlError;
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
    referrer-url: ReferrerUrlBackendEvent[]; // Array of referrer-url events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for referrer-url events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.referrer-url", // or other referrer-url event types
  "payload": {
    /* referrer-url specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### ReferrerUrl Event Example
```json
{
  "eventType": "context.referrer-url",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects referrer-url data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming referrer-url events against these requirements:

- ✅ `eventType` must be valid referrer-url event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface ReferrerUrlEvent {
  eventId: string;
  eventType: "referrerUrl" | "referrerUrl.error";
  moduleName: "referrerUrl";
  timestamp: string;
  payload: ReferrerUrlData | ReferrerUrlError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`referrerUrl`)

```typescript
interface ReferrerUrlData {
  referrerUrl: string; // The full URL of the referring page
  timestamp: number;
}
```

#### ❌ Error Response (`referrerUrl.error`)

```typescript
interface ReferrerUrlError {
  error: string;
  errorCode: "COLLECTION_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```
