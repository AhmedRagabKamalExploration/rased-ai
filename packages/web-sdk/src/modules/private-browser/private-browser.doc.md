Private Browser Module
🔬 The Research and "Why" Behind Private Browser Detection
The core idea behind detecting private browsing mode is to identify subtle differences in how browsers behave when operating in a privacy-focused state. While private modes are designed to prevent local data storage, they often do so by enforcing unique restrictions or behaviors that are not present in a normal browsing session. Detecting these anomalies is a key signal for anti-fraud systems.

🕵️ Private Browsing as a Signal
The detection of private browsing mode is not about violating a user's privacy but rather about understanding the context of their session. This information, when combined with other data points, can be a powerful tool for fraud detection.

🚩 Anti-Fraud and Bot Detection
Ephemerality: Private browsing sessions are designed to be ephemeral. This means that a user's local storage, history, and cache are cleared after the session. From a security perspective, this is similar to a user who consistently clears their browser data. A high rate of "new" users from the same device (as detected by other fingerprinting modules) could be a signal of this behavior.

Bot Behavior: Automated scripts and bots often operate in private or headless modes. The ability to detect this state can help distinguish between a real human user and an automated script.

Suspicious Activity: Some fraudulent activities, such as card testing or account hijacking, are performed in private browsing mode to prevent a digital trail from being left behind. Detecting this mode on sensitive pages can be a red flag.

🎛️ Implementation Strategy
The module's implementation is based on a series of non-intrusive tests that check for the tell-tale signs of private browsing mode. Since different browsers implement private mode in different ways, a robust solution must use multiple detection methods.

localStorage Write Test: A common method is to attempt to write to localStorage and sessionStorage. In some older browsers in private mode, this operation would fail, or the data would not persist.

Quota Limitation: Some browsers, like Safari, may set a very low storage quota for localStorage in private mode. By attempting to write a large amount of data and checking for a QuotaExceededError, the module can detect this behavior.

IndexedDB Test: The IndexedDB API is another reliable target. By attempting to open and interact with an IndexedDB database and checking for failures, the module can detect private browsing mode in some browsers.

The module combines these checks to provide a single, consistent signal.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface PrivateBrowserEvent {
eventId: string;
eventType: "isPrivateBrowser" | "privateBrowser.error";
moduleName: "isPrivateBrowser";
timestamp: string;
payload: PrivateBrowserData | PrivateBrowserError;
}

📋 Data Structures
✅ Successful Generation (isPrivateBrowser)
interface PrivateBrowserData {
isPrivateBrowser: boolean;
detectionMethod: number; // A number indicating which test succeeded
timestamp: number;
}

❌ Error Response (privateBrowser.error)
interface PrivateBrowserError {
error: string;
errorCode: "DETECTION_FAILED" | "UNEXPECTED_ERROR";
details: {
message: string;
};
}

How isPrivateBrowser Works
The isPrivateBrowser functionality in the obfuscated JavaScript file implements private browsing detection using multiple detection methods. Here's how it works:
Detection Methods Used:
File System API Check (Method 1)
Uses webkitRequestFileSystem to attempt creating a file system
In private mode, this throws a DOMException with code 1 or 10
If the exception is caught, it indicates private browsing mode
localStorage Quota Check (Method 2)
Attempts to write to localStorage and then remove the item
In private mode (especially Safari), this throws a QuotaExceededError
This is particularly effective for Safari's private browsing mode
IndexedDB Check (Method 3)
Attempts to open an IndexedDB database named "test-db"
In private mode, IndexedDB operations are restricted and will fail
If the database operation fails, it indicates private browsing mode
