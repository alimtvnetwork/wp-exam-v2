import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version6TelemetryHub } from '@/components/public/layouts/version-6-telemetry-hub';

const renderTelemetryHub = () => {
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

describe('Version 6 telemetry hub', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('validates candidate access and exposes both navigation paths', () => {
    const { onAdminClick, onCandidateClick } = renderTelemetryHub();
    const tokenInput = screen.getByLabelText('Candidate access token');
    const startButton = screen.getByRole('button', { name: /start assessment/i });

    fireEvent.change(tokenInput, { target: { value: 'bad' } });
    expect(startButton).toBeDisabled();

    fireEvent.change(tokenInput, { target: { value: 'TOK-VALID-42' } });
    fireEvent.click(startButton);
    fireEvent.click(screen.getByRole('button', { name: /open admin control room/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  });

  it('announces the secure simulation result and increments its commit', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    renderTelemetryHub();

    fireEvent.click(screen.getByRole('button', { name: /run secure simulation/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/routing encrypted request/i);

    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/scoring server-side/i);

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/result signed/i);
    expect(screen.getByRole('status')).toHaveTextContent(/commit #18421/i);
  });
});
