import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version4DeveloperPlatform } from '@/components/public/layouts/version-4-developer-platform';

const renderProductPage = () => {
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

describe('Version 4 product-led homepage', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('routes the hero actions to the candidate portal and the builder', () => {
    const { onAdminClick, onCandidateClick } = renderProductPage();

    fireEvent.click(screen.getByRole('button', { name: /try the candidate experience/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /open the builder/i })[0]);

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  });

  it('types the demo question into the builder and mirrors it in the candidate view', () => {
    vi.useFakeTimers();
    renderProductPage();

    const replayButton = screen.getByRole('button', { name: /replay/i });
    expect(replayButton).toBeDisabled();

    for (let step = 0; step < 200; step += 1) {
      act(() => {
        vi.advanceTimersByTime(40);
      });
    }

    const question = 'A page takes six seconds to load. What do you check first?';
    expect(screen.getAllByText(question)).toHaveLength(2);
    expect(screen.getAllByText('The network waterfall in DevTools')).toHaveLength(2);
    expect(replayButton).not.toBeDisabled();
  }, 15000);
});
