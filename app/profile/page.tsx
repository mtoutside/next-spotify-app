"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface UserProfile {
  display_name: string;
  images: { url: string }[];
  id: string;
  email: string;
  external_urls: { spotify: string };
  href: string;
  country: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/");
      return;
    }

    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => router.push("/"));
  }, []);

  return (
    <>
      <h1>Spotify Profile</h1>
      {user ? (
        <table>
          <tbody>
            <tr>
              <td>Display name</td>
              <td>{user.display_name}</td>
            </tr>
            <tr>
              <td>Id</td>
              <td>{user.id}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{user.email}</td>
            </tr>
            <tr>
              <td>Spotify URI</td>
              <td>
                <a href={user.external_urls.spotify}>{user.external_urls.spotify}</a>
              </td>
            </tr>
            <tr>
              <td>Country</td>
              <td>{user.country}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
