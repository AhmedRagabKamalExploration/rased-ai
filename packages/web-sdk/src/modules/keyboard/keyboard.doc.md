# Keyboard Behaviour Module

## 🔬 The Research and "Why" Behind Keyboard Biometrics

**The core principle is that the rhythm and dynamics of a person's typing are a unique behavioral biometric, similar to a signature or gait. This module analyzes how a user types, not what they type, making it a powerful, privacy-safe tool for bot detection and user verification.**

## 🎹 Keystroke Dynamic Variations

Every user's typing pattern is influenced by muscle memory, typing proficiency, and even emotional state. Bots, in contrast, "type" with inhuman perfection.

### 🤖 Bot vs. Human Typing

#### 🤖 Bots

- **Programmatic Input**: Near-zero key press duration and perfectly consistent time between key presses
- **No Corrections**: They make no typos or corrections
- **Perfect Rhythm**: Unnaturally consistent timing patterns
- **No Hesitation**: Instant responses without human-like pauses

#### 👤 Humans

- **Natural Variations**: Exhibit natural variations in typing speed and rhythm
- **Error Correction**: They make typos and use the Backspace key, which is a very strong human signal
- **Muscle Memory**: Consistent patterns for familiar words/passwords
- **Emotional Influence**: Typing rhythm affected by stress, fatigue, or urgency

## 🔍 Key Metrics (The "How")

### ⏱️ Timing Measurements

- **Dwell Time (Press Duration)**: The time a key is held down (keyup timestamp - keydown timestamp). Humans have variable dwell times, while bots are often instantaneous
- **Flight Time (Transition Time)**: The time between releasing one key and pressing the next. This measures the speed and rhythm of typing
- **Typing Speed**: The overall characters per minute or second for a given input field
- **Special Key Usage**: The frequency of Backspace, Delete, Tab, or arrow key usage indicates a human correcting mistakes or navigating a form

### 🎯 Use Cases

This module is a cornerstone of bot detection on forms, especially for identifying:

- **Credential Stuffing Attacks**: Bots submit stolen credentials with perfect, rapid-fire keystrokes
- **Automated Account Creation**: Bots filling out registration forms can be easily spotted
- **User Authentication**: The way a user types their own password is a highly consistent personal signature

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface KeyboardEvent {
  eventId: string; // Unique identifier
  eventType: "behaviour.keyboard.summary" | "behaviour.keyboard.realtime";
  moduleName: "KeyboardBehaviourModule";
  timestamp: string; // ISO timestamp
  payload: KeyboardAnalysis;
}
```

---

## ⌨️ Data Structures

### ✅ Analysis Summary (`behaviour.keyboard.summary`)

```typescript
interface KeyboardAnalysis {
  // 🎯 Target Element
  target: {
    tag: string; // "INPUT", "TEXTAREA", "CONTENTEDITABLE"
    id?: string; // Element ID if available
    name?: string; // Element name attribute
    type?: string; // Input type (password, email, text, etc.)
    fieldPurpose?: string; // Detected purpose (username, password, search)
  };

  // 📈 Aggregate Metrics
  metrics: {
    totalKeyPresses: number; // Total keys pressed
    totalKeyReleases: number; // Total keys released
    typingDuration: number; // Total time from first keydown to last keyup (ms)
    activeTypingTime: number; // Time actually spent typing (excluding pauses)

    // ⏱️ Timing Analysis
    avgDwellTime: number; // Average key press duration in ms
    medianDwellTime: number; // Median dwell time for stability
    dwellTimeVariance: number; // Variance in dwell times
    minDwellTime: number; // Shortest key press
    maxDwellTime: number; // Longest key press

    avgFlightTime: number; // Average time between key presses
    medianFlightTime: number; // Median flight time
    flightTimeVariance: number; // Variance in flight times
    minFlightTime: number; // Shortest transition time
    maxFlightTime: number; // Longest transition time

    // 📊 Speed Metrics
    typingSpeed: number; // Characters per second
    typingSpeedWPM: number; // Words per minute
    burstTypingSpeed: number; // Peak typing speed
    pauseFrequency: number; // Pauses per minute
    avgPauseDuration: number; // Average pause length
  };

