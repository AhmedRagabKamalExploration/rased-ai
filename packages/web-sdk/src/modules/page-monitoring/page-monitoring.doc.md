# Page Monitoring Module

## 🔬 The Research and "Why" Behind Page Monitoring

The core idea behind page monitoring is to track the duration of a user's session on a specific page. This metric, known as pageTime, serves as a crucial signal for analyzing user engagement and detecting behavioral anomalies associated with bots and fraudulent activity.

## ⏱️ Page Time as a Signal

A user's time on a page is a passive yet powerful indicator of their browsing behavior. This data point is highly effective when correlated with other signals like mouse movements and keyboard events.

## 🕵️ Anti-Fraud and Bot Detection

- **Time-on-Page Anomalies**: Bots are programmed to navigate at machine speed. They often exhibit an unnaturally short pageTime, sometimes completing a task in milliseconds. This is a major red flag for an anti-fraud system.

- **Human-like Variation**: Real users demonstrate a natural variance in pageTime. They read content, think, and interact with the page at a pace that is far more unpredictable than a bot's.

- **Session Duration**: Monitoring pageTime over the course of a session can reveal patterns. A consistent, unchanging pageTime across multiple pages could indicate a bot is simply loading a series of pages without real interaction.

## 🎛️ Implementation Strategy

The module's implementation is straightforward and highly efficient.

- **Start Time Capture**: The module captures the `Date.now()` timestamp at the moment the module is initialized.

- **Event-Based Reporting**: A `beforeunload` event listener is attached to the window. When the user leaves the page, this event is triggered, and the total pageTime (the difference between the initial timestamp and the current time) is calculated and dispatched.

- **Regular Snapshots**: In addition to the final pageTime, the module can periodically dispatch events to provide snapshots of the user's time on the page. This is useful for long-running sessions.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The page-monitoring module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface PageMonitoringBackendEvent {
  eventType: ""behaviour.page-monitoring" | "page-monitoring.error"";
  payload: PageMonitoringData | PageMonitoringError;
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
    page-monitoring: PageMonitoringBackendEvent[]; // Array of page-monitoring events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for page-monitoring events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "behaviour.page-monitoring", // or other page-monitoring event types
  "payload": {
    /* page-monitoring specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### PageMonitoring Event Example
```json
{
  "eventType": "behaviour.page-monitoring",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects page-monitoring data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming page-monitoring events against these requirements:

- ✅ `eventType` must be valid page-monitoring event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface PageMonitoringEvent {
  eventId: string;
  eventType: "pageMonitoring" | "pageMonitoring.error";
  moduleName: "pageMonitoring";
  timestamp: string;
  payload: PageMonitoringData | PageMonitoringError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`pageMonitoring`)

```typescript
interface PageMonitoringData {
  pageTime: number; // The duration on the page in milliseconds
  timestamp: number;
}
```

#### ❌ Error Response (`pageMonitoring.error`)

```typescript
interface PageMonitoringError {
  error: string;
  errorCode: "COLLECTION_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```
