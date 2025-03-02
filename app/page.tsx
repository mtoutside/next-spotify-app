"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAccesstoken(token);
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
    setAccesstoken(null);
    setRefreshToken(null);
    setExpiresIn(null);
    localStorage.removeItem("access_token");
  };


  const fetchUserProfile = async (token: string) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: UserProfile = await response.json();
    setUser(data);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {user ? (
          <div>
            <h1>Logged in as {user.display_name}</h1>
            <img width="150" src={user.images?.[0]?.url} alt={user.display_name} />
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