  // ⚙️ Special Key Usage
  specialKeys: {
    backspaceCount: number; // Backspace key presses
    deleteCount: number; // Delete key presses
    tabCount: number; // Tab key presses
    arrowKeyCount: number; // Arrow key navigation
    enterCount: number; // Enter/Return key presses
    escapeCount: number; // Escape key presses
    spaceCount: number; // Spacebar presses
    shiftCount: number; // Shift key usage
    ctrlCount: number; // Control key combinations
    altCount: number; // Alt key combinations
  };

  // 🔤 Character Analysis
  characters: {
    totalCharacters: number; // Total characters typed
    alphaCount: number; // Alphabetic characters
    numericCount: number; // Numeric characters
    symbolCount: number; // Special symbols
    uppercaseCount: number; // Uppercase letters
    lowercaseCount: number; // Lowercase letters

    // 📝 Input Patterns
    corrections: number; // Backspace/delete followed by retyping
    repeatedCharacters: number; // Same character typed multiple times
    consecutiveDeletes: number; // Multiple deletes in sequence
    typoPattern: boolean; // Detected typing errors and corrections
  };

  // 🎯 Behavioral Indicators
  behavior: {
    // 👤 Human-like patterns
    humanIndicators: {
      naturalRhythm: boolean; // Natural typing rhythm detected
      errorCorrection: boolean; // Makes and corrects mistakes
      variableTiming: boolean; // Timing varies naturally
      pausesForThought: boolean; // Natural hesitation patterns
      muscleMemory: boolean; // Consistent patterns for common words
    };

    // 🤖 Bot-like patterns
    botIndicators: {
      perfectTiming: boolean; // Unnaturally consistent timing
      zeroErrors: boolean; // No mistakes or corrections
      impossibleSpeed: boolean; // Faster than humanly possible
      mechanicalRhythm: boolean; // Robotic timing patterns
      instantSubmission: boolean; // Immediate form submission
    };

    // 📊 Statistical Analysis
    consistency: {
      dwellTimeConsistency: number; // 0-1 consistency score
      flightTimeConsistency: number; // 0-1 consistency score
      rhythmStability: number; // How stable the typing rhythm is
      biometricConfidence: number; // Confidence in user identity
    };
  };

  // 🔍 Advanced Analysis
  advanced: {
    // 🎼 Rhythm Analysis
    rhythm: {
      primaryCadence: number; // Dominant typing rhythm (BPM)
      rhythmVariability: number; // How much rhythm varies
      polyrhythmic: boolean; // Multiple rhythm patterns detected
      staccato: boolean; // Short, sharp keystrokes
      legato: boolean; // Smooth, connected typing
    };

    // 🧠 Cognitive Load Indicators
    cognitiveLoad: {
      hesitationPoints: number; // Points where user paused to think
      reformulations: number; // Text deleted and rewritten
      uncertaintyMarkers: number; // Patterns suggesting uncertainty
      confidenceLevel: number; // 0-1 typing confidence score
    };

    // 🔐 Security Insights
    security: {
      passwordTypingPattern: boolean; // Detected password-like typing
      credentialStuffing: boolean; // Suggests automated credential entry
      formFillingBot: boolean; // Automated form filling detected
      humanVerificationScore: number; // 0-1 human likelihood score
    };
  };
}
```

---

## 🔍 Advanced Keystroke Analysis

### 🎼 Rhythm Pattern Recognition

```typescript
interface TypingRhythm {
  // Musical-like analysis of typing patterns
  tempo: number; // Overall typing tempo (BPM equivalent)
  timeSignature: string; // Dominant rhythm pattern
  syncopation: boolean; // Irregular rhythm variations

  // Pattern analysis
  commonBigrams: Array<{ pair: string; avgTiming: number }>; // Common letter pairs
  commonTrigrams: Array<{ triplet: string; avgTiming: number }>; // Common three-letter combinations
  wordBoundaryTiming: number; // Timing at word boundaries

