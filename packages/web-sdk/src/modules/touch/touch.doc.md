# Touch Event Module

## 🔬 The Research and "Why" Behind Touch Biometrics

**Similar to mouse biometrics, the way a user interacts with a touchscreen—swiping, tapping, and pinching—is a unique behavioral signature. This module captures these dynamics to differentiate between human and bot interactions on mobile web sessions.**

## 👉 Touch Dynamic Variations

### 🤖 Bots/Emulators

- **Lack True Touch Support**: Often lack true touch event support or produce perfectly linear, unnaturally fast swipes
- **Cannot Replicate Physics**: They cannot replicate the pressure and acceleration curves of a human finger
- **Perfect Geometry**: Produce perfectly straight lines and geometric patterns
- **Instant Actions**: No natural build-up or release of touch pressure

### 👤 Humans

- **Curved Trajectories**: Human swipes are curved, with natural acceleration and deceleration
- **Physical Properties**: Taps have a measurable surface area and pressure
- **Natural Variations**: Touch patterns vary based on finger size, hand position, and device grip
- **Contextual Behavior**: Touch behavior adapts to UI elements and user intent

## 🔍 Key Metrics

### 📐 Trajectory Analysis

Similar to the MouseBehaviourModule, we analyze the pathLength, duration, speed, straightness, and jerkiness of swipes.

### 👆 Pressure & Radius

The `force` and `radiusX`/`radiusY` properties of a touch event are strong signals of a real human finger on a screen. Emulators often report a value of 0 or a perfect 1.

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface TouchEvent {
  eventId: string; // Unique identifier
  eventType:
    | "behaviour.touch.swipe"
    | "behaviour.touch.tap"
    | "behaviour.touch.pinch";
  moduleName: "TouchEventModule";
  timestamp: string; // ISO timestamp
  payload: TouchAnalysis;
}
```

---

## 👆 Data Structures

### ✅ Touch Analysis (`behaviour.touch.*`)

```typescript
interface TouchAnalysis {
  // 🎯 Target Information
  target: {
    tag: string; // HTML element tag
    id?: string; // Element ID if available
    className?: string; // CSS classes
    position: {
      x: number; // Element position X
      y: number; // Element position Y
      width: number; // Element width
      height: number; // Element height
    };
  };

  // 👆 Touch Points
  touchPoints: {
    startPoint: {
      clientX: number; // Start X coordinate
      clientY: number; // Start Y coordinate
      pageX: number; // Page X coordinate
      pageY: number; // Page Y coordinate
      screenX: number; // Screen X coordinate
      screenY: number; // Screen Y coordinate
      force: number; // Touch pressure (0-1)
      radiusX: number; // Touch area width
      radiusY: number; // Touch area height
      rotationAngle: number; // Touch rotation
      timestamp: number; // Touch start time
    };

    endPoint: {
      clientX: number; // End X coordinate
      clientY: number; // End Y coordinate
      pageX: number; // Page X coordinate
      pageY: number; // Page Y coordinate
      screenX: number; // Screen X coordinate
      screenY: number; // Screen Y coordinate
      force: number; // Touch pressure at end
      radiusX: number; // Touch area width at end
      radiusY: number; // Touch area height at end
      rotationAngle: number; // Touch rotation at end
      timestamp: number; // Touch end time
    };

    trajectory?: Array<{
      x: number;
      y: number;
      force: number;
      radiusX: number;
      radiusY: number;
      timestamp: number;
    }>; // Path points for swipes
  };

  // 📊 Touch Metrics
  metrics: {
    // ⏱️ Temporal Analysis
    duration: number; // Total touch duration (ms)
    dwellTime: number; // Time pressure was applied
    releaseTime: number; // Time to release touch

    // 📏 Spatial Analysis
    pathLength: number; // Total distance traveled
    straightLineDistance: number; // Direct point-to-point distance
    straightness: number; // Ratio of straight/actual distance
    displacement: { x: number; y: number }; // Final displacement vector

    // 🏃 Velocity Analysis
    avgSpeed: number; // Average movement speed
    maxSpeed: number; // Peak movement speed
    endSpeed: number; // Speed at gesture end
    speedVariance: number; // Speed consistency
    accelerationPattern: number[]; // Acceleration curve

    // 📈 Trajectory Analysis
    pointCount: number; // Number of trajectory points
    directionChanges: number; // Number of direction changes
    curvature: number; // Path curvature measure
    jerkiness: number; // Smoothness of movement
    spiralness: number; // Spiral-like movement detection

    // 👆 Physical Properties
    avgPressure: number; // Average applied pressure
    maxPressure: number; // Maximum pressure applied
    pressureVariance: number; // Pressure consistency
    avgTouchArea: number; // Average touch contact area
    touchAreaVariance: number; // Contact area changes
  };

  // 🎯 Gesture Classification
  gesture: {
    type: "tap" | "swipe" | "pinch" | "drag" | "scroll" | "unknown";
    direction?: "up" | "down" | "left" | "right" | "diagonal";
    intent: "navigation" | "selection" | "manipulation" | "scroll" | "zoom";
    confidence: number; // Gesture classification confidence (0-1)

    // 📱 Touch-specific gestures
    multiTouch: boolean; // Multiple fingers involved
    fingerCount: number; // Number of simultaneous touches
    simultaneousTouches: TouchAnalysis[]; // Other concurrent touches
  };

