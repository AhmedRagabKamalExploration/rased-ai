# Rased Web SDK Installation Guide

Welcome to the Rased Web SDK installation guide. This document provides comprehensive instructions for integrating the Rased Web SDK into your web application using various installation methods.

## Table of Contents

- [Overview](#overview)
- [Installation Methods](#installation-methods)
  - [1. NPM/Yarn Package Manager (Recommended)](#1-npmyarn-package-manager-recommended)
  - [2. CDN Integration](#2-cdn-integration)
  - [3. Self-Hosting (Maximum Security)](#3-self-hosting-maximum-security)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Rased Web SDK is a comprehensive behavioral analytics and fraud detection solution that can be integrated into your web application through multiple methods. Choose the installation method that best fits your project's architecture and security requirements.

### Key Features

- 🔒 **Multi-layer Security**: 4-layer encryption with automatic key rotation
- 📊 **38 Data Collection Modules**: Comprehensive behavioral and device fingerprinting
- 🚀 **High Performance**: Optimized for minimal impact on your application
- 🛡️ **Privacy Compliant**: GDPR and CCPA compliant data collection
- 🔧 **Easy Integration**: Simple API with comprehensive documentation

---

## Installation Methods

### 1. NPM/Yarn Package Manager (Recommended)

This method is ideal for modern web applications that use a build process (React, Angular, Vue, etc.).

#### Step 1: Install the Package

Choose your preferred package manager and run one of the following commands in your project's terminal:

```bash
# Using npm
npm install @rased-ai/web-sdk

# Using yarn
yarn add @rased-ai/web-sdk

# Using pnpm
pnpm add @rased-ai/web-sdk
```

#### Step 2: Import and Initialize

In your application's source code (e.g., in a main component or initialization file), import and start the SDK:

```typescript
import { WebSDK } from "@rased-ai/web-sdk";

// Get a singleton instance of the SDK
const sdk = WebSDK.getInstance();

// Start the SDK with your configuration
await sdk.start({
  organizationId: "YOUR_ORGANIZATION_ID",
  sessionId: "UNIQUE_SESSION_ID",
  transactionId: "UNIQUE_TRANSACTION_ID",
  baseApiUrl: "https://api.your-backend.com",
  deviceId: "optional-device-id", // Optional
  sessionDuration: 3600, // Optional, in seconds
  metadata: {
    // Optional
    userId: "user-123",
    customField: "value",
  },
});
```

#### Step 3: TypeScript Support

The SDK includes full TypeScript definitions. If you're using TypeScript, you'll get complete type safety and IntelliSense support.

```typescript
import { WebSDK, type SdkInitConfig } from "@rased-ai/web-sdk";

const config: SdkInitConfig = {
  organizationId: "org-123",
  sessionId: "session-456",
  transactionId: "txn-789",
  baseApiUrl: "https://api.example.com",
};

const sdk = WebSDK.getInstance();
await sdk.start(config);
```

---

### 2. CDN Integration

This is a quick and easy way to add the SDK to any website without a build process.

#### Step 1: Add the Script Tag

Place the following `<script>` tag in the `<head>` of your HTML file. We recommend using a specific version for stability:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Application</title>

    <!-- Rased Web SDK -->
    <script
      src="https://cdn.rased.ai/web-sdk/1.0.0/web-sdk.umd.js"
      async
      defer
    ></script>
  </head>
  <body>
    <!-- Your application content -->
  </body>
</html>
```

#### Step 2: Initialize the SDK

After the script has loaded, the SDK will be available as a global variable `RasedSDK`. Initialize it when the page loads:

```html
<script>
  window.addEventListener("load", function () {
    // Wait for SDK to be available
    if (typeof RasedSDK !== "undefined") {
      const sdk = RasedSDK.WebSDK.getInstance();

      sdk
        .start({
          organizationId: "YOUR_ORGANIZATION_ID",
          sessionId: "UNIQUE_SESSION_ID",
          transactionId: "UNIQUE_TRANSACTION_ID",
          baseApiUrl: "https://api.your-backend.com",
        })
        .then(() => {
          console.log("Rased SDK initialized successfully");
        })
        .catch((error) => {
          console.error("Failed to initialize Rased SDK:", error);
        });
    } else {
      console.error("Rased SDK failed to load");
    }
  });
</script>
```

#### Alternative: ES6 Modules via CDN

You can also use ES6 modules directly from the CDN:

```html
<script type="module">
  import { WebSDK } from "https://cdn.rased.ai/web-sdk/1.0.0/web-sdk.esm.js";

  const sdk = WebSDK.getInstance();
  await sdk.start({
    organizationId: "YOUR_ORGANIZATION_ID",
    sessionId: "UNIQUE_SESSION_ID",
    transactionId: "UNIQUE_TRANSACTION_ID",
    baseApiUrl: "https://api.your-backend.com",
  });
</script>
```

---

### 3. Self-Hosting (Maximum Security)

For clients with strict security policies, such as financial institutions, self-hosting the SDK is the recommended approach. This ensures no external scripts are loaded from third-party domains.

#### Step 1: Obtain the SDK File

Contact our support team to receive the `web-sdk.umd.js` file for self-hosting.

#### Step 2: Host the SDK File

Upload the `web-sdk.umd.js` file to your web server in a secure location:

```
your-domain.com/
├── assets/
│   ├── js/
│   │   └── web-sdk.umd.js
│   └── css/
└── index.html
```

#### Step 3: Include the Script

Add a `<script>` tag to your HTML to load the SDK from your own domain:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Application</title>

    <!-- Self-hosted Rased Web SDK -->
    <script src="/assets/js/web-sdk.umd.js" async defer></script>
  </head>
  <body>
    <!-- Your application content -->
  </body>
</html>
```

#### Step 4: Initialize the SDK

The initialization process is identical to the CDN method:

```html
<script>
  window.addEventListener("load", function () {
    if (typeof RasedSDK !== "undefined") {
      const sdk = RasedSDK.WebSDK.getInstance();

      sdk.start({
        organizationId: "YOUR_ORGANIZATION_ID",
        sessionId: "UNIQUE_SESSION_ID",
        transactionId: "UNIQUE_TRANSACTION_ID",
        baseApiUrl: "https://api.your-backend.com",
      });
    }
  });
</script>
```

---

## Configuration

### Required Parameters

| Parameter        | Type     | Description                           |
| ---------------- | -------- | ------------------------------------- |
| `organizationId` | `string` | Your organization's unique identifier |
| `sessionId`      | `string` | Unique session identifier             |
| `transactionId`  | `string` | Unique transaction identifier         |
| `baseApiUrl`     | `string` | Backend API URL for data transmission |

### Optional Parameters

| Parameter         | Type     | Default        | Description                |
| ----------------- | -------- | -------------- | -------------------------- |
| `deviceId`        | `string` | Auto-generated | Unique device identifier   |
| `sessionDuration` | `number` | `3600`         | Session timeout in seconds |
| `trigger`         | `string` | `null`         | Trigger configuration JSON |
| `metadata`        | `object` | `{}`           | Additional metadata object |

### Example Configuration

```typescript
const config = {
  // Required parameters
  organizationId: "org-12345678",
  sessionId: "session-abcdef123456",
  transactionId: "txn-987654321",
  baseApiUrl: "https://api.rased.ai",

  // Optional parameters
  deviceId: "device-xyz789",
  sessionDuration: 7200, // 2 hours
  trigger: '{"#trigger":"form_submit"}',
  metadata: {
    userId: "user-12345",
    pageType: "checkout",
    customField: "value",
  },
};
```

---

## Best Practices

### 🔒 Security

- **Version Pinning**: Always pin the SDK to a specific version to prevent unexpected changes
- **Self-Hosting**: For financial institutions, use self-hosting to maintain full control
- **HTTPS Only**: Ensure all communications use HTTPS
- **Content Security Policy**: Configure CSP headers to allow the SDK

### ⚡ Performance

- **Asynchronous Loading**: Use `async` and `defer` attributes on script tags
- **Lazy Initialization**: Initialize the SDK only when needed
- **Error Handling**: Implement proper error handling for SDK initialization

```typescript
// Example: Lazy initialization with error handling
async function initializeRasedSDK() {
  try {
    const sdk = WebSDK.getInstance();
    await sdk.start(config);
    console.log("SDK initialized successfully");
  } catch (error) {
    console.error("SDK initialization failed:", error);
    // Implement fallback behavior
  }
}

// Initialize when needed
document.addEventListener("DOMContentLoaded", initializeRasedSDK);
```

### 🛡️ Privacy Compliance

- **User Consent**: Obtain user consent before initializing the SDK
- **Data Minimization**: Only collect necessary data
- **Transparency**: Inform users about data collection

```typescript
// Example: Consent-based initialization
function initializeWithConsent() {
  if (hasUserConsent()) {
    const sdk = WebSDK.getInstance();
    sdk.start(config);
  } else {
    console.log("User consent required for analytics");
  }
}
```

---

## Troubleshooting

### Common Issues

#### SDK Not Loading

**Problem**: SDK fails to load from CDN or local server

**Solutions**:

- Check network connectivity
- Verify the CDN URL is correct
- Ensure the local file path is accessible
- Check browser console for CORS errors

#### Initialization Errors

**Problem**: SDK initialization fails

**Solutions**:

```typescript
// Check configuration validity
const config = {
  organizationId: "valid-org-id",
  sessionId: "valid-session-id",
  transactionId: "valid-transaction-id",
  baseApiUrl: "https://valid-api-url.com",
};

// Verify API connectivity
fetch(config.baseApiUrl + "/health")
  .then((response) => console.log("API accessible"))
  .catch((error) => console.error("API not accessible:", error));
```

#### Data Not Being Collected

**Problem**: SDK loads but no data is being collected

**Solutions**:

```typescript
// Enable debug mode
localStorage.setItem("rased-debug", "true");

// Check SDK status
const sdk = WebSDK.getInstance();
console.log("SDK status:", sdk.getStatus());

// Listen for events
sdk.on("data:collected", (data) => {
  console.log("Data collected:", data);
});
```

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable debug mode
localStorage.setItem("rased-debug", "true");

// Debug information will be logged to console
console.log("[Rased SDK Debug] Module initialized:", moduleName);
console.log("[Rased SDK Debug] Data collected:", data);
console.log("[Rased SDK Debug] API request:", request);
```

### Support

For additional support:

- 📧 **Email**: support@rased.ai
- 📚 **Documentation**: [Technical Documentation](./TECHNICAL_DOCUMENTATION.md)
- 🐛 **Issues**: Report issues through your account dashboard
- 💬 **Chat**: Live chat support available in your dashboard

---

## Next Steps

After successful installation:

1. **Configure Backend**: Set up your backend to receive SDK data
2. **Test Integration**: Verify data collection in your development environment
3. **Monitor Performance**: Use the built-in performance monitoring
4. **Review Documentation**: Explore the comprehensive technical documentation

For detailed technical information, see the [Technical Documentation](./TECHNICAL_DOCUMENTATION.md).
