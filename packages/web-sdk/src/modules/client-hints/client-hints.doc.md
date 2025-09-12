# Client Hints Module

## 🔬 The Research and "Why" Behind Client Hints

The core idea behind Client Hints is to provide a more privacy-preserving and structured alternative to the monolithic User-Agent string. For anti-fraud and fingerprinting purposes, Client Hints offer a more reliable and extensible set of data points about the user's device, browser, and network. This data is harder to spoof than the User-Agent string and provides a stronger signal for identifying devices.

## 💡 How Client Hints Work

Client Hints are a collection of HTTP request headers and a JavaScript API (`navigator.userAgentData`) that allow a server to request specific, low-entropy information from a browser. High-entropy information, which is more useful for fingerprinting but more sensitive, requires explicit user consent or a specific API call.

## 🕵️ Anti-Fraud and Bot Detection

- **Low Entropy Hints**: These include basic browser brand, platform (OS), and whether the device is mobile. This data is available by default and is a good starting point for a fingerprint.

- **High Entropy Hints**: To get more detailed information, such as the full OS version, device model, or CPU architecture, the SDK must explicitly request it using the asynchronous `getHighEntropyValues()` method. This data is highly valuable for fingerprinting because it's difficult for an attacker to make all the pieces consistent across a spoofed environment. For example, a bot might try to claim it's a Chrome browser on macOS but might fail to provide a consistent CPU architecture or OS version, a key indicator of spoofing.

- **Network Data**: Client Hints can also expose network-related data like the connection type (4g), round-trip time (rtt), and downlink speed. Anomalies in this data can reveal that a user is behind a high-speed VPN or a server with an unnaturally fast connection, which is common for bots.

## 🧩 Data Consolidation

This module's strength lies in its ability to collect multiple types of hints and consolidate them into a single payload. The combination of data from `navigator.userAgentData` and `navigator.connection` creates a rich profile that is highly effective for anti-fraud analysis.

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface ClientHintsEvent {
  eventId: string;
  eventType: "clientHints" | "clientHints.error";
  moduleName: "clientHints";
  timestamp: string;
  payload: ClientHintsData | ClientHintsError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`clientHints`)

```typescript
interface ClientHintsData {
  cpuArch: string; // The device's CPU architecture
  chOsVersion: string; // The full OS version
  chConnection: string; // The effective connection type
  chBitness: string; // The OS bitness (e.g., "64")
  chOs: string; // The OS name (e.g., "macOS", "Windows")
  chModel: string; // The device model
  chMobile: boolean; // Whether the device is a mobile device
  chRtt: number; // The round-trip time of the connection
  chDownlink: number; // The downlink speed
  chFullVersionList: string; // Detailed version list of the browser brands
  chWow64: number; // Whether the browser is running in WOW64 mode (Windows-specific)
  chMobileNullable: number; // An integer representation of the mobile status
  chSaveData: number; // A flag for data-saver mode
  timestamp: number;
}
```

#### ❌ Error Response (`clientHints.error`)

```typescript
interface ClientHintsError {
  error: string;
  errorCode: "UNSUPPORTED_API" | "COLLECTION_FAILED";
  details: {
    message: string;
  };
}
```
