import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version3ExecutiveTalent } from '@/components/public/layouts/version-3-executive-talent';

const renderTransitMapPage = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();

  render(
    <Version3ExecutiveTalent
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={vi.fn()}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick };
};

describe('Version 3 transit map homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the stops of the chosen line', () => {
    renderTransitMapPage();

    const frontendButton = screen.getByRole('button', { name: 'Frontend developer' });
    expect(frontendButton).toHaveAttribute('aria-pressed', 'true');

    const frontendStops = screen.getByRole('list', { name: /stops on the frontend developer line/i });
    expect(within(frontendStops).getByText('JavaScript')).toBeInTheDocument();
    expect(within(frontendStops).getByText('Performance')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Customer support' }));

    expect(frontendButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'Customer support line' })).toBeInTheDocument();

    const supportStops = screen.getByRole('list', { name: /stops on the customer support line/i });
    expect(within(supportStops).getByText('Upset caller')).toBeInTheDocument();
    expect(within(supportStops).getByText('Audio prompt')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  }, 15000);

  it('routes every action to the candidate portal or the builder', () => {
    const { onAdminClick, onCandidateClick } = renderTransitMapPage();

    fireEvent.click(screen.getByRole('button', { name: /try a sample assessment/i }));
    fireEvent.click(screen.getByRole('button', { name: /ride this line as a candidate/i }));
    fireEvent.click(screen.getByRole('button', { name: /take a sample assessment/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));
    fireEvent.click(screen.getByRole('button', { name: /build one like it/i }));
    fireEvent.click(screen.getByRole('button', { name: /build your first assessment/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(3);
    expect(onAdminClick).toHaveBeenCalledTimes(3);
  }, 15000);
});
