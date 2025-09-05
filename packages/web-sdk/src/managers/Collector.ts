import { IdentityManager } from "./IdentityManager";
import { APIManager } from "./APIManager";

interface CollectorConfig {
  batchSize: number;
  flushInterval: number;
}

export class Collector {
  private static instance: Collector;
  private queue = new Map<string, any[]>();
  private config!: CollectorConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private identityManager = IdentityManager.getInstance();
  private apiManager = APIManager.getInstance();

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

  public add(eventData: any): void {
    const moduleName = eventData.module;
    if (!this.queue.has(moduleName)) {
      this.queue.set(moduleName, []);
    }
    // We remove the module name from the individual event
    // because it's now the key for the group.
    delete eventData.module;
    this.queue.get(moduleName)?.push(eventData);

    const totalEvents = Array.from(this.queue.values()).reduce(
      (sum, events) => sum + events.length,
      0
    );
    if (totalEvents >= this.config.batchSize) {
      this.flush();
    }
  }

  public start(): void {
    this.timer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  public stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.flush(); // Perform a final flush on shutdown
  }

  private flush(): void {
    if (this.queue.size === 0) return;

    const modulesPayload = Object.fromEntries(this.queue);
    this.queue.clear();

    const batch = {
      deviceId: this.identityManager.getDeviceId(),
      batchId: crypto.randomUUID(),
      batchTimestamp: new Date().toISOString(),
      modules: modulesPayload,
    };

    console.log(
      `[SDK] Flushing batch with ${Object.keys(modulesPayload).length} modules...`
    );

    // Delegate the actual network request to the APIManager
    this.apiManager.sendEvents(batch);
  }
}
