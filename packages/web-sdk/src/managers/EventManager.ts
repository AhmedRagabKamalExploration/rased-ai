// src/managers/EventManager.ts
import { Collector, SessionManager, IdentityManager } from '@/managers';


export class EventManager {
    private static instance: EventManager;
    private collector = Collector.getInstance();
    private sessionManager = SessionManager.getInstance();
    private identityManager = IdentityManager.getInstance();

    private constructor() {}

    public static getInstance(): EventManager {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }

    public dispatch(eventType: string, payload: object): void {
        const enrichedEvent = {
            eventId: crypto.randomUUID(),
            eventType: eventType,
            deviceId: this.identityManager.getDeviceId(),
            sessionId: this.sessionManager.getSessionId(),
            timestamp: new Date().toISOString(),
            payload: payload,
        };
        this.collector.add(enrichedEvent);
    }
}