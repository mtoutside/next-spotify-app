import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refreshAccessToken } from '@/app/utils/auth';
import { server } from '@/app/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Auth Utils', () => {
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

  describe('refreshAccessToken', () => {
    describe('正常系', () => {
      beforeEach(() => {
        vi.mocked(window.sessionStorage.getItem).mockReturnValue('valid-refresh-token');

        server.use(
          http.post('/api/auth/refresh', () => {
            return HttpResponse.json({
              access_token: 'new-access-token',
              expires_in: 3600,
            });
          }),
        );
      });

      it('リフレッシュトークンが存在する場合、新しいアクセストークンを取得する', async () => {
        const result = await refreshAccessToken();

        expect(result).toBe('new-access-token');
        expect(window.sessionStorage.getItem).toHaveBeenCalledWith('refresh_token');
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'access_token',
          'new-access-token',
        );
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'expires_at',
          expect.any(String),
        );
      });

      it('有効期限を正しく設定する', async () => {
        const mockNow = 1000000;
        vi.spyOn(Date, 'now').mockReturnValue(mockNow);

        await refreshAccessToken();

        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'expires_at',
          (mockNow + 3600 * 1000).toString(),
        );
      });
    });

    describe('異常系', () => {
      it('リフレッシュトークンが存在しない場合、sessionStorageをクリアしてnullを返す', async () => {
        vi.mocked(window.sessionStorage.getItem).mockReturnValue(null);

        const result = await refreshAccessToken();

        expect(result).toBeNull();
        expect(window.sessionStorage.clear).toHaveBeenCalledOnce();
        expect(global.console.error).toHaveBeenCalledWith('No refresh token found, loggin out...');
      });

      it('リフレッシュAPIが失敗した場合、sessionStorageをクリアしてnullを返す', async () => {
        vi.mocked(window.sessionStorage.getItem).mockReturnValue('valid-refresh-token');

        server.use(
          http.post('/api/auth/refresh', () => {
            return new Response(null, { status: 500 });
          }),
        );

        const result = await refreshAccessToken();

        expect(result).toBeNull();
        expect(window.sessionStorage.clear).toHaveBeenCalledOnce();
        expect(global.console.error).toHaveBeenCalledWith(
          'Error refreshing token:',
          expect.any(Error),
        );
      });

      it('レスポンスにaccess_tokenがない場合、sessionStorageをクリアしてnullを返す', async () => {
        vi.mocked(window.sessionStorage.getItem).mockReturnValue('valid-refresh-token');

        server.use(
          http.post('/api/auth/refresh', () => {
            return HttpResponse.json({ error: 'invalid_grant' });
          }),
        );

        const result = await refreshAccessToken();

        expect(result).toBeNull();
        expect(window.sessionStorage.clear).toHaveBeenCalledOnce();
        expect(global.console.error).toHaveBeenCalledWith('Failed to refresh token, log out...');
      });

      it('ネットワークエラーの場合、sessionStorageをクリアしてnullを返す', async () => {
        vi.mocked(window.sessionStorage.getItem).mockReturnValue('valid-refresh-token');

        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const result = await refreshAccessToken();

        expect(result).toBeNull();
        expect(window.sessionStorage.clear).toHaveBeenCalledOnce();
        expect(global.console.error).toHaveBeenCalledWith(
          'Error refreshing token:',
          expect.any(Error),
        );
      });
    });
  });
});
