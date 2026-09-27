import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import {
  EMAIL_THEMES,
  DEFAULT_EMAIL_SECTIONS,
  DEFAULT_MOCK_APPLICANT_DATA,
  generateModularEmailHtml,
} from '@/lib/templates/email-template';
import { EmailThemeType, EmailCustomizationConfig } from '@/lib/types/form';

describe('Spec 16: Email Template Studio, Multi-Theme Palettes & Multi-Screen Verification', () => {
  beforeEach(() => {
    useQuizStore.getState().resetForm();
  });

  describe('Theme Palettes & Visual Styling', () => {
    it('defines complete palette tokens for all 6 email themes', () => {
      const themes: EmailThemeType[] = ['emerald', 'navy', 'blue', 'purple', 'amber', 'slate'];

      themes.forEach((themeKey) => {
        const theme = EMAIL_THEMES[themeKey];
        expect(theme).toBeDefined();
        expect(theme.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.headerBg).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.badgeBg).toBeTruthy();
        expect(theme.name).toBeTruthy();
      });
    });

    it('injects selected theme primary color and headerBg into generated email HTML', () => {
      // Test Emerald Theme
      const emeraldHtml = generateModularEmailHtml({ theme: 'emerald' });
      expect(emeraldHtml).toContain('border-bottom: 4px solid #16a34a');
      expect(emeraldHtml).toContain('background: #0f392b');

      // Test Royal Blue Theme
      const blueHtml = generateModularEmailHtml({ theme: 'blue' });
      expect(blueHtml).toContain('border-bottom: 4px solid #2563eb');
      expect(blueHtml).toContain('background: #1e3a8a');

      // Test Letterly Purple Theme
      const purpleHtml = generateModularEmailHtml({ theme: 'purple' });
      expect(purpleHtml).toContain('border-bottom: 4px solid #7c3aed');
      expect(purpleHtml).toContain('background: #3b0764');
    });
  });

  describe('Modular Section Visibility Toggling', () => {
    it('renders all 5 modular sections by default', () => {
      const fullHtml = generateModularEmailHtml();
      expect(fullHtml).toContain('Section 1 — Applicant &amp; Role Details');
      expect(fullHtml).toContain('Section 2 — Portfolio &amp; Online Profiles');
      expect(fullHtml).toContain('Section 3 — Qualifications &amp; Workstation');
      expect(fullHtml).toContain('Section 4 — Technical Statement &amp; Introduction');
      expect(fullHtml).toContain('Section 5 — Compensation &amp; Availability');
    });

    it('excludes disabled sections cleanly when toggled off', () => {
      const partialConfig: Partial<EmailCustomizationConfig> = {
        sections: {
          showApplicantDetails: true,
          showProfilesAndLinks: false,
          showQualifications: true,
          showTechnicalStatement: false,
          showCompensation: false,
        },
      };

      const partialHtml = generateModularEmailHtml(partialConfig);

      // Included sections
      expect(partialHtml).toContain('Section 1 — Applicant &amp; Role Details');
      expect(partialHtml).toContain('Section 3 — Qualifications &amp; Workstation');

      // Excluded sections
      expect(partialHtml).not.toContain('Section 2 — Portfolio &amp; Online Profiles');
      expect(partialHtml).not.toContain('Section 4 — Technical Statement &amp; Introduction');
      expect(partialHtml).not.toContain('Section 5 — Compensation &amp; Availability');
      expect(partialHtml).not.toContain('Current Compensation');
      expect(partialHtml).not.toContain('Asking Compensation');
    });
  });

  describe('Custom Header, Branding & Disclaimers', () => {
    it('applies custom company name, banner text, and footer disclaimers', () => {
      const customConfig: Partial<EmailCustomizationConfig> = {
        companyName: 'Acme Global Innovations',
        headerBannerText: 'Acme Talent Portal — Priority Submission',
        footerNoteText: 'Confidential Candidate Evaluation Report — Internal Use Only',
      };

      const customHtml = generateModularEmailHtml(customConfig);

      expect(customHtml).toContain('Acme Talent Portal — Priority Submission');
      expect(customHtml).toContain('Confidential Candidate Evaluation Report — Internal Use Only');
      expect(customHtml).toContain('Acme Global Innovations');
    });
  });

  describe('Zero-PII Compliance', () => {
    it('verifies generated template contains only sanitized placeholder values', () => {
      const html = generateModularEmailHtml();

      // Zero personal names from raw template
      expect(html).not.toContain('Anik Sen');
      expect(html).not.toContain('aniksen.work@gmail.com');
      expect(html).not.toContain('+880 1819-123456');
      expect(html).not.toContain('Chittagong');

      // Uses generic mock applicant details
      expect(html).toContain('Alex Morgan');
      expect(html).toContain('alex.morgan@example.org');
    });
  });

  describe('Form Settings Persistence', () => {
    it('persists email customization config into form settings store', () => {
      const store = useQuizStore.getState();

      const config: EmailCustomizationConfig = {
        theme: 'amber',
        primaryColor: '#ea580c',
        companyName: 'WP Exam Systems Tech',
        headerBannerText: 'Custom Banner Header',
        footerNoteText: 'Custom Footer Note',
        sections: {
          showApplicantDetails: true,
          showProfilesAndLinks: true,
          showQualifications: false,
          showTechnicalStatement: true,
          showCompensation: false,
        },
      };

      store.updateSettings({ emailCustomization: config });

      const saved = useQuizStore.getState().settings.emailCustomization;
      expect(saved).toBeDefined();
      expect(saved?.theme).toBe('amber');
      expect(saved?.primaryColor).toBe('#ea580c');
      expect(saved?.sections.showQualifications).toBe(false);
      expect(saved?.sections.showCompensation).toBe(false);
      expect(saved?.sections.showApplicantDetails).toBe(true);
    });
  });
});
