import { describe, it, expect } from 'vitest';
import {
  evaluateSingleRule,
  evaluateCompoundValidation,
  FieldValidationRule,
  SingleValidationItem,
} from '@/lib/types/form';
import { getTheme, getThemeCssVariables } from '@/themes/theme-definitions';

describe('Compound Validation Engine & Presets', () => {
  it('should validate starts_with rule correctly', () => {
    const rule: SingleValidationItem = {
      id: 'r1',
      ruleType: 'starts_with',
      value: 'EMP_',
    };

    const valid = evaluateSingleRule(rule, 'EMP_9920');
    expect(valid.isValid).toBe(true);

    const invalid = evaluateSingleRule(rule, 'USR_9920');
    expect(invalid.isValid).toBe(false);
    expect(invalid.message).toContain('EMP_');
  });

  it('should validate ends_with rule correctly', () => {
    const rule: SingleValidationItem = {
      id: 'r2',
      ruleType: 'ends_with',
      value: '.pdf',
    };

    const valid = evaluateSingleRule(rule, 'contract.pdf');
    expect(valid.isValid).toBe(true);

    const invalid = evaluateSingleRule(rule, 'contract.docx');
    expect(invalid.isValid).toBe(false);
  });

  it('should validate contains and not_contains rules', () => {
    const containsRule: SingleValidationItem = {
      id: 'r3',
      ruleType: 'contains',
      value: '@company',
    };

    const validContains = evaluateSingleRule(containsRule, 'john@company.org');
    expect(validContains.isValid).toBe(true);

    const invalidContains = evaluateSingleRule(containsRule, 'john@gmail.com');
    expect(invalidContains.isValid).toBe(false);

    const notContainsRule: SingleValidationItem = {
      id: 'r4',
      ruleType: 'not_contains',
      value: 'spam',
    };

    const validNotContains = evaluateSingleRule(notContainsRule, 'clean text without bad words');
    expect(validNotContains.isValid).toBe(true);

    const invalidNotContains = evaluateSingleRule(notContainsRule, 'buy cheap spam here');
    expect(invalidNotContains.isValid).toBe(false);
  });

  it('should validate gdrive and pdf document URLs', () => {
    const gdriveRule: SingleValidationItem = {
      id: 'r5',
      ruleType: 'google_drive',
    };

    const validGdrive = evaluateSingleRule(gdriveRule, 'https://drive.google.com/file/d/12345/view');
    expect(validGdrive.isValid).toBe(true);

    const invalidGdrive = evaluateSingleRule(gdriveRule, 'https://dropbox.com/file/12345');
    expect(invalidGdrive.isValid).toBe(false);

    const pdfRule: SingleValidationItem = {
      id: 'r6',
      ruleType: 'pdf',
    };

    const validPdf = evaluateSingleRule(pdfRule, 'https://example.com/assets/portfolio.pdf');
    expect(validPdf.isValid).toBe(true);

    const invalidPdf = evaluateSingleRule(pdfRule, 'https://example.com/assets/portfolio.png');
    expect(invalidPdf.isValid).toBe(false);
  });

  it('should validate compound rules with AND logic', () => {
    const rule: FieldValidationRule = {
      operator: 'AND',
      rules: [
        { id: '1', ruleType: 'starts_with', value: 'https://' },
        { id: '2', ruleType: 'ends_with', value: '.pdf' },
      ],
    };

    const pass = evaluateCompoundValidation(rule, 'https://careers.com/docs/cv.pdf');
    expect(pass.isValid).toBe(true);

    const fail = evaluateCompoundValidation(rule, 'http://careers.com/docs/cv.pdf');
    expect(fail.isValid).toBe(false);
  });

  it('should validate compound rules with OR logic', () => {
    const rule: FieldValidationRule = {
      operator: 'OR',
      rules: [
        { id: '1', ruleType: 'google_drive' },
        { id: '2', ruleType: 'pdf' },
      ],
    };

    // Satisfies gdrive
    const passGdrive = evaluateCompoundValidation(rule, 'https://docs.google.com/document/d/123');
    expect(passGdrive.isValid).toBe(true);

    // Satisfies pdf
    const passPdf = evaluateCompoundValidation(rule, 'https://myportfolio.io/resume.pdf');
    expect(passPdf.isValid).toBe(true);

    // Fails both
    const failBoth = evaluateCompoundValidation(rule, 'https://youtube.com/watch?v=123');
    expect(failBoth.isValid).toBe(false);
  });
});

describe('Theme Definitions & CSS Variable Generator', () => {
  it('should return valid theme definitions for all supported themes', () => {
    const riseup = getTheme('riseup-asia');
    expect(riseup.id).toBe('riseup-asia');
    expect(riseup.colors.primary).toBe('#FFAD01');

    const dracula = getTheme('dracula');
    expect(dracula.id).toBe('dracula');
    expect(dracula.colors.primary).toBe('#BD93F9');

    const vscode = getTheme('vscode-dark');
    expect(vscode.id).toBe('vscode-dark');
    expect(vscode.colors.primary).toBe('#38BDF8');

    const letterly = getTheme('letterly');
    expect(letterly.id).toBe('letterly');
  });

  it('should generate valid CSS variables record for theme injection', () => {
    const dracula = getTheme('dracula');
    const vars = getThemeCssVariables(dracula);

    expect(vars['--wp-exam-bg']).toBe('#191A21');
    expect(vars['--wp-exam-card']).toBe('#282A36');
    expect(vars['--wp-exam-primary']).toBe('#BD93F9');
    expect(vars['--wp-exam-text-primary']).toBe('#F8F8F2');
  });
});
