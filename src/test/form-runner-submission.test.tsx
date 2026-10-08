import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormRunner } from '@/components/runner/FormRunner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FormModel } from '@/lib/types/form';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockForm: FormModel = {
  id: 'test-quiz',
  title: 'Test Quiz',
  description: 'Test Description',
  formType: 'quiz',
  formAccess: 'open',
  isSequential: false,
  isPublished: true,
  fields: [
    {
      id: 'q1',
      type: 'multiple_choice',
      label: 'Question 1',
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option A',
      points: 10,
      isRequired: false, // make optional so handleSubmit proceeds directly
    },
  ],
  settings: {
    passingScore: 70,
  },
};

describe('FormRunner Submission', () => {
  it('renders FormRunner and submits without React hooks error', async () => {
    render(
      <TooltipProvider>
        <MemoryRouter>
          <FormRunner form={mockForm} />
        </MemoryRouter>
      </TooltipProvider>
    );

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find(b => (b.textContent || '').includes('Submit'));
    expect(submitBtn).toBeDefined();

    // Click submit
    act(() => {
      fireEvent.click(submitBtn!);
    });

    // Check if submission completed card renders
    expect(screen.getByText('Assessment Completed')).toBeTruthy();
  });
});
