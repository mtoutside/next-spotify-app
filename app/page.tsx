"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Profile from "./components/Profile";
import { fetchUserProfile } from "./utils/api";
import styles from "./page.module.css";

interface UserProfile {
  display_name: string;
  images: { url: string }[];
  id: string;
  email: string;
  external_urls: { spotify: string };
  href: string;
  country: string;
}

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!;
const scope = "user-read-private user-read-email";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.error("No refresh token found, loggin out...")
      logout();
      return;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await response.json();
      if (data.access_token && data.expires_in) {
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("expires_at", (Date.now() + data.expires_in * 1000).toString());
      } else {
        console.error("Failed to refresh token, log out...");
        logout();
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
    }
  }

  useEffect(() => {
    const expiresAt = Number(sessionStorage.getItem("expires_at"));
    const refreshToken = sessionStorage.getItem("refresh_token");


    if (!expiresAt || !refreshToken) return;

    const expiresInMs = expiresAt - Date.now();
    if (expiresInMs <= 5000) {
      refreshAccessToken();
    } else {
      const timeout = setTimeout(refreshAccessToken, expiresInMs - 5000);
      return () => clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found, Redirecting to home...");
        router.push("/");
        return;
      }

      try {
        const userData = await fetchUserProfile(token);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        sessionStorage.clear();
        router.push("/");
      }
    };

    fetchData();
  }, []);

  const generateCodeVerifier = () => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    return Array.from(randomValues).map(x => possible[x % possible.length]).join("");
  }

  const generateCodeChallenge = async () => {
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem("codeVerifier", codeVerifier);

    const data = new TextEncoder().encode(codeVerifier);
    const hashed = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const loginWithSpotify = async () => {
    const codeChallenge = await generateCodeChallenge();
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scope)}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    window.location.href = authUrl;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.clear();
    location.reload();
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {user ? (
          <div>
            <h1>Logged in as {user.display_name}</h1>
            <Profile user={user} />
          </div>
        ) : (
          <div>
            <h1>Welcome to the OAuth2 PKCE Example</h1>
            <button onClick={loginWithSpotify}>Log in with Spotify</button>
          </div>
        )}
      </main>
    </div>
  );
}
