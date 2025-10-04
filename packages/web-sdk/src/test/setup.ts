import { vi } from "vitest";

// Mock crypto.subtle and crypto.randomUUID for tests
Object.defineProperty(global, "crypto", {
  value: {
    subtle: {
      digest: vi.fn().mockImplementation(async (_algorithm, data) => {
        // Simple mock implementation that returns a predictable hash
        const text = new TextDecoder().decode(data);
        // Create a 32-byte array (SHA-256 size) with predictable content
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = (text.charCodeAt(i % text.length) + i) % 256;
        }
        return hash;
      }),
    },
    randomUUID: vi.fn().mockReturnValue("test-uuid-123"),
  },
  writable: true,
  configurable: true,
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock navigator for browser tests
const mockNavigator = {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  vendor: "Google Inc.",
  platform: "Win32",
  language: "en-US",
  languages: ["en-US", "en"],
  hardwareConcurrency: 8,
  cookieEnabled: true,
  doNotTrack: null,
  deviceMemory: 8,
  plugins: [
    { name: "Chrome PDF Plugin" },
    { name: "Chrome PDF Viewer" },
    { name: "Native Client" },
  ],
  connection: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
  },
};

// Make plugins writable and iterable
const mockPlugins = [
  { name: "Chrome PDF Plugin" },
  { name: "Chrome PDF Viewer" },
  { name: "Native Client" },
];

Object.defineProperty(mockNavigator, "plugins", {
  value: mockPlugins,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, "navigator", {
  value: mockNavigator,
  writable: true,
  configurable: true,
});

// Mock window for DOM tests
Object.defineProperty(global, "window", {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    location: {
      href: "https://example.com",
      hostname: "example.com",
      pathname: "/",
      search: "",
      hash: "",
    },
    screen: {
      width: 1920,
      height: 1080,
      colorDepth: 24,
      pixelDepth: 24,
      availWidth: 1920,
      availHeight: 1040,
      availLeft: 0,
      availTop: 0,
    },
    innerWidth: 1920,
    innerHeight: 1080,
    outerWidth: 1920,
    outerHeight: 1080,
  },
  writable: true,
});

// Mock document for DOM tests
Object.defineProperty(global, "document", {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createElement: vi.fn().mockImplementation((tagName) => {
      if (tagName === "canvas") {
        return {
          getContext: vi.fn().mockReturnValue({
            fillText: vi.fn(),
            measureText: vi.fn().mockReturnValue({ width: 100 }),
            getParameter: vi.fn().mockReturnValue("WebGL"),
            getExtension: vi.fn().mockReturnValue({
              getParameter: vi.fn().mockImplementation((param) => {
                if (param === "UNMASKED_VENDOR_WEBGL") return "AMD Corporation";
                if (param === "UNMASKED_RENDERER_WEBGL")
                  return "Radeon RX 6800";
                return "unknown";
              }),
            }),
          }),
        };
      }
      return {};
    }),
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn().mockReturnValue([]),
    title: "Test Page",
    referrer: "https://google.com",
    cookie: "test=value",
    domain: "example.com",
    location: {
      hostname: "example.com",
    },
  },
  writable: true,
});

// Mock performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn().mockReturnValue(1234567890),
    timing: {
      navigationStart: 0,
      loadEventEnd: 2000,
    },
    getEntriesByType: vi.fn().mockReturnValue([]),
    mark: vi.fn(),
    measure: vi.fn(),
  },
  writable: true,
});

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Add supportedEntryTypes static property
(global.PerformanceObserver as any).supportedEntryTypes = [
  "navigation",
  "resource",
];

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn().mockReturnValue({
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue({
            addEventListener: vi.fn(),
            result: null,
          }),
          put: vi.fn().mockReturnValue({
            addEventListener: vi.fn(),
          }),
        }),
      }),
    },
    addEventListener: vi.fn(),
  }),
};

Object.defineProperty(global, "indexedDB", {
  value: mockIndexedDB,
  writable: true,
});

// Mock Date.now specifically
vi.fn().mockReturnValue(1234567890);

// Mock Date.now directly
vi.spyOn(Date, "now").mockReturnValue(1234567890);

// Mock Hammer.js to prevent errors in gestures module
(global as any).Hammer = vi.fn().mockImplementation(() => ({
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));

// Mock the Hammer.js import
vi.mock("@/libs/hammer", () => ({
  default: (global as any).Hammer,
}));

// Mock Performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn().mockReturnValue(1234567890),
    timing: {
      navigationStart: 0,
      loadEventEnd: 2000,
      domContentLoadedEventEnd: 1500,
    },
    getEntriesByType: vi.fn().mockReturnValue([
      {
        name: "https://example.com",
        duration: 2000,
        startTime: 0,
        transferSize: 1024,
        encodedBodySize: 512,
      },
    ]),
    getEntriesByName: vi.fn().mockReturnValue([]),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  },
  writable: true,
});

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
})) as any;

// Add supportedEntryTypes static property
(global.PerformanceObserver as any).supportedEntryTypes = [
  "navigation",
  "resource",
];

// Mock console methods to avoid noise in tests
global.console = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
} as any;

// Mock crypto-js globally
vi.mock("crypto-js", () => ({
  SHA256: vi.fn().mockImplementation(() => ({
    toString: vi.fn().mockReturnValue("mocked-hash-123456789"),
  })),
}));
