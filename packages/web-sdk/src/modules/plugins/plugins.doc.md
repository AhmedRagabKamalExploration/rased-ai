# Plugins Module

## 🔬 The Research and "Why" Behind Plugin Fingerprinting

The core idea behind plugin fingerprinting is that the combination of plugins and their associated MIME types represents a highly unique characteristic of a browser's environment. This data is a valuable source of entropy for generating a stable and reliable device fingerprint.

## 🧩 Plugins as a Signal

The presence or absence of specific plugins provides a crucial signal for identifying user behavior.

## 🕵️ Anti-Fraud and Bot Detection

- **Uniqueness**: The list of installed plugins is highly variable between different users. This makes it an excellent source of data for building a unique device identifier.

- **Consistency**: The plugin list is generally stable for a given user, which helps in recognizing a returning user.

- **Bot Detection**: Bots and automated environments often have no plugins installed, or a very generic, minimal set. A long and varied list of plugins is a strong indicator of a real user.

- **Environment Mismatches**: An attacker might try to spoof a browser's userAgent but fail to replicate the corresponding plugin list, creating an inconsistency that is a red flag for fraud detection systems.

## 🎛️ Implementation Strategy

The module's implementation directly reflects the data structure you provided. It iterates through the `navigator.plugins` array to collect detailed information about each plugin and its supported MIME types.

- **Plugin Enumeration**: The module accesses the `navigator.plugins` collection, which is an array-like object containing Plugin objects.

- **MIME Type Collection**: For each Plugin, it iterates through its associated MimeType objects, collecting details like type, description, and suffixes.

- **Data Structuring**: The collected data is organized into a structured payload that includes the plugin's name, description, filename, and a list of its MIME types. This mirrors the format of the obfuscated payload.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The plugins module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface PluginsBackendEvent {
  eventType: ""fingerprint.plugins" | "plugins.error"";
  payload: PluginFingerprint | PluginError;
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
    plugins: PluginsBackendEvent[]; // Array of plugins events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for plugins events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "fingerprint.plugins", // or other plugins event types
  "payload": {
    /* plugins specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Plugins Event Example
```json
{
  "eventType": "fingerprint.plugins",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects plugins data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming plugins events against these requirements:

- ✅ `eventType` must be valid plugins event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface PluginsEvent {
  eventId: string;
  eventType: "plugins" | "plugins.error";
  moduleName: "plugins";
  timestamp: string;
  payload: PluginsData | PluginsError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`plugins`)

```typescript
interface MimeTypeData {
  type: string;
  description: string;
  suffixes: string;
}

interface PluginData {
  name: string;
  description: string;
  filename: string;
  mime: MimeTypeData[];
}

interface PluginsData {
  plugins: PluginData[];
  timestamp: number;
}
```

#### ❌ Error Response (`plugins.error`)

```typescript
interface PluginsError {
  error: string;
  errorCode: "PLUGIN_COLLECTION_FAILED" | "UNSUPPORTED_API";
  details: {
    message: string;
  };
}
```
