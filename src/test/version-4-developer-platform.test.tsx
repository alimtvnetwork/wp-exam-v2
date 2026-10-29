import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version4DeveloperPlatform } from '@/components/public/layouts/version-4-developer-platform';

const renderResultsBoardPage = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();

  render(
    <Version4DeveloperPlatform
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={vi.fn()}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick };
};

describe('Version 4 results board homepage', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('routes the hero and closing actions to the candidate portal and the builder', () => {
    const { onAdminClick, onCandidateClick } = renderResultsBoardPage();

    fireEvent.click(screen.getByRole('button', { name: /try the candidate side/i }));
    fireEvent.click(screen.getByRole('button', { name: /take a sample assessment/i }));

    for (const button of screen.getAllByRole('button', { name: /open the builder/i })) {
      fireEvent.click(button);
    }

    expect(onCandidateClick).toHaveBeenCalledTimes(2);
    expect(onAdminClick).toHaveBeenCalledTimes(2);
  });

  it('fills the board with new results and then allows a replay', () => {
    vi.useFakeTimers();
    renderResultsBoardPage();

    const replayButton = screen.getByRole('button', { name: /replay/i });
    expect(replayButton).toBeDisabled();
    expect(screen.getAllByText('Shortlisted')).toHaveLength(1);
    expect(screen.getByText('Invited')).toBeInTheDocument();

    for (let step = 0; step < 80; step += 1) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    expect(screen.getAllByText('Shortlisted')).toHaveLength(2);
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.queryByText('Invited')).not.toBeInTheDocument();
    expect(replayButton).not.toBeDisabled();

    fireEvent.click(replayButton);
    expect(screen.getByText('Invited')).toBeInTheDocument();
    expect(replayButton).toBeDisabled();
  }, 15000);
});
