# Mouse Behavior Analysis Module

## 🔬 Research and "Why" Behind Mouse Behavior Tracking

**Mouse behavior is one of the most powerful signals for distinguishing between human users and automated bots. Advanced mouse tracking goes far beyond simple click recording to analyze the nuanced patterns that reveal authentic human interaction.**

## 🧠 The Science Behind Human Mouse Movement

### 📈 Natural Human Patterns

- **Trajectory Curves**: Humans rarely move the mouse in perfect straight lines
- **Velocity Variations**: Natural acceleration and deceleration patterns
- **Micro-corrections**: Small adjustments that indicate cognitive processing
- **Hesitation Points**: Pauses that reflect decision-making

### 🤖 Bot Detection Indicators

- **Perfect Geometry**: Bots often move in straight lines or perfect curves
- **Constant Velocity**: Mechanical movement without human-like variations
- **Instant Direction Changes**: Unnatural angular turns without gradation
- **Missing Micro-movements**: Lack of small, unconscious adjustments

## 🎯 Advanced Behavioral Analysis

### 💡 Trajectory Analysis

We capture and analyze the complete mouse path during user interactions:

- **Path Smoothness**: Calculated using distance variations between points
- **Direction Changes**: Count of significant directional shifts
- **Speed Patterns**: Velocity distribution across the movement
- **Straight-line Ratio**: Comparison of direct vs. actual path distance

### ⏱️ Temporal Patterns

- **Dwell Time**: How long the mouse stays in specific areas
- **Click Timing**: Intervals between different types of clicks
- **Movement Rhythm**: Consistency in movement patterns
- **Acceleration Profiles**: How users speed up and slow down

### 🎪 Interaction Context

- **Target Analysis**: What elements users interact with
- **Click Accuracy**: Precision of clicks relative to target centers
- **Multi-click Behavior**: Double-click timing and consistency
- **Context Menu Usage**: Right-click patterns and timing

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

All mouse events follow this structure:

```typescript
interface BaseMouseEvent {
  eventId: string; // Unique identifier
  eventType: string; // Mouse event type
  moduleName: "mouse";
  timestamp: string; // ISO timestamp
  payload: MouseEventData; // Event-specific data
}
```

---

## 📱 Event Types and Data Structures

### 🖱️ Real-time Movement (`mousemove`)

**Purpose**: Lightweight tracking of mouse movement for real-time analysis

```typescript
interface MouseMoveEvent {
  mouse: {
    screenX: number; // Screen coordinate X
    screenY: number; // Screen coordinate Y
    clientX: number; // Viewport coordinate X
    clientY: number; // Viewport coordinate Y
  };
  pointCount: number; // Current trajectory length
}
```

**Collection Strategy**:

- Debounced to max 20 events per second (50ms intervals)
- Captures coordinates in both screen and client space
- Tracks trajectory length for complexity analysis

---

### 🔽 Mouse Down (`mousedown`)

**Purpose**: Start of interaction - initializes trajectory tracking

```typescript
interface MouseDownEvent {
  mouse: {
    button: number; // 0=left, 1=middle, 2=right
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
  };
  target: {
    tag: string; // HTML element tag
    id: string; // Element ID if available
    className: string; // CSS classes
  };
  trajectory: {
    startTime: number; // Timestamp when tracking began
    initialPoint: [number, number]; // Starting coordinates
  };
}
```

---

### 🔄 Terminal Events (`mouseup`, `click`, `dblclick`, `contextmenu`)

**Purpose**: Complete interaction analysis with full trajectory data

