import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { it, expect } from 'vitest';
import { mockUser } from '@/app/mocks/server';
import { UserProfile } from '@/app/types';
import Profile from './Profile';

interface ProfileProps {
  User: UserProfile | null;
}

it("ユーザー情報を正しく表示する", () => {
  const user: ProfileProps = mockUser;
  render(<Profile user={ user } />);
  expect(screen.getByText("Test User")).toBeInTheDocument();
  expect(screen.getByAltText("Test User")).toHaveAttribute(
    "src",
    "https://test.com/avatar.png"
  );
});
