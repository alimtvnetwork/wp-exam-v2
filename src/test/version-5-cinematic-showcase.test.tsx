import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Version5CinematicShowcase } from '@/components/public/layouts/version-5-cinematic-showcase';

const renderAnswerSheetPage = () => {
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

describe('Version 5 answer sheet homepage', () => {
  afterEach(() => {
    cleanup();
  });

  it('routes the visitor based on the answer to question 1', () => {
    const { onAdminClick, onCandidateClick } = renderAnswerSheetPage();

    fireEvent.click(screen.getByRole('radio', { name: /i hire people/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /open the builder/i })[0]);
    expect(onAdminClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('radio', { name: /been sent an assessment/i }));
    fireEvent.click(screen.getByRole('button', { name: /start your assessment/i }));
    expect(onCandidateClick).toHaveBeenCalledTimes(1);
  }, 15000);

  it('marks the fairness question and awards full marks', () => {
    renderAnswerSheetPage();

    const unfairStatement = screen.getByRole('checkbox', { name: /reviewer decides/i });
    fireEvent.click(unfairStatement);
    expect(screen.getByText(/that’s the problem we fix/i)).toBeInTheDocument();

    fireEvent.click(unfairStatement);
    expect(screen.queryByText(/that’s the problem we fix/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /same questions/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /same time limit/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /marked the same way/i }));
    expect(screen.getByRole('status')).toHaveTextContent('3/3, well done');
    expect(screen.queryByText('Full marks')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /i hire people/i }));
    expect(screen.getByText('Full marks')).toBeInTheDocument();
  }, 15000);

  it('routes the footer actions', () => {
    const { onAdminClick, onCandidateClick } = renderAnswerSheetPage();

    fireEvent.click(screen.getByRole('button', { name: /take a sample assessment/i }));
    fireEvent.click(screen.getByRole('button', { name: /open the builder/i }));

    expect(onCandidateClick).toHaveBeenCalledTimes(1);
    expect(onAdminClick).toHaveBeenCalledTimes(1);
  }, 15000);
});