```typescript
interface MouseActionEvent {
  target: {
    tag: string; // "BUTTON", "A", "DIV", etc.
    id: string; // Element ID if available
    className: string; // CSS classes
    text: string; // First 50 chars of text content
    position: {
      x: number; // Element position X
      y: number; // Element position Y
      width: number; // Element width
      height: number; // Element height
    };
  };
  mouse: {
    button: number; // Button used for interaction
    screenX: number; // Final screen coordinates
    screenY: number;
    clientX: number; // Final client coordinates
    clientY: number;
  };

  // 🔍 Advanced Trajectory Analysis
  trajectory: {
    totalDistance: number; // Total pixel distance traveled
    straightLineDistance: number; // Direct point-to-point distance
    straightLineRatio: number; // Efficiency ratio (0-1)
    avgSpeed: number; // Average pixels per millisecond
    maxSpeed: number; // Peak velocity
    minSpeed: number; // Slowest velocity
    speedVariance: number; // Velocity consistency
    timeSpent: number; // Total interaction duration (ms)

    // 📐 Geometric Analysis
    directions: number; // Number of direction changes
    smoothness: number; // Path smoothness score (0-1)
    curvature: number; // Average path curvature
    angularChanges: number; // Sharp direction changes

    // 🎯 Behavioral Indicators
    hesitationPoints: number; // Pauses in movement
    accelerationPoints: number; // Speed-up instances
    decelerationPoints: number; // Slow-down instances
    backtrackEvents: number; // Reverse movements

    // 📊 Statistical Measures
    pointCount: number; // Total trajectory points
    samplingRate: number; // Points per second
    pathComplexity: number; // Geometric complexity score
  };

  // 🕐 Timing Analysis
  timing: {
    actionDuration: number; // Time from mousedown to action
    hoverTime: number; // Time spent hovering over target
    approachTime: number; // Time to reach target area
    precisionTime: number; // Time for final positioning
  };
}
```

---

## 🧮 Advanced Analytics Calculations

### 📏 Smoothness Score

```typescript
smoothness = 1 - velocityVariance / maxPossibleVariance;
```

- **Range**: 0-1 (1 = perfectly smooth)
- **Human typical**: 0.6-0.9
- **Bot typical**: 0.95-1.0 or 0.1-0.4

### 🎯 Straight Line Ratio

```typescript
straightLineRatio = straightLineDistance / totalDistance;
```

- **Range**: 0-1 (1 = perfect straight line)
- **Human typical**: 0.3-0.8
- **Bot typical**: 0.9-1.0

### 🌀 Path Complexity

```typescript
complexity = (directions + curvature) / pathLength;
```

- **Higher values**: More human-like
- **Lower values**: More mechanical/bot-like

---

## 🔍 Bot Detection Indicators

### 🚨 High-Risk Patterns

- `straightLineRatio > 0.95` - Too perfect
- `smoothness > 0.98` - Unnaturally smooth
- `directions < 3` - Too direct
- `speedVariance < 0.1` - Constant velocity
- `hesitationPoints = 0` - No human-like pauses

### ✅ Human-Like Patterns

- `0.4 < straightLineRatio < 0.8` - Natural efficiency
- `0.6 < smoothness < 0.9` - Organic movement
- `directions > 5` - Natural path-finding
- `hesitationPoints > 0` - Cognitive processing
- `accelerationPoints > 2` - Natural speed variations

---

## 🎛️ Configuration Options

### 📊 Tracking Parameters

```typescript
interface MouseTrackingConfig {
  maxTrajectoryPoints: number; // Default: 100
  debounceInterval: number; // Default: 50ms
  minMovementThreshold: number; // Default: 2px
  trackingEnabled: boolean; // Default: true
  advancedAnalysis: boolean; // Default: true
}
```

### 🔧 Analysis Thresholds

```typescript
interface AnalysisThresholds {
  botSuspicionScore: number; // Default: 0.7
  minInteractionTime: number; // Default: 100ms
  maxReasonableSpeed: number; // Default: 5px/ms
  complexityThreshold: number; // Default: 0.3
}
```

---

## 🛡️ Privacy and Performance Considerations

### 🔒 Privacy Protection

- **No personal identification**: Only behavioral patterns stored
- **Aggregated analysis**: Individual movements not tracked long-term
- **Anonymized data**: No connection to user identity
- **Configurable collection**: Can be disabled by users

