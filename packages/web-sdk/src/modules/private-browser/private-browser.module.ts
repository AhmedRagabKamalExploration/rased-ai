import { BaseModule } from "@/modules/BaseModule";

export class PrivateBrowserModule extends BaseModule {
  public readonly moduleName: string = "isPrivateBrowser";

  /**
   * Initializes private browser detection.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    let isPrivate: boolean = false;
    let detectionMethod: number = -1;

    try {
      const detectionResults = await Promise.all([
        this.checkLocalStorage(),
        this.checkIndexedDB(),
        this.checkFileSystemAPI(),
      ]);

      const result = detectionResults.find((r) => r.isPrivate);
      if (result) {
        isPrivate = true;
        detectionMethod = result.method;
      }
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "privateBrowser.error", {
        error: "Private browser detection failed",
        errorCode: "DETECTION_FAILED",
        details: {
          message: (error as Error).message,
        },
      });
      return;
    }

    this.eventManager.dispatch(this.moduleName, "isPrivateBrowser", {
      isPrivateBrowser: isPrivate,
      detectionMethod: detectionMethod,
      timestamp: Date.now(),
    });
  }

  /**
   * Checks for private browsing mode by attempting to use localStorage.
   * This specific method catches a QuotaExceededError in some browsers like Safari,
   * which is a strong signal of private mode.
   * @returns A promise that resolves to a detection result.
   */
  private async checkLocalStorage(): Promise<{
    isPrivate: boolean;
    method: number;
  }> {
    return new Promise((resolve) => {
      try {
        localStorage.setItem("test", "1");
        localStorage.removeItem("test");
        resolve({ isPrivate: false, method: -1 });
      } catch (e: any) {
        if (e.name === "QuotaExceededError") {
          resolve({ isPrivate: true, method: 1 });
        } else {
          resolve({ isPrivate: false, method: -1 });
        }
      }
    });
  }

  /**
   * Checks IndexedDB behavior for private browsing mode.
   * This is a reliable asynchronous check for Chrome and Firefox.
   * In private mode, IndexedDB might be blocked or have an in-memory-only database.
   * @returns A promise that resolves to a detection result.
   */
  private async checkIndexedDB(): Promise<{
    isPrivate: boolean;
    method: number;
  }> {
    return new Promise((resolve) => {
      try {
        const dbName = "test-db";
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = () => {};

        request.onsuccess = () => {
          request.result.close();
          indexedDB.deleteDatabase(dbName);
          resolve({ isPrivate: false, method: -1 });
        };

        request.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          if (error && error.name === "SecurityError") {
            resolve({ isPrivate: true, method: 2 });
          } else {
            resolve({ isPrivate: false, method: -1 });
          }
        };
      } catch (e) {
        // Catch an immediate error if IndexedDB is not available.
        resolve({ isPrivate: true, method: 2 });
      }
    });
  }

  /**
   * Checks the File System API for private browsing mode.
   * This is a key check from the obfuscated code, effective on many browsers.
   * @returns A promise that resolves to a detection result.
   */
  private async checkFileSystemAPI(): Promise<{
    isPrivate: boolean;
    method: number;
  }> {
    return new Promise((resolve) => {
      if (!("webkitRequestFileSystem" in window)) {
        resolve({ isPrivate: false, method: -1 });
        return;
      }

      (window as any).webkitRequestFileSystem(
        (window as any).TEMPORARY,
        1,
        () => resolve({ isPrivate: false, method: -1 }),
        () => resolve({ isPrivate: true, method: 3 })
      );
    });
  }
}
