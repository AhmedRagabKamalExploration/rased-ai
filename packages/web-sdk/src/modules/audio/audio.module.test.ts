import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AudioModule } from "./audio.module";
import { EventManager } from "@/managers/EventManager";

// Mock EventManager
const mockEventManager = {
  dispatch: vi.fn(),
};

vi.mock("@/managers/EventManager", () => ({
  EventManager: {
    getInstance: vi.fn(() => mockEventManager),
  },
}));

describe("AudioModule", () => {
  let audioModule: AudioModule;
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockCompressor: any;
  let mockBuffer: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EventManager.getInstance to return our mock
    (EventManager.getInstance as any).mockReturnValue(mockEventManager);

    // Mock AudioContext
    mockBuffer = {
      getChannelData: vi
        .fn()
        .mockReturnValue(new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5])),
    };

    mockOscillator = {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
    };

    mockCompressor = {
      threshold: {
        setValueAtTime: vi.fn(),
      },
      knee: {
        setValueAtTime: vi.fn(),
      },
      ratio: {
        setValueAtTime: vi.fn(),
      },
      attack: {
        setValueAtTime: vi.fn(),
      },
      release: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createDynamicsCompressor: vi.fn().mockReturnValue(mockCompressor),
      destination: {},
      currentTime: 0,
      startRendering: vi.fn().mockResolvedValue(mockBuffer),
    };

    // Mock window.OfflineAudioContext (the actual API used by AudioModule)
    global.window = {
      ...global.window,
      OfflineAudioContext: vi.fn().mockImplementation(() => mockAudioContext),
      webkitOfflineAudioContext: vi
        .fn()
        .mockImplementation(() => mockAudioContext),
    };

    // Mock crypto.subtle.digest
    global.crypto = {
      ...global.crypto,
      subtle: {
        digest: vi.fn().mockImplementation(async (_algorithm, data) => {
          const text = new TextDecoder().decode(data);
          const hash = new Uint8Array(32);
          for (let i = 0; i < 32; i++) {
            hash[i] = (text.charCodeAt(i % text.length) + i) % 256;
          }
          return hash;
        }),
      },
    };

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
      error: vi.fn(),
    };

    audioModule = new AudioModule();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("moduleName", () => {
    it("should have correct module name", () => {
      expect(audioModule.moduleName).toBe("audio");
    });
  });

  describe("init", () => {
    it("should initialize successfully and dispatch audio data", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "audio",
        "audio",
        expect.objectContaining({
          supported: true,
          fingerprint: expect.any(String),
        })
      );
    });

    it("should handle Web Audio API not supported", async () => {
      // Mock window.OfflineAudioContext to be undefined
      const originalWindow = global.window;

      global.window = {
        ...global.window,
        OfflineAudioContext: undefined,
        webkitOfflineAudioContext: undefined,
      };

      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "audio",
        "audio",
        expect.objectContaining({
          supported: false,
          error: "Web Audio API not supported.",
        })
      );

      // Restore original values
      global.window = originalWindow;
    });

    it("should handle fingerprinting errors gracefully", async () => {
      // Mock startRendering to reject
      mockAudioContext.startRendering = vi
        .fn()
        .mockRejectedValue(new Error("Rendering failed"));

      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "audio",
        "audio.error",
        expect.objectContaining({
          error: "Rendering failed",
        })
      );
    });
  });

  describe("generateFingerprint", () => {
    it("should create audio context with correct parameters", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(global.window.OfflineAudioContext).toHaveBeenCalledWith(
        1,
        44100,
        44100
      );
    });

    it("should configure oscillator correctly", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOscillator.type).toBe("triangle");
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        10000,
        0
      );
    });

    it("should configure compressor correctly", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCompressor.threshold.setValueAtTime).toHaveBeenCalledWith(
        -50,
        0
      );
      expect(mockCompressor.knee.setValueAtTime).toHaveBeenCalledWith(40, 0);
      expect(mockCompressor.ratio.setValueAtTime).toHaveBeenCalledWith(12, 0);
      expect(mockCompressor.attack.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockCompressor.release.setValueAtTime).toHaveBeenCalledWith(
        0.25,
        0
      );
    });

    it("should connect audio nodes in correct order", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOscillator.connect).toHaveBeenCalledWith(mockCompressor);
      expect(mockCompressor.connect).toHaveBeenCalledWith(
        mockAudioContext.destination
      );
    });

    it("should start oscillator and render audio", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockAudioContext.startRendering).toHaveBeenCalled();
    });

    it("should calculate fingerprint from audio data", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockBuffer.getChannelData).toHaveBeenCalledWith(0);
    });
  });

  describe("hash", () => {
    it("should generate hash from input data", async () => {
      const testData = "test-fingerprint-data";

      // Access private method through any type
      const result = await (audioModule as any).hash(testData);

      expect(typeof result).toBe("string");
      expect(result.length).toBe(64); // SHA-256 hex string length
      expect(global.crypto.subtle.digest).toHaveBeenCalledWith(
        "SHA-256",
        new TextEncoder().encode(testData)
      );
    });
  });

  describe("integration", () => {
    it("should handle complete audio fingerprinting flow", async () => {
      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "audio",
        "audio",
        expect.objectContaining({
          supported: true,
          fingerprint: expect.any(String),
        })
      );
    });

    it("should handle different audio data scenarios", async () => {
      // Mock different audio data
      const differentData = new Float32Array([0.5, 0.1, 0.8, 0.3, 0.9]);
      mockBuffer.getChannelData.mockReturnValue(differentData);

      audioModule.init();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockEventManager.dispatch).toHaveBeenCalledWith(
        "audio",
        "audio",
        expect.objectContaining({
          supported: true,
          fingerprint: expect.any(String),
        })
      );
    });
  });
});
