# Screen Orientation Module

## 🔬 The Research and "Why" Behind Screen Orientation Detection

The core idea behind screen orientation detection is to capture the orientation of the user's screen, which provides a valuable, real-time signal for understanding device type and user behavior. This is particularly relevant for mobile and tablet devices, where screen rotation is a natural part of the user experience.

## 🔄 Orientation as a Signal

The screen orientation data, which includes the orientation type and angle, is a non-intrusive way to gather information that can help build a strong device fingerprint and detect anomalies.

## 🕵️ Anti-Fraud and Bot Detection

- **Device Fingerprinting**: The default orientation and the ability to change it are unique characteristics of a device and its operating system. A mobile device fingerprint will include dynamic orientation changes, whereas a desktop device will typically be static.

- **Behavioral Analysis**: By monitoring orientation changes, an anti-fraud system can build a behavioral profile of a user. A session with multiple orientation changes is a strong signal of a human user on a mobile device.

- **Bot Detection**: Bots and headless browsers often run in a static, predefined orientation. A session that reports no orientation changes on a device that is expected to have them (e.g., a simulated mobile device) can be a red flag.

- **Spoofing Detection**: An attacker trying to spoof a mobile device would need to accurately simulate these orientation changes to appear legitimate. A mismatch between the reported orientation and other device data could expose the spoofing attempt.

## 🎛️ Implementation Strategy

The module's implementation relies on the browser's `screen.orientation` API.

- **Initial Collection**: The module captures the initial orientation data immediately upon initialization.

- **Event Listening**: It then sets up an event listener for the `orientationchange` event.

- **Real-time Updates**: Whenever the screen orientation changes, the listener is triggered, and a new event is dispatched with the updated data.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The screen-orientation module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface ScreenOrientationBackendEvent {
  eventType: ""context.screen-orientation" | "screen-orientation.error"";
  payload: ScreenOrientationData | ScreenOrientationError;
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
    screen-orientation: ScreenOrientationBackendEvent[]; // Array of screen-orientation events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for screen-orientation events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.screen-orientation", // or other screen-orientation event types
  "payload": {
    /* screen-orientation specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### ScreenOrientation Event Example
```json
{
  "eventType": "context.screen-orientation",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects screen-orientation data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming screen-orientation events against these requirements:

- ✅ `eventType` must be valid screen-orientation event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface ScreenOrientationEvent {
  eventId: string;
  eventType: "screenOrientation" | "screenOrientation.error";
  moduleName: "screenOrientation";
  timestamp: string;
  payload: ScreenOrientationData | ScreenOrientationError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`screenOrientation`)

```typescript
interface ScreenOrientationData {
  type:
    | "landscape-primary"
    | "landscape-secondary"
    | "portrait-primary"
    | "portrait-secondary";
  angle: number; // The angle of the screen rotation (0, 90, 180, 270)
  timestamp: number;
}
```

#### ❌ Error Response (`screenOrientation.error`)

```typescript
interface ScreenOrientationError {
  error: string;
  errorCode: "UNSUPPORTED_API" | "COLLECTION_FAILED";
  details: {
    message: string;
  };
}
```
