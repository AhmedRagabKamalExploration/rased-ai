export interface EncryptionLayer {
  name: string;
  encrypt(data: any): string;
  decrypt(encryptedData: string): any;
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
    // Primary encryption layer (AES-like)
    this.encryptionLayers.push({
      name: "primary",
      encrypt: (data: any) => this.primaryEncrypt(data),
      decrypt: (encryptedData: string) => this.primaryDecrypt(encryptedData),
    });

    // Secondary encryption layer (Base64 + XOR)
    this.encryptionLayers.push({
      name: "secondary",
      encrypt: (data: any) => this.secondaryEncrypt(data),
      decrypt: (encryptedData: string) => this.secondaryDecrypt(encryptedData),
    });

    // Tertiary encryption layer (Custom algorithm)
    this.encryptionLayers.push({
      name: "tertiary",
      encrypt: (data: any) => this.tertiaryEncrypt(data),
      decrypt: (encryptedData: string) => this.tertiaryDecrypt(encryptedData),
    });

    // Quaternary encryption layer (Final obfuscation)
    this.encryptionLayers.push({
      name: "quaternary",
      encrypt: (data: any) => this.quaternaryEncrypt(data),
      decrypt: (encryptedData: string) => this.quaternaryDecrypt(encryptedData),
    });
  }

  public encrypt(data: any): string {
    let encryptedData = JSON.stringify(data);

    // Apply all encryption layers in sequence
    for (const layer of this.encryptionLayers) {
      encryptedData = layer.encrypt(encryptedData);
    }

    return encryptedData;
  }

  public decrypt(encryptedData: string): any {
    let decryptedData = encryptedData;

    // Apply decryption layers in reverse order
    for (let i = this.encryptionLayers.length - 1; i >= 0; i--) {
      decryptedData = this.encryptionLayers[i].decrypt(decryptedData);
    }

    try {
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Failed to parse decrypted data:", error);
      return null;
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

  private secondaryEncrypt(data: string): string {
    // Base64 encoding with additional obfuscation
    const encoded = btoa(data);
    let obfuscated = "";
    for (let i = 0; i < encoded.length; i++) {
      const charCode = encoded.charCodeAt(i) + (i % 10);
      obfuscated += String.fromCharCode(charCode);
    }
    return obfuscated;
  }

  private secondaryDecrypt(encryptedData: string): string {
    try {
      let deobfuscated = "";
      for (let i = 0; i < encryptedData.length; i++) {
        const charCode = encryptedData.charCodeAt(i) - (i % 10);
        deobfuscated += String.fromCharCode(charCode);
      }
      return atob(deobfuscated);
    } catch (error) {
      console.error("Secondary decryption failed:", error);
      return encryptedData;
    }
  }

  private tertiaryEncrypt(data: string): string {
    // Custom character shifting algorithm
    let encrypted = "";
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const shift = (i * 7 + 13) % 26;
      if (charCode >= 65 && charCode <= 90) {
        encrypted += String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
      } else if (charCode >= 97 && charCode <= 122) {
        encrypted += String.fromCharCode(((charCode - 97 + shift) % 26) + 97);
      } else {
        encrypted += data[i];
      }
    }
    return encrypted;
  }

  private tertiaryDecrypt(encryptedData: string): string {
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
  }

  private quaternaryEncrypt(data: string): string {
    // Final obfuscation layer
    let obfuscated = "";
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      const obfuscatedChar = charCode ^ 0xaa; // XOR with 0xAA
      obfuscated += obfuscatedChar.toString(16).padStart(2, "0");
    }
    return obfuscated;
  }

  private quaternaryDecrypt(encryptedData: string): string {
    try {
      let decrypted = "";
      for (let i = 0; i < encryptedData.length; i += 2) {
        const hex = encryptedData.substr(i, 2);
        const charCode = parseInt(hex, 16) ^ 0xaa;
        decrypted += String.fromCharCode(charCode);
      }
      return decrypted;
    } catch (error) {
      console.error("Quaternary decryption failed:", error);
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
