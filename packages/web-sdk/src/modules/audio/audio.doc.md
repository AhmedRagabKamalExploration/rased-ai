# Audio Fingerprinting Module

## 🔬 The Research and "Why" Behind Advanced Audio Fingerprinting

**The core idea is that the digital signal processing (DSP) algorithms implemented in browsers and their underlying operating systems are not perfectly standardized. When you ask a device to generate a specific sound wave, the final result is influenced by:**

## 🎵 Audio Stack Variations

### 🔧 Hardware Level

- **Sound Cards**: The specific sound card or integrated audio chipset
- **Audio Processors**: Different manufacturers (Realtek, Creative, Intel) have unique DSP implementations
- **Digital-to-Analog Converters**: Hardware DACs introduce subtle variations in signal processing
- **Amplifier Circuits**: Internal amplification stages affect signal characteristics

### 💾 Software Stack

- **Drivers**: The software that allows the OS to communicate with the audio hardware
- **Operating System**: The OS's own audio processing libraries and mixers
- **Audio Frameworks**: DirectSound (Windows), Core Audio (macOS), ALSA/PulseAudio (Linux)
- **Browser Implementation**: The specific version of the Web Audio API in Chrome, Firefox, or Safari, and its own internal optimizations

## 🎛️ Advanced Implementation Strategy

**An advanced implementation leverages this by creating a more complex audio signal that passes through several processing stages. This amplifies the subtle differences between devices.**

### 🎼 Simple Method

- **Basic Approach**: A basic approach might use just one `OscillatorNode`
- **Output Characteristics**: The output is still unique, but the variations might be small
- **Limited Entropy**: Single-stage processing provides minimal differentiation

### 🎚️ Advanced Method (Best Practice)

**We create a chain of audio nodes. A common and effective chain is:**

1. **`OscillatorNode`**: Generates the initial sound wave
2. **`DynamicsCompressorNode`**: Applies audio compression. The specific algorithms and floating-point calculations for this are complex and vary slightly between systems, making it a great source of entropy
3. **`BiquadFilterNode`**: Applies a filter, adding another layer of DSP that can differ

**By passing a signal through this chain and analyzing the final output, we get a much richer and more unique signature of the entire audio stack.**

### 🔇 Silent Processing

**Crucially, this entire process is done silently and almost instantaneously using an `OfflineAudioContext`, which processes the audio without ever sending it to the speakers.**

---

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface AudioEvent {
  eventId: string; // Unique identifier
  eventType: "audio" | "audio.error";
  moduleName: "audio";
  timestamp: string; // ISO timestamp
  payload: AudioFingerprint | AudioError;
}
```

---

## 🎵 Data Structures

### ✅ Successful Generation (`audio`)

```typescript
interface AudioFingerprint {
  supported: true;
  fingerprint: string; // SHA-256 hash of audio signature

  // 🎛️ Audio Context Properties
  context: {
    sampleRate: number; // 44100, 48000, etc.
    baseLatency: number; // Audio system latency
    outputLatency: number; // Output buffer latency
    maxChannelCount: number; // Maximum supported channels
    numberOfInputs: number; // Input channel count
    numberOfOutputs: number; // Output channel count
    destination: {
      channelCount: number; // Destination channel count
      channelCountMode: string; // "max", "clamped-max", "explicit"
      channelInterpretation: string; // "speakers", "discrete"
    };
  };

  // 🔊 Audio Processing Chain
  processing: {
    oscillator: {
      type: string; // "triangle", "sine", "square", "sawtooth"
      frequency: number; // 10000 Hz (standard test frequency)
      detune: number; // Frequency detuning in cents
    };

    compressor: {
      threshold: number; // -50 dB (compression threshold)
      knee: number; // 40 dB (knee width)
      ratio: number; // 12:1 (compression ratio)
      attack: number; // 0 seconds (attack time)
      release: number; // 0.25 seconds (release time)
      reduction: number; // Actual gain reduction applied
    };

    filter?: {
      type: string; // "lowpass", "highpass", "bandpass", etc.
      frequency: number; // Filter cutoff frequency
      Q: number; // Filter quality factor
      gain: number; // Filter gain
    };
  };

  // 📈 Signal Analysis
  analysis: {
    bufferLength: number; // Total samples processed
    signalSum: number; // Sum of absolute sample values
    peakAmplitude: number; // Maximum sample value
    rmsLevel: number; // Root mean square level
    dynamicRange: number; // Difference between peak and minimum

    // 📊 Frequency Domain Analysis
    spectralCentroid: number; // Weighted mean of frequencies
    spectralRolloff: number; // Frequency below which 85% of energy lies
    zeroCrossingRate: number; // Rate of signal sign changes

    // 🎯 DSP Characteristics
    processingTime: number; // Time to render audio buffer
    floatingPointPrecision: number; // Detected FP precision differences
    quantizationNoise: number; // Digital quantization artifacts
    harmonicDistortion: number; // Total harmonic distortion
  };

