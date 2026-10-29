import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version7VelocityStudio } from '@/components/public/layouts/version-7-velocity-studio';

const renderTheTable = () => {
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

describe('Version 7 table homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('seats a candidate at the next empty place', () => {
    renderTheTable();

    expect(screen.getByText('Maya Rossi')).toBeInTheDocument();
    expect(screen.getAllByText('Empty')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText('Candidate name'), { target: { value: 'Sofia Lopez' } });
    fireEvent.click(screen.getByRole('button', { name: 'Seat them' }));

    expect(screen.getByText('Sofia Lopez')).toBeInTheDocument();
    expect(screen.getAllByText('Same paper · 30 minutes')).toHaveLength(4);
    expect(screen.getAllByText('Empty')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Clear Sofia Lopez' }));
    expect(screen.queryByText('Sofia Lopez')).not.toBeInTheDocument();
    expect(screen.getAllByText('Empty')).toHaveLength(2);
  }, 15000);

  it('routes the actions', () => {
    const { onAdminClick, onCandidateClick } = renderTheTable();

    fireEvent.click(screen.getByRole('button', { name: /take an open seat/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  }, 15000);
});
