import { describe, it, expect } from 'vitest';
import { THEME_CONFIGS, AppThemeType } from '../lib/theme-context';
import { FormField, evaluateFileUploadValidation, FileValidationRule } from '../lib/types/form';

describe('Slug Routing, Theming Engine & AI Studio Verification', () => {
  it('converts complex title strings into valid kebab-case URL slugs', () => {
    const generateSlug = (rawTitle: string): string => {
      return rawTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };

    expect(generateSlug('Full-Stack React & Go Developer Assessment! 2026')).toBe(
      'full-stack-react-go-developer-assessment-2026'
    );
    expect(generateSlug('   DevOps / Cloud Architecture Form   ')).toBe(
      'devops-cloud-architecture-form'
    );
    expect(generateSlug('WP Exam Console #1')).toBe('wp-exam-console-1');
  });

  it('constructs correct public, preview, and admin routes based on slug', () => {
    const origin = 'https://wpexam.io';
    const testSlug = 'intern-software-engineer';

    const publicUrl = `${origin}/f/${testSlug}`;
    const previewUrl = `${origin}/preview/${testSlug}`;
    const adminUrl = `${origin}/admin/form/${testSlug}`;

    expect(publicUrl).toBe('https://wpexam.io/f/intern-software-engineer');
    expect(previewUrl).toBe('https://wpexam.io/preview/intern-software-engineer');
    expect(adminUrl).toBe('https://wpexam.io/admin/form/intern-software-engineer');
  });

  it('provides complete HSL CSS tokens across all supported themes', () => {
    const themeKeys: AppThemeType[] = ['riseup', 'dracula', 'letterly', 'obsidian', 'clean'];

    themeKeys.forEach((themeKey) => {
      const config = THEME_CONFIGS[themeKey];
      expect(config).toBeDefined();
      expect(config.hslValues).toBeDefined();
      expect(config.hslValues['--primary']).toBeDefined();
      expect(config.hslValues['--background']).toBeDefined();
      expect(config.hslValues['--card']).toBeDefined();
      expect(config.hslValues['--border']).toBeDefined();
      expect(config.hslValues['--ring']).toBeDefined();
    });

    // Rise Up Asia must feature Gold primary (41 100% 50%)
    expect(THEME_CONFIGS.riseup.hslValues['--primary']).toBe('41 100% 50%');

    // Letterly must feature Electric Indigo primary (247 98% 63%)
    expect(THEME_CONFIGS.letterly.hslValues['--primary']).toBe('247 98% 63%');

    // Dracula must feature purple primary (265 89% 78%)
    expect(THEME_CONFIGS.dracula.hslValues['--primary']).toBe('265 89% 78%');
  });

  it('generates structured LLM instruction prompt containing full question context', () => {
    const sampleQuestion: FormField = {
      id: 'q_test_1',
      type: 'multiple_choice',
      label: 'What is the primary benefit of WAL mode in SQLite?',
      group: 'Database Architecture',
      isRequired: true,
      points: 15,
      options: ['Higher write concurrency', 'Smaller file size', 'Zero disk writes', 'No file locks'],
      correctAnswer: 'Higher write concurrency',
    };

    const buildAiPrompt = (q: FormField, index: number): string => {
      return [
        `Question #${index + 1}`,
        `Type: ${q.type}`,
        `Prompt/Label: "${q.label}"`,
        `Section: "${q.group || 'General'}"`,
        `Required: ${q.isRequired ? 'Yes' : 'No'}`,
        `Points: ${q.points ?? 1}`,
        `Designated Correct Answer: ${q.correctAnswer}`,
      ].join('\n');
    };

    const prompt = buildAiPrompt(sampleQuestion, 0);

    expect(prompt).toContain('Question #1');
    expect(prompt).toContain('Type: multiple_choice');
    expect(prompt).toContain('Section: "Database Architecture"');
    expect(prompt).toContain('Points: 15');
    expect(prompt).toContain('Higher write concurrency');
  });

  it('validates file upload metadata format and size threshold', () => {
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    const validateFileUpload = (file: { name: string; size: number; type: string }) => {
      const isSizeValid = file.size <= MAX_SIZE_BYTES;
      const isExtensionAllowed = /\.(pdf|docx|zip|png|jpg)$/i.test(file.name);

      return {
        isValid: isSizeValid && isExtensionAllowed,
        formattedSizeMb: (file.size / (1024 * 1024)).toFixed(2),
      };
    };

    const validFile = { name: 'architecture-diagram.pdf', size: 2.4 * 1024 * 1024, type: 'application/pdf' };
    const oversizedFile = { name: 'huge-dump.zip', size: 25 * 1024 * 1024, type: 'application/zip' };

    const validResult = validateFileUpload(validFile);
    expect(validResult.isValid).toBe(true);
    expect(validResult.formattedSizeMb).toBe('2.40');

    const oversizedResult = validateFileUpload(oversizedFile);
    expect(oversizedResult.isValid).toBe(false);
  });

  it('evaluates file upload validation rule engine under default and custom limits', () => {
    // 1. Default limits (10MB, pdf/docx/zip/png/jpg)
    const validPdf = { name: 'resume.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' };
    const res1 = evaluateFileUploadValidation(undefined, validPdf);
    expect(res1.isValid).toBe(true);
    expect(res1.message).toContain('Valid file upload: resume.pdf');

    // 2. Oversized file exceeds default 10MB limit
    const oversizedFile = { name: 'huge_archive.zip', size: 15 * 1024 * 1024, type: 'application/zip' };
    const res2 = evaluateFileUploadValidation(undefined, oversizedFile);
    expect(res2.isValid).toBe(false);
    expect(res2.message).toContain('File too large (15.00 MB)');
    expect(res2.message).toContain('Maximum permitted file size is 10 MB');

    // 3. Disallowed extension with default settings
    const exeFile = { name: 'malicious.exe', size: 1 * 1024 * 1024, type: 'application/x-msdownload' };
    const res3 = evaluateFileUploadValidation(undefined, exeFile);
    expect(res3.isValid).toBe(false);
    expect(res3.message).toContain('Invalid format (.exe)');
    expect(res3.message).toContain('.pdf, .docx, .zip, .png, .jpg');

    // 4. Custom rule: Max 5MB, only PDF allowed
    const customRule: FileValidationRule = {
      maxSizeMb: 5,
      allowedExtensions: ['pdf'],
      customErrorMessage: 'Only PDF documents under 5MB are accepted for this assessment.',
    };

    const docxFile = { name: 'report.docx', size: 1 * 1024 * 1024, type: 'application/vnd.openxmlformats' };
    const res4 = evaluateFileUploadValidation(customRule, docxFile);
    expect(res4.isValid).toBe(false);
    expect(res4.message).toBe('Only PDF documents under 5MB are accepted for this assessment.');

    const largePdf = { name: 'big_spec.pdf', size: 7 * 1024 * 1024, type: 'application/pdf' };
    const res5 = evaluateFileUploadValidation(customRule, largePdf);
    expect(res5.isValid).toBe(false);
    expect(res5.message).toBe('Only PDF documents under 5MB are accepted for this assessment.');

    const compliantPdf = { name: 'compliant.pdf', size: 3 * 1024 * 1024, type: 'application/pdf' };
    const res6 = evaluateFileUploadValidation(customRule, compliantPdf);
    expect(res6.isValid).toBe(true);

    // 5. Null file handling
    const resNull = evaluateFileUploadValidation(customRule, null);
    expect(resNull.isValid).toBe(false);
    expect(resNull.message).toContain('No file uploaded yet');
  });
});
