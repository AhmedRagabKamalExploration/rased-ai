export class SessionManager {
  private static instance: SessionManager;
  private _sessionId: string | null = null;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private sessionTimeout: number = 15 * 60 * 1000; // Default 15 mins

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Starts a new session with the ID provided by the client's backend.
   * This ensures data is correctly correlated.
   * @param sessionId The unique ID for this session.
   * @param timeoutInMinutes The inactivity period after which the session should end.
   */
  public start(sessionId: string, timeoutInMinutes: number): void {
    this._sessionId = sessionId;
    this.sessionTimeout = timeoutInMinutes * 60 * 1000;
    console.log(`[SDK] Session started with provided ID: ${this._sessionId}`);
    this.resetTimeout();
  }

  /**
   * Retrieves the current session ID. Called by the EventManager.
   * Resets the inactivity timer each time it's called, signifying user activity.
   */
  public getSessionId(): string {
    if (!this._sessionId) {
      return "no-session";
    }
    // User activity has been detected, so reset the inactivity timer.
    this.resetTimeout();
    return this._sessionId;
  }

  /**
   * Ends the current session and clears the inactivity timer.
   */
  public end(): void {
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
    console.log(`[SDK] Session ended: ${this._sessionId}`);
    this._sessionId = null;
  }

  /**
   * Resets the inactivity timeout. This is called whenever there is user activity.
   */
  private resetTimeout(): void {
    // Clear any existing timer.
    if (this.timeoutHandle) clearTimeout(this.timeoutHandle);

    // Set a new timer to end the session after a period of inactivity.
    this.timeoutHandle = setTimeout(() => {
      console.log(`[SDK] Session timed out due to inactivity.`);
      this.end();
    }, this.sessionTimeout);
  }
}
