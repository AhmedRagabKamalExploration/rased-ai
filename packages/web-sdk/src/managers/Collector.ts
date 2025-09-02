import { IdentityManager } from "./IdentityManager";
import { SessionManager } from "./SessionManager";

interface CollectorConfig {
  batchSize: number;
  flushInterval: number;
}

export class Collector {
  private static instance: Collector;
  // The queue is now a Map to group events by module name.
  private queue: Map<string, any[]> = new Map();
  private totalEvents: number = 0;
  private config!: CollectorConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Get instances of other managers to access global IDs
  private identityManager = IdentityManager.getInstance();
  private sessionManager = SessionManager.getInstance();

  private constructor() {}

  public static getInstance(): Collector {
    if (!Collector.instance) {
      Collector.instance = new Collector();
    }
    return Collector.instance;
  }

  public configure(config: CollectorConfig): void {
    this.config = config;
  }

  /**
   * Adds a new event to the queue, grouped by its module name.
   * Triggers a flush if the total number of events reaches the batch size.
   */
  public add(eventData: { moduleName: string; [key: string]: any }): void {
    const { moduleName } = eventData;
    if (!this.queue.has(moduleName)) {
      this.queue.set(moduleName, []);
    }
    this.queue.get(moduleName)!.push(eventData);
    this.totalEvents++;

    if (this.totalEvents >= this.config.batchSize) {
      this.flush();
    }
  }

  public start(): void {
    this.timer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  public stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.flush(); // Final flush on stop
  }

  /**
   * Flushes all queued events, grouped by module, in a structured batch payload.
   */
  private flush(): void {
    if (this.queue.size === 0) return;

    const modulesData = Object.fromEntries(this.queue);

    // --- NEW: Create a structured batch with top-level IDs ---
    const finalBatch = {
      deviceId: this.identityManager.getDeviceId(),
      sessionId: this.sessionManager.getSessionId(),
      batchTimestamp: new Date().toISOString(),
      modules: modulesData,
    };

    console.log(
      `[SDK] Flushing ${this.totalEvents} events in a structured batch...`
    );
    // In a real implementation, you would send this finalBatch object.
    // navigator.sendBeacon('/api/collect', JSON.stringify(finalBatch));
    console.log(finalBatch);

    // Clear the queue and reset the count after flushing.
    this.queue.clear();
    this.totalEvents = 0;
  }
}
