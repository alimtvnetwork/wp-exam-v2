import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version7VelocityStudio } from '@/components/public/layouts/version-7-velocity-studio';

const renderTwoViews = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();

  render(
    <Version7VelocityStudio
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={vi.fn()}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick };
};

describe('Version 7 two-views homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('writes the chosen answer into the reviewer record', () => {
    renderTwoViews();

    const reviewer = screen.getByRole('region', { name: 'Reviewer' });

    expect(within(reviewer).getByText('Not answered yet')).toBeInTheDocument();
    expect(within(reviewer).getByText('Priya Shah')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /send the document again/i }));

    expect(screen.getByRole('button', { name: /send the document again/i })).toHaveAttribute('aria-pressed', 'true');
    expect(within(reviewer).getByText('Send the document again, and say where it lives.')).toBeInTheDocument();
    expect(within(reviewer).queryByText('Not answered yet')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /search the shared drive/i }));

    expect(screen.getByRole('button', { name: /send the document again/i })).toHaveAttribute('aria-pressed', 'false');
    expect(within(reviewer).getByText('Tell them to search the shared drive.')).toBeInTheDocument();
    expect(within(reviewer).queryByText('Send the document again, and say where it lives.')).not.toBeInTheDocument();
  }, 15000);

  it('routes the actions', () => {
    const { onAdminClick, onCandidateClick } = renderTwoViews();

    fireEvent.click(screen.getByRole('button', { name: /try the paper/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  }, 15000);
});
