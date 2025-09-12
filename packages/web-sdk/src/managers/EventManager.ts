import { Collector } from "./Collector";

export class EventManager {
  private static instance: EventManager;
  private collector = Collector.getInstance();

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
      eventType,
      timestamp: Date.now(),
      payload,
    };
    this.collector.add(enrichedEvent);
  }
}