  // 🔍 Hardware Fingerprints
  hardware: {
    audioDriverVersion: string; // Detected driver version
    dspCapabilities: string[]; // Supported DSP features
    latencyClass: "low" | "medium" | "high"; // System latency category
    bufferSizes: number[]; // Supported buffer sizes
    bitDepth: number; // Audio bit depth (16, 24, 32)
    audioCodecs: string[]; // Supported audio codecs
  };

  // 🌍 Browser Environment
  environment: {
    webAudioVersion: string; // Web Audio API version
    audioContextType: string; // "AudioContext" | "webkitAudioContext"
    offlineSupport: boolean; // OfflineAudioContext availability
    realtimeAnalyser: boolean; // AnalyserNode support
    spatialAudio: boolean; // 3D audio support

    // 🎚️ Audio Features
    features: {
      dynamicsCompressor: boolean;
      biquadFilter: boolean;
      convolver: boolean;
      delayNode: boolean;
      gainNode: boolean;
      oscillatorNode: boolean;
      pannerNode: boolean;
      scriptProcessor: boolean;
      waveShaperNode: boolean;
      audioWorklet: boolean; // Modern audio processing
    };
  };

  // 📊 Entropy Metrics
  entropy: {
    totalBits: number; // Estimated entropy bits
    uniquenessScore: number; // 0-1 fingerprint uniqueness
    stabilityScore: number; // 0-1 same-device consistency

    componentEntropy: {
      oscillatorVariance: number; // Oscillator implementation differences
      compressionVariance: number; // Compressor algorithm differences
      filterVariance: number; // Filter implementation differences
      systemLatency: number; // Timing-based entropy
    };
  };
}
```

### ❌ Error Response (`audio.error`)

```typescript
interface AudioError {
  error: string; // "Web Audio API not supported."
  errorCode:
    | "AUDIO_NOT_SUPPORTED"
    | "CONTEXT_CREATION_FAILED"
    | "PROCESSING_FAILED";
  details: {
    audioContextSupport: boolean; // AudioContext availability
    offlineContextSupport: boolean; // OfflineAudioContext availability
    webkitFallback: boolean; // webkit prefix needed
    securityRestrictions: string[]; // Browser security blocks
  };
  fallbackData?: {
    userAgent: string; // Browser identification
    basicAudioSupport: boolean; // HTML5 audio support
    mimeTypes: string[]; // Supported audio MIME types
  };
}
```

---

## 🧮 Advanced Audio Processing

### 🎼 Multi-Stage Audio Chain

#### 🌊 Oscillator Configuration

```typescript
interface OscillatorConfig {
  waveform: "triangle" | "sine" | "square" | "sawtooth";
  frequency: number; // 10000 Hz for optimal entropy
  duration: number; // 1 second processing time

  // Advanced parameters
  frequencyModulation: {
    enabled: boolean;
    modulationFreq: number; // FM frequency
    modulationDepth: number; // FM depth
  };

  customWaveform?: {
    real: Float32Array; // Real FFT coefficients
    imag: Float32Array; // Imaginary FFT coefficients
  };
}
```

#### 🎚️ Dynamics Compressor Analysis

```typescript
interface CompressionAnalysis {
  inputLevel: number; // Pre-compression signal level
  outputLevel: number; // Post-compression signal level
  gainReduction: number; // Applied gain reduction

  // Algorithm-specific variations
  attackCurve: number[]; // Attack envelope shape
  releaseCurve: number[]; // Release envelope shape
  compressionRatio: number; // Actual vs. target ratio

  // System-specific characteristics
  lookAheadDelay: number; // Compressor lookahead time
  sidechainFiltering: boolean; // Sidechain filter presence
  kneeImplementation: string; // "hard" | "soft" | "variable"
}
```

#### 🔊 Filter Response Analysis

```typescript
interface FilterAnalysis {
  filterType: string; // Filter topology
  actualCutoff: number; // Measured cutoff frequency
  rolloffRate: number; // dB per octave
  phaseResponse: number[]; // Phase shift across frequencies

