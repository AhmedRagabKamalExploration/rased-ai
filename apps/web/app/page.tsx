"use client";

import { WebSDK } from "@rased-ai/web-sdk";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const webSDk = useRef(WebSDK.getInstance());
  useEffect(() => {
    webSDk.current.start({
      apiKey: "sk-1234567890abcdef1234567890abcdef",
    });
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
