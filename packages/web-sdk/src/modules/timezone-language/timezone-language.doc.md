# Timezone and Language Module

## 🔬 The Research and "Why" Behind Timezone/Language Analysis

This module collects basic localization settings from the browser. Its value comes from cross-referencing this data with the user's IP-based location. A significant mismatch between the two is a classic and very strong indicator of a user attempting to obscure their identity.

## 🕵️ Fraud Detection Scenarios

- **Proxy/VPN Usage**: A user with an IP address in Germany, a browser language of Vietnamese, and a timezone of "America/Los_Angeles" is highly likely to be using a proxy or VPN to mask their true location.

- **Account Takeover**: If a known US-based user's account suddenly has activity from the same IP but with a different browser language, it could signal an account takeover by a fraudster in another country.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The timezone-language module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface TimezoneLanguageBackendEvent {
  eventType: ""context.timezone-language" | "timezone-language.error"";
  payload: TimezoneLanguageData | TimezoneLanguageError;
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
    timezone-language: TimezoneLanguageBackendEvent[]; // Array of timezone-language events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for timezone-language events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.timezone-language", // or other timezone-language event types
  "payload": {
    /* timezone-language specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### TimezoneLanguage Event Example
```json
{
  "eventType": "context.timezone-language",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects timezone-language data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming timezone-language events against these requirements:

- ✅ `eventType` must be valid timezone-language event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface LocalizationEventPayload {
  eventType: "context.localization";
  moduleName: "TimezoneAndLanguageModule";
  payload: LocalizationData;
}
```

### 🌐 Data Structures

```typescript
interface LocalizationData {
  timezone: string; // e.g., "America/New_York"
  language: string; // e.g., "en-US"
  languages: string[]; // e.g., ["en-US", "en"]
}
```
