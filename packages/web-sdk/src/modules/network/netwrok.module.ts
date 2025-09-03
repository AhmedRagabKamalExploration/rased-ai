import { BaseModule } from "@/modules/BaseModule";

// Type definition for the experimental NetworkInformation API
type NetworkInformation = EventTarget & {
  type?:
    | "bluetooth"
    | "cellular"
    | "ethernet"
    | "wifi"
    | "wimax"
    | "other"
    | "none"
    | "unknown";
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  rtt?: number;
  downlink?: number;
  onchange?: (event: Event) => void;
};

export class NetworkModule extends BaseModule {
  public readonly moduleName: string = "network";

  private connection: NetworkInformation | null =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection ||
    null;

  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    if (this.connection) {
      this.dispatchNetworkState();
      this.addListener(
        this.connection,
        "change",
        this.dispatchNetworkState.bind(this)
      );
    } else {
      // Fallback for browsers that don't support the API
      this.eventManager.dispatch(this.moduleName, "network", {
        isOnline: navigator.onLine,
        unsupported: true,
      });
    }
  }

  private dispatchNetworkState(): void {
    this.eventManager.dispatch(this.moduleName, "network", {
      isOnline: navigator.onLine,
      connectionType: this.connection?.type,
      effectiveType: this.connection?.effectiveType,
      roundTripTime: this.connection?.rtt,
      downlink: this.connection?.downlink,
    });
  }
}
