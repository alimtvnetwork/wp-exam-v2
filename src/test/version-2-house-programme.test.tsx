import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version2ModernSaas } from '@/components/public/layouts/version-2-modern-saas';

const renderHouseProgramme = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();

  render(
    <Version2ModernSaas
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={vi.fn()}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick };
};

describe('Version 2 house programme homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the scenes of the chosen paper', () => {
    renderHouseProgramme();

    const frontendButton = screen.getByRole('button', { name: 'Frontend developer' });
    expect(frontendButton).toHaveAttribute('aria-pressed', 'true');

    const frontendPaper = screen.getByRole('list', { name: /frontend developer paper/i });
    expect(within(frontendPaper).getByText('JavaScript')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Product designer' }));

    expect(frontendButton).toHaveAttribute('aria-pressed', 'false');
    const designPaper = screen.getByRole('list', { name: /product designer paper/i });
    expect(within(designPaper).getByText('A visual critique')).toBeInTheDocument();
    expect(within(designPaper).getByText('Image prompt')).toBeInTheDocument();
    expect(screen.getByText(/pass mark 75%/i)).toBeInTheDocument();
  }, 15000);

  it('routes the programme actions to the candidate portal and the builder', () => {
    const { onAdminClick, onCandidateClick } = renderHouseProgramme();

    fireEvent.click(screen.getByRole('button', { name: /take a sitting/i }));
    fireEvent.click(screen.getByRole('button', { name: /sit this paper/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));
    fireEvent.click(screen.getByRole('button', { name: /arrange a sitting/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(2);
    expect(onAdminClick).toHaveBeenCalledTimes(2);
  }, 15000);
});
