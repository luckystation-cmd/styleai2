import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';
import { expect, test, vi } from 'vitest';

test('renders Access Core button when user is null', () => {
  render(
    <Header 
      user={null} 
      credits={0} 
      theme="dark" 
      setTheme={vi.fn()} 
      handleLogin={vi.fn()} 
      handleLogout={vi.fn()} 
      openTopUp={vi.fn()} 
      systemHealth={{ status: 'online', apiKeySet: true }}
    />
  );
  expect(screen.getByText(/Access Core/i)).toBeDefined();
});

test('renders credits and user email when logged in', () => {
  const user = { email: 'test@example.com', photoURL: null } as any;
  render(
    <Header 
      user={user} 
      credits={10} 
      theme="dark" 
      setTheme={vi.fn()} 
      handleLogin={vi.fn()} 
      handleLogout={vi.fn()} 
      openTopUp={vi.fn()} 
      systemHealth={{ status: 'online', apiKeySet: true }}
    />
  );
  expect(screen.getByText(/10 CREDITS/i)).toBeDefined();
  expect(screen.getByText(/test@example.com/i)).toBeDefined();
});
