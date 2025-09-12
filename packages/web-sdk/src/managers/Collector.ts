import { APIManager } from "./APIManager";
import { MetadataManager } from "./MetadataManager";

interface CollectorConfig {
  batchSize: number;
  flushInterval: number;
}

export class Collector {
  private static instance: Collector;
  private queue = new Map<string, any[]>();
  private config!: CollectorConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private apiManager = APIManager.getInstance();
  private metadataManager = MetadataManager.getInstance();

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
    const moduleName = eventData.moduleName;
    if (!this.queue.has(moduleName)) {
      this.queue.set(moduleName, []);
    }
    // We remove the module name from the individual event
    // because it's now the key for the group.
    delete eventData.moduleName;
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
    const metadata = this.metadataManager.createMetadata();

    const batch = {
      content: modulesPayload,
      metadata,
    };

    console.log(
      `[SDK] Flushing batch with ${Object.keys(modulesPayload).length} modules...`
    );

    console.log({ batch });

    // Delegate the actual network request to the APIManager
    this.apiManager.sendEvents(batch);
  }
}
