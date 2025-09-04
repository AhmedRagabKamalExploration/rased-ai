import { BaseModule } from "@/modules/BaseModule";

// Reliable, public STUN servers. Google's is the standard.
const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// A more specific regex to only match valid IPv4 and IPv6 addresses.
const IP_REGEX =
  /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7}|[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,6}::[a-f0-9]{1,4}?/gi;

export class WebRTCIPModule extends BaseModule {
  public readonly moduleName: string = "WebRTCIPModule";

  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    this.discoverIPs().catch((error) => {
      console.error(`[SDK] ${this.moduleName}: IP discovery failed.`, error);
      this.eventManager.dispatch(this.moduleName, "context.webrtc.error", {
        supported: false,
        error: (error as Error).message,
      });
    });
  }

  private async discoverIPs(): Promise<void> {
    const RTCPeerConnection =
      window.RTCPeerConnection ||
      (window as any).mozRTCPeerConnection ||
      (window as any).webkitRTCPeerConnection;

    if (!RTCPeerConnection) {
      throw new Error("WebRTC API not supported.");
    }

    const peerConnection = new RTCPeerConnection(STUN_SERVERS);
    const uniqueIPs = new Set<string>();
    const rawCandidates: string[] = [];

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (peerConnection.signalingState !== "closed") {
          peerConnection.close();
          // If we found IPs before the timeout, dispatch them as a partial result.
          if (uniqueIPs.size > 0) {
            console.warn(
              `[SDK] ${this.moduleName}: Discovery timed out, dispatching partial results.`
            );
            this.dispatchResults(Array.from(uniqueIPs), rawCandidates, true);
            resolve(); // Resolve as we have partial data.
          } else {
            reject(new Error("Discovery timed out with no candidates found."));
          }
        }
      }, 2000);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          const candidateStr = event.candidate.candidate;
          rawCandidates.push(candidateStr);
          const matches = candidateStr.match(IP_REGEX);
          if (matches) {
            matches.forEach((ip) => uniqueIPs.add(ip));
          }
        } else if (!event.candidate) {
          clearTimeout(timeout);
          peerConnection.close();
          this.dispatchResults(Array.from(uniqueIPs), rawCandidates);
          resolve();
        }
      };

      peerConnection.createDataChannel("");
      peerConnection
        .createOffer()
        .then((offer) => peerConnection.setLocalDescription(offer))
        .catch((err) => reject(err));
    });
  }

  private isPrivateIP(ip: string): boolean {
    // Check for IPv4 private ranges
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ip)) {
      return true;
    }
    // Check for IPv6 private/local ranges (Unique Local, Link-Local)
    if (/^([fF][cCdD]).*|^([fF][eE]80:)/.test(ip)) {
      return true;
    }
    // Check for mDNS addresses which are for local discovery
    if (ip.endsWith(".local")) {
      return true;
    }
    return false;
  }

  private isIPv4(ip: string): boolean {
    // IPv4 pattern: 4 decimal numbers (0-255) separated by dots
    const ipv4Pattern =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Pattern.test(ip);
  }

  private isIPv6(ip: string): boolean {
    // IPv6 pattern: hexadecimal groups separated by colons
    const ipv6Pattern =
      /^([a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$|^([a-f0-9]{1,4}:){1,7}:$|^([a-f0-9]{1,4}:){1,6}:[a-f0-9]{1,4}$|^([a-f0-9]{1,4}:){1,5}(:[a-f0-9]{1,4}){1,2}$|^([a-f0-9]{1,4}:){1,4}(:[a-f0-9]{1,4}){1,3}$|^([a-f0-9]{1,4}:){1,3}(:[a-f0-9]{1,4}){1,4}$|^([a-f0-9]{1,4}:){1,2}(:[a-f0-9]{1,4}){1,5}$|^[a-f0-9]{1,4}:((:[a-f0-9]{1,4}){1,6})$|^:((:[a-f0-9]{1,4}){1,7}|:)$/i;
    return ipv6Pattern.test(ip);
  }

  private dispatchResults(
    ips: string[],
    rawCandidates: string[],
    timedOut: boolean = false
  ): void {
    const localIPs: string[] = [];
    const publicIPv4: string[] = [];
    const publicIPv6: string[] = [];

    ips.forEach((ip) => {
      // Filter out invalid or placeholder IPs before classifying
      if (ip === "0.0.0.0" || ip === "::") {
        return;
      }

      if (this.isPrivateIP(ip)) {
        localIPs.push(ip);
      } else {
        // Classify as IPv4 or IPv6
        if (this.isIPv4(ip)) {
          publicIPv4.push(ip);
        } else if (this.isIPv6(ip)) {
          publicIPv6.push(ip);
        }
      }
    });

    this.eventManager.dispatch(this.moduleName, "context.webrtc.ips", {
      supported: true,
      timedOut, // Add a flag to indicate if the results are partial
      candidates: {
        publicIPs: {
          ipv4: publicIPv4,
          ipv6: publicIPv6,
        },
        localIPs,
      },
      rawCandidates,
    });
  }
}
