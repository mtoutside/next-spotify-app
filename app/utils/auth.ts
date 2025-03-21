export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = sessionStorage.getItem('refresh_token');
  if (!refreshToken) {
    console.error('No refresh token found, loggin out...');
    sessionStorage.clear();
    return null;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await response.json();
    if (data.access_token && data.expires_in) {
      sessionStorage.setItem('access_token', data.access_token);
      sessionStorage.setItem('expires_at', (Date.now() + data.expires_in * 1000).toString());
      return data.access_token;
    } else {
      console.error('Failed to refresh token, log out...');
      sessionStorage.clear();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    sessionStorage.clear();
    return null;
  }
};
