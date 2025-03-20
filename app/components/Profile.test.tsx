import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { it, expect } from 'vitest';
import { mockUser } from '@/app/mocks/server';
import Profile from './Profile';


it("ユーザー情報を正しく表示する", () => {
  const user = mockUser;
  render(<Profile user={user} />);
  expect(screen.getByText("Test User")).toBeInTheDocument();
  expect(screen.getByAltText("Test User")).toHaveAttribute(
    "src",
    "https://example.com/image.jpg"
  );
  expect(screen.getByText("1234567890")).toBeInTheDocument();
});
