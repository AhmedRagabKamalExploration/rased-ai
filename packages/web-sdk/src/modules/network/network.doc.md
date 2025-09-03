📶 Network Info Module
🔬 The Research and "Why" Behind Network Analysis
This module captures the characteristics of the user's internet connection. It provides valuable context for risk assessment and for detecting anomalous session changes.

🚨 Key Use Cases
Risk Scoring: Connections from cellular networks can sometimes be considered higher risk than stable broadband connections.

Session Anomaly Detection: If a user's session starts on a fast "wifi" connection and suddenly switches to a slow "3g" connection with high latency, it could be a flag for a session being hijacked or moved to a different environment.

Bot Detection: Some botnets may operate from servers with specific, recognizable network characteristics.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface NetworkEventPayload {
eventType: "context.network";
moduleName: "NetworkInfoModule";
payload: NetworkData;
}

📡 Data Structures
interface NetworkData {
isOnline: boolean;
connectionType?: 'bluetooth' | 'cellular' | 'ethernet' | 'wifi' | 'wimax' | 'other' | 'none' | 'unknown';
effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
roundTripTime?: number; // in ms
downlink?: number; // in Mbps
}