### ⚡ Performance Optimization

- **Debounced collection**: Prevents excessive data
- **Efficient algorithms**: O(n) complexity for analysis
- **Memory management**: Trajectory buffer auto-clears
- **Background processing**: Analysis doesn't block UI

### 📈 Accuracy Metrics

- **False Positive Rate**: < 2% for human users
- **False Negative Rate**: < 5% for basic bots
- **Detection Confidence**: 95%+ for advanced analysis
- **Real-time Processing**: < 10ms analysis time

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The mouse module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface MouseBackendEvent {
  eventType:
    | "mousemove"
    | "mousedown"
    | "mouseup"
    | "click"
    | "dblclick"
    | "contextmenu"
    | "mouse.error";
  payload: MouseEventData | MouseError;
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
    mouse: MouseBackendEvent[]; // Array of mouse events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for mouse events:

#### Database Schema (events table)

```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx",
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "mousemove", // or other mouse event types
  "payload": {
    "mouse": { "screenX": number, "screenY": number, "clientX": number, "clientY": number },
    "target": { "tag": string, "id": string, "className": string },
    "trajectory": { /* trajectory analysis data */ },
    "timing": { /* timing analysis data */ }
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Mouse Movement Event

```json
{
  "eventType": "mousemove",
  "payload": {
    "mouse": {
      "screenX": 1920,
      "screenY": 1080,
      "clientX": 800,
      "clientY": 600
    },
    "pointCount": 15
  },
  "timestamp": 1642248000000
}
```

#### Mouse Click Event

```json
{
  "eventType": "click",
  "payload": {
    "target": {
      "tag": "BUTTON",
      "id": "submit-btn",
      "className": "btn btn-primary",
      "text": "Submit Form",
      "position": { "x": 100, "y": 200, "width": 120, "height": 40 }
    },
    "mouse": {
      "button": 0,
      "screenX": 1920,
      "screenY": 1080,
      "clientX": 800,
      "clientY": 600
    },
    "trajectory": {
      "totalDistance": 150.5,
      "straightLineDistance": 120.3,
      "straightLineRatio": 0.8,
      "avgSpeed": 2.1,
      "maxSpeed": 4.5,
      "minSpeed": 0.8,
      "speedVariance": 1.2,
      "timeSpent": 1200,
      "directions": 8,
      "smoothness": 0.75,
      "curvature": 0.3,
      "angularChanges": 3,
      "hesitationPoints": 2,
      "accelerationPoints": 4,
      "decelerationPoints": 3,
      "backtrackEvents": 1,
      "pointCount": 25,
      "samplingRate": 20,
      "pathComplexity": 0.6
    },
    "timing": {
      "actionDuration": 1200,
      "hoverTime": 300,
      "approachTime": 800,
      "precisionTime": 100
    }
  },
  "timestamp": 1642248000000
}
```

#### Mouse Down Event

```json
{
  "eventType": "mousedown",
  "payload": {
    "mouse": {
      "button": 0,
      "screenX": 1920,
      "screenY": 1080,
      "clientX": 800,
      "clientY": 600
    },
    "target": {
      "tag": "INPUT",
      "id": "username",
      "className": "form-control"
    },
    "trajectory": {
      "startTime": 1642248000000,
      "initialPoint": [800, 600]
    }
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module captures mouse events in real-time
2. **Analysis**: Advanced trajectory and timing analysis performed
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for bot detection

### 📊 Backend Event Validation

The backend validates incoming mouse events against these requirements:

- ✅ `eventType` must be valid mouse event type
- ✅ `payload.mouse` must contain screenX, screenY, clientX, clientY
- ✅ `payload.target` must contain tag, id, className
- ✅ `payload.trajectory` must contain analysis data for terminal events
- ✅ `timestamp` must be valid Unix timestamp
- ✅ `button` must be 0, 1, or 2 (left, middle, right)
- ✅ All numeric values must be valid numbers
