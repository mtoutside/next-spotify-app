export const fetchWithAuth = async (url: string, token: string, method = "GET", body?: any) => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    console.error(`API request failed: ${response.status} ${response.statusText}`);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

export const fetchUserProfile = async (token: string) => {
  return fetchWithAuth("https://api.spotify.com/v1/me", token);
};
