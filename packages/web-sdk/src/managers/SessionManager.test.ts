import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { SessionManager } from "./SessionManager";

describe("SessionManager", () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    global.console = {
      ...console,
      log: vi.fn(),
    };

    // Mock setTimeout and clearTimeout
    vi.useFakeTimers();

    sessionManager = SessionManager.getInstance();

    // Clear any existing session
    sessionManager.end();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = SessionManager.getInstance();
      const instance2 = SessionManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("start", () => {
    it("should start session with provided ID and timeout", () => {
      const sessionId = "session-123";
      const timeoutInMinutes = 30;

      sessionManager.start(sessionId, timeoutInMinutes);

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Session started with provided ID: session-123"
      );
    });

    it("should set session timeout correctly", () => {
      const sessionId = "session-123";
      const timeoutInMinutes = 10; // 10 minutes

      sessionManager.start(sessionId, timeoutInMinutes);

      // Access private property through any type
      const privateProps = sessionManager as any;
      expect(privateProps.sessionTimeout).toBe(10 * 60 * 1000); // 10 minutes in milliseconds
    });

    it("should reset timeout when starting new session", () => {
      const sessionId1 = "session-123";
      const sessionId2 = "session-456";

      sessionManager.start(sessionId1, 15);
      sessionManager.start(sessionId2, 30);

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Session started with provided ID: session-456"
      );
    });
  });

  describe("getSessionId", () => {
    it("should return session ID when session is active", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 15);

      const retrievedSessionId = sessionManager.getSessionId();
      expect(retrievedSessionId).toBe("session-123");
    });

    it('should return "no-session" when no session is active', () => {
      const retrievedSessionId = sessionManager.getSessionId();
      expect(retrievedSessionId).toBe("no-session");
    });

    it("should reset timeout when getSessionId is called", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 15);

      // Get session ID (this should reset the timeout)
      sessionManager.getSessionId();

      // Fast forward past timeout without calling getSessionId() (which resets timeout)
      vi.advanceTimersByTime(15 * 60 * 1000 + 1000); // 15 minutes + 1 second

      // Session should have timed out
      expect((sessionManager as any)._sessionId).toBe(null);
    });
  });

  describe("end", () => {
    it("should end session and clear timeout", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 15);

      sessionManager.end();

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Session ended: session-123"
      );
      expect(sessionManager.getSessionId()).toBe("no-session");
    });

    it("should handle end when no session is active", () => {
      expect(() => sessionManager.end()).not.toThrow();
    });

    it("should clear timeout handle when ending session", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 15);

      // Access private property to check timeout handle
      const privateProps = sessionManager as any;
      expect(privateProps.timeoutHandle).toBeDefined();

      sessionManager.end();

      // The timeout handle should be cleared
      expect(privateProps.timeoutHandle).toBeNull();
    });
  });

  describe("timeout behavior", () => {
    it("should timeout session after inactivity period", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 15); // 15 minutes timeout

      // Fast forward past timeout
      vi.advanceTimersByTime(15 * 60 * 1000);

      expect(global.console.log).toHaveBeenCalledWith(
        "[SDK] Session timed out due to inactivity."
      );
      expect(sessionManager.getSessionId()).toBe("no-session");
    });

    it("should not timeout if getSessionId is called before timeout", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 15); // 15 minutes timeout

      // Fast forward to just before timeout
      vi.advanceTimersByTime(14 * 60 * 1000);

      // Call getSessionId to reset timeout
      sessionManager.getSessionId();

      // Fast forward past original timeout
      vi.advanceTimersByTime(2 * 60 * 1000);

      // Session should still be active
      expect(sessionManager.getSessionId()).toBe("session-123");
    });

    it("should handle multiple timeout resets", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 10); // 10 minutes timeout

      // Reset timeout multiple times
      vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      sessionManager.getSessionId();

      vi.advanceTimersByTime(5 * 60 * 1000); // 5 more minutes
      sessionManager.getSessionId();

      vi.advanceTimersByTime(5 * 60 * 1000); // 5 more minutes

      // Session should still be active
      expect(sessionManager.getSessionId()).toBe("session-123");

      // Now advance past timeout without calling getSessionId() (which resets timeout)
      vi.advanceTimersByTime(10 * 60 * 1000 + 1000); // 10 minutes + 1 second

      // Session should have timed out
      expect((sessionManager as any)._sessionId).toBe(null);
    });
  });

  describe("resetTimeout", () => {
    it("should clear existing timeout and set new one", () => {
      const sessionId = "session-123";
      sessionManager.start(sessionId, 15);

      // Access private method through any type
      const privateProps = sessionManager as any;
      const originalTimeoutHandle = privateProps.timeoutHandle;

      // Call resetTimeout
      privateProps.resetTimeout();

      // Should have a new timeout handle
      expect(privateProps.timeoutHandle).not.toBe(originalTimeoutHandle);
      expect(privateProps.timeoutHandle).toBeDefined();
    });

    it("should handle resetTimeout when no existing timeout", () => {
      // Access private method through any type
      const privateProps = sessionManager as any;
      privateProps.timeoutHandle = null;

      expect(() => privateProps.resetTimeout()).not.toThrow();
      expect(privateProps.timeoutHandle).toBeDefined();
    });
  });

  describe("integration", () => {
    it("should handle complete session lifecycle", () => {
      const sessionId = "session-123";
      const timeoutInMinutes = 5;

      // Start session
      sessionManager.start(sessionId, timeoutInMinutes);
      expect(sessionManager.getSessionId()).toBe("session-123");

      // Simulate activity (reset timeout)
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutes
      sessionManager.getSessionId();

      // More activity
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 more minutes
      sessionManager.getSessionId();

      // Session should still be active
      expect(sessionManager.getSessionId()).toBe("session-123");

      // End session manually
      sessionManager.end();
      expect(sessionManager.getSessionId()).toBe("no-session");
    });

    it("should handle multiple session starts", () => {
      sessionManager.start("session-1", 10);
      expect(sessionManager.getSessionId()).toBe("session-1");

      sessionManager.start("session-2", 20);
      expect(sessionManager.getSessionId()).toBe("session-2");

      sessionManager.end();
      expect(sessionManager.getSessionId()).toBe("no-session");
    });
  });
});
