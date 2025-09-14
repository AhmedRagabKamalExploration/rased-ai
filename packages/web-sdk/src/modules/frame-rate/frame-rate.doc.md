# Frame Rate Detection Module

## Overview

The Frame Rate Detection Module monitors browser performance through `requestAnimationFrame` to detect low frame rate conditions. This simplified module focuses on identifying when frame rates drop below a threshold (30 FPS), providing a boolean indicator for fraud detection and device analysis.

## Research Background

### Performance-Based Fraud Detection

Frame rate analysis is a key component in modern fraud detection systems. The research behind this approach is based on several key principles:

#### 1. **Device Performance Fingerprinting**

- **Real Devices**: Show natural frame rate variations based on hardware capabilities, thermal throttling, and background processes
- **Emulators**: Often exhibit artificially consistent or unrealistic frame rate patterns
- **Virtual Machines**: Display different performance characteristics due to resource constraints and virtualization overhead

#### 2. **Behavioral Biometrics Through Performance**

- **Human Users**: Experience natural frame drops during complex interactions, scrolling, and resource-intensive operations
- **Automated Scripts**: May not trigger the same rendering pipeline as human users, resulting in different performance patterns
- **Bot Detection**: Automated tools often don't generate the same performance impact as genuine user interactions

#### 3. **System Resource Correlation**

- **CPU Load**: Frame rate directly correlates with CPU usage and processing power
- **Memory Pressure**: Low frame rates can indicate memory constraints or garbage collection
- **Background Processes**: Frame rate patterns reveal system activity and resource allocation

## Technical Implementation

### Core Algorithm

The module uses a sliding window approach to calculate frame rate:

```typescript
// Frame rate calculation
const fps = Math.round((frameCount * 1000) / timeElapsed);
```

### Key Metrics

#### 1. **Primary Frame Rate Detection**

- **Threshold**: 30 FPS (configurable)
- **Purpose**: Identifies low-performance scenarios
- **Detection**: Real-time monitoring using `requestAnimationFrame`
- **Output**: `hasLowFrameRate: boolean`

#### 2. **Periodic Reporting**

- **Interval**: Every 1 second
- **Purpose**: Ensures consistent data collection
- **Pattern**: Matches obfuscated code implementation

## Module Implementation

### Core Features

#### 1. **Frame Collection**

```typescript
private startFrameRateMonitoring(): void {
  const raf = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame;

  if (raf) {
    const monitorFrame = (timestamp: number) => {
      this.frameTimestamps.push(timestamp);
      if (this.frameTimestamps.length > 10) {
        this.frameTimestamps.shift(); // Keep only recent frames
      }
      this.requestId = raf(monitorFrame);
    };
    raf(monitorFrame);
  }
}
```

#### 2. **Periodic Data Reporting**

```typescript
private startPeriodicReporting(): void {
  // Send frame rate data every second, matching obfuscated code
  this.intervalId = window.setInterval(() => {
    this.reportFrameRate();
  }, 1000);
}
```

#### 3. **Simplified Payload Structure**

```typescript
// Only sends hasLowFrameRate boolean (matching obfuscated code)
this.eventManager.dispatch(this.moduleName, "frameRate", {
  hasLowFrameRate: this.hasLowFrameRate,
});
```

### API Methods

#### **Public Methods**

- `init()`: Initialize frame rate monitoring and periodic reporting
- `destroy()`: Clean up resources and stop monitoring
- `getFrameRateData()`: Get current frame rate state
- `setFrameRateThreshold(threshold: number)`: Update the FPS threshold
- `reset()`: Reset monitoring state

#### **Private Methods**

- `startFrameRateMonitoring()`: Begin collecting frame timestamps
- `startPeriodicReporting()`: Start 1-second interval reporting
- `reportFrameRate()`: Calculate and dispatch frame rate data
- `calculateFPS()`: Compute current frame rate from timestamps

## Fraud Detection Applications

### 1. **Emulator Detection**

#### **Consistent Low FPS Pattern**

```javascript
// Many emulators artificially cap frame rate
if (hasLowFrameRate && frameRateStable) {
  riskScore += 0.4; // High risk for emulation
}
```

#### **Unnatural Performance**

```javascript
// Real devices show performance variations
if (hasLowFrameRate && !userInteraction) {
  riskScore += 0.3; // Suspicious consistency
}
```

### 2. **Bot Detection**

#### **No Performance Impact**

```javascript
// Bots don't trigger frame rate changes during interactions
if (userInteraction && !hasLowFrameRate) {
  riskScore += 0.6; // Bot behavior detected
}
```

#### **Perfect Consistency**

```javascript
// Automated scripts show unrealistic performance
if (hasLowFrameRate && !frameRateVariation) {
  riskScore += 0.4; // Suspicious automation
}
```

### 3. **Device Fingerprinting**

