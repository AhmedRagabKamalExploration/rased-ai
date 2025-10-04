# Math Fingerprinting Module

## 🔬 The Research and "Why" Behind Mathematical Fingerprinting

The core idea behind math-based fingerprinting is that the implementation of floating-point arithmetic and trigonometric functions can vary subtly across different combinations of hardware (CPU, GPU), operating systems, and browser versions. These minute, predictable differences create a unique, stable, and difficult-to-forge device fingerprint.

## 🧮 Mathematical Variations

### 💻 Hardware Level

- **CPU**: Floating-point units (FPUs) in different CPUs may have slightly different internal precision or rounding behaviors for complex operations.

- **GPU**: The shader and graphics pipelines on different GPUs have their own unique floating-point implementations. This is a crucial source of entropy.

### 💾 Software Stack

- **Operating System**: The OS's math libraries (e.g., libm on Unix-like systems) can have different implementations and optimization levels.

- **Browser Engine**: Different JavaScript engines (V8 in Chrome, SpiderMonkey in Firefox, JavaScriptCore in Safari) and their specific versions can handle complex math operations with slight variations in precision.

## 🧪 Advanced Implementation Strategy

A simple math operation won't be enough to create a unique fingerprint. The strategy is to chain together a series of complex, deterministic mathematical calculations that amplify these minor differences into a detectable fingerprint. The process is as follows:

1. **Generate a Deterministic Input**: The module starts with a fixed, known input value.

2. **Chain Complex Operations**: The input is passed through a sequence of operations that are highly sensitive to floating-point precision. This includes:
   - Trigonometric functions (`sin`, `cos`, `tan`)
   - Exponential and logarithmic functions (`exp`, `log`, `pow`)
   - Square roots and other high-precision operations
   - Bitwise manipulations

3. **Aggregate the Result**: The final result of this complex chain is a single numerical value.

4. **Hash the Output**: The final number is then converted to a string and hashed (e.g., using SHA-256) to produce a stable and compact fingerprint.

This process is entirely stateless and provides a unique identifier of the system's core mathematical capabilities without any network requests or user interaction.

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The math module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface MathBackendEvent {
  eventType: ""fingerprint.math" | "math.error"";
  payload: MathFingerprint | MathError;
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
    math: MathBackendEvent[]; // Array of math events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for math events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "fingerprint.math", // or other math event types
  "payload": {
    /* math specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Math Event Example
```json
{
  "eventType": "fingerprint.math",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects math data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming math events against these requirements:

- ✅ `eventType` must be valid math event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface MathEvent {
  eventId: string;
  eventType: "math" | "math.error";
  moduleName: "math";
  timestamp: string;
  payload: MathFingerprint | MathError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`math`)

```typescript
interface MathFingerprint {
  hash: string; // SHA-256 hash of the final mathematical result
  timestamp: number;
}
```

#### ❌ Error Response (`math.error`)

```typescript
interface MathError {
  error: string; // The error message
  errorCode: "MATH_OPERATION_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```
