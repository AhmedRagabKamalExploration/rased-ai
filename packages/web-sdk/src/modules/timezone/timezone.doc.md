# Timezone Module

## 🔬 The Research and "Why" Behind Timezone Detection

The core idea behind timezone fingerprinting is that a user's local timezone settings, when combined with their IP address and other location data, can be used to verify their true geographic location. Inconsistencies between these data points are a strong signal that a user may be using a proxy, VPN, or attempting to spoof their location to evade detection.

## 🌍 Timezone as a Signal

A user's timezone is a piece of information that is relatively stable for a real user but can be easily manipulated in a fraudulent context.

## 🕵️ Anti-Fraud and Bot Detection

- **Location Verification**: A key purpose of this module is to cross-validate location data. For example, if a user's IP address points to New York, but their timezone is set to Tokyo, this is a clear red flag for an anti-fraud system.

- **Bot Behavior**: Bots often operate from servers in different geographic locations than the user they are impersonating. A bot might also run on a server with a default timezone that doesn't match the location it's trying to spoof.

- **Spoofing**: Attackers may use browser extensions or other tools to change their reported location. The timezone offset is another data point that must be changed to convincingly spoof a new location.

## 👥 User Behavior

- **Daylight Saving Time**: The `isDaylightSavingsTime` property helps in accurately determining the local time and validating the timezone against the current date. It can also reveal inconsistencies if the user has a manually set time that doesn't respect DST.

- **Timezone Offset**: The `timezoneOffset` value, representing the difference in minutes from UTC, is a precise and reliable indicator of the user's timezone.

## 🎛️ Implementation Strategy

The module uses the standard `Intl.DateTimeFormat` API and the `Date` object to accurately collect timezone data. This approach is reliable across modern browsers and provides the necessary information without relying on external services.

- **Timezone Offset**: The `getTimezoneOffset()` method of the `Date` object provides the difference, in minutes, from the user's local time to UTC.

- **Daylight Saving Time**: By comparing the timezone offset of a date during a known period of standard time with a date during a known period of daylight saving time, the module can reliably determine if the user's timezone observes DST.

- **Data Structuring**: The collected data is organized into a simple payload with a boolean for DST and the numerical offset, mirroring the structure of your data.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The timezone module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface TimezoneBackendEvent {
  eventType: ""context.timezone" | "timezone.error"";
  payload: TimezoneInfo | TimezoneError;
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
    timezone: TimezoneBackendEvent[]; // Array of timezone events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for timezone events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.timezone", // or other timezone event types
  "payload": {
    /* timezone specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Timezone Event Example
```json
{
  "eventType": "context.timezone",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects timezone data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming timezone events against these requirements:

- ✅ `eventType` must be valid timezone event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface TimezoneEvent {
  eventId: string;
  eventType: "timezone" | "timezone.error";
  moduleName: "timezone";
  timestamp: string;
  payload: TimezoneData | TimezoneError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`timezone`)

```typescript
interface TimezoneData {
  isDaylightSavingsTime: boolean;
  timezoneOffset: number;
  timestamp: number;
}
```

#### ❌ Error Response (`timezone.error`)

```typescript
interface TimezoneError {
  error: string;
  errorCode: "TIMEZONE_COLLECTION_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```
