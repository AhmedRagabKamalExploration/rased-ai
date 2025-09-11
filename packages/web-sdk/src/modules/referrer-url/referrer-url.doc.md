Referrer URL Module
🔬 The Research and "Why" Behind Referrer URL Collection
The core idea behind collecting the referrer URL is to understand the origin of a user's visit. This single data point provides invaluable context about how a user arrived at your site, which is a critical signal for analyzing user behavior, detecting anomalies, and identifying fraudulent activity.

🔗 Referrer as a Signal
The referrer URL is a highly reliable and non-intrusive way to gather information about a user's browsing journey.

🕵️ Anti-Fraud and Bot Detection
Source Consistency: A user's referrer should be logically consistent with their navigation path. For example, a user arriving at a checkout page from a product page is a normal path. A user arriving directly at a checkout page from a malicious domain is a red flag.

Direct Traffic: A user with no referrer URL often indicates direct traffic, which is a common behavior. However, it can also be a sign of a bot that is designed to clear its referrer header to hide its origin.

Click-Jacking: In a click-jacking attack, a legitimate site is embedded in a malicious iframe. The referrer URL of the malicious site is a key signal that can help detect this attack.

Behavioral Analysis: By analyzing patterns of referrer URLs, an anti-fraud system can build a model of normal user behavior and flag deviations.

🎛️ Implementation Strategy
The module's implementation is straightforward and relies on the browser's built-in document.referrer property.

Data Collection: The module simply reads the document.referrer property.

Data Dispatch: The collected URL is then dispatched as a single event, allowing the backend to analyze it in conjunction with other data points.

Handling No-Referrer: The module is designed to handle cases where there is no referrer URL (e.g., direct traffic, new tab, or a browser setting that blocks it).

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface ReferrerUrlEvent {
eventId: string;
eventType: "referrerUrl" | "referrerUrl.error";
moduleName: "referrerUrl";
timestamp: string;
payload: ReferrerUrlData | ReferrerUrlError;
}

📋 Data Structures
✅ Successful Generation (referrerUrl)
interface ReferrerUrlData {
referrerUrl: string; // The full URL of the referring page
timestamp: number;
}

❌ Error Response (referrerUrl.error)
interface ReferrerUrlError {
error: string;
errorCode: "COLLECTION_FAILED" | "UNEXPECTED_ERROR";
details: {
message: string;
};
}
