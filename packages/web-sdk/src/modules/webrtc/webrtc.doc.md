# 💧 IP Leak Detection Module (WebRTC)

## 🔬 The Research and "Why" Behind WebRTC IP Leaks

The core concept is that the WebRTC (Web Real-Time Communication) API, designed for peer-to-peer communication like video chat, can unintentionally reveal a user's true local and public IP addresses, even when they are using a VPN or proxy. This discrepancy is a high-confidence signal of identity masking.

## 🌐 How the "Leak" Works

To establish a direct connection between two browsers (peers), WebRTC needs to bypass firewalls and Network Address Translation (NAT). It does this using a mechanism called ICE (Interactive Connectivity Establishment), which involves STUN (Session Traversal Utilities for NAT) servers.

### The Process

1. **The Goal**: Your browser needs to know all of its possible network addresses to share with a peer.
2. **The Process**: It sends a request to a public STUN server (like Google's).
3. **The Response**: The STUN server replies, "Here is the public IP address I see you connecting from."
4. **The Discovery**: During this process, the browser also discovers its own local network IP address (e.g., 192.168.1.100).
5. **The "Leak"**: JavaScript can trigger this ICE discovery process. The list of discovered IP addresses (called "ICE candidates") can then be read. If a user is behind a VPN, this process can reveal the IP address assigned by their real Internet Service Provider, completely bypassing the VPN's tunnel for this specific API call.

## 🛡️ The Anti-Fraud Power: Unmasking VPNs

The true value comes from comparing the results of this module with the results from your IPLookupModule.

- **IPLookupModule (Server-Side View)**: Sees the IP address of the VPN server.
- **WebRTCIPModule (Client-Side Leak)**: Sees the user's real public IP address from their ISP.

If these two public IP addresses do not match, you have an extremely strong signal that the user is actively trying to hide their location.

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface WebRTCIPEvent {
  eventId: string;
  eventType: "context.webrtc.ips" | "context.webrtc.error";
  moduleName: "WebRTCIPModule";
  timestamp: string;
  payload: WebRTCFingerprint | WebRTCError;
}
```

### 💻 Data Structures

#### ✅ Successful Generation (context.webrtc.ips)

```typescript
interface WebRTCFingerprint {
  supported: true;
  timedOut?: boolean;
  // The list of unique IP addresses discovered
  candidates: {
    publicIPs: {
      ipv4: string[];
      ipv6: string[];
    };
    localIPs: string[];
  };
  // Raw candidate strings for deeper analysis
  rawCandidates: string[];
}
```

#### ❌ Error Response (context.webrtc.error)

```typescript
interface WebRTCError {
  supported: false;
  error: string; // e.g., "WebRTC API not supported", "Discovery timed out"
}
```

## 📈 Privacy and Performance

### 🔒 Privacy Considerations

- **No Connection Made**: This module only performs the IP discovery phase. No actual peer-to-peer connection is established, and no media (camera/mic) is ever accessed.

- **Browser Mitigation**: Modern browsers, especially Firefox and Brave, have implemented features to mitigate this leak by obfuscating the local IP address (often returning an mDNS .local address instead). The absence of a "classic" local IP is itself a signal of a privacy-conscious browser.

### ⚡ Performance Optimization

- **Asynchronous & Lightweight**: The entire process runs asynchronously and typically completes in under 200ms. It has minimal impact on performance.

- **Timeout**: A timeout is implemented to ensure the module doesn't hang indefinitely if the STUN servers are unreachable or the process fails.

---

## 📤 Output/Send Events to Backend

### 🚀 Event Transmission Format

The WebRTC module sends events to the backend in the following structure:

```typescript
// Individual event sent to backend
interface WebRTCBackendEvent {
  eventType: "context.webrtc.ips" | "context.webrtc.error";
  payload: WebRTCFingerprint | WebRTCError;
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
    webrtc: WebRTCBackendEvent[]; // Array of WebRTC events
    // ... other module events
  };
}
```

### 🎯 Expected Backend Properties

The backend expects and stores the following properties for WebRTC events:

#### Database Schema (events table)

```sql
{
  "id": "unique-event-id",
  "transaction_id": "txn-xxx",
  "organization_id": "org-xxx",
  "session_id": "ssn-xxx",
  "device_id": "device-xxx",
  "batch_id": "batch-xxx",
  "event_type": "context.webrtc.ips", // or "context.webrtc.error"
  "payload": {
    "supported": boolean,
    "timedOut": boolean,
    "candidates": {
      "publicIPs": { "ipv4": string[], "ipv6": string[] },
      "localIPs": string[]
    },
    "rawCandidates": string[]
  },
  "received_at": "2024-01-15T12:00:00.000Z"
}
```

#### Successful IP Discovery Event

```json
{
  "eventType": "context.webrtc.ips",
  "payload": {
    "supported": true,
    "timedOut": false,
    "candidates": {
      "publicIPs": {
        "ipv4": ["203.0.113.45"],
        "ipv6": ["2001:db8::1"]
      },
      "localIPs": ["192.168.1.100", "10.0.0.5"]
    },
    "rawCandidates": [
      "candidate:1 1 UDP 2113667326 203.0.113.45 54400 typ host",
      "candidate:2 1 UDP 1694498814 192.168.1.100 54401 typ host",
      "candidate:3 1 UDP 1694498815 10.0.0.5 54402 typ host"
    ]
  },
  "timestamp": 1642248000000
}
```

#### Error Event

```json
{
  "eventType": "context.webrtc.error",
  "payload": {
    "supported": false,
    "error": "WebRTC API not supported in this browser"
  },
  "timestamp": 1642248000000
}
```

#### Timeout Event

```json
{
  "eventType": "context.webrtc.ips",
  "payload": {
    "supported": true,
    "timedOut": true,
    "candidates": {
      "publicIPs": {
        "ipv4": [],
        "ipv6": []
      },
      "localIPs": []
    },
    "rawCandidates": []
  },
  "timestamp": 1642248000000
}
```

### 🔄 Event Processing Flow

1. **Collection**: Module initiates WebRTC IP discovery process
2. **Discovery**: STUN server queries to discover IP addresses
3. **Analysis**: IP addresses categorized as public vs local
4. **Event Creation**: Creates event with proper structure and timestamp
5. **Batching**: Event added to current batch with other module events
6. **Transmission**: Batch sent to backend via `POST /v1/event`
7. **Storage**: Backend stores individual events in database
8. **Analysis**: Events can be queried and analyzed for VPN/proxy detection

### 📊 Backend Event Validation

The backend validates incoming WebRTC events against these requirements:

- ✅ `eventType` must be "context.webrtc.ips" or "context.webrtc.error"
- ✅ `payload.supported` must be boolean
- ✅ `payload.candidates` must contain publicIPs and localIPs objects
- ✅ `payload.publicIPs` must contain ipv4 and ipv6 arrays
- ✅ `payload.localIPs` must be string array
- ✅ `payload.rawCandidates` must be string array
- ✅ `timestamp` must be valid Unix timestamp
- ✅ IP addresses must be valid IPv4 or IPv6 format
