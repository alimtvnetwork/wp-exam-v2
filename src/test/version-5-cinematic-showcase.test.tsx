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

const renderCinematicShowcase = () => {
  const onAdminClick = vi.fn();
  const onCandidateClick = vi.fn();
  const onNavigate = vi.fn();

  render(
    <Version5CinematicShowcase
      onAdminClick={onAdminClick}
      onCandidateClick={onCandidateClick}
      onNavigate={onNavigate}
      isAuthenticated={false}
    />,
  );

  return { onAdminClick, onCandidateClick, onNavigate };
};

describe('Version 5 dual-engine workbench', () => {
  afterEach(() => {
    cleanup();
  });

  it(
    'synchronizes admin controller switches with the live candidate chamber',
    () => {
      const { onAdminClick, onCandidateClick } = renderCinematicShowcase();

      expect(
        screen.getByText(/adaptive branch l6: which architectural primitive/i),
      ).toBeVisible();

      const branchingSwitch = screen.getByLabelText(/adaptive branching decision tree/i);
      fireEvent.click(branchingSwitch);

      expect(
        screen.getByText(/standard linear q1: how does the system isolate/i),
      ).toBeVisible();

      const domProofSwitch = screen.getByLabelText(/inspect server-side verification proof/i);
      fireEvent.click(domProofSwitch);

      expect(screen.getByText(/browser dom \/ network payload inspector/i)).toBeVisible();

      fireEvent.click(screen.getAllByRole('button', { name: /launch candidate exam/i })[0]);
      fireEvent.click(screen.getAllByRole('button', { name: /open full admin studio/i })[0]);

      expect(onCandidateClick).toHaveBeenCalledTimes(1);
      expect(onAdminClick).toHaveBeenCalledTimes(1);
    },
    15000,
  );

  it(
    'evaluates candidate selection against the live passing threshold and switches questions',
    () => {
      renderCinematicShowcase();

      fireEvent.click(screen.getByRole('button', { name: /confirm & proceed/i }));
      expect(screen.getByRole('status')).toHaveTextContent(/correct selection confirmed/i);

      fireEvent.click(screen.getByRole('tab', { name: /q02 \/ security/i }));
      expect(
        screen.getByText(/adaptive branch l6: how does the evaluation runtime guarantee/i),
      ).toBeVisible();
    },
    15000,
  );
});
