"use client";

import { SdkInitConfig, WebSDK } from "@rased-ai/web-sdk";
import { useEffect, useRef, useState } from "react";

// Mock implementation of the WebSDK to resolve the module dependency.
// This allows the code to run in this environment without the real package.

export default function App() {
  const webSDk = useRef(WebSDK.getInstance());
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const sdk = webSDk.current;

    const initializeSDK = async () => {
      try {
        setIsConfigLoading(true);

        // Fetch SDK configuration from the backend
        const configResponse = await fetch("http://localhost:8000/v1/config", {
          headers: {
            "x-organisationid": "org-demo-12345678-abcd-efgh-ijkl-mnopqrstuvwx",
            authorization:
              "Bearer 8a86298e9283a5e45f5b6fa55fdfb31d82e648d2075a4ac84d2787281038430d",
          },
        });

        if (!configResponse.ok) {
          throw new Error("Failed to fetch SDK configuration");
        }

        const sdkConfig = await configResponse.json();
        console.log("SDK configuration received:", sdkConfig);

        const webSdkConfig: SdkInitConfig = {
          baseApiUrl: sdkConfig.base_api_url,
          organizationId: sdkConfig.organization_id,
          sessionId: sdkConfig.session_id,
          transactionId: sdkConfig.transaction_id,
          trigger: sdkConfig.trigger,
        };

        // Start the SDK with the fetched configuration
        await sdk.start(webSdkConfig);
        console.log("WebSDK started successfully");
      } catch (error) {
        console.error("Failed to start WebSDK:", error);
        setConfigError(error as string);
      } finally {
        setIsConfigLoading(false);
      }
    };

    initializeSDK();

    return () => {
      sdk.shutdown();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
      <a
        href="#start-of-content"
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
        }}
      >
        Skip to content
      </a>
      <h1>WebSDK Demo</h1>
    </div>
  );
}
