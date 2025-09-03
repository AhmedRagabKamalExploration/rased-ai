import { BaseModule } from "@/modules/BaseModule";

// We only want to track typing in specific, sensitive input elements.
const TARGET_INPUT_TYPES = [
  "text",
  "password",
  "email",
  "tel",
  "search",
  "url",
  "number",
];

interface KeyPressData {
  downTime: number;
  upTime: number;
}

export class KeyboardModule extends BaseModule {
  public readonly moduleName: string = "keyboard";

  private keyPressMap = new Map<string, KeyPressData>();
  private lastKeyUpTime: number = 0;
  private analysisData = new Map<HTMLElement, any[]>();

  public init(): void {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    this.addListener(document, "keydown", this.handleKeyDown.bind(this), {
      capture: true,
    });
    this.addListener(document, "keyup", this.handleKeyUp.bind(this), {
      capture: true,
    });
    this.addListener(document, "focusout", this.handleFocusOut.bind(this), {
      capture: true,
    });
  }

  private handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    // IMPORTANT: We do not record the `key` itself to protect user privacy.
    // We only care about the timing. We use `code` as a unique but non-sensitive identifier.
    const key = keyboardEvent.code;

    // Start tracking dwell time
    if (!this.keyPressMap.has(key)) {
      this.keyPressMap.set(key, { downTime: Date.now(), upTime: 0 });
    }
  }

  private handleKeyUp(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    const key = keyboardEvent.code;
    const target = keyboardEvent.target as HTMLElement;

    if (this.isTrackable(target) && this.keyPressMap.has(key)) {
      const pressData = this.keyPressMap.get(key)!;
      pressData.upTime = Date.now();

      const dwellTime = pressData.upTime - pressData.downTime;
      const flightTime =
        this.lastKeyUpTime > 0 ? pressData.downTime - this.lastKeyUpTime : 0;
      this.lastKeyUpTime = pressData.upTime;

      if (!this.analysisData.has(target)) {
        this.analysisData.set(target, []);
      }
      this.analysisData.get(target)!.push({ key, dwellTime, flightTime });
    }
    this.keyPressMap.delete(key);
  }

  private handleFocusOut(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.isTrackable(target) && this.analysisData.has(target)) {
      const data = this.analysisData.get(target)!;
      if (data.length < 3) return; // Not enough data to be meaningful

      // Calculate summary metrics
      const totalDuration =
        data[data.length - 1].dwellTime +
        data[0].flightTime -
        data[0].flightTime;
      const totalDwell = data.reduce((sum, d) => sum + d.dwellTime, 0);
      const totalFlight = data.reduce((sum, d) => sum + d.flightTime, 0);

      const payload = {
        target: {
          tag: target.tagName,
          id: target.id,
          name: (target as HTMLInputElement).name,
        },
        metrics: {
          totalKeyPresses: data.length,
          typingDuration: totalDuration,
          avgDwellTime: Math.round(totalDwell / data.length),
          avgFlightTime: Math.round(totalFlight / (data.length - 1)),
          typingSpeed: parseFloat(
            (data.length / (totalDuration / 1000)).toFixed(2)
          ),
        },
        specialKeys: {
          backspaceCount: data.filter((d) => d.key === "Backspace").length,
          deleteCount: data.filter((d) => d.key === "Delete").length,
          tabCount: data.filter((d) => d.key === "Tab").length,
          arrowKeyCount: data.filter((d) => d.key.startsWith("Arrow")).length,
        },
      };

      this.eventManager.dispatch(this.moduleName, "keyboard", payload);
      this.analysisData.delete(target); // Clear data for this field
    }
  }

  private isTrackable(element: HTMLElement): boolean {
    if (element.tagName === "INPUT") {
      return TARGET_INPUT_TYPES.includes((element as HTMLInputElement).type);
    }
    return element.tagName === "TEXTAREA";
  }
}
