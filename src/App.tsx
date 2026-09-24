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

const queryClient = new QueryClient();

const LegacyRunnerRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/runner${location.search}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<Index />} />
            <Route path="/apply" element={<WizardRunner />} />
            <Route path="/forms/wizard" element={<WizardRunner />} />
            <Route path="/forms/canvas" element={<VisualNodeCanvas />} />
            <Route path="/forms/nodes" element={<VisualNodeCanvas />} />
            <Route
              path="/preview"
              element={
                <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
                  <FormRunner isPreviewRoute={true} />
                </div>
              }
            />
            <Route
              path="/runner"
              element={
                <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
                  <FormRunner />
                </div>
              }
            />
            <Route path="/wp-exam-runner" element={<LegacyRunnerRedirect />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
