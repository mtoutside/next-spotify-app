"use server";
import { NextRequest, NextResponse } from "next/server";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json();
    if (!refresh_token) {
      return NextResponse.json({ error: "Missins refresh token" }, { status: 400 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token,
    });

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to refresh token" },
        { status: response.status });
    }

    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
