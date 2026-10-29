import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version5CinematicShowcase } from '@/components/public/layouts/version-5-cinematic-showcase';

class ResizeObserverMock {
  observe = vi.fn();

  unobserve = vi.fn();

  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

const renderTuneItPage = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();

  render(
    <Version5CinematicShowcase
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={vi.fn()}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick };
};

describe('Version 5 tune-it-see-it homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('updates the candidate view when the time limit changes', () => {
    renderTuneItPage();

    expect(screen.getByText('30:00 left')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '45 min' }));
    expect(screen.getByText('45:00 left')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'No limit' }));
    expect(screen.queryByText(/left$/)).not.toBeInTheDocument();
  }, 15000);

  it('shows the score or a thank-you note on the result screen', () => {
    const { onAdminClick, onCandidateClick } = renderTuneItPage();

    fireEvent.click(screen.getByRole('tab', { name: /result/i }));
    expect(screen.getByText('78%')).toBeVisible();
    expect(screen.getByText('Passed')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /a thank-you note/i }));
    expect(screen.queryByText('78%')).not.toBeInTheDocument();
    expect(screen.getByText(/you're all done/i)).toBeVisible();

    fireEvent.click(screen.getAllByRole('button', { name: /try it as a candidate/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /sign in to build/i })[0]);

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  }, 15000);
});
