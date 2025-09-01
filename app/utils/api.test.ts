import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { fetchUserProfile, fetchWithAuth } from '@/app/utils/api';
import { server, errorHandlers, mockUser } from '@/app/mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
    global.console.error = vi.fn();
  });

  describe('fetchUserProfile', () => {
    describe('正常系', () => {
      it('有効なトークンでユーザーデータを取得できる', async () => {
        const user = await fetchUserProfile('valid-token');
        expect(user).toEqual(mockUser);
        expect(user.display_name).toBe('Test User');
        expect(user.id).toBe('1234567890');
      });
    });

    describe('異常系', () => {
      beforeEach(() => {
        server.use(...errorHandlers);
      });
      afterEach(() => {
        server.resetHandlers();
      });

      it('API リクエストが失敗した場合にエラーハンドリングが機能する', async () => {
        await expect(fetchUserProfile('invalid-token')).rejects.toThrow('API request failed: 500');
      });
    });
  });

  describe('fetchWithAuth', () => {
    describe('正常系', () => {
      it('GETリクエストが正常に動作する', async () => {
        const result = await fetchWithAuth('https://api.spotify.com/v1/me', 'valid-token');
        expect(result).toEqual(mockUser);
      });

      it('POSTリクエストでbodyを送信できる', async () => {
        server.use(
          http.post('https://api.example.com/test', async ({ request }) => {
            const body = await request.json();
            return HttpResponse.json({ received: body });
          }),
        );

        const testBody = { test: 'data' };
        const result = await fetchWithAuth(
          'https://api.example.com/test',
          'valid-token',
          'POST',
          testBody,
        );
        expect(result.received).toEqual(testBody);
      });
    });

    describe('401エラー時のトークンリフレッシュ', () => {
      beforeEach(() => {
        vi.mocked(window.sessionStorage.getItem).mockReturnValue('refresh-token');

        server.use(
          http.get('https://api.spotify.com/v1/me', ({ request }) => {
            const authHeader = request.headers.get('Authorization');
            if (authHeader === 'Bearer expired-token') {
              return new Response(null, { status: 401 });
            }
            if (authHeader === 'Bearer new-token') {
              return HttpResponse.json(mockUser);
            }
            return new Response(null, { status: 401 });
          }),
          http.post('/api/auth/refresh', () => {
            return HttpResponse.json({
              access_token: 'new-token',
              expires_in: 3600,
            });
          }),
        );
      });

      it('401エラー時にトークンをリフレッシュしてリトライする', async () => {
        const result = await fetchWithAuth('https://api.spotify.com/v1/me', 'expired-token');
        expect(result).toEqual(mockUser);
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith('access_token', 'new-token');
      });

      it('トークンリフレッシュに失敗した場合はエラーを投げる', async () => {
        server.use(
          http.post('/api/auth/refresh', () => {
            return new Response(null, { status: 500 });
          }),
        );

        await expect(
          fetchWithAuth('https://api.spotify.com/v1/me', 'expired-token'),
        ).rejects.toThrow('Failed to refresh token');
      });

      it('リフレッシュトークンがない場合はエラーを投げる', async () => {
        vi.mocked(window.sessionStorage.getItem).mockReturnValue(null);

        await expect(
          fetchWithAuth('https://api.spotify.com/v1/me', 'expired-token'),
        ).rejects.toThrow('Failed to refresh token');
      });
    });

    describe('異常系', () => {
      it('ネットワークエラーの場合は適切にエラーを投げる', async () => {
        server.use(
          http.get('https://api.spotify.com/v1/me', () => {
            return new Response(null, { status: 404 });
          }),
        );

        await expect(fetchWithAuth('https://api.spotify.com/v1/me', 'valid-token')).rejects.toThrow(
          'API request failed: 404',
        );
        expect(global.console.error).toHaveBeenCalledWith('API request failed: 404 ');
      });
    });
  });
});
