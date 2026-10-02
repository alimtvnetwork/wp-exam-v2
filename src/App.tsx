import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import WizardRunner from "./components/forms/wizard-runner.tsx";
import VisualNodeCanvas from "./components/forms/visual-node-canvas.tsx";
import LandingPage from "./components/public/LandingPage.tsx";
import { FormRunner } from "@/components/runner/FormRunner.tsx";
import { ThemeProvider } from "@/lib/theme-context";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl border border-destructive/40 bg-card shadow-xl text-center space-y-4">
            <h2 className="text-xl font-bold font-heading text-destructive">Application Notice</h2>
            <p className="text-sm text-muted-foreground">
              The assessment or preview encountered a loading issue.
            </p>
            <div className="text-xs font-mono bg-muted/60 p-3 rounded-lg text-left overflow-auto max-h-32">
              {this.state.error?.message || "Unknown error"}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

const LegacyRunnerRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/runner${location.search}`} replace />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<Index />} />
            <Route path="/admin/:tab" element={<Index />} />
            <Route path="/admin/form/:slug" element={<Index />} />
            <Route
              path="/apply"
              element={
                <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-8 px-4 sm:px-6 flex items-center justify-center">
                  <WizardRunner />
                </div>
              }
            />
            <Route
              path="/forms/wizard"
              element={
                <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-8 px-4 sm:px-6 flex items-center justify-center">
                  <WizardRunner />
                </div>
              }
            />
            <Route path="/forms/canvas" element={<VisualNodeCanvas />} />
            <Route path="/forms/nodes" element={<VisualNodeCanvas />} />
            <Route path="/f/:slug" element={<FormRunner />} />
            <Route path="/f/:category/:slug" element={<FormRunner />} />
            <Route path="/preview/:slug" element={<FormRunner isPreviewRoute />} />
            <Route path="/preview" element={<FormRunner isPreviewRoute />} />
            <Route path="/runner" element={<FormRunner />} />
            <Route path="/wp-exam-runner" element={<LegacyRunnerRedirect />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
