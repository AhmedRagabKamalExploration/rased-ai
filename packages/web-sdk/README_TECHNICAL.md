# Web SDK Technical Overview

## 🚀 Quick Start

The Web SDK is a comprehensive behavioral analytics and fraud detection solution built on a manager-based architecture. It provides secure, scalable data collection through 38 specialized modules managed by 10 core managers.

### Installation & Basic Usage

```typescript
import { WebSDK } from "./web-SDK";

// Initialize SDK
const sdk = WebSDK.getInstance();

// Configure and start
await sdk.start({
  organizationId: "org-123",
  sessionId: "session-456",
  transactionId: "txn-789",
  baseApiUrl: "https://api.example.com",
});

// SDK automatically collects data from all 38 modules
```

---

## 🏗️ Architecture Summary

### Core Components

| Component             | Purpose                  | Key Features                                |
| --------------------- | ------------------------ | ------------------------------------------- |
| **WebSDK**            | Main orchestrator        | Singleton pattern, lifecycle management     |
| **ConfigManager**     | Configuration management | Validation, triggers, immutable config      |
| **IdentityManager**   | Device identification    | Fingerprinting, persistence, validation     |
| **SessionManager**    | Session lifecycle        | Timeout handling, state management          |
| **ModuleManager**     | Module coordination      | 38 modules, dependency injection            |
| **Collector**         | Data collection          | Batching, retry logic, memory efficient     |
| **APIManager**        | Backend communication    | RESTful API, authentication, error handling |
| **MetadataManager**   | Metadata management      | Sanitization, validation, batch export      |
| **TokenManager**      | Token management         | Nonce generation, validation, rotation      |
| **EncryptionManager** | Data security            | 4-layer encryption, key rotation            |
| **EventManager**      | Event coordination       | Centralized events, cleanup, debugging      |

### Data Flow

```
User Interaction → Modules → EventManager → Collector → APIManager → Backend
                                    ↓
                            EncryptionManager ← TokenManager ← MetadataManager
```

---

## 📊 Module Categories

### Behavioral Analysis (12 modules)

- **MouseBehaviourModule**: Trajectory analysis, click patterns
- **KeyboardModule**: Keystroke dynamics, typing patterns
- **TouchModule**: Touch gestures, multi-touch interactions
- **GesturesModule**: Complex gesture recognition
- **PointerModule**: Pointer events, precision tracking
- **PageMonitoringModule**: Page interactions, navigation
- **VisibilityChangeModule**: Tab focus, attention tracking
- **SkipToContentModule**: Accessibility interactions
- **FrameRateModule**: Rendering performance
- **DeviceOrientationModule**: Orientation changes
- **ScreenOrientationModule**: Screen orientation
- **AutomationDetectionModule**: Bot detection

### Device Fingerprinting (15 modules)

- **BrowserModule**: Browser identification, capabilities
- **DeviceModule**: Hardware information, GPU data
- **CanvasModule**: Canvas rendering fingerprinting
- **WebGLModule**: WebGL context, capabilities
- **AudioModule**: Audio context fingerprinting
- **FontModule**: Font detection, rendering
- **ScreenModule**: Screen properties, characteristics
- **PluginsModule**: Browser plugin detection
- **BrowserTypeModule**: Browser type identification
- **BrowserFeaturesModule**: Feature detection
- **BrowserSpeechModule**: Speech synthesis
- **ClientHintsModule**: Client hints, capabilities
- **MathModule**: Mathematical fingerprinting
- **TrueIdModule**: Advanced device identification
- **BindingModule**: JavaScript binding detection

### Context & Environment (8 modules)

- **NetworkModule**: Network connection info
- **TimezoneModule**: Timezone detection
- **TimezoneAndLanguageModule**: Regional analysis
- **MediaModule**: Media device capabilities
- **ReferrerUrlModule**: Traffic source analysis
- **PrivateBrowserModule**: Private browsing detection
- **MalwareModule**: Security threat detection
- **TeamViewerFontModule**: Remote desktop detection

### Detection & Analysis (3 modules)

- **AdblockModule**: Ad blocker detection
- **PerformanceModule**: Performance metrics
- **WebRTCIPModule**: IP leak detection

---

## 🔐 Security Architecture

### Multi-Layer Encryption

1. **Primary**: XOR encryption with rotating keys
2. **Secondary**: Base64 encoding with obfuscation
3. **Tertiary**: Custom character shifting
4. **Quaternary**: Hex obfuscation layer

### Token Management

- **Nonce Tokens**: 5-minute lifespan for request security
- **Session Tokens**: 1-hour lifespan for session management
- **Auth Tokens**: 1-hour lifespan for API authentication
- **Refresh Tokens**: 24-hour lifespan for token renewal

### Data Protection

- All data encrypted before transmission
- Metadata sanitization removes sensitive information
- Secure token storage and automatic cleanup
- Automatic key rotation every 5 minutes

---

## 🚀 Performance Features

### Memory Management

- Singleton pattern reduces memory usage
- Automatic event listener cleanup
- Efficient batch processing
- Garbage collection optimization

### Network Optimization

- Intelligent batching reduces network calls
- Data compression before transmission
- Connection pooling and reuse
- Retry logic with exponential backoff

