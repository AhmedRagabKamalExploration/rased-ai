# Binding Module

## 🔬 The Research and "Why" Behind Device Binding

The core idea behind the Binding Module is to establish a secure, cryptographic link between the SDK running in the browser and the backend server. This technique, known as device attestation, provides a high-confidence signal for validating data origin and detecting impersonation or spoofing attempts.

## 🔐 Cryptographic Principles

Unlike simple fingerprinting, which can be vulnerable to spoofing, device binding uses asymmetric cryptography to create a trust anchor on the client.

## 🔑 Asymmetric Key Pairs

- **Key Generation**: The module generates a unique RSA key pair on the client's device using the Web Crypto API. The `privateKey` remains securely stored locally, while the corresponding `publicKey` is sent to the server.

- **Signing and Verification**: When a data payload is created, the `privateKey` is used to create a digital signature of the data. The server then uses the `publicKey` to verify this signature. If the signature is valid, the server has cryptographic proof that the data was signed by the legitimate, original device.

## 🛡️ Anti-Spoofing and Integrity

- **High-Confidence Attestation**: This method makes it nearly impossible for a fraudster to impersonate a device. An attacker would not only need to steal the entire device fingerprint but also the `privateKey` to forge a valid signature.

- **Tamper Detection**: Any modification to the data payload in transit will cause the signature verification on the server to fail, immediately flagging the event as fraudulent.

- **Session Persistence**: The `webInstanceId` is a persistent identifier for the key pair, allowing the backend to link multiple sessions back to the same device even if other, more ephemeral data points have changed.

## 🎛️ Implementation Strategy

The implementation relies on the browser's native Web Crypto API (`window.crypto.subtle`). This API is secure, non-blocking, and highly optimized for cryptographic operations.

- **Key Pair Management**: The module checks for a stored key pair. If none exists, it generates a new one. This key pair is then exported and stored securely for persistence across sessions.

- **Data Signing**: A small, high-entropy piece of data (the `data` field) is created, which serves as the "message" to be signed. This could be a hash of other fingerprints collected by the SDK.

- **Payload Creation**: The final payload includes the raw data, the generated signature (as a Uint8Array), and the `publicKey` (in JWK format). This gives the backend all the necessary information to perform a cryptographic verification.

## 📊 Technical Implementation and Data Indicators

### 🏗️ Event Structure

```typescript
interface BindingEvent {
  eventId: string;
  eventType: "binding" | "binding.error";
  moduleName: "binding";
  timestamp: string;
  payload: BindingData | BindingError;
}
```

### 📋 Data Structures

#### ✅ Successful Generation (`binding`)

```typescript
interface BindingData {
  data: number[]; // The data blob that was signed
  signature: number[]; // The digital signature of the data
  publicKey: {
    alg: string;
    e: string;
    ext: boolean;
    kty: string;
    n: string;
    key_ops: string[];
  };
  webInstanceId: string; // A persistent identifier for the key pair
  timestamp: number;
}
```

#### ❌ Error Response (`binding.error`)

```typescript
interface BindingError {
  error: string;
  errorCode:
    | "CRYPTO_API_UNSUPPORTED"
    | "KEY_GENERATION_FAILED"
    | "SIGNING_FAILED";
  details: {
    message: string;
  };
}
```
