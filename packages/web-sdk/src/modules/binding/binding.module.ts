import { BaseModule } from "@/modules/BaseModule";

export class BindingModule extends BaseModule {
  public readonly moduleName: string = "binding";

  private dbName = "SDKDatabase";
  private dbVersion = 1;
  private storeName = "keyStore";
  private keyPairId = "sdk-binding-key-pair";

  /**
   * Initializes the device binding process by generating a key pair and signing data.
   * This module is a core part of the device attestation and integrity pipeline.
   */
  public async init(): Promise<void> {
    console.log(`[SDK] ${this.moduleName}: Initializing...`);
    try {
      // Get or generate a cryptographic key pair for signing.
      const keyPair = await this.getKeyPair();
      if (!keyPair) {
        throw new Error("Failed to get or generate key pair.");
      }

      // Use a hardcoded small data blob as the data to sign.
      const data = new Uint8Array([
        113, 199, 137, 129, 29, 177, 25, 225, 74, 138,
      ]);

      // Sign the data with the generated private key.
      const signature = await this.signData(keyPair.privateKey, data);

      // Export the public key to a standard format (JWK) for the backend.
      const publicKey = await this.exportPublicKey(keyPair.publicKey);

      // Create a persistent identifier for this device instance.
      const webInstanceId = await this.generateWebInstanceId(publicKey);

      this.eventManager.dispatch(this.moduleName, "binding", {
        data: Array.from(data),
        signature: Array.from(new Uint8Array(signature)),
        publicKey,
        webInstanceId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[SDK] ${this.moduleName}: Collection failed.`, error);
      this.eventManager.dispatch(this.moduleName, "binding.error", {
        error: "Binding data collection failed",
        errorCode: "UNEXPECTED_ERROR",
        details: {
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Retrieves an existing key pair from IndexedDB or generates a new one.
   * This ensures the key pair is persistent across sessions.
   */
  private async getKeyPair(): Promise<CryptoKeyPair | null> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.storeName, "readonly");
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(this.keyPairId);

      request.onsuccess = async () => {
        const storedKeys = request.result;
        if (storedKeys) {
          // If keys exist, import them.
          const importedPublicKey = await window.crypto.subtle.importKey(
            "jwk",
            storedKeys.publicKeyJwk,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            true,
            ["verify"]
          );
          const importedPrivateKey = await window.crypto.subtle.importKey(
            "jwk",
            storedKeys.privateKeyJwk,
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            true,
            ["sign"]
          );
          resolve({
            publicKey: importedPublicKey,
            privateKey: importedPrivateKey,
          });
        } else {
          // If no keys exist, generate a new pair and store it.
          const keyPair = await this.generateAndStoreKeyPair(db);
          resolve(keyPair);
        }
      };

      request.onerror = () => {
        console.error("IndexedDB request failed:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Opens the IndexedDB database.
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.storeName);
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generates a new RSA key pair and stores it in IndexedDB.
   */
  private async generateAndStoreKeyPair(
    db: IDBDatabase
  ): Promise<CryptoKeyPair> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );

    const publicKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.publicKey
    );
    const privateKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.privateKey
    );

    const transaction = db.transaction(this.storeName, "readwrite");
    const store = transaction.objectStore(this.storeName);
    store.put({ publicKeyJwk, privateKeyJwk }, this.keyPairId);

    return keyPair;
  }

  /**
   * Signs the given data with the private key.
   */
  private async signData(
    privateKey: CryptoKey,
    data: any
  ): Promise<ArrayBuffer> {
    return window.crypto.subtle.sign(
      {
        name: "RSASSA-PKCS1-v1_5",
      },
      privateKey,
      data
    );
  }

  /**
   * Exports the public key to a JSON Web Key (JWK) format.
   */
  private async exportPublicKey(publicKey: CryptoKey): Promise<JsonWebKey> {
    return window.crypto.subtle.exportKey("jwk", publicKey);
  }

  /**
   * Generates a unique, persistent web instance ID from the public key.
   */
  private async generateWebInstanceId(publicKey: JsonWebKey): Promise<string> {
    const keyData = JSON.stringify({ n: publicKey.n, e: publicKey.e });
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(keyData)
    );
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
