import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/lib/theme-context';

import LandingPage from '@/components/public/LandingPage';
import Index from '@/pages/Index';
import { WizardRunner } from '@/components/forms/wizard-runner';
import { VisualNodeCanvas } from '@/components/forms/visual-node-canvas';
import { FormRunner } from '@/components/runner/FormRunner';

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderRoute = (initialPath: string) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/admin" element={<Index />} />
              <Route path="/admin/:tab" element={<Index />} />
              <Route path="/admin/form/:slug" element={<Index />} />
              <Route path="/apply" element={<WizardRunner />} />
              <Route path="/forms/wizard" element={<WizardRunner />} />
              <Route path="/forms/canvas" element={<VisualNodeCanvas />} />
              <Route path="/forms/nodes" element={<VisualNodeCanvas />} />
              <Route path="/f/:slug" element={<FormRunner />} />
              <Route path="/f/:category/:slug" element={<FormRunner />} />
              <Route path="/preview/:slug" element={<FormRunner isPreviewRoute />} />
              <Route path="/preview" element={<FormRunner isPreviewRoute />} />
              <Route path="/runner" element={<FormRunner />} />
            </Routes>
          </MemoryRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('Route Mounting', () => {
  it('mounts /preview', () => {
    const { container } = renderRoute('/preview');
    expect(container).toBeTruthy();
  });

  it('mounts /preview/sample-slug', () => {
    const { container } = renderRoute('/preview/sample-slug');
    expect(container).toBeTruthy();
  });

  it('mounts /f/sample-slug', () => {
    const { container } = renderRoute('/f/sample-slug');
    expect(container).toBeTruthy();
  });

  it('mounts /runner', () => {
    const { container } = renderRoute('/runner');
    expect(container).toBeTruthy();
  });

  it('mounts /admin', () => {
    const { container } = renderRoute('/admin');
    expect(container).toBeTruthy();
  });

  it('mounts /admin/runner', () => {
    const { container } = renderRoute('/admin/runner');
    expect(container).toBeTruthy();
  });

  it('mounts /admin/focus-runner', () => {
    const { container } = renderRoute('/admin/focus-runner');
    expect(container).toBeTruthy();
  });

  it('mounts /apply', () => {
    const { container } = renderRoute('/apply');
    expect(container).toBeTruthy();
  });

  it('mounts /forms/canvas', () => {
    const { container } = renderRoute('/forms/canvas');
    expect(container).toBeTruthy();
  });
});
