Page Monitoring Module
🔬 The Research and "Why" Behind Page Monitoring
The core idea behind page monitoring is to track the duration of a user's session on a specific page. This metric, known as pageTime, serves as a crucial signal for analyzing user engagement and detecting behavioral anomalies associated with bots and fraudulent activity.

⏱️ Page Time as a Signal
A user's time on a page is a passive yet powerful indicator of their browsing behavior. This data point is highly effective when correlated with other signals like mouse movements and keyboard events.

🕵️ Anti-Fraud and Bot Detection
Time-on-Page Anomalies: Bots are programmed to navigate at machine speed. They often exhibit an unnaturally short pageTime, sometimes completing a task in milliseconds. This is a major red flag for an anti-fraud system.

Human-like Variation: Real users demonstrate a natural variance in pageTime. They read content, think, and interact with the page at a pace that is far more unpredictable than a bot's.

Session Duration: Monitoring pageTime over the course of a session can reveal patterns. A consistent, unchanging pageTime across multiple pages could indicate a bot is simply loading a series of pages without real interaction.

🎛️ Implementation Strategy
The module's implementation is straightforward and highly efficient.

Start Time Capture: The module captures the Date.now() timestamp at the moment the module is initialized.

Event-Based Reporting: A beforeunload event listener is attached to the window. When the user leaves the page, this event is triggered, and the total pageTime (the difference between the initial timestamp and the current time) is calculated and dispatched.

Regular Snapshots: In addition to the final pageTime, the module can periodically dispatch events to provide snapshots of the user's time on the page. This is useful for long-running sessions.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface PageMonitoringEvent {
eventId: string;
eventType: "pageMonitoring" | "pageMonitoring.error";
moduleName: "pageMonitoring";
timestamp: string;
payload: PageMonitoringData | PageMonitoringError;
}

📋 Data Structures
✅ Successful Generation (pageMonitoring)
interface PageMonitoringData {
pageTime: number; // The duration on the page in milliseconds
timestamp: number;
}

❌ Error Response (pageMonitoring.error)
interface PageMonitoringError {
error: string;
errorCode: "COLLECTION_FAILED" | "UNEXPECTED_ERROR";
details: {
message: string;
};
}
