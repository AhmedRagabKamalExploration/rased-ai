"use client";

import { WebSDK } from "@rased-ai/web-sdk";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const webSDk = useRef(WebSDK.getInstance());
  useEffect(() => {
    const sdk = webSDk.current; // Capture ref value to avoid linting warning

    const initializeSDK = async () => {
      try {
        // Start the SDK immediately - DOM is already loaded in React
        await sdk.start({
          apiKey: "sk-1234567890abcdef1234567890abcdef",
        });
        console.log("WebSDK started successfully");
      } catch (error) {
        console.error("Failed to start WebSDK:", error);
      }
    };

    initializeSDK();

    return () => {
      sdk.shutdown();
    };
  }, []);

  return (
    <div>
      <a
        href="#start-of-content"
        data-skip-target-assigned="false"
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
        }}
      >
        Skip to content
      </a>
      <h1>Hello, world!</h1>
    </div>
  );
}
