"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Profile from "./components/Profile";
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
  const [accessToken, setAccesstoken] = useState<string | null>(null);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
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
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("expires_at", (Date.now() + data.expires_in * 1000).toString());
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
    const expiresAt = Number(localStorage.getItem("expires_at"));
    const refreshToken = localStorage.getItem("refresh_token");


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
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const generateCodeVerifier = () => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomValues = crypto.getRandomValues(new Uint8Array(64));
    return Array.from(randomValues).map(x => possible[x % possible.length]).join("");
  }

  const generateCodeChallenge = async () => {
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem("codeVerifier", codeVerifier);

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
    localStorage.clear();
    router.push("/");
  };


  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error("Failed to fetch user profile", response.status, response.statusText);

        if (response.status === 401 || response.status === 403) {
          console.error("Unauthorized access. Logging out...")
          logout();
        } else {
          console.error("Server error. Redirecting to home...")
          router.push("/");
        }
        return;
      }

      const data: UserProfile = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      logout();
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {user ? (
          <div>
            <h1>Logged in as {user.display_name}</h1>
            <Profile user={user} />
            <button onClick={logout}>Log out</button>
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
