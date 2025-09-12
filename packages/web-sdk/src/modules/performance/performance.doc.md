# Performance Monitoring Module

## 🔬 The Research and "Why" Behind Performance Metrics

The core idea behind performance monitoring for security is that human behavior in a browser, and the device running it, creates unique and predictable performance patterns. Deviations from these patterns can be a strong indicator of non-human activity, such as bots or headless browsers.

## 📊 Performance Metrics as a Behavioral Signal

Performance metrics provide a passive and powerful way to fingerprint a device and detect anomalies.

## 🤖 Bots & Automated Scripts

- **Unnaturally Fast Load Times**: Bots, especially those running on powerful servers with optimized network connections, can have extremely fast page load and resource loading times that are physically impossible for a human using a standard internet connection.

- **Consistent Timings**: A human user's interaction times and page loading speeds will have natural variance due to network latency, background processes, and physical interaction. A bot, however, might perform tasks with millisecond-perfect consistency.

- **No Layout Shifts or Long Tasks**: A bot designed for a specific task may never trigger performance events like layout shifts or long tasks that are common in human-driven browsing sessions.

## 👤 Legitimate Users

- **Variable Performance**: Human users show natural variance in performance data. A video might lag, a script might take a moment to execute, or a resource might load slowly. These small, real-world imperfections are a strong signal of human presence.

- **Long Tasks & Layout Shifts**: Events like reflowing the page layout or a long-running JavaScript task are normal occurrences for a real user and are predictable within a certain range.

## 🎛️ Implementation Strategy

The module uses two primary browser APIs to collect a comprehensive set of performance data: the performance.timing API and the PerformanceObserver API. This dual approach provides a complete picture of the user's experience.

### 💻 performance.timing API

This API provides a historical timeline of a page load, from when the user navigated to the page to when the last resources were loaded. Key metrics include:

- **navigationStart**: The timestamp of the page navigation.
- **loadEventEnd**: The timestamp when the page's load event finishes.

The difference between these two points gives us the total page load time.

### 📈 PerformanceObserver API (Best Practice)

This is a modern, non-blocking API that allows for real-time monitoring of performance events. It's an improvement over the older timing APIs because it's asynchronous and doesn't clutter the main thread. It's used to detect:

- **longtask**: Scripts or operations that block the main thread for over 50 milliseconds.
- **layout-shift**: Unexpected changes in a web page's layout.
- **paint**: The time it takes for the browser to render content.

## 📋 Data Structures

### 🏗️ Event Structure

```typescript
interface PerformanceEvent {
  eventId: string; // Unique identifier
  eventType:
    | "perf"
    | "longTasks"
    | "layoutShifts"
    | "paintTiming"
    | "perf.error";
  moduleName: "perf";
  timestamp: string; // ISO timestamp
  payload: PerformanceData | PerformanceError;
}
```

### ✅ Successful Generation (`perf`)

```typescript
interface PerformanceData {
  pageLoadMs: number; // Total page load time in milliseconds
  timestamp: number;

  navigationTiming: {
    navigationStart: number;
    loadEventEnd: number;
    // ... many more timing properties
  };

  resourceTiming: {
    totalResources: number;
    totalSize: number;
    averageLoadTime: number;
    slowestResource: {
      duration: number;
      name: string;
    };
    resourceTypes: {
      script: number;
      stylesheet: number;
      image: number;
      font: number;
      document: number;
      other: number;
    };
  };

  memoryUsage?: {
    // Optional, not supported in all browsers
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };

  connectionInfo?: {
    // Optional, not supported in all browsers
    effectiveType: "2g" | "3g" | "4g";
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}
```

### ❌ Error Response (`perf.error`)

```typescript
interface PerformanceError {
  error: string; // The error message
  errorCode: "UNSUPPORTED_API" | "COLLECTION_FAILED";
  details: {
    unsupportedAPIs: string[]; // List of APIs that failed to load
    message: string;
  };
}
```
