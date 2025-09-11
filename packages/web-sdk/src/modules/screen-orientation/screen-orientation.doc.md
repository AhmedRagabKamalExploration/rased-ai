Screen Orientation Module
🔬 The Research and "Why" Behind Screen Orientation Detection
The core idea behind screen orientation detection is to capture the orientation of the user's screen, which provides a valuable, real-time signal for understanding device type and user behavior. This is particularly relevant for mobile and tablet devices, where screen rotation is a natural part of the user experience.

🔄 Orientation as a Signal
The screen orientation data, which includes the orientation type and angle, is a non-intrusive way to gather information that can help build a strong device fingerprint and detect anomalies.

🕵️ Anti-Fraud and Bot Detection
Device Fingerprinting: The default orientation and the ability to change it are unique characteristics of a device and its operating system. A mobile device fingerprint will include dynamic orientation changes, whereas a desktop device will typically be static.

Behavioral Analysis: By monitoring orientation changes, an anti-fraud system can build a behavioral profile of a user. A session with multiple orientation changes is a strong signal of a human user on a mobile device.

Bot Detection: Bots and headless browsers often run in a static, predefined orientation. A session that reports no orientation changes on a device that is expected to have them (e.g., a simulated mobile device) can be a red flag.

Spoofing Detection: An attacker trying to spoof a mobile device would need to accurately simulate these orientation changes to appear legitimate. A mismatch between the reported orientation and other device data could expose the spoofing attempt.

🎛️ Implementation Strategy
The module's implementation relies on the browser's screen.orientation API.

Initial Collection: The module captures the initial orientation data immediately upon initialization.

Event Listening: It then sets up an event listener for the orientationchange event.

Real-time Updates: Whenever the screen orientation changes, the listener is triggered, and a new event is dispatched with the updated data.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface ScreenOrientationEvent {
eventId: string;
eventType: "screenOrientation" | "screenOrientation.error";
moduleName: "screenOrientation";
timestamp: string;
payload: ScreenOrientationData | ScreenOrientationError;
}

📋 Data Structures
✅ Successful Generation (screenOrientation)
interface ScreenOrientationData {
type: "landscape-primary" | "landscape-secondary" | "portrait-primary" | "portrait-secondary";
angle: number; // The angle of the screen rotation (0, 90, 180, 270)
timestamp: number;
}

❌ Error Response (screenOrientation.error)
interface ScreenOrientationError {
error: string;
errorCode: "UNSUPPORTED_API" | "COLLECTION_FAILED";
details: {
message: string;
};
}
