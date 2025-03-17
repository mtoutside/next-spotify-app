import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { it, expect } from 'vitest';
import  { mockUser } from '@/mocks/server';
import { UserProfile } from '@/types';
import Profile from './Profile';

it("ユーザー情報を正しく表示する", () => {
  const props: UserProfile = mockUser;
  render(<div />);
  // render(<Profile user={ props } />);
  expect(screen.getByText("Test User")).toBeInTheDocument();
  expect(screen.getByAltText("Test User")).toHaveAttribute(
    "src",
    "https://test.com/avatar.png"
  );
});
