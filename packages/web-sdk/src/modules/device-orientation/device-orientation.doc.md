# Device Orientation Module

## 🔬 The Research and "Why" Behind Device Orientation

**The core idea is that a physical mobile device held by a human is never perfectly still. It is subject to micro-tremors from the user's hand and larger movements as they interact with it. This module captures data from the device's accelerometer and gyroscope to detect this natural motion.**

## 🤖 Bot and Emulator Detection

### 🤖 Bots/Emulators

- **No Physical Motion**: An automated script running in an emulator on a server has no physical motion
- **Static Values**: Accelerometer and gyroscope will report static, often zero or null, values
- **Perfect Stillness**: Unnatural lack of micro-movements that characterize real devices

### 👤 Humans

- **Constant Motion**: A real device will produce a constant, low-level stream of changing orientation and motion data
- **Micro-tremors**: Natural hand movements create subtle but detectable sensor variations
- **Interactive Movement**: Device tilts and shifts during normal usage

**This is one of the strongest signals for differentiating real mobile traffic from fraudulent, emulated traffic.**

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface OrientationEvent {
  eventId: string; // Unique identifier
  eventType: "behaviour.device.orientation" | "behaviour.device.motion";
  moduleName: "DeviceOrientationModule";
  timestamp: string; // ISO timestamp
  payload: OrientationData | MotionData;
}
```

---

## 🔄 Data Structures

### 🧭 Orientation Data (`behaviour.device.orientation`)

```typescript
interface OrientationData {
  supported: boolean; // Device orientation API available

  // 📐 Orientation Values
  orientation: {
    absolute: boolean; // True if orientation is absolute
    alpha: number | null; // Z-axis rotation (0-360 degrees)
    beta: number | null; // X-axis rotation (-180 to 180 degrees)
    gamma: number | null; // Y-axis rotation (-90 to 90 degrees)
  };

  // 📊 Motion Analysis
  analysis: {
    isStatic: boolean; // Device appears completely still
    variability: number; // Amount of natural movement detected
    humanLikeness: number; // 0-1 score of human-like motion

    // 📈 Statistical Measures
    orientationRange: {
      alphaRange: number; // Range of alpha values observed
      betaRange: number; // Range of beta values observed
      gammaRange: number; // Range of gamma values observed
    };

    stabilityScore: number; // How stable the device is held
    tremorsDetected: boolean; // Natural hand tremors present
  };

  // ⏱️ Temporal Patterns
  timing: {
    samplingRate: number; // Events per second
    duration: number; // Total observation period (ms)
    eventCount: number; // Total events captured
    lastUpdate: number; // Timestamp of last orientation change
  };
}
```

### 🏃 Motion Data (`behaviour.device.motion`)

```typescript
interface MotionData {
  supported: boolean; // Device motion API available

  // 🚀 Acceleration Data
  acceleration: {
    x: number | null; // X-axis acceleration (m/s²)
    y: number | null; // Y-axis acceleration (m/s²)
    z: number | null; // Z-axis acceleration (m/s²)
  };

  // 🌍 Gravity-Included Acceleration
  accelerationIncludingGravity: {
    x: number | null; // X-axis with gravity (m/s²)
    y: number | null; // Y-axis with gravity (m/s²)
    z: number | null; // Z-axis with gravity (m/s²)
  };

  // 🔄 Rotation Rate
  rotationRate: {
    alpha: number | null; // Z-axis rotation rate (deg/s)
    beta: number | null; // X-axis rotation rate (deg/s)
    gamma: number | null; // Y-axis rotation rate (deg/s)
  };

  // ⏱️ Timing Information
  interval: number; // Time interval between readings (ms)

  // 📊 Motion Analysis
  analysis: {
    movementIntensity: number; // Overall movement level
    gravitationalAlignment: number; // How aligned with gravity
    rotationalActivity: number; // Amount of rotation detected

    // 🎯 Bot Detection Signals
    botIndicators: {
      zeroMotion: boolean; // No motion detected at all
      perfectStillness: boolean; // Unnaturally still
      impossibleValues: boolean; // Values outside physical limits
      constantValues: boolean; // Values never change
    };

    // 👤 Human Behavior Indicators
    humanIndicators: {
      naturalTremors: boolean; // Micro-movements detected
      gravitationalResponse: boolean; // Responds to gravity changes
      variableMotion: boolean; // Motion patterns vary naturally
      contextualMovement: boolean; // Movement matches interaction
    };
  };

  // 🔍 Device Characteristics
  device: {
    accelerometerAccuracy: number; // Sensor accuracy level
    gyroscopeAccuracy: number; // Gyroscope precision
    magnetometerPresent: boolean; // Magnetometer available
    sensorFusion: boolean; // Multiple sensors combined
  };
}
```

---

## 🔍 Advanced Motion Analysis

### 📈 Pattern Recognition

```typescript
interface MotionPatterns {
  // Walking/movement patterns
  walkingDetected: boolean; // Rhythmic movement suggesting walking
  stillnessDetected: boolean; // Extended periods of no movement
  interactionMovement: boolean; // Movement correlating with touch events

  // Environmental factors
  transportation: {
    vehicleMotion: boolean; // Smooth, consistent acceleration
    publicTransport: boolean; // Stop-start motion patterns
    walking: boolean; // Rhythmic up-down motion
  };

  // Usage patterns
  devicePosition: {
    handheld: boolean; // Typical handheld motion patterns
    onTable: boolean; // Stable, minimal movement
    inPocket: boolean; // Muffled, restricted movement
  };
}
```

### 🚨 Fraud Detection

```typescript
interface FraudIndicators {
  // Emulator detection
  emulatorSignals: {
    noSensorData: boolean; // Sensors not available
    staticSensorData: boolean; // Sensors return static values
    impossibleStability: boolean; // Too stable for real device
  };

  // Bot behavior
  automationSignals: {
    perfectStillness: boolean; // No natural micro-movements
    synchronizedMotion: boolean; // Motion synced with interactions
    unresponsiveToGravity: boolean; // Doesn't respond to orientation changes
  };

  // Device spoofing
  spoofingIndicators: {
    inconsistentSensors: boolean; // Sensor data doesn't align
    impossiblePhysics: boolean; // Values violate physics
    missingCorrelation: boolean; // Motion doesn't correlate with orientation
  };
}
```

---

## 📱 Mobile-Specific Considerations

### 🔒 Privacy and Permissions

- **Permission Required**: Device motion/orientation requires user permission on iOS 13+
- **Secure Context**: HTTPS required for sensor access
- **User Consent**: Explicit permission handling for privacy compliance

### ⚡ Performance Optimization

- **Event Throttling**: Limit sampling rate to prevent performance impact
- **Battery Awareness**: Reduce sampling when battery is low
- **Background Handling**: Pause collection when app is backgrounded

### 📊 Success Metrics

- **Fraud Detection Rate**: 95%+ bot/emulator detection accuracy
- **False Positive Rate**: <2% for legitimate mobile users
- **Coverage**: Works on 90%+ of mobile devices with sensors
- **Privacy Compliance**: Full GDPR/privacy regulation compliance
