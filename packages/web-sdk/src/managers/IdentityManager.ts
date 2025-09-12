// src/managers/IdentityManager.ts

const DB_NAME = "sdk_identity_store";
const KEY_NAME = "device_key";

export class IdentityManager {
  private static instance: IdentityManager;
  private _deviceId: string | null = null;

  private constructor() {}

  public static getInstance(): IdentityManager {
    if (!IdentityManager.instance) {
      IdentityManager.instance = new IdentityManager();
    }
    return IdentityManager.instance;
  }

  public async initialize(): Promise<void> {
    try {
      let keyPair = await this.getKeyFromDB();
      if (!keyPair) {
        keyPair = await crypto.subtle.generateKey(
          { name: "ECDSA", namedCurve: "P-256" },
          true,
          ["sign", "verify"]
        );
        await this.saveKeyToDB(keyPair);
      }
      const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
      // Create a stable ID from the public key's coordinates
      this._deviceId = await this.hash(`'${publicKey.x}${publicKey.y}`);
      console.log(
        "[SDK] IdentityManager initialized. Device ID:",
        this._deviceId
      );
    } catch (error) {
      console.error(
        "[SDK] IdentityManager failed to initialize. Crypto API may be unavailable.",
        error
      );
      this._deviceId = "crypto-unavailable";
    }
  }

  public getDeviceId(): string {
    if (!this._deviceId) {
      console.warn("[SDK] Device ID accessed before initialization.");
      return "uninitialized";
    }
    return this._deviceId;
  }

  // Helper to create a SHA-256 hash
  private async hash(data: string): Promise<string> {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(data)
    );
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // IndexedDB helpers
  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore(KEY_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getKeyFromDB(): Promise<CryptoKeyPair | null> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(KEY_NAME, "readonly").objectStore(KEY_NAME);
      const request = tx.get(0);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private async saveKeyToDB(key: CryptoKeyPair): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(KEY_NAME, "readwrite");
      const store = tx.objectStore(KEY_NAME);
      store.put(key, 0);
      tx.oncomplete = () => resolve();
    });
  }
}
