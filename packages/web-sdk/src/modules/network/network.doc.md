# Network Info Module

## 🔬 The Research and "Why" Behind Network Analysis

This module captures the characteristics of the user's internet connection. It provides valuable context for risk assessment and for detecting anomalous session changes.

## 🚨 Key Use Cases

- **Risk Scoring**: Connections from cellular networks can sometimes be considered higher risk than stable broadband connections.

- **Session Anomaly Detection**: If a user's session starts on a fast "wifi" connection and suddenly switches to a slow "3g" connection with high latency, it could be a flag for a session being hijacked or moved to a different environment.

- **Bot Detection**: Some botnets may operate from servers with specific, recognizable network characteristics.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The network module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface NetworkBackendEvent {
  eventType: ""context.network" | "network.error"";
  payload: NetworkInfo | NetworkError;
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
    network: NetworkBackendEvent[]; // Array of network events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for network events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.network", // or other network event types
  "payload": {
    /* network specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Network Event Example
```json
{
  "eventType": "context.network",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects network data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming network events against these requirements:

- ✅ `eventType` must be valid network event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface NetworkEventPayload {
  eventType: "context.network";
  moduleName: "NetworkInfoModule";
  payload: NetworkData;
}
```

### 📡 Data Structures

```typescript
interface NetworkData {
  isOnline: boolean;
  connectionType?:
    | "bluetooth"
    | "cellular"
    | "ethernet"
    | "wifi"
    | "wimax"
    | "other"
    | "none"
    | "unknown";
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  roundTripTime?: number; // in ms
  downlink?: number; // in Mbps
}
```
