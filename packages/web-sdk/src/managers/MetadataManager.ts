export interface Metadata {
  messageType: "BATCH" | "INITIATING";
  collectionEventId: string;
  tenantId: string;
  transactionId: string;
  sessionId: string;
  deviceSessionType: string;
  deviceSessionId: string;
  messageId: number;
  transactionEventPageId: string | null;
  sdkVersion: string;
  origin: string;
  channels: string;
  pageType: string[];
}

export class MetadataManager {
  private readonly tenantId: string;
  private readonly transactionId: string;
  private readonly sessionId: string;
  private readonly sdkVersion: string;
  private readonly origin: string;
  private readonly channels: string;
  private readonly pageType: string[];
  private collectionEventId: string;
  private deviceSessionId: string;
  private messageCounter: number;
  private deviceSessionType: "INITIATING" | "REJOINING";

  constructor(initialData: {
    tenantId: string;
    transactionId: string;
    sessionId: string;
    sdkVersion: string;
    origin: string;
  }) {
    this.tenantId = initialData.tenantId;
    this.transactionId = initialData.transactionId;
    this.sessionId = initialData.sessionId;
    this.sdkVersion = initialData.sdkVersion;
    this.origin = initialData.origin;
    this.channels = "WEB"; // Hardcoded as per the example
    this.pageType = ["WEB_STANDARD"]; // Hardcoded as per the example

    // These properties are dynamic and will be managed internally
    this.collectionEventId = crypto.randomUUID();
    this.deviceSessionId = crypto.randomUUID();
    this.messageCounter = 0;
    this.deviceSessionType = "INITIATING";
  }

  public getCollectionEventId(): string {
    return this.collectionEventId;
  }

  public getNextMessageId(): number {
    return this.messageCounter++;
  }

  // Method to create the full metadata object for a payload
  public createMetadata(transactionEventPageId: string | null): Metadata {
    return {
      messageType: "BATCH",
      collectionEventId: this.collectionEventId,
      tenantId: this.tenantId,
      transactionId: this.transactionId,
      sessionId: this.sessionId,
      deviceSessionType: this.deviceSessionType,
      deviceSessionId: this.deviceSessionId,
      messageId: this.getNextMessageId(),
      transactionEventPageId: transactionEventPageId,
      sdkVersion: this.sdkVersion,
      origin: this.origin,
      channels: this.channels,
      pageType: this.pageType,
    };
  }

  // Call this method when the session is rejoining (e.g., after a page reload)
  public rejoiningSession() {
    this.deviceSessionType = "REJOINING";
    this.messageCounter = 0;
  }
}
