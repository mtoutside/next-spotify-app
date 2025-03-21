import { refreshAccessToken } from './auth';

export const fetchWithAuth = async (url: string, token: string, method = 'GET', body?: object) => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(url, options);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error('Failed to refresh token');
    }

    headers.Authorization = `Bearer ${newToken}`;
    response = await fetch(url, options);
  }

  if (!response.ok) {
    console.error(`API request failed: ${response.status} ${response.statusText}`);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

export const fetchUserProfile = async (token: string) => {
  return fetchWithAuth('https://api.spotify.com/v1/me', token);
};
