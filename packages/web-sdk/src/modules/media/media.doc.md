Media Module
🔬 The Research and "Why" Behind Media Fingerprinting
The core idea behind media fingerprinting is to identify the unique combination of audio and video devices (microphones, speakers, webcams) present on a user's machine. This hardware-level signature is a powerful component of a comprehensive device fingerprint, providing a strong signal for distinguishing between human and non-human activity.

🎤 Media Devices as a Signal
The presence, type, and number of media devices on a system are a set of highly stable and unique attributes that are difficult for a fraudster or bot to spoof convincingly.

🕵️ Anti-Fraud and Bot Detection
Device Enumeration: By using the navigator.mediaDevices.enumerateDevices() API, the module can retrieve a list of all connected media devices. The unique combination of these devices is a key differentiator.

Hardware Discrepancies: Bots and headless browsers often run in virtualized environments where no real media hardware is present. The module can easily detect this by checking if there are zero audio or video devices.

Generic vs. Real Devices: If a bot attempts to simulate media devices, it will often use generic labels that can be flagged as suspicious. A real user's device, however, is likely to report a mix of brand-specific or system-level device labels.

🔐 Privacy and Permissions
Privacy-Safe: The module is designed to be privacy-safe. It only enumerates the devices but does not attempt to access or record audio or video. The process does not trigger a permissions pop-up for the user.

Obscured Labels: The browser's own security model ensures that device labels (device.label) are obfuscated (e.g., "Microphone 1") until the user has granted permission to access a device via getUserMedia(). The number of devices is still a usable signal.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface MediaEvent {
eventId: string;
eventType: "media" | "media.error";
moduleName: "media";
timestamp: string;
payload: MediaData | MediaError;
}

📋 Data Structures
✅ Successful Generation (media)
interface MediaDevice {
id: string; // The device's unique ID
kind: "audioinput" | "audiooutput" | "videoinput";
isCustomLabel: boolean; // Flag if the label is generic
label: string; // The device label (may be generic if no permission)
}

interface MediaData {
audioInput: MediaDevice[];
audioOutput: MediaDevice[];
videoInput: MediaDevice[];
hasMicrophone: boolean;
hasSpeakers: boolean;
hasWebcam: boolean;
timestamp: number;
}

❌ Error Response (media.error)
interface MediaError {
error: string;
errorCode: "MEDIA_API_UNSUPPORTED" | "ENUMERATION_FAILED";
details: {
message: string;
};
}
