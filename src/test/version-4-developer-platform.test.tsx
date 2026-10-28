import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version4DeveloperPlatform } from '@/components/public/layouts/version-4-developer-platform';

const renderDeveloperPlatform = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();
  const onNavigate = vi.fn();

  render(
    <Version4DeveloperPlatform
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={onNavigate}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick, onNavigate };
};

describe('Version 4 sovereign developer platform', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it(
    'validates candidate token format and triggers candidate and admin callbacks',
    () => {
      const { onAdminClick, onCandidateClick } = renderDeveloperPlatform();
      const tokenInput = screen.getByLabelText(/session access token/i);
      const enterButton = screen.getByRole('button', { name: /enter candidate portal/i });

      fireEvent.change(tokenInput, { target: { value: 'short' } });
      expect(enterButton).toBeDisabled();

      fireEvent.change(tokenInput, { target: { value: 'TOK-VALID-8819' } });
      expect(enterButton).not.toBeDisabled();

      fireEvent.click(enterButton);
      fireEvent.click(screen.getByRole('button', { name: /open admin workspace/i }));

      expect(onCandidateClick).toHaveBeenCalledTimes(1);
      expect(onAdminClick).toHaveBeenCalledTimes(1);
    },
    15000,
  );

  it(
    'runs the cryptographic handshake verification and switches diagnostic specs',
    () => {
      vi.useFakeTimers();
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      renderDeveloperPlatform();

      fireEvent.click(screen.getByRole('button', { name: /verify cryptographic handshake/i }));
      expect(screen.getByRole('status')).toHaveTextContent(/computing sha-256 token digest/i);

      act(() => {
        vi.advanceTimersByTime(550);
      });
      expect(screen.getByRole('status')).toHaveTextContent(/enforcing casbin rbac policy/i);

      act(() => {
        vi.advanceTimersByTime(750);
      });
      expect(screen.getByRole('status')).toHaveTextContent(/handshake verified/i);
      expect(screen.getByRole('status')).toHaveTextContent(/commit #49209/i);

      fireEvent.click(screen.getByRole('tab', { name: /casbin rbac/i }));
      expect(screen.getByText(/zero-trust multi-tenant rbac matrix/i)).toBeVisible();

      fireEvent.click(screen.getByRole('option', { name: /database write contention/i }));
      expect(screen.getByText(/PRAGMA journal_mode = WAL; ATTACH DATABASE/i)).toBeVisible();
    },
    15000,
  );
});
