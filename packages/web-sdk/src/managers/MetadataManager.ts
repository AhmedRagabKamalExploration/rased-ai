import packageJson from "../../package.json";
import type { SdkInitConfig } from "./ConfigManager";
import { IdentityManager } from "./IdentityManager";
export interface Metadata {
  messageType: "BATCH" | "INITIATING";
  collectionEventId: string;
  organizationId: string;
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
  private static instance: MetadataManager;
  private identityManager = IdentityManager.getInstance();
  private organizationId = "";
  private transactionId = "";
  private sessionId = "";
  private readonly sdkVersion: string;
  private readonly origin: string;
  private readonly channels: string;
  private readonly pageType: string[];
  private collectionEventId: string;
  private messageCounter: number;
  private deviceSessionType: "INITIATING" | "REJOINING";

  private constructor() {
    this.sdkVersion = packageJson.version;
    this.origin = typeof window !== "undefined" ? window.location.origin : "";
    this.channels = "WEB"; // Hardcoded as per the example
    this.pageType = ["WEB_STANDARD"]; // Hardcoded as per the example

    // These properties are dynamic and will be managed internally
    this.collectionEventId = crypto.randomUUID();
    this.messageCounter = 0;
    this.deviceSessionType = "INITIATING";
  }

  public static getInstance(): MetadataManager {
    if (!MetadataManager.instance) {
      MetadataManager.instance = new MetadataManager();
    }
    return MetadataManager.instance;
  }

  public getCollectionEventId(): string {
    return this.collectionEventId;
  }

  public getNextMessageId(): number {
    return this.messageCounter++;
  }

  public updateMetadata({
    organizationId,
    transactionId,
    sessionId,
  }: Pick<
    SdkInitConfig,
    "organizationId" | "transactionId" | "sessionId"
  >): void {
    this.organizationId = organizationId;
    this.transactionId = transactionId;
    this.sessionId = sessionId;
  }

  // Method to create the full metadata object for a payload
  public createMetadata(
    transactionEventPageId: string | null = null
  ): Metadata {
    const deviceSessionId = this.identityManager.getDeviceId();

    // Log a warning if device ID is still uninitialized
    if (deviceSessionId === "uninitialized") {
      console.warn(
        "[SDK] MetadataManager: Device ID is uninitialized. IdentityManager may not be properly initialized."
      );
    }

    return {
      messageType: "BATCH",
      collectionEventId: this.collectionEventId,
      organizationId: this.organizationId,
      transactionId: this.transactionId,
      sessionId: this.sessionId,
      deviceSessionType: this.deviceSessionType,
      deviceSessionId, // Get device ID dynamically
      messageId: this.getNextMessageId(),
      transactionEventPageId,
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
