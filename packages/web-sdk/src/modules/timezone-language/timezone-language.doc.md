🌍 Timezone and Language Module
🔬 The Research and "Why" Behind Timezone/Language Analysis
This module collects basic localization settings from the browser. Its value comes from cross-referencing this data with the user's IP-based location. A significant mismatch between the two is a classic and very strong indicator of a user attempting to obscure their identity.

🕵️ Fraud Detection Scenarios
Proxy/VPN Usage: A user with an IP address in Germany, a browser language of Vietnamese, and a timezone of "America/Los_Angeles" is highly likely to be using a proxy or VPN to mask their true location.

Account Takeover: If a known US-based user's account suddenly has activity from the same IP but with a different browser language, it could signal an account takeover by a fraudster in another country.

📊 Technical Implementation and Data Indicators
🏗️ Event Structure
interface LocalizationEventPayload {
eventType: "context.localization";
moduleName: "TimezoneAndLanguageModule";
payload: LocalizationData;
}

🌐 Data Structures
interface LocalizationData {
timezone: string; // e.g., "America/New_York"
language: string; // e.g., "en-US"
languages: string[]; // e.g., ["en-US", "en"]
}
