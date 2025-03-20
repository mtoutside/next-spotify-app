import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import { fetchUserProfile } from '@/app/utils/api';
import { server, errorHandlers } from '@/app/mocks/server';

describe('fetchUserProfile 正常系', () => {
  it('ユーザーデータを取得できる', async () => {
    const user = await fetchUserProfile('test-token');
    expect(user.display_name).toBe('Test User');
  });
});

describe('fetchUserProfile 異常系', () => {
  beforeEach(() => {
    server.use(...errorHandlers);
  });
  afterEach(() => {
    server.resetHandlers();
  });

  it('API リクエストが失敗した場合にエラーハンドリングが機能する', async () => {
    await expect(fetchUserProfile('invalid-token')).rejects.toThrow('API request failed');
  });
});
