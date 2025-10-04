# Visibility Change Module

## 🔬 The Research and "Why" Behind Visibility Change Detection

The core idea behind visibility change detection is to monitor when a web page becomes hidden or visible to the user through the Page Visibility API. This behavioral data serves as a crucial signal for analyzing user engagement patterns and detecting anomalies associated with bots, automated scripts, and fraudulent activity.

## 👁️ Page Visibility as a Behavioral Signal

The Page Visibility API provides real-time information about whether a page is visible to the user. This includes scenarios like:

- **Tab Switching**: User switches to another tab
- **Window Minimization**: User minimizes the browser window
- **Screen Locking**: User locks their device screen
- **Background Processing**: Page continues running in the background

## 🕵️ Anti-Fraud and Bot Detection Applications

### **Human vs. Bot Behavior Patterns**

**Real Human Users:**

- **Natural Tab Switching**: Humans frequently switch between tabs while browsing
- **Context Switching**: Users minimize windows to check other applications
- **Organic Patterns**: Visibility changes correlate with user interactions and reading patterns
- **Variable Timing**: Natural pauses and interruptions in browsing behavior

**Automated Bots/Scripts:**

- **Continuous Visibility**: Bots often run in headless browsers where visibility doesn't change
- **No Tab Switching**: Automated scripts typically don't simulate human tab-switching behavior
- **Unnatural Patterns**: Lack of organic visibility state changes
- **Headless Operation**: Many bots operate without any visibility API events

### **Fraud Detection Signals**

The visibility change module helps detect:

- **Card Testing Attacks**: Fraudsters use automated scripts that don't trigger visibility changes
- **Account Takeover Attempts**: Bots typically don't switch tabs or minimize windows
- **Click Fraud**: Automated clicks often happen without visibility state changes
- **Session Hijacking**: Unusual visibility patterns can indicate compromised sessions
- **Bot Farms**: Automated systems often lack natural visibility change patterns

## 🎛️ Implementation Strategy

The module implements a robust, cross-browser approach to visibility detection:

### **Browser Compatibility Detection**

```typescript
// Standard Page Visibility API (Modern browsers)
if ("hidden" in document) {
  // Uses document.hidden and visibilitychange event
}

// Internet Explorer/Edge support
if ("msHidden" in document) {
  // Uses document.msHidden and msvisibilitychange event
}

// WebKit browsers (Safari, older Chrome)
if ("webkitHidden" in document) {
  // Uses document.webkitHidden and webkitvisibilitychange event
}
```

### **State Mapping and Normalization**

The module normalizes different browser implementations into consistent states:

- **"visible"**: Page is currently visible to the user
- **"hidden"**: Page is hidden (tab switched, window minimized, etc.)
- **"prerender"**: Page is being prerendered (Chrome-specific)
- **"unknown"**: Unable to determine visibility state

### **Event Tracking and Analytics**

- **Change Count**: Tracks total number of visibility state changes
- **Timing Analysis**: Measures time between visibility changes
- **Pattern Recognition**: Identifies unusual visibility change patterns
- **Correlation Analysis**: Links visibility changes with user interactions

