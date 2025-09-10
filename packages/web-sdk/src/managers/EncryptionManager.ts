// In a real implementation, you would use imported cryptographic libraries
// like 'pako' for compression and 'crypto-js' for encryption.
// For now, we'll implement basic encryption without external dependencies.

// The EncryptionLayer interface, as you proposed
export interface EncryptionLayer {
  name: string;
  encrypt(data: string): string;
  decrypt(encryptedData: string): string;
}

export class EncryptionManager {
  private static instance: EncryptionManager;
  private encryptionLayers: EncryptionLayer[];
  private currentKey: string;
  private keyRotationInterval: number;
  private rotationTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.encryptionLayers = [];
    this.currentKey = this.generateKey();
    this.keyRotationInterval = 300000; // 5 minutes
    this.initializeEncryptionLayers();
    this.startKeyRotation();
  }

  public static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  private initializeEncryptionLayers(): void {
    // Primary encryption layer (XOR encryption)
    this.encryptionLayers.push({
      name: "primary",
      encrypt: (data: string) => this.primaryEncrypt(data),
      decrypt: (encryptedData: string) => this.primaryDecrypt(encryptedData),
    });

    // Secondary encryption layer (Base64 + obfuscation)
    this.encryptionLayers.push({
      name: "secondary",
      encrypt: (data: string) => {
        const encoded = btoa(data);
        let obfuscated = "";
        for (let i = 0; i < encoded.length; i++) {
          const charCode = encoded.charCodeAt(i) + (i % 10);
          obfuscated += String.fromCharCode(charCode);
        }
        return obfuscated;
      },
      decrypt: (encryptedData: string) => {
        let deobfuscated = "";
        for (let i = 0; i < encryptedData.length; i++) {
          const charCode = encryptedData.charCodeAt(i) - (i % 10);
          deobfuscated += String.fromCharCode(charCode);
        }
        return atob(deobfuscated);
      },
    });

    // Tertiary encryption layer (Custom character shifting)
    this.encryptionLayers.push({
      name: "tertiary",
      encrypt: (data: string) => {
        let encrypted = "";
        for (let i = 0; i < data.length; i++) {
          const charCode = data.charCodeAt(i);
          const shift = (i * 7 + 13) % 26;
          if (charCode >= 65 && charCode <= 90) {
            encrypted += String.fromCharCode(
              ((charCode - 65 + shift) % 26) + 65
            );
          } else if (charCode >= 97 && charCode <= 122) {
            encrypted += String.fromCharCode(
              ((charCode - 97 + shift) % 26) + 97
            );
          } else {
            encrypted += data[i];
          }
        }
        return encrypted;
      },
      decrypt: (encryptedData: string) => {
        let decrypted = "";
        for (let i = 0; i < encryptedData.length; i++) {
          const charCode = encryptedData.charCodeAt(i);
          const shift = (i * 7 + 13) % 26;
          if (charCode >= 65 && charCode <= 90) {
            decrypted += String.fromCharCode(
              ((charCode - 65 - shift + 26) % 26) + 65
            );
          } else if (charCode >= 97 && charCode <= 122) {
            decrypted += String.fromCharCode(
              ((charCode - 97 - shift + 26) % 26) + 97
            );
          } else {
            decrypted += encryptedData[i];
          }
        }
        return decrypted;
      },
    });

    // Quaternary encryption layer (Hex obfuscation)
    this.encryptionLayers.push({
      name: "quaternary",
      encrypt: (data: string) => {
        let obfuscated = "";
        for (let i = 0; i < data.length; i++) {
          const charCode = data.charCodeAt(i);
          const obfuscatedChar = charCode ^ 0xaa; // XOR with 0xAA
          obfuscated += obfuscatedChar.toString(16).padStart(2, "0");
        }
        return obfuscated;
      },
      decrypt: (encryptedData: string) => {
        let decrypted = "";
        for (let i = 0; i < encryptedData.length; i += 2) {
          const hex = encryptedData.substr(i, 2);
          const charCode = parseInt(hex, 16) ^ 0xaa;
          decrypted += String.fromCharCode(charCode);
        }
        return decrypted;
      },
    });
  }

  public encrypt(data: any): string {
    let serializedData = JSON.stringify(data);

    // Apply all encryption layers in sequence
    let encryptedData = serializedData;
    for (const layer of this.encryptionLayers) {
      encryptedData = layer.encrypt(encryptedData);
    }

    // Final Base64 encoding for safe transmission
    return btoa(encryptedData);
  }

  public decrypt(encryptedPayload: string): any {
    let decryptedData = "";

    try {
      // First, decode from Base64
      const decodedData = atob(encryptedPayload);
      decryptedData = decodedData;

      // Then, apply decryption layers in reverse order
      for (let i = this.encryptionLayers.length - 1; i >= 0; i--) {
        decryptedData = this.encryptionLayers[i].decrypt(decryptedData);
      }

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("[EncryptionManager] Decryption failed:", error);
      throw new Error("Payload decryption failed.");
    }
  }

  private primaryEncrypt(data: string): string {
    // Simple XOR encryption with current key
    let encrypted = "";
    for (let i = 0; i < data.length; i++) {
      const charCode =
        data.charCodeAt(i) ^
        this.currentKey.charCodeAt(i % this.currentKey.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  }

  private primaryDecrypt(encryptedData: string): string {
    try {
      const decoded = atob(encryptedData);
      let decrypted = "";
      for (let i = 0; i < decoded.length; i++) {
        const charCode =
          decoded.charCodeAt(i) ^
          this.currentKey.charCodeAt(i % this.currentKey.length);
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (error) {
      console.error("Primary decryption failed:", error);
      return encryptedData;
    }
  }

  private generateKey(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  private startKeyRotation(): void {
    this.rotationTimer = setInterval(() => {
      this.rotateKeys();
    }, this.keyRotationInterval);
  }

  private rotateKeys(): void {
    this.currentKey = this.generateKey();
    console.log("Encryption keys rotated");
  }

  public destroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }
}
