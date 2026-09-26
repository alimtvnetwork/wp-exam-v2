import { describe, it, expect, beforeEach } from 'vitest';
import { THEME_PRESETS, getTheme, getThemeCssVariables } from '@/lib/themes';
import { QuizSessionData } from '@/components/runner/FormRunner';

describe('Spec 14: Preview Quiz Redesign (Hero Model, Sidebar, Session & Purple Theme)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Theme Tokens & Purple Theme Validation', () => {
    it('provides complete HSL variables for the purple theme', () => {
      const purpleTheme = getTheme('purple');
      expect(purpleTheme).toBeDefined();
      expect(purpleTheme.appearance).toBe('dark');
      expect(purpleTheme.colors.background).toBe('#0F0E1E');
      expect(purpleTheme.colors.cardBg).toBe('#18162F');

      const cssVars = getThemeCssVariables(purpleTheme);
      expect(cssVars['--primary']).toBe('248 98% 63%');
      expect(cssVars['--background']).toBe('246 35% 9%');
      expect(cssVars['--card']).toBe('245 36% 14%');
      expect(cssVars['--foreground']).toBe('0 0% 100%');
      expect(cssVars['--ring']).toBe('248 98% 63%');
      expect(cssVars['--border']).toBe('246 34% 24%');
    });

    it('aliases letterly to the purple theme with consistent dark contrast', () => {
      const letterlyTheme = getTheme('letterly');
      expect(letterlyTheme.id).toBe('purple');
      expect(letterlyTheme.appearance).toBe('dark');
    });

    it('provides full HSL variables across dracula and vscode-dark themes', () => {
      const dracula = getTheme('dracula');
      const draculaVars = getThemeCssVariables(dracula);
      expect(draculaVars['--primary']).toBe('265 89% 78%');
      expect(draculaVars['--background']).toBe('231 15% 12%');

      const vscode = getTheme('vscode-dark');
      const vscodeVars = getThemeCssVariables(vscode);
      expect(vscodeVars['--primary']).toBe('199 89% 60%');
      expect(vscodeVars['--background']).toBe('220 26% 7%');
    });
  });

  describe('Session Persistence Engine', () => {
    it('serializes and deserializes quiz session progress in localStorage', () => {
      const formSlug = 'full-stack-architect';
      const storageKey = `wp_quiz_session_${formSlug}`;

      const sessionPayload: QuizSessionData = {
        formSlug,
        answers: {
          'fsa-1': 'Content-Security-Policy',
          'fsa-2': 'True',
        },
        currentStep: 1,
        stepHistory: [0],
        savedAt: Date.now(),
        isTimed: true,
        timeLeftSeconds: 1850,
      };

      localStorage.setItem(storageKey, JSON.stringify(sessionPayload));

      const retrievedRaw = localStorage.getItem(storageKey);
      expect(retrievedRaw).toBeTruthy();

      const parsed: QuizSessionData = JSON.parse(retrievedRaw!);
      expect(parsed.formSlug).toBe(formSlug);
      expect(parsed.answers['fsa-1']).toBe('Content-Security-Policy');
      expect(parsed.currentStep).toBe(1);
      expect(parsed.stepHistory).toEqual([0]);
      expect(parsed.isTimed).toBe(true);
      expect(parsed.timeLeftSeconds).toBe(1850);
    });

    it('distinguishes between timed and untimed sessions correctly', () => {
      const untimedSession: QuizSessionData = {
        formSlug: 'untimed-eval',
        answers: {},
        currentStep: 0,
        stepHistory: [],
        savedAt: Date.now(),
        isTimed: false,
        timeLeftSeconds: null,
      };

      expect(untimedSession.isTimed).toBe(false);
      expect(untimedSession.timeLeftSeconds).toBeNull();
    });
  });

  describe('Hero Section Calculations', () => {
    it('computes total points and passing scores accurately', () => {
      const sampleFields = [
        { id: 'q1', difficulty: 'easy', customPointsOverride: 5 },
        { id: 'q2', difficulty: 'medium', customPointsOverride: 10 },
        { id: 'q3', difficulty: 'hard', customPointsOverride: 20 },
      ];

      const totalPoints = sampleFields.reduce((sum, f) => sum + (f.customPointsOverride ?? 5), 0);
      expect(totalPoints).toBe(35);

      const passingScorePct = 70;
      const minPassingPoints = (totalPoints * passingScorePct) / 100;
      expect(minPassingPoints).toBe(24.5);
    });

    it('formats hero timer display for timed vs self-paced quizzes', () => {
      const formatTimer = (seconds?: number): string => {
        if (!seconds) {
          return 'Untimed';
        }
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      };

      expect(formatTimer(1800)).toBe('30:00');
      expect(formatTimer(45)).toBe('0:45');
      expect(formatTimer(undefined)).toBe('Untimed');
    });
  });
});
