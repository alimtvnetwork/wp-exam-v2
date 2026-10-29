import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version2ModernSaas } from '@/components/public/layouts/version-2-modern-saas';

const renderTheBar = () => {
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

const row = (name: string) => {
  const item = screen.getByText(name).closest('li');

  if (!item) {
    throw new Error(`No row for ${name}`);
  }

  return item;
};

describe('Version 2 pass-mark homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('splits the sample round on the pass mark', () => {
    renderTheBar();

    const slider = screen.getByRole('slider', { name: /pass mark/i });
    expect(slider).toHaveValue('70');
    expect(row('Sofia Lopez')).toHaveTextContent('Through');
    expect(row('Tom Ward')).toHaveTextContent('Below');
    expect(screen.getByText('4 through')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '80' } });

    expect(slider).toHaveValue('80');
    expect(row('Sofia Lopez')).toHaveTextContent('Below');
    expect(row('Daniel Kim')).toHaveTextContent('Through');
    expect(screen.getByText('3 through')).toBeInTheDocument();
  }, 15000);

  it('routes the actions to the candidate portal and the builder', () => {
    const { onAdminClick, onCandidateClick } = renderTheBar();

    fireEvent.click(screen.getByRole('button', { name: /try a paper/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  }, 15000);
});