### CPU Optimization

- Asynchronous processing prevents blocking
- Debounced collection prevents excessive CPU usage
- Background processing for heavy operations
- Optimized algorithms for data processing

---

## 📡 API Integration

### Backend Endpoints

- `POST /v1/event`: Event ingestion with token rotation
- `GET /v1/config`: SDK configuration generation
- `GET /v1/token/{hash}`: Token validation and generation

### Event Structure

```typescript
interface EventBatch {
  deviceId: string;
  batchId: string;
  batchTimestamp: string;
  modules: {
    [moduleName: string]: Array<{
      eventType: string;
      payload: any;
      timestamp: number;
    }>;
  };
}
```

### Database Schema

```sql
events {
  id: string (primary key)
  transaction_id: string (foreign key)
  organization_id: string (foreign key)
  session_id: string
  device_id: string
  batch_id: string
  event_type: string
  payload: jsonb
  received_at: timestamp
}
```

---

## 🛠️ Development Guide

### Adding New Modules

1. **Extend BaseModule**:

```typescript
export class NewModule extends BaseModule {
  public readonly moduleName: string = "new-module";

  public init(): void {
    // Module initialization logic
    this.eventManager.dispatch(this.moduleName, "event-type", data);
  }
}
```

2. **Register Module**:

```typescript
// Add to src/modules/index.ts
export const featureModules = [
  // ... existing modules
  NewModule,
];
```

3. **Document Module**:

- Create `new-module.doc.md` with comprehensive documentation
- Include output/send events section
- Document data structures and use cases

### Manager Integration

```typescript
// Access managers in modules
export class CustomModule extends BaseModule {
  private metadataManager = MetadataManager.getInstance();
  private tokenManager = TokenManager.getInstance();

  public init(): void {
    // Use managers for enhanced functionality
    const metadata = this.metadataManager.getMetadata();
    const nonce = this.tokenManager.generateNonce("session");
  }
}
```

---

## 🔍 Troubleshooting

### Common Issues

**SDK Initialization Failed**

```typescript
// Check configuration validity
const config = {
  organizationId: "valid-org-id",
  sessionId: "valid-session-id",
  transactionId: "valid-transaction-id",
  baseApiUrl: "https://valid-api-url.com",
};
```

**Module Not Collecting Data**

```typescript
// Enable debug mode
localStorage.setItem("websdk-debug", "true");

// Check module status
sdk.on("module:initialized", (moduleName) => {
  console.log(`Module ${moduleName} initialized`);
});
```

**Data Not Being Sent**

```typescript
// Check collector and API manager status
const collector = sdk.getCollector();
const apiManager = sdk.getAPIManager();
console.log("Status:", collector.getStatus(), apiManager.getStatus());
```

### Debug Mode

```typescript
// Enable comprehensive logging
localStorage.setItem("websdk-debug", "true");

// Monitor performance metrics
const metrics = sdk.getPerformanceMetrics();
console.log("Memory:", metrics.memoryUsage);
console.log("Events:", metrics.eventCount);
console.log("API Calls:", metrics.apiCalls);
```

---

## 📚 Documentation Structure

- **TECHNICAL_DOCUMENTATION.md**: Comprehensive technical reference
- **IMPLEMENTATION_SUMMARY.md**: Implementation details and architecture
- **src/modules/\*/module.doc.md**: Individual module documentation (38 files)
- **README_TECHNICAL.md**: This overview document

### Key Documentation Files

| File                          | Purpose                      | Content                                                  |
| ----------------------------- | ---------------------------- | -------------------------------------------------------- |
| `TECHNICAL_DOCUMENTATION.md`  | Complete technical reference | Manager details, module overview, integration guide      |
| `IMPLEMENTATION_SUMMARY.md`   | Implementation architecture  | Manager classes, security features, usage examples       |
| `src/modules/*/module.doc.md` | Module-specific docs         | Research background, data structures, output events      |
| `README_TECHNICAL.md`         | Quick reference              | Architecture summary, module categories, troubleshooting |

---

## 🎯 Use Cases

### Fraud Detection

- Bot and automation detection
- Device fingerprinting for identity verification
- Behavioral analysis for user authentication
- Network analysis for VPN/proxy detection

### User Analytics

- Interaction pattern analysis
- Performance monitoring
- Accessibility compliance tracking
- User experience optimization

### Security Analysis

- Malware and threat detection
- Privacy tool detection
- Remote access identification
- Security compliance monitoring

---

## 🔄 Version Information

- **Current Version**: 1.0.0
- **TypeScript**: Full type safety
- **Browser Support**: Modern browsers with fallbacks
- **Dependencies**: Minimal external dependencies
- **Bundle Size**: Optimized for production use

---

## 📞 Support

For technical support, implementation questions, or feature requests:

1. **Documentation**: Refer to `TECHNICAL_DOCUMENTATION.md` for comprehensive details
2. **Module Docs**: Check individual module documentation files
3. **Debug Mode**: Enable debug logging for troubleshooting
4. **Performance**: Monitor metrics and optimize as needed

The Web SDK provides a robust, secure, and performant solution for behavioral analytics and fraud detection, with comprehensive documentation and support for easy integration and maintenance.