  // Expertise indicators
  touchTypingDetected: boolean; // Touch typing vs hunt-and-peck
  typingProficiency: "beginner" | "intermediate" | "advanced" | "expert";
  fingerMovementEfficiency: number; // How efficiently fingers move
}
```

### 🧬 Biometric Authentication

```typescript
interface KeystrokeBiometrics {
  // User identification through typing patterns
  biometricTemplate: {
    dwellTimeProfile: number[]; // Characteristic dwell time distribution
    flightTimeProfile: number[]; // Characteristic flight time distribution
    rhythmSignature: number[]; // Unique rhythm fingerprint
    errorPatternSignature: string[]; // Typical error patterns
  };

  // Authentication metrics
  authentication: {
    enrollmentQuality: number; // Quality of biometric enrollment
    matchScore: number; // How well current typing matches template
    falseAcceptanceRate: number; // Estimated FAR
    falseRejectionRate: number; // Estimated FRR
    authenticityConfidence: number; // Overall authentication confidence
  };

  // Continuous authentication
  continuous: {
    slidingWindowScore: number; // Real-time authentication score
    anomalyDetected: boolean; // Unusual typing pattern detected
    stressIndicators: boolean; // Signs of stress affecting typing
    fatigueIndicators: boolean; // Signs of fatigue in typing pattern
  };
}
```

---

## 🛡️ Security Applications

### 🚨 Fraud Detection

```typescript
interface FraudDetectionSignals {
  // Credential stuffing detection
  credentialStuffing: {
    suspiciousSpeed: boolean; // Too fast for human typing
    perfectAccuracy: boolean; // No errors or corrections
    roboticTiming: boolean; // Mechanical timing patterns
    massiveScale: boolean; // Many attempts with similar patterns
  };

  // Account takeover prevention
  accountTakeover: {
    typingMismatch: boolean; // Doesn't match account owner's pattern
    deviceMismatch: boolean; // Different device typing characteristics
    locationMismatch: boolean; // Geographic inconsistency
    behaviorChange: boolean; // Sudden change in typing behavior
  };

  // Form automation detection
  formAutomation: {
    instantFilling: boolean; // Form filled too quickly
    perfectTabOrder: boolean; // Perfect navigation between fields
    noHesitation: boolean; // No natural pauses or corrections
    clipboardDetected: boolean; // Data pasted rather than typed
  };
}
```

### 🔐 Privacy Protection

```typescript
interface PrivacyMeasures {
  // Data protection
  dataProtection: {
    keystrokeContent: "never_stored"; // Actual keystrokes never recorded
    timingOnly: boolean; // Only timing data collected
    hashedPatterns: boolean; // Patterns stored as hashes
    anonymizedData: boolean; // No personal identification possible
  };

  // Compliance
  compliance: {
    gdprCompliant: boolean; // GDPR data protection compliance
    ccpaCompliant: boolean; // CCPA privacy compliance
    userConsent: boolean; // Explicit user consent obtained
    dataRetention: number; // Data retention period (days)
  };
}
```

---

## 📈 Performance and Integration

### ⚡ Performance Optimization

- **Event Throttling**: Intelligent sampling to reduce CPU overhead
- **Memory Efficiency**: Circular buffers for continuous monitoring
- **Background Processing**: Non-blocking analysis algorithms
- **Real-time Analysis**: < 10ms processing time per keystroke

### 🎛️ Configuration Options

```typescript
interface KeyboardAnalysisConfig {
  enableRealTimeAnalysis: boolean; // Default: true
  enableBiometricTemplating: boolean; // Default: false
  enableAdvancedRhythmAnalysis: boolean; // Default: true

  // Privacy controls
  respectPrivacySettings: boolean; // Default: true
  anonymizeData: boolean; // Default: true
  dataRetentionDays: number; // Default: 30

  // Performance settings
  samplingRate: number; // Default: 100 (all keystrokes)
  analysisDepth: "basic" | "standard" | "advanced"; // Default: "standard"
  enableContinuousAuth: boolean; // Default: false
}
```

### 📊 Success Metrics

- **Bot Detection Accuracy**: 98%+ detection rate for automated typing
- **False Positive Rate**: <1% for legitimate human users
- **Response Time**: <5ms keystroke processing latency
- **Privacy Compliance**: 100% GDPR/privacy regulation compliance
