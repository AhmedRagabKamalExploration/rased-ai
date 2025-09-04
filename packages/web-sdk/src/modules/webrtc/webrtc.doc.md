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
