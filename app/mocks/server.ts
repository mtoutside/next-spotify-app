import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  http.get('https://api.spotify.com/v1/me', () => {
    return HttpResponse.json({
      display_name: 'Test User',
      images: [{ url: 'https://example.com/image.jpg' }],
      id: '1234567890',
      email: 'example@example.com',
      external_urls: { spotify: 'https://open.spotify.com/user/1234567890' },
      country: 'JP',
    });
  }),
);