  // 🔍 Behavioral Analysis
  behavior: {
    // 👤 Human-like indicators
    humanIndicators: {
      naturalPressure: boolean; // Natural pressure variation
      organicMovement: boolean; // Curved, natural movement
      hesitationPoints: boolean; // Natural pauses in movement
      pressureBuildUp: boolean; // Gradual pressure application
      variableSpeed: boolean; // Natural speed variations
    };

    // 🤖 Bot-like indicators
    botIndicators: {
      perfectGeometry: boolean; // Too straight/geometric
      constantPressure: boolean; // Unchanging pressure
      impossibleSpeed: boolean; // Faster than human possible
      mechanicalMovement: boolean; // Robotic movement patterns
      missingPhysics: boolean; // No realistic touch physics
    };

    // 📊 Quality Scores
    humanLikeness: number; // 0-1 human behavior score
    naturalness: number; // 0-1 natural movement score
    realism: number; // 0-1 realistic touch physics score
  };

  // 📱 Device Context
  device: {
    touchSupport: boolean; // Device supports touch
    multiTouchSupport: boolean; // Multi-touch capability
    pressureSensitive: boolean; // Pressure sensitivity available
    orientationAware: boolean; // Device orientation affects touch

    // 📏 Screen Properties
    screenDensity: number; // Pixels per inch
    screenSize: { width: number; height: number }; // Physical screen size
    orientationAngle: number; // Current device orientation

    // 🔧 Touch Hardware
    touchAccuracy: number; // Touch precision level
    palmRejection: boolean; // Palm rejection active
    stylusDetection: boolean; // Stylus input detected
  };
}
```

---

## 🔍 Advanced Touch Analysis

### 🎯 Multi-Touch Gestures

```typescript
interface MultiTouchAnalysis {
  // 👋 Gesture Recognition
  gestureType: "pinch" | "rotate" | "spread" | "swipe" | "tap";
  fingerConfiguration: {
    fingerCount: number; // Number of active fingers
    fingerSpread: number; // Distance between fingers
    fingerAlignment: number; // How aligned fingers are
    dominantHand: "left" | "right" | "unknown"; // Detected handedness
  };

  // 📐 Geometric Analysis
  geometry: {
    centroid: { x: number; y: number }; // Center point of all touches
    boundingBox: { width: number; height: number }; // Bounding rectangle
    aspectRatio: number; // Width/height ratio
    rotationAngle: number; // Overall rotation
    scaleChange: number; // Zoom/scale factor change
  };

  // ⏱️ Temporal Coordination
  coordination: {
    synchronization: number; // How synchronized the touches are
    leadFinger: number; // Index of leading finger
    followDelay: number; // Delay between finger actions
    simultaneity: number; // How simultaneous the touches are
  };
}
```

### 🧬 Touch Biometrics

```typescript
interface TouchBiometrics {
  // 👆 Physical Characteristics
  physicalProfile: {
    fingerSize: { width: number; height: number }; // Estimated finger size
    touchPressure: number; // Typical pressure application
    contactArea: number; // Typical touch contact area
    gripPattern: "thumb" | "finger" | "stylus"; // How device is held
  };

  // 🎭 Behavioral Patterns
  behavioralProfile: {
    touchRhythm: number; // Typical touch timing pattern
    movementStyle: "smooth" | "jerky" | "hesitant" | "confident";
    pressureStyle: "light" | "medium" | "heavy";
    gesturePreferences: string[]; // Preferred gesture types
  };

  // 🔍 Usage Patterns
  usagePatterns: {
    dominantHand: "left" | "right" | "ambidextrous";
    deviceGrip: "one-handed" | "two-handed" | "tablet-grip";
    interactionStyle: "precise" | "casual" | "hurried";
    experienceLevel: "novice" | "intermediate" | "expert";
  };
}
```

---

## 🛡️ Fraud Detection

### 🚨 Emulator Detection

```typescript
interface EmulatorDetection {
  // Hardware simulation detection
  hardwareSignals: {
    missingTouchHardware: boolean; // No real touch hardware
    simulatedPressure: boolean; // Fake pressure values
    perfectTouchEvents: boolean; // Too perfect to be real
    impossiblePrecision: boolean; // Unrealistic precision
  };

  // Software emulation signs
  softwareSignals: {
    chromeDevTools: boolean; // Chrome DevTools touch emulation
    browserEmulation: boolean; // Browser touch simulation
    automationFramework: boolean; // Selenium/automation detected
    scriptedTouches: boolean; // Programmatic touch events
  };

  // Physics violations
  physicsViolations: {
    instantTouches: boolean; // No touch build-up time
    zeroAreaTouches: boolean; // No contact area
    impossibleSpeed: boolean; // Faster than physically possible
    noFingerPhysics: boolean; // Missing realistic finger behavior
  };
}
```

---

## 📱 Mobile Optimization

### ⚡ Performance Considerations

- **Event Throttling**: Limit touch event processing to 60fps
- **Memory Management**: Efficient trajectory storage and cleanup
- **Battery Awareness**: Reduce processing when battery is low
- **Background Handling**: Pause collection when app is backgrounded

### 🔒 Privacy Protection

- **No Content Recording**: Only movement patterns, never touched content
- **Anonymized Data**: No personal identification possible
- **Temporary Storage**: Touch data cleared after analysis
- **Consent-Based**: Explicit user permission for touch tracking

### 📊 Success Metrics

- **Bot Detection Rate**: 96%+ automated touch detection
- **False Positive Rate**: <3% for legitimate mobile users
- **Performance Impact**: <2% CPU overhead during interaction
- **Privacy Compliance**: Full mobile privacy regulation compliance
