# Media Module

## 🔬 The Research and "Why" Behind Media Fingerprinting

The core idea behind media fingerprinting is to identify the unique combination of audio and video devices (microphones, speakers, webcams) present on a user's machine. This hardware-level signature is a powerful component of a comprehensive device fingerprint, providing a strong signal for distinguishing between human and non-human activity.

## 🎤 Media Devices as a Signal

The presence, type, and number of media devices on a system are a set of highly stable and unique attributes that are difficult for a fraudster or bot to spoof convincingly.

## 🕵️ Anti-Fraud and Bot Detection

- **Device Enumeration**: By using the `navigator.mediaDevices.enumerateDevices()` API, the module can retrieve a list of all connected media devices. The unique combination of these devices is a key differentiator.

- **Hardware Discrepancies**: Bots and headless browsers often run in virtualized environments where no real media hardware is present. The module can easily detect this by checking if there are zero audio or video devices.

- **Generic vs. Real Devices**: If a bot attempts to simulate media devices, it will often use generic labels that can be flagged as suspicious. A real user's device, however, is likely to report a mix of brand-specific or system-level device labels.

## 🔐 Privacy and Permissions

- **Privacy-Safe**: The module is designed to be privacy-safe. It only enumerates the devices but does not attempt to access or record audio or video. The process does not trigger a permissions pop-up for the user.

- **Obscured Labels**: The browser's own security model ensures that device labels (`device.label`) are obfuscated (e.g., "Microphone 1") until the user has granted permission to access a device via `getUserMedia()`. The number of devices is still a usable signal.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The media module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface MediaBackendEvent {
  eventType: ""context.media" | "media.error"";
  payload: MediaInfo | MediaError;
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
    media: MediaBackendEvent[]; // Array of media events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for media events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.media", // or other media event types
  "payload": {
    /* media specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Media Event Example
```json
{
  "eventType": "context.media",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects media data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming media events against these requirements:

- ✅ `eventType` must be valid media event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface MediaEvent {
  eventId: string;
  eventType: "media" | "media.error";
  moduleName: "media";
  timestamp: string;
  payload: MediaData | MediaError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`media`)

```typescript
interface MediaDevice {
  id: string; // The device's unique ID
  kind: "audioinput" | "audiooutput" | "videoinput";
  isCustomLabel: boolean; // Flag if the label is generic
  label: string; // The device label (may be generic if no permission)
}

interface MediaData {
  audioInput: MediaDevice[];
  audioOutput: MediaDevice[];
  videoInput: MediaDevice[];
  hasMicrophone: boolean;
  hasSpeakers: boolean;
  hasWebcam: boolean;
  timestamp: number;
}
```

#### ❌ Error Response (`media.error`)

```typescript
interface MediaError {
  error: string;
  errorCode: "MEDIA_API_UNSUPPORTED" | "ENUMERATION_FAILED";
  details: {
    message: string;
  };
}
```
