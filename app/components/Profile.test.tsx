import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockUser } from '@/app/mocks/server';
import Profile from './Profile';

describe('Profile Component', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        clear: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: {
        reload: vi.fn(),
      },
      writable: true,
    });
  });

  describe('ユーザー情報の表示', () => {
    it('ユーザー情報を正しく表示する', () => {
      render(<Profile user={mockUser} />);

      expect(screen.getByText('Spotify Profile')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByAltText('Test User')).toHaveAttribute(
        'src',
        'https://example.com/image.jpg',
      );
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('example@example.com')).toBeInTheDocument();
      expect(screen.getByText('JP')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://open.spotify.com/user/1234567890',
      );
    });

    it('ユーザーがnullの場合はローディング表示する', () => {
      render(<Profile user={null} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /log out/i })).not.toBeInTheDocument();
    });

    it('画像がない場合は代替テキストのみ表示される', () => {
      const userWithoutImage = { ...mockUser, images: [] };
      render(<Profile user={userWithoutImage} />);

      const img = screen.getByAltText('Test User');
      expect(img).not.toHaveAttribute('src');
    });
  });

  describe('ログアウト機能', () => {
    it('ログアウトボタンをクリックするとsessionStorageをクリアしてページをリロードする', () => {
      render(<Profile user={mockUser} />);

      const logoutButton = screen.getByRole('button', { name: /log out/i });
      fireEvent.click(logoutButton);

      expect(window.sessionStorage.clear).toHaveBeenCalledOnce();
      expect(window.location.reload).toHaveBeenCalledOnce();
    });
  });
});
