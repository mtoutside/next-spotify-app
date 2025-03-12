import { NextRequest, NextResponse } from 'next/server';

const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const redirectUrl = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ?? "";
const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { code, code_verifier } = await req.json();

    console.log(code, code_verifier);
    if (!code || !code_verifier) {
      return NextResponse.json({ error: 'Missing code or code_verifier' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUrl);
    params.append('code_verifier', code_verifier);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
