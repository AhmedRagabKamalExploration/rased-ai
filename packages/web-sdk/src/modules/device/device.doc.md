Device Fingerprinting Module
🔬 The Research and "Why" Behind Advanced Device Fingerprinting
The core idea behind device fingerprinting is to collect a combination of hardware and software characteristics that, when aggregated, form a unique identifier for a device. This identifier is highly stable and difficult for a bot or malicious actor to spoof.

💻 Device Properties as a Signal
The data collected by this module provides fundamental details about the user's device and its environment. These data points are critical for several reasons:

🕵️ Anti-Fraud and Bot Detection
Consistency Checks: The data from this module can be cross-referenced with other modules, like the BrowserType or Screen modules. For example, a mismatch between the reported userAgent (e.g., "iPhone") and the hardwareConcurrency (e.g., 12 cores, typical of a high-end desktop) can be a strong signal of a spoofed or virtualized environment.

Headless Browser Detection: Headless browsers often report generic or inconsistent values for properties like gpuVendor or deviceMemory, which do not match real-world devices.

Hardware Uniqueness: The combination of gpuVendor, gpuModel, hardwareConcurrency, and deviceMemory is statistically unique to a very high degree, making it a reliable part of a stable device fingerprint.

🖼️ GPU Fingerprinting (WebGL)
A key part of this module is the collection of GPU data. Different graphics drivers and hardware report slightly different strings for their vendor and renderer names. This provides a high-entropy data point that is extremely difficult to forge without a real GPU.

🎛️ Implementation Strategy
The module uses a multi-faceted approach to collect data from various browser APIs. The data is collected once at initialization to create a snapshot of the device's capabilities.

System Information: The module uses navigator properties (hardwareConcurrency, language, languages, platform, userAgent) to gather basic system and browser details.

GPU Information: It uses a temporary, off-screen canvas element and the WebGL context to read the UNMASKED_VENDOR_WEBGL and UNMASKED_RENDERER_WEBGL strings. This is a standard and effective method for GPU fingerprinting.

Memory & Color: It retrieves properties like deviceMemory and window.matchMedia for colorGamut to get additional hardware details.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface DeviceEvent {
eventId: string;
eventType: "device" | "device.error";
moduleName: "device";
timestamp: string;
payload: DeviceData | DeviceError;
}

📋 Data Structures
✅ Successful Generation (device)
interface DeviceData {
hardwareConcurrency: number;
language: string;
languages: string[];
platform: string;
userAgent: string;
gpuVendor: string;
gpuModel: string;
colorGamut: string;
deviceMemory: number | undefined;
}

❌ Error Response (device.error)
interface DeviceError {
error: string;
errorCode: "UNSUPPORTED_API" | "GPU_INFO_FAILED" | "UNEXPECTED_ERROR";
details: {
message: string;
};
}
