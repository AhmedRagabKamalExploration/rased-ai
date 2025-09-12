# Timezone Module

## 🔬 The Research and "Why" Behind Timezone Detection

The core idea behind timezone fingerprinting is that a user's local timezone settings, when combined with their IP address and other location data, can be used to verify their true geographic location. Inconsistencies between these data points are a strong signal that a user may be using a proxy, VPN, or attempting to spoof their location to evade detection.

## 🌍 Timezone as a Signal

A user's timezone is a piece of information that is relatively stable for a real user but can be easily manipulated in a fraudulent context.

## 🕵️ Anti-Fraud and Bot Detection

- **Location Verification**: A key purpose of this module is to cross-validate location data. For example, if a user's IP address points to New York, but their timezone is set to Tokyo, this is a clear red flag for an anti-fraud system.

- **Bot Behavior**: Bots often operate from servers in different geographic locations than the user they are impersonating. A bot might also run on a server with a default timezone that doesn't match the location it's trying to spoof.

- **Spoofing**: Attackers may use browser extensions or other tools to change their reported location. The timezone offset is another data point that must be changed to convincingly spoof a new location.

## 👥 User Behavior

- **Daylight Saving Time**: The `isDaylightSavingsTime` property helps in accurately determining the local time and validating the timezone against the current date. It can also reveal inconsistencies if the user has a manually set time that doesn't respect DST.

- **Timezone Offset**: The `timezoneOffset` value, representing the difference in minutes from UTC, is a precise and reliable indicator of the user's timezone.

## 🎛️ Implementation Strategy

The module uses the standard `Intl.DateTimeFormat` API and the `Date` object to accurately collect timezone data. This approach is reliable across modern browsers and provides the necessary information without relying on external services.

- **Timezone Offset**: The `getTimezoneOffset()` method of the `Date` object provides the difference, in minutes, from the user's local time to UTC.

- **Daylight Saving Time**: By comparing the timezone offset of a date during a known period of standard time with a date during a known period of daylight saving time, the module can reliably determine if the user's timezone observes DST.

- **Data Structuring**: The collected data is organized into a simple payload with a boolean for DST and the numerical offset, mirroring the structure of your data.

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface TimezoneEvent {
  eventId: string;
  eventType: "timezone" | "timezone.error";
  moduleName: "timezone";
  timestamp: string;
  payload: TimezoneData | TimezoneError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`timezone`)

```typescript
interface TimezoneData {
  isDaylightSavingsTime: boolean;
  timezoneOffset: number;
  timestamp: number;
}
```

#### ❌ Error Response (`timezone.error`)

```typescript
interface TimezoneError {
  error: string;
  errorCode: "TIMEZONE_COLLECTION_FAILED" | "UNEXPECTED_ERROR";
  details: {
    message: string;
  };
}
```
