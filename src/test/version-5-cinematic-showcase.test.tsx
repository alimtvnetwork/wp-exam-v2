import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version5CinematicShowcase } from '@/components/public/layouts/version-5-cinematic-showcase';

const renderLinkPage = () => {
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

describe('Version 5 one-link homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('changes the sample link and the paper behind it', () => {
    renderLinkPage();

    const frontendButton = screen.getByRole('button', { name: 'Frontend developer' });
    expect(frontendButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('/ frontend')).toBeInTheDocument();
    expect(screen.getByText(/code reading/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Customer support' }));

    expect(frontendButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('/ support')).toBeInTheDocument();
    expect(screen.getByText(/upset caller/i)).toBeInTheDocument();
    expect(screen.queryByText(/code reading/i)).not.toBeInTheDocument();
  }, 15000);

  it('copies the link and routes the actions', () => {
    const { onAdminClick, onCandidateClick } = renderLinkPage();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith('onboardingquiz/frontend');

    fireEvent.click(screen.getByRole('button', { name: 'Sales' }));
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /open this link/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  }, 15000);
});
