# Browser Speech Module

## 🔬 The Research and "Why" Behind Browser Speech Fingerprinting

The core idea behind browser speech fingerprinting is that the specific Text-to-Speech (TTS) voices and their underlying synthesis engines are not standardized across different browser and operating system combinations. This unique collection of available voices provides a high-entropy data point for creating a reliable device fingerprint.

## 🗣️ Voice Properties as a Signal

The list of available voices, including their names, languages, and whether they are marked as a default, is a unique characteristic of a user's environment. This data is stable over time for a given device but varies significantly across different systems.

## 🕵️ Anti-Fraud and Bot Detection

- **Uniqueness**: The combination of voices available on a system creates a highly unique signature. For example, a Mac will have "Alex" and "Victoria," while a Windows machine will have "David" and "Zira." This makes the list of voices a powerful tool for distinguishing between devices.

- **Bot Detection**: Headless browsers or virtualized environments often lack a complete or standard set of TTS voices. A bot may report a generic list or no voices at all, which is a strong signal of a non-human user.

- **Spoofing Detection**: If a fraudster attempts to spoof a specific device or browser, they would need to ensure that their reported voice list matches that of a genuine device. This is difficult to do consistently across all data points, making it a valuable tool for detecting inconsistencies.

## 🎛️ Implementation Strategy

The module's implementation is based on the `SpeechSynthesis.getVoices()` method of the Web Speech API. This method asynchronously retrieves a list of all available `SpeechSynthesisVoice` objects.

- **Voice Enumeration**: The module calls `speechSynthesis.getVoices()` to get a list of all available voices.

- **Data Extraction**: For each voice, it extracts key properties like `name`, `lang`, and `default`.

- **String Concatenation**: These properties are combined into a single, deterministic string.

- **Hash Generation**: The final string is then hashed using SHA-256 to create a compact, secure, and privacy-preserving fingerprint. This is the value that is sent to the backend.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The browser-speech module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface BrowserSpeechBackendEvent {
  eventType: ""context.browser-speech" | "browser-speech.error"";
  payload: BrowserSpeechData | BrowserSpeechError;
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
    browser-speech: BrowserSpeechBackendEvent[]; // Array of browser-speech events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for browser-speech events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.browser-speech", // or other browser-speech event types
  "payload": {
    /* browser-speech specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### BrowserSpeech Event Example
```json
{
  "eventType": "context.browser-speech",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects browser-speech data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming browser-speech events against these requirements:

- ✅ `eventType` must be valid browser-speech event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface BrowserSpeechEvent {
  eventId: string;
  eventType: "browserSpeech" | "browserSpeech.error";
  moduleName: "browserSpeech";
  timestamp: string;
  payload: BrowserSpeechData | BrowserSpeechError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`browserSpeech`)

```typescript
interface BrowserSpeechData {
  hash: string; // SHA-256 hash of the concatenated voice data
  timestamp: number;
}
```

#### ❌ Error Response (`browserSpeech.error`)

```typescript
interface BrowserSpeechError {
  error: string;
  errorCode: "SPEECH_API_UNSUPPORTED" | "COLLECTION_FAILED";
  details: {
    message: string;
  };
}
```
