"use client";

import { WebSDK } from "@rased-ai/web-sdk";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const webSDk = useRef(WebSDK.getInstance());
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    const sdk = webSDk.current; // Capture ref value to avoid linting warning

    const initializeSDK = async () => {
      try {
        // Start the SDK immediately - DOM is already loaded in React
        await sdk.start({
          baseApiUrl: "https://api.rased.ai",
          organizationId: "org-1234567890",
          sessionId: "ssn-1234567890",
          transactionId: "txn-1234567890",
          trigger: '{"#trigger":"submit"}',
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

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate login API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Login attempt:", formData);
      alert("Login successful! (Demo)");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      }}
    >
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

      <div
        id="start-of-content"
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          margin: "1rem",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#333",
            fontSize: "1.75rem",
            fontWeight: "600",
          }}
        >
          Sign In
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `2px solid ${errors.email ? "#ef4444" : "#d1d5db"}`,
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = "#3b82f6";
                }
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = "#d1d5db";
                }
              }}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `2px solid ${errors.password ? "#ef4444" : "#d1d5db"}`,
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = "#3b82f6";
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = "#d1d5db";
                }
              }}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
              color: "white",
              padding: "0.75rem",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "#3b82f6";
              }
            }}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "#6b7280",
            fontSize: "0.875rem",
          }}
        >
          Don&apos;t have an account?{" "}
          <a
            href="#"
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontWeight: "500",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
