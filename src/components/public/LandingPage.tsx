import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLoginModal, useAdminAuth } from '@/components/auth/AdminLoginModal';
import { ThemeSwitcher, useTheme } from '@/lib/theme-context';
import onboardingQuizLogo from '@/assets/onboarding-quiz-logo.svg';

import {
  HomeLayoutSwitcher,
  HomeLayoutType,
  LAYOUT_SIGNATURE_THEMES,
  getStoredLayout,
  setStoredLayout,
} from './home-layout-switcher';
import { Version1Classic } from './layouts/version-1-classic';
import { Version2ModernSaas } from './layouts/version-2-modern-saas';
import { Version3ExecutiveTalent } from './layouts/version-3-executive-talent';
import { Version4DeveloperPlatform } from './layouts/version-4-developer-platform';
import { Version5CinematicShowcase } from './layouts/version-5-cinematic-showcase';
import { Version6TelemetryHub } from './layouts/version-6-telemetry-hub';
import { Version7VelocityStudio } from './layouts/version-7-velocity-studio';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  const { setTheme } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<HomeLayoutType>(getStoredLayout);

  useEffect(() => {
    // When mounting with a specified layout query param, activate its signature theme
    const initialLayout = getStoredLayout();
    const signatureTheme = LAYOUT_SIGNATURE_THEMES[initialLayout];

    if (signatureTheme) {
      const params = new URLSearchParams(window.location.search);
      const hasLayoutParam = Boolean(params.get('layout') || params.get('v'));

      if (hasLayoutParam) {
        setTheme(signatureTheme);
      }
    }

    // Listen for URL or storage layout updates
    const handlePopState = () => {
      const layout = getStoredLayout();
      setCurrentLayout(layout);

      const popTheme = LAYOUT_SIGNATURE_THEMES[layout];
      if (popTheme) {
        setTheme(popTheme);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setTheme]);

  const handleSelectLayout = (layout: HomeLayoutType) => {
    setCurrentLayout(layout);
    setStoredLayout(layout);

    // Automatically apply the signature theme for the selected layout
    const signatureTheme = LAYOUT_SIGNATURE_THEMES[layout];
    if (signatureTheme) {
      setTheme(signatureTheme);
    }
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');

      return;
    }

    setIsLoginModalOpen(true);
  };

  const handleCandidateClick = () => {
    navigate('/portal');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans antialiased flex flex-col justify-between transition-colors duration-300">
      {/* Top Enterprise Navigation */}
      <header className="border-b border-border/60 backdrop-blur-md bg-background/80 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer text-left"
            >
              <img
                src={onboardingQuizLogo}
                alt="Onboarding Quiz"
                className="w-9 h-9 rounded-xl shadow-md ring-1 ring-border/50 shrink-0"
              />
              <div className="hidden min-[480px]:block">
                <span className="font-extrabold text-lg tracking-tight text-foreground flex items-center gap-1.5 font-heading">
                  Onboarding Quiz
                  <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono py-0">
                    Enterprise
                  </Badge>
                </span>
              </div>
            </button>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors cursor-pointer">
              Features
            </a>
            <button
              type="button"
              onClick={() => navigate('/admin?tab=builder')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Form Builder
            </button>
            <button
              type="button"
              onClick={handleCandidateClick}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Candidate Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('/runner')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Live Preview
            </button>
          </nav>

          {/* Action Tools: Layout Switcher + Theme Switcher + Portals */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Version Switcher (5 Styles with Signature Themes) */}
            <HomeLayoutSwitcher
              currentLayout={currentLayout}
              onSelectLayout={handleSelectLayout}
              variant="header"
            />

            {/* Application Theme Switcher (Kept intact) */}
            <ThemeSwitcher />

            <div className="h-4 w-px bg-border/80 hidden sm:block" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleCandidateClick}
              className="text-xs h-9 px-3 gap-1.5 font-semibold rounded-xl cursor-pointer border-border hover:bg-muted hidden sm:inline-flex"
            >
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              <span>Candidate Portal</span>
            </Button>

            <Button
              size="sm"
              onClick={handleAdminClick}
              aria-label={isAuthenticated ? 'Admin Console' : 'Admin Login'}
              className="text-xs h-9 px-3.5 sm:px-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-bold rounded-xl shadow-md shadow-primary/20 cursor-pointer transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-primary-foreground" />
              <span className="hidden min-[520px]:inline">
                {isAuthenticated ? 'Admin Console' : 'Admin Login'}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dynamic Layout Canvas */}
      <main className="flex-1 w-full">
        <div key={currentLayout} className="animate-in fade-in duration-200">
          {currentLayout === 'v1' && (
            <Version1Classic
              onAdminClick={handleAdminClick}
              onCandidateClick={handleCandidateClick}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentLayout === 'v2' && (
            <Version2ModernSaas
              onAdminClick={handleAdminClick}
              onCandidateClick={handleCandidateClick}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentLayout === 'v3' && (
            <Version3ExecutiveTalent
              onAdminClick={handleAdminClick}
              onCandidateClick={handleCandidateClick}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentLayout === 'v4' && (
            <Version4DeveloperPlatform
              onAdminClick={handleAdminClick}
              onCandidateClick={handleCandidateClick}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentLayout === 'v5' && (
            <Version5CinematicShowcase
              onAdminClick={handleAdminClick}
              onCandidateClick={handleCandidateClick}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentLayout === 'v6' && (
            <Version6TelemetryHub
              onAdminClick={handleAdminClick}
              onCandidateClick={handleCandidateClick}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          )}

          {currentLayout === 'v7' && (
            <Version7VelocityStudio
              onAdminClick={handleAdminClick}
              onCandidateClick={handleCandidateClick}
              onNavigate={navigate}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>
      </main>

      {/* Floating Layout Switcher Dock for Rapid Review */}
      <HomeLayoutSwitcher
        currentLayout={currentLayout}
        onSelectLayout={handleSelectLayout}
        variant="floating"
      />

      {/* Shared Enterprise Footer */}
      <footer className="border-t border-border py-8 bg-card text-xs text-muted-foreground transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={onboardingQuizLogo}
              alt=""
              className="w-5 h-5 rounded-md"
            />
            <span className="font-bold text-foreground font-heading">Onboarding Quiz</span>
            <span>•</span>
            <span>Enterprise Assessment Platform v2.5</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={handleCandidateClick}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Candidate Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin?tab=builder')}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Form Builder
            </button>
            <button
              type="button"
              onClick={() => navigate('/runner')}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Live Runner
            </button>
            <button
              type="button"
              onClick={handleAdminClick}
              className="hover:text-primary cursor-pointer transition-colors font-semibold"
            >
              Admin Login
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => navigate('/admin')}
      />
    </div>
  );
};

export default LandingPage;
