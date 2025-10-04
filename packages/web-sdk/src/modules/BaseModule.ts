// src/modules/BaseModule.ts
import { EventManager } from "@/managers/EventManager";

type ListenerInfo = {
  target: EventTarget;
  type: string;
  listener: EventListener;
};

// The contract for all feature modules
export abstract class BaseModule {
  public abstract readonly moduleName: string;
  protected eventManager = EventManager.getInstance();
  private listeners: ListenerInfo[] = [];

  public abstract init(): void;

  protected addListener(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options);
    this.listeners.push({ target, type, listener });
  }

  public destroy(): void {
    this.listeners.forEach(({ target, type, listener }) => {
      try {
        target.removeEventListener(type, listener);
      } catch (error) {
        console.error(
          `[SDK] ${this.moduleName}: Failed to remove event listener:`,
          error
        );
      }
    });
    this.listeners = [];
  }
}
