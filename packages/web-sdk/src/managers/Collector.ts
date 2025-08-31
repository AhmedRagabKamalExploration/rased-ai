// src/managers/Collector.ts

interface CollectorConfig {
    batchSize: number;
    flushInterval: number;
}

export class Collector {
    private static instance: Collector;
    private queue: any[] = [];
    private config!: CollectorConfig;
    private timer: ReturnType<typeof setTimeout> | null = null;

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
        this.queue.push(eventData);
        if (this.queue.length >= this.config.batchSize) {
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

    private flush(): void {
        if (this.queue.length === 0) return;

        const batch = this.queue.slice(0);
        this.queue = [];
        
        console.log(`[SDK] Flushing ${batch.length} events...`);
        // In a real implementation, use fetch or beacon API
        // navigator.sendBeacon('/api/collect', JSON.stringify(batch));
        console.log(batch);
    }
}