// src/managers/SessionManager.ts

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
    
    public start(timeoutInMinutes: number): void {
        this.sessionTimeout = timeoutInMinutes * 60 * 1000;
        this._sessionId = crypto.randomUUID();
        console.log(`[SDK] Session started: ${this._sessionId}`);
        this.resetTimeout();
    }
    
    public getSessionId(): string {
        if (!this._sessionId) {
            return "no-session";
        }
        this.resetTimeout(); // Reset timer on activity
        return this._sessionId;
    }

    public end(): void {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
        console.log(`[SDK] Session ended: ${this._sessionId}`);
        this._sessionId = null;
    }

    private resetTimeout(): void {
        if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
        this.timeoutHandle = setTimeout(() => {
            console.log(`[SDK] Session timed out.`);
            // In a more complex app, this could trigger a final send-off
            this.end();
        }, this.sessionTimeout);
    }
}