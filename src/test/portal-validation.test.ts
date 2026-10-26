import { describe, it, expect } from 'vitest';
import {
  normalizeWebUrl,
  isValidHttpUrl,
  isRecognizedVideoPlatform,
  isValidVideoUrl,
  isValidPortfolioUrl,
} from '@/lib/portal-validation';

describe('Candidate Portal URL Validation & Normalization Engine', () => {
  describe('normalizeWebUrl', () => {
    it('returns empty string for empty or whitespace-only inputs', () => {
      expect(normalizeWebUrl('')).toBe('');
      expect(normalizeWebUrl('   ')).toBe('');
    });

    it('rejects unsafe script protocols', () => {
      expect(normalizeWebUrl('javascript:alert(1)')).toBe('');
      expect(normalizeWebUrl('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(normalizeWebUrl('vbscript:MsgBox(1)')).toBe('');
      expect(normalizeWebUrl('file:///etc/passwd')).toBe('');
    });

    it('preserves existing http and https protocols', () => {
      expect(normalizeWebUrl('https://loom.com/share/123')).toBe('https://loom.com/share/123');
      expect(normalizeWebUrl('http://my-portfolio.dev')).toBe('http://my-portfolio.dev');
    });

    it('prepends https:// when candidate omits scheme', () => {
      expect(normalizeWebUrl('loom.com/share/abc')).toBe('https://loom.com/share/abc');
      expect(normalizeWebUrl('github.com/developer/project')).toBe('https://github.com/developer/project');
      expect(normalizeWebUrl('youtu.be/video123')).toBe('https://youtu.be/video123');
    });
  });

  describe('isValidHttpUrl', () => {
    it('validates standard web URLs', () => {
      expect(isValidHttpUrl('https://loom.com/share/abc')).toBe(true);
      expect(isValidHttpUrl('loom.com/share/abc')).toBe(true);
      expect(isValidHttpUrl('https://github.com/torvalds/linux')).toBe(true);
      expect(isValidHttpUrl('https://drive.google.com/file/d/123/view')).toBe(true);
    });

    it('rejects invalid or non-domain inputs', () => {
      expect(isValidHttpUrl('not a url')).toBe(false);
      expect(isValidHttpUrl('hello')).toBe(false);
      expect(isValidHttpUrl('http://localhost')).toBe(false); // No dot in host
      expect(isValidHttpUrl('')).toBe(false);
    });
  });

  describe('isRecognizedVideoPlatform', () => {
    it('recognizes major video hosting services', () => {
      expect(isRecognizedVideoPlatform('https://www.loom.com/share/abc')).toBe(true);
      expect(isRecognizedVideoPlatform('loom.com/share/abc')).toBe(true);
      expect(isRecognizedVideoPlatform('https://www.youtube.com/watch?v=xyz')).toBe(true);
      expect(isRecognizedVideoPlatform('https://youtu.be/xyz')).toBe(true);
      expect(isRecognizedVideoPlatform('https://vimeo.com/123456')).toBe(true);
      expect(isRecognizedVideoPlatform('https://drive.google.com/file/d/abc/view')).toBe(true);
    });

    it('returns false for non-video platforms', () => {
      expect(isRecognizedVideoPlatform('https://github.com/repo')).toBe(false);
      expect(isRecognizedVideoPlatform('https://randomsite.org')).toBe(false);
    });
  });

  describe('Step 4 Candidate Submissions: Video & Portfolio validation', () => {
    it('requires a valid video URL for Step 4 satisfaction', () => {
      expect(isValidVideoUrl('')).toBe(false);
      expect(isValidVideoUrl('invalid-text')).toBe(false);
      expect(isValidVideoUrl('https://loom.com/share/abc')).toBe(true);
      expect(isValidVideoUrl('loom.com/share/abc')).toBe(true);
    });

    it('allows empty portfolio URL but validates if provided', () => {
      expect(isValidPortfolioUrl('')).toBe(true);
      expect(isValidPortfolioUrl('   ')).toBe(true);
      expect(isValidPortfolioUrl('github.com/my-profile')).toBe(true);
      expect(isValidPortfolioUrl('https://myportfolio.io')).toBe(true);
      expect(isValidPortfolioUrl('garbage text')).toBe(false);
    });
  });
});
