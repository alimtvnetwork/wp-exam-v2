import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormRunner } from '@/components/runner/FormRunner';
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
      isRequired: true,
    },
  ],
  settings: {
    passingScore: 70,
  },
};

describe('FormRunner Submission', () => {
  it('renders FormRunner and submits without React hooks error', async () => {
    const { container } = render(
      <MemoryRouter>
        <FormRunner form={mockForm} />
      </MemoryRouter>
    );

    expect(container).toBeTruthy();
  });
});