  // Implementation variations
  filterOrder: number; // Number of poles/zeros
  topology: string; // "IIR" | "FIR" | "analog-modeled"
  coefficients: number[]; // Filter coefficients
  groupDelay: number; // Filter group delay
}
```

---

## 🔐 Anti-Spoofing and Detection

### 🚨 Spoofing Detection

```typescript
interface SpoofingIndicators {
  // Static response detection
  identicalResults: boolean; // Always same output
  perfectlyLinear: boolean; // Too mathematically perfect
  missingNoise: boolean; // No system noise/variations

  // Timing anomalies
  impossibleSpeed: boolean; // Too fast processing
  constantTiming: boolean; // Always same render time

  // Hardware inconsistencies
  unrealisticPrecision: boolean; // Too many decimal places
  impossibleFeatures: boolean; // Feature combinations don't exist
  contradictoryMetrics: boolean; // Conflicting measurements
}
```

### 🛡️ Countermeasures

- **Multiple Test Signals**: Different waveforms and frequencies
- **Temporal Analysis**: Processing time variations
- **Cross-Validation**: Verify results against known hardware patterns
- **Dynamic Parameters**: Randomize test parameters per session

---

## 📈 Privacy and Performance

### 🔒 Privacy Considerations

- **Silent Processing**: No audio ever reaches speakers
- **No Recording**: Only mathematical analysis, no audio storage
- **Temporary Buffers**: Audio data destroyed after processing
- **Anonymous Hashing**: Raw audio never transmitted

### ⚡ Performance Optimization

```typescript
interface PerformanceConfig {
  bufferSize: number; // Default: 44100 samples (1 second)
  sampleRate: number; // Default: 44100 Hz
  channels: number; // Default: 1 (mono)
  processingTimeout: number; // Default: 3000ms

  // Quality vs. Speed tradeoffs
  analysisDepth: "basic" | "standard" | "comprehensive";
  enableSpectralAnalysis: boolean; // Default: true
  enableHarmonicAnalysis: boolean; // Default: false (expensive)
}
```

### 📊 Success Metrics

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The audio module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface AudioBackendEvent {
  eventType: ""fingerprint.audio" | "audio.error"";
  payload: AudioFingerprint | AudioError;
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
    audio: AudioBackendEvent[]; // Array of audio events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for audio events:

#### Database Schema (events table)
```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx", 
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "fingerprint.audio", // or other audio event types
  "payload": {
    /* audio specific data structure */
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Audio Event Example
```json
{
  "eventType": "fingerprint.audio",
  "payload": {
    /* Example payload data */
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module collects audio data during initialization
2. **Analysis**: Advanced analysis performed on collected data
3. **Event Creation**: Creates event with proper structure and timestamp
4. **Batching**: Event added to current batch with other module events
5. **Transmission**: Batch sent to backend via `POST /v1/event`
6. **Storage**: Backend stores individual events in database
7. **Analysis**: Events can be queried and analyzed for fraud detection

### 📊 Backend Event Validation

The backend validates incoming audio events against these requirements:

- ✅ `eventType` must be valid audio event type
- ✅ `payload` must contain required fields based on event type
- ✅ `timestamp` must be valid Unix timestamp
- ✅ All required fields must be present and valid
- ✅ Data types must match expected schema


- **Browser Support**: >95% in modern browsers
- **Processing Speed**: <200ms typical execution
- **Fingerprint Stability**: 99.9% same-device consistency
- **Uniqueness Rate**: 99.8% device discrimination
- **Error Rate**: <1% processing failures

---

## 🎯 Integration Guidelines

### 🔧 Configuration Options

```typescript
interface AudioFingerprintConfig {
  enableProcessing: boolean; // Default: true
  chainComplexity: "simple" | "standard" | "advanced"; // Default: "standard"

  // Audio chain configuration
  oscillatorType: "triangle" | "sine" | "square"; // Default: "triangle"
  enableCompression: boolean; // Default: true
  enableFiltering: boolean; // Default: false

  // Analysis options
  enableSpectralAnalysis: boolean; // Default: false (performance)
  enableEntropyCalculation: boolean; // Default: true

  // Privacy settings
  hashOutput: boolean; // Default: true
  anonymizeMetrics: boolean; // Default: true
  respectDoNotTrack: boolean; // Default: true
}
```

### 🔍 Quality Assurance

```typescript
interface QualityMetrics {
  processingReliability: number; // 0-1 success rate
  fingerprintStability: number; // 0-1 same-device consistency
  crossPlatformVariance: number; // 0-1 different-platform detection
  antiSpoofingEffectiveness: number; // 0-1 spoofing resistance

  // Performance benchmarks
  averageProcessingTime: number; // Milliseconds
  memoryUsage: number; // Peak memory consumption
  cpuUtilization: number; // Processing overhead
}
```