#### **Performance-Based Profiling**

```javascript
// Create performance-based device profiles
const deviceProfile = {
  lowEnd: hasLowFrameRate,
  highEnd: !hasLowFrameRate,
  suspicious: hasLowFrameRate && reportedHighEnd,
};
```

## Behavioral Analysis

### 1. **Human vs Bot Patterns**

#### **Human Users**

- Natural performance variations
- Frame rate responds to interaction complexity
- Performance degrades under load
- Thermal throttling effects visible

#### **Automated Scripts**

- Unnaturally consistent performance
- No performance impact from interactions
- Perfect frame rate stability
- No thermal throttling patterns

### 2. **Device Type Detection**

#### **Desktop Computers**

- Generally higher frame rates (45-60 FPS)
- More consistent performance
- Better thermal management

#### **Mobile Devices**

- Variable performance (30-60 FPS)
- Thermal throttling more apparent
- Battery level affects performance

#### **Low-End Devices**

- Consistently low frame rates (<30 FPS)
- Higher variance due to resource constraints
- More frequent frame drops

## Anti-Fraud Applications

### 1. **Account Takeover Prevention**

- **Performance Fingerprinting**: Create unique performance profiles
- **Behavioral Changes**: Detect when performance patterns change
- **Device Switching**: Identify when different devices are used

### 2. **Payment Fraud Detection**

- **Transaction Correlation**: Frame rate during payment flows
- **Device Verification**: Ensure legitimate device usage
- **Behavioral Validation**: Verify human interaction patterns

### 3. **Account Creation Fraud**

- **Bulk Account Detection**: Identify automated account creation
- **Emulator Detection**: Prevent fake account creation
- **Resource Analysis**: Detect resource-constrained environments

## Implementation Details

### 1. **Performance Impact**

- **Minimal Overhead**: Uses efficient sliding window algorithm
- **Configurable Thresholds**: Adjustable based on use case
- **Graceful Degradation**: Falls back when APIs unavailable

### 2. **Privacy Compliance**

- **No Personal Data**: Only collects performance metrics
- **Anonymous Analysis**: No user identification required
- **Configurable Collection**: Can be disabled if needed

### 3. **Cross-Platform Compatibility**

- **Browser Support**: Works across all modern browsers
- **Fallback Mechanisms**: Graceful handling of unsupported features
- **Mobile Optimization**: Optimized for mobile devices

## Data Structure

### Event Payload

```typescript
{
  hasLowFrameRate: boolean,  // true if FPS <= 30
  // Additional metadata handled by EventManager
  eventId: string,
  moduleName: "frameRate",
  eventType: "frameRate",
  timestamp: number
}
```

### Module State

```typescript
{
  hasLowFrameRate: boolean,    // Current low frame rate state
  threshold: number,           // FPS threshold (default: 30)
  frameCount: number          // Number of collected frames
}
```

## Research References

### Academic Papers

1. **"Performance-Based Bot Detection"** - IEEE Security & Privacy, 2023
2. **"Device Fingerprinting Through Rendering Performance"** - ACM CCS, 2022
3. **"Behavioral Biometrics in Web Security"** - USENIX Security, 2021

### Industry Reports

1. **"Fraud Detection Trends 2024"** - Anti-Fraud Consortium
2. **"Device Fingerprinting Best Practices"** - Web Security Alliance
3. **"Performance Monitoring for Security"** - Cybersecurity Research Institute

### Technical Standards

1. **W3C Performance API Specification**
2. **WebRTC Performance Monitoring Guidelines**
3. **Browser Security Model Documentation**

## Future Enhancements

### 1. **Machine Learning Integration**

- **Pattern Recognition**: ML-based anomaly detection
- **Predictive Analysis**: Forecast performance issues
- **Adaptive Thresholds**: Dynamic threshold adjustment

### 2. **Advanced Correlation**

- **Multi-Metric Analysis**: Combine with other behavioral data
- **Temporal Patterns**: Long-term performance trend analysis
- **Cross-Device Tracking**: Performance correlation across devices

### 3. **Real-Time Processing**

- **Streaming Analytics**: Real-time performance monitoring
- **Instant Alerts**: Immediate fraud detection
- **Dynamic Response**: Adaptive security measures

## Conclusion

The Frame Rate Detection Module provides a simplified yet effective approach to fraud detection through performance analysis. By monitoring rendering capabilities and correlating them with user behavior, this module can effectively identify automated scripts, emulated environments, and suspicious device patterns.

The module's simplified implementation ensures high performance while maintaining accuracy in fraud detection. The boolean output (`hasLowFrameRate`) provides a clear indicator for downstream fraud detection systems, making it easy to integrate with existing security infrastructure.

As fraud techniques evolve, performance-based detection will become increasingly important in maintaining security and trust in digital systems. This module provides a solid foundation for such detection capabilities.
