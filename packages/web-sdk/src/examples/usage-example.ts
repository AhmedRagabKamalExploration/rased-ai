// /**
//  * Example usage of the enhanced Web SDK with new managers
//  * This demonstrates how to use EncryptionManager, MetadataManager, and TokenManager
//  */

// import { WebSDK } from "../web-SDK";
// import { type SdkInitConfig } from "../managers";

// // Example configuration
// const config: SdkInitConfig = {
//   organizationId: "org-12345",
//   sessionId: "session-67890",
//   transactionId: "txn-abcdef",
//   baseApiUrl: "https://api.example.com",
//   trigger: "{}",
// };

// // Initialize the SDK
// const sdk = WebSDK.getInstance();

// async function demonstrateUsage() {
//   try {
//     // Start the SDK
//     await sdk.start(config);

//     // Get manager instances
//     const metadataManager = sdk.getMetadataManager();
//     const tokenManager = sdk.getTokenManager();
//     const encryptionManager = sdk.getEncryptionManager();
//     const apiManager = sdk.getAPIManager();

//     // === MetadataManager Usage ===
//     console.log("=== MetadataManager Demo ===");

//     // Set custom metadata
//     metadataManager.setMetadata("customField", "customValue", "user");
//     metadataManager.setMetadata("pageTitle", document.title, "browser");
//     metadataManager.setMetadata("userAgent", navigator.userAgent, "browser");

//     // Update multiple metadata at once
//     metadataManager.updateMetadata(
//       {
//         browserLanguage: navigator.language,
//         screenResolution: `${screen.width}x${screen.height}`,
//         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       "system"
//     );

//     // Get specific metadata
//     const sessionId = metadataManager.getMetadata("sessionId");
//     console.log("Session ID:", sessionId);

//     // Get all metadata
//     const allMetadata = metadataManager.getMetadata();
//     console.log("All metadata:", allMetadata);

//     // Export metadata for batch processing
//     const batchMetadata = metadataManager.exportMetadataForBatch();
//     console.log("Batch metadata:", batchMetadata);

//     // === TokenManager Usage ===
//     console.log("\n=== TokenManager Demo ===");

//     // Generate and validate nonce
//     const nonce = tokenManager.generateNonce();
//     console.log("Generated nonce:", nonce);
//     console.log("Nonce valid:", tokenManager.validateNonce(nonce));

//     // Generate session token
//     const sessionToken = tokenManager.generateSessionToken();
//     console.log("Generated session token:", sessionToken);

//     // Get token status
//     const tokenStatus = tokenManager.getAllTokens();
//     console.log("Token status:", tokenStatus);

//     // Queue some data for nonce processing
//     const messageId1 = tokenManager.queueForNonce({
//       type: "test",
//       data: "message1",
//     });
//     const messageId2 = tokenManager.queueForNonce({
//       type: "test",
//       data: "message2",
//     });
//     console.log("Queued messages:", messageId1, messageId2);

//     // Process the queue
//     const processedMessages = tokenManager.processNonceQueue();
//     console.log("Processed messages:", processedMessages.length);

//     // Get queue status
//     const queueStatus = tokenManager.getQueueStatus();
//     console.log("Queue status:", queueStatus);

//     // === EncryptionManager Usage ===
//     console.log("\n=== EncryptionManager Demo ===");

//     // Encrypt sensitive data
//     const sensitiveData = {
//       username: "john_doe",
//       email: "john@example.com",
//       preferences: {
//         theme: "dark",
//         notifications: true,
//       },
//     };

//     const encryptedData = encryptionManager.encrypt(sensitiveData);
//     console.log("Encrypted data:", encryptedData);

//     // Decrypt the data
//     const decryptedData = encryptionManager.decrypt(encryptedData);
//     console.log("Decrypted data:", decryptedData);
//     console.log(
//       "Data matches:",
//       JSON.stringify(sensitiveData) === JSON.stringify(decryptedData)
//     );

//     // === APIManager Usage ===
//     console.log("\n=== APIManager Demo ===");

//     // Get API status
//     const apiStatus = apiManager.getStatus();
//     console.log("API Status:", apiStatus);

//     // Send some test data
//     const testBatch = {
//       events: [
//         { type: "page_view", timestamp: Date.now(), url: window.location.href },
//         { type: "user_action", timestamp: Date.now(), action: "click" },
//       ],
//       metadata: batchMetadata,
//     };

//     // This would normally send to the API
//     // await apiManager.sendEvents(testBatch);
//     console.log("Test batch prepared:", testBatch);

//     // === Heartbeat and Collection State ===
//     console.log("\n=== Heartbeat Demo ===");

//     // Set heartbeat state
//     metadataManager.setHeartbeatState("active");
//     console.log("Heartbeat state:", metadataManager.getHeartbeatState());

//     // Simulate some activity
//     setTimeout(() => {
//       metadataManager.setHeartbeatState("idle");
//       console.log(
//         "Heartbeat state changed to:",
//         metadataManager.getHeartbeatState()
//       );
//     }, 2000);

//     // === Cleanup Example ===
//     console.log("\n=== Cleanup Demo ===");

//     // Show current state
//     console.log("Metadata size:", metadataManager.getMetadataSize());
//     console.log("Token summary:", tokenManager.getTokenSummary());

//     // Clean up specific data
//     metadataManager.removeMetadata("customField");
//     console.log(
//       "Removed custom field, new size:",
//       metadataManager.getMetadataSize()
//     );

//     // Clear session metadata
//     metadataManager.clearSessionMetadata();
//     console.log("Cleared session metadata");
//   } catch (error) {
//     console.error("Demo failed:", error);
//   }
// }

// // Run the demo
// demonstrateUsage();

// // Example of using the managers in a real application
// export class ExampleApplication {
//   private sdk: WebSDK;
//   private metadataManager: any;
//   private tokenManager: any;
//   private encryptionManager: any;

//   constructor() {
//     this.sdk = WebSDK.getInstance();
//   }

//   async initialize() {
//     await this.sdk.start(config);
//     this.metadataManager = this.sdk.getMetadataManager();
//     this.tokenManager = this.sdk.getTokenManager();
//     this.encryptionManager = this.sdk.getEncryptionManager();
//   }

//   trackUserAction(action: string, data: any) {
//     // Encrypt sensitive user data
//     const encryptedData = this.encryptionManager.encrypt(data);

//     // Update metadata with action info
//     this.metadataManager.setMetadata("lastAction", action, "user");
//     this.metadataManager.setMetadata("lastActionTime", Date.now(), "system");

//     // Generate nonce for this action
//     const nonce = this.tokenManager.generateNonce();

//     console.log("Tracked action:", action, "with nonce:", nonce);
//   }

//   getSessionInfo() {
//     return {
//       metadata: this.metadataManager.getMetadata(),
//       tokens: this.tokenManager.getAllTokens(),
//       queueStatus: this.tokenManager.getQueueStatus(),
//     };
//   }

//   shutdown() {
//     this.sdk.shutdown();
//   }
// }
