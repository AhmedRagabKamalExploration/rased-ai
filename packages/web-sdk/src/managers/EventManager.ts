import { Collector } from "./Collector";
import { ConfigManager } from "./ConfigManager";

export class EventManager {
  private static instance: EventManager;
  private collector = Collector.getInstance();
  private configManager = ConfigManager.getInstance();

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
    // The transactionId and sessionId now come directly from the validated config
    const { transactionId, sessionId } = this.configManager.config;

    const enrichedEvent = {
      eventId: crypto.randomUUID(),
      moduleName,
      eventType,
      sessionId,
      transactionId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.collector.add(enrichedEvent);
  }
}
