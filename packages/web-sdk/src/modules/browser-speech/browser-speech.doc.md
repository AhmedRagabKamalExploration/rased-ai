Browser Speech Module
🔬 The Research and "Why" Behind Browser Speech Fingerprinting
The core idea behind browser speech fingerprinting is that the specific Text-to-Speech (TTS) voices and their underlying synthesis engines are not standardized across different browser and operating system combinations. This unique collection of available voices provides a high-entropy data point for creating a reliable device fingerprint.

🗣️ Voice Properties as a Signal
The list of available voices, including their names, languages, and whether they are marked as a default, is a unique characteristic of a user's environment. This data is stable over time for a given device but varies significantly across different systems.

🕵️ Anti-Fraud and Bot Detection
Uniqueness: The combination of voices available on a system creates a highly unique signature. For example, a Mac will have "Alex" and "Victoria," while a Windows machine will have "David" and "Zira." This makes the list of voices a powerful tool for distinguishing between devices.

Bot Detection: Headless browsers or virtualized environments often lack a complete or standard set of TTS voices. A bot may report a generic list or no voices at all, which is a strong signal of a non-human user.

Spoofing Detection: If a fraudster attempts to spoof a specific device or browser, they would need to ensure that their reported voice list matches that of a genuine device. This is difficult to do consistently across all data points, making it a valuable tool for detecting inconsistencies.

🎛️ Implementation Strategy
The module's implementation is based on the SpeechSynthesis.getVoices() method of the Web Speech API. This method asynchronously retrieves a list of all available SpeechSynthesisVoice objects.

Voice Enumeration: The module calls speechSynthesis.getVoices() to get a list of all available voices.

Data Extraction: For each voice, it extracts key properties like name, lang, and default.

String Concatenation: These properties are combined into a single, deterministic string.

Hash Generation: The final string is then hashed using SHA-256 to create a compact, secure, and privacy-preserving fingerprint. This is the value that is sent to the backend.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface BrowserSpeechEvent {
eventId: string;
eventType: "browserSpeech" | "browserSpeech.error";
moduleName: "browserSpeech";
timestamp: string;
payload: BrowserSpeechData | BrowserSpeechError;
}

📋 Data Structures
✅ Successful Generation (browserSpeech)
interface BrowserSpeechData {
hash: string; // SHA-256 hash of the concatenated voice data
timestamp: number;
}

❌ Error Response (browserSpeech.error)
interface BrowserSpeechError {
error: string;
errorCode: "SPEECH_API_UNSUPPORTED" | "COLLECTION_FAILED";
details: {
message: string;
};
}
