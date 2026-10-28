import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Version7VelocityStudio } from '@/components/public/layouts/version-7-velocity-studio';

class ResizeObserverMock {
  observe = vi.fn();

  unobserve = vi.fn();

  disconnect = vi.fn();
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

const renderYieldStudio = () => {
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

describe('Version 7 hiring yield studio', () => {
  it('renders transparent default calculations and conversion actions', () => {
    const { onAdminClick, onCandidateClick } = renderYieldStudio();

    expect(screen.getByText('92 h')).toBeVisible();
    expect(screen.getByText('$7,820')).toBeVisible();
    expect(screen.getAllByText('67').length).toBeGreaterThan(0);
    expect(screen.getByText('(240 × 28 ÷ 60) × 82%')).toBeVisible();
    expect(screen.getByRole('slider', { name: 'Monthly applicants' })).toBeVisible();
    expect(screen.getByRole('slider', { name: 'Candidate completion rate' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /enter candidate experience/i }));
    fireEvent.click(screen.getByRole('button', { name: /admin sign in/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  });

  it('supports accessible stage selection and pauses autoplay after interaction', () => {
    renderYieldStudio();
    const assessTab = screen.getByRole('tab', { name: /measure signal/i });

    fireEvent.click(assessTab);

    expect(assessTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent(/role-calibrated questions/i);
    expect(screen.getByRole('button', { name: /play lifecycle autoplay/i })).toBeVisible();
  });
});