## 📊 Technical Implementation and Data Indicators

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The visibility-change module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface VisibilityChangeBackendEvent {
  eventType: ""behaviour.visibility-change" | "visibility-change.error"";
  payload: VisibilityChangeData | VisibilityChangeError;
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
    visibility-change: VisibilityChangeBackendEvent[]; // Array of visibility-change events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for visibility-change events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "behaviour.visibility-change", // or other visibility-change event types
  "payload": {
    /* visibility-change specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### VisibilityChange Event Example
```json
{
  "eventType": "behaviour.visibility-change",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects visibility-change data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming visibility-change events against these requirements:

- ✅ `eventType` must be valid visibility-change event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


### 🏗️ Event Structure

```typescript
interface VisibilityChangeEvent {
  eventId: string;
  eventType: "visibilityChange" | "visibilityChange.error";
  moduleName: "visibilityChange";
  timestamp: string;
  payload: VisibilityChangeData | VisibilityChangeError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`visibilityChange`)

```typescript
interface VisibilityChangeData {
  visibilityState: string; // Current visibility state
  previousState?: string; // Previous state (for changes)
  changeCount: number; // Total number of changes
  timestamp: number; // High-precision timestamp
  timeSinceLastChange?: number; // Time since last change (ms)
  browserSupport: boolean; // Whether API is supported
  isInitialState: boolean; // Whether this is the initial state
}
```

#### ❌ Error Response (`visibilityChange.error`)

```typescript
interface VisibilityChangeError {
  error: string;
  errorCode: "COLLECTION_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```

## 🔍 Research Background and Academic Foundation

### **Page Visibility API Research**

The Page Visibility API was developed to address the need for web applications to understand when they are visible to users. This has significant implications for:

- **Performance Optimization**: Pause unnecessary operations when hidden
- **Resource Management**: Reduce CPU and battery usage
- **User Experience**: Maintain appropriate application state
- **Security Analysis**: Detect unusual browsing patterns

### **Behavioral Analysis in Security**

Research in behavioral biometrics and fraud detection has shown that:

1. **Temporal Patterns**: Human users exhibit natural patterns of attention and distraction
2. **Context Switching**: Real users frequently switch between applications and tasks
3. **Interaction Correlation**: Visibility changes correlate with user interactions
4. **Anomaly Detection**: Unusual visibility patterns can indicate automated behavior

### **Bot Detection Research**

Academic studies have identified several key characteristics of bot behavior:

- **Lack of Natural Interruptions**: Bots don't naturally pause or switch contexts
- **Continuous Operation**: Automated scripts often run without visibility changes
- **Headless Execution**: Many bots operate in environments without visibility API
- **Pattern Repetition**: Bot visibility patterns (if any) are often repetitive and predictable

## 🚨 Anti-Fraud Applications

### **Risk Scoring Integration**

Visibility change data contributes to overall risk assessment:

- **Low Risk**: Natural visibility change patterns with human-like timing
- **Medium Risk**: Limited visibility changes or unusual patterns
- **High Risk**: No visibility changes or highly repetitive patterns
- **Critical Risk**: Complete absence of visibility API support (headless bots)

### **Pattern Analysis**

The module enables sophisticated pattern analysis:

```typescript
// Example risk indicators
const riskIndicators = {
  noVisibilityChanges: changeCount === 0,
  excessiveChanges: changeCount > threshold,
  unnaturalTiming: timeBetweenChanges < minimumHumanDelay,
  missingAPI: !browserSupport,
  repetitivePattern: isPatternRepetitive(changeHistory),
};
```

### **Integration with Other Modules**

Visibility change data works synergistically with:

- **Page Monitoring**: Correlates visibility with time spent on page
- **Mouse/Keyboard**: Links visibility changes with user interactions
- **Browser Features**: Validates visibility API functionality
- **Private Browser**: Some private modes affect visibility behavior
- **Network**: Visibility changes often correlate with network activity

## 🌍 Browser Compatibility

### **Supported Browsers**

```typescript
interface BrowserSupport {
  chrome: "full"; // All properties and events
  firefox: "full"; // Complete Page Visibility API
  safari: "partial"; // WebKit implementation
  edge: "full"; // Same as Chrome (Chromium-based)
  ie: "limited"; // msHidden/msvisibilitychange only
  opera: "full"; // Chromium-based support
}
```

### **Fallback Strategies**

- **Feature Detection**: Graceful degradation for unsupported browsers
- **Alternative Signals**: Use other behavioral indicators when visibility API unavailable
- **Error Handling**: Comprehensive error handling for API failures
- **Progressive Enhancement**: Core functionality works across all browsers

## ⚡ Performance Considerations

### **Efficient Implementation**

- **Event-Driven**: Only processes actual visibility changes
- **Minimal Overhead**: Lightweight event listeners
- **Memory Efficient**: No continuous polling or heavy computations
- **Battery Friendly**: Respects device power management

### **Privacy and Compliance**

- **No Personal Data**: Only technical visibility state information
- **Anonymous Analysis**: No user identification possible
- **Temporary Storage**: Data not retained long-term
- **GDPR Compliant**: No personal information collected

## 🎯 Use Cases and Applications

### **E-commerce Fraud Prevention**

- Detect automated checkout processes
- Identify bot-driven inventory checking
- Prevent automated account creation

### **Financial Services**

- Monitor suspicious account access patterns
- Detect automated trading bots
- Identify fraudulent transaction attempts

### **Content Protection**

- Prevent automated content scraping
- Detect bot-driven ad fraud
- Monitor for automated form submissions

### **Security Monitoring**

- Identify compromised user sessions
- Detect automated attack patterns
- Monitor for suspicious user behavior

---

## 📈 Future Research Directions

### **Advanced Pattern Recognition**

- Machine learning models for visibility pattern analysis
- Integration with other behavioral signals
- Real-time anomaly detection algorithms

### **Privacy-Preserving Analysis**

- Federated learning approaches
- Differential privacy techniques
- On-device processing capabilities

### **Cross-Platform Integration**

- Mobile app visibility detection
- Desktop application monitoring
- IoT device behavior analysis
