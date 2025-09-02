import { Collector, SessionManager } from "@/managers";

export class EventManager {
  private static instance: EventManager;
  private collector = Collector.getInstance();
  private sessionManager = SessionManager.getInstance();

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  public dispatch(
    moduleName: string,
    eventType: string,
    payload: object
  ): void {
    const enrichedEvent = {
      eventId: crypto.randomUUID(),
      moduleName,
      eventType: eventType,
      sessionId: this.sessionManager.getSessionId(),
      timestamp: new Date().toISOString(),
      payload: payload,
    };
    this.collector.add(enrichedEvent);
  }
}
