"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../page.module.css";

export default function Callback() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      // exchangeToken(code);
      saveTokenData(code);
    } else {
      setError("No authorization code found");
    }
  }, []);

  const exchangeToken = async (code: string) => {
    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        router.push("/");
      } else {
        setError("Failed to obtain access token");
      }
    } catch (err) {
      setError("An error occurred while exchangeing token");
    }
  };

  const saveTokenData = async (code: string) => {
    const codeVerifier = localStorage.getItem("codeVerifier");
    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, code_verifier: codeVerifier }),
      });
      const data = await response.json();

      if (data.access_token && data.refresh_token && data.expires_in) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("expires_at", (Date.now() + data.expires_in * 1000).toString());
        router.push("/");
      } else {
        setError("Failed to obtain access token");
      }
    } catch (err) {
      setError("An error occurred while exchangeing token");
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Processing authentication...</h1>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    </div>
  );
}
