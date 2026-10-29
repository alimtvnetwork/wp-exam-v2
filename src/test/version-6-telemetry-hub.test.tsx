import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version6TelemetryHub } from '@/components/public/layouts/version-6-telemetry-hub';

const renderTheHour = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();

  render(
    <Version6TelemetryHub
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={vi.fn()}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick };
};

describe('Version 6 hour homepage', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('sets one time limit for the paper', () => {
    vi.useFakeTimers();
    renderTheHour();

    const choice = screen.getByRole('button', { name: '45 min' });
    fireEvent.click(choice);

    expect(choice).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('45:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 min' })).toHaveAttribute('aria-pressed', 'false');
  }, 15000);

  it('routes the actions', () => {
    const { onAdminClick, onCandidateClick } = renderTheHour();

    fireEvent.click(screen.getByRole('button', { name: /try a timed paper/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  }, 15000);
});
