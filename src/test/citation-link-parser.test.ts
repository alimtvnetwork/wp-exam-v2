import { describe, it, expect } from 'vitest';
import {
  extractDomainTitle,
  isUrlLine,
  detectLinkFormat,
  parseJsonArray,
  parseMarkdownLinks,
  parseColonSeparated,
  parseRawUrls,
  parseDoubleLine,
  parseReferenceLinks,
  SAMPLE_CITATION_FORMATS,
} from '@/lib/citation-link-parser';

describe('Universal Citation and Reference Link Parser', () => {
  describe('extractDomainTitle', () => {
    it('extracts and capitalizes domain name from URL with path', () => {
      const title = extractDomainTitle('https://alimkarim.com/path');

      expect(title).toBe('Alimkarim.com');
    });

    it('strips www prefix and capitalizes domain', () => {
      const title = extractDomainTitle('https://www.example.com/page');

      expect(title).toBe('Example.com');
    });

    it('handles http URLs with subdomains', () => {
      const title = extractDomainTitle('http://docs.github.com/en');

      expect(title).toBe('Docs.github.com');
    });

    it('handles URLs without protocol prefix', () => {
      const title = extractDomainTitle('alimkarim.com');

      expect(title).toBe('Alimkarim.com');
    });

    it('returns empty string for empty or whitespace-only input', () => {
      expect(extractDomainTitle('')).toBe('');
      expect(extractDomainTitle('   ')).toBe('');
    });

    it('falls back to capitalized raw string for invalid URL format', () => {
      const title = extractDomainTitle('invalid url string');

      expect(title).toBe('Invalid url string');
    });
  });

  describe('isUrlLine', () => {
    it('identifies http and https lines as URLs', () => {
      expect(isUrlLine('https://example.com/')).toBe(true);
      expect(isUrlLine('http://example.com/test')).toBe(true);
      expect(isUrlLine('   https://example.com   ')).toBe(true);
    });

    it('rejects non-URL lines', () => {
      expect(isUrlLine('Example Domain')).toBe(false);
      expect(isUrlLine('Example Domain: https://example.com')).toBe(false);
      expect(isUrlLine('[Example](https://example.com)')).toBe(false);
      expect(isUrlLine('')).toBe(false);
    });
  });

  describe('detectLinkFormat', () => {
    it('detects json array format', () => {
      const rawText = '[ { "title": "Example", "url": "https://example.com" } ]';
      const format = detectLinkFormat(rawText);

      expect(format).toBe('json');
    });

    it('detects markdown hyperlink format', () => {
      const rawText = '[Example Domain](https://example.com/)\n[Alim Karim](https://alimkarim.com/)';
      const format = detectLinkFormat(rawText);

      expect(format).toBe('markdown');
    });

    it('detects colon separated format', () => {
      const rawText = 'Example Domain: https://example.com/\nalimkarim.com: https://alimkarim.com/';
      const format = detectLinkFormat(rawText);

      expect(format).toBe('colon');
    });

    it('detects raw url format', () => {
      const rawText = 'https://example.com/\nhttps://alimkarim.com/';
      const format = detectLinkFormat(rawText);

      expect(format).toBe('raw_url');
    });

    it('detects double line format', () => {
      const rawText = 'Example Domain\nhttps://example.com/\n\nalimkarim.com\nhttps://alimkarim.com/';
      const format = detectLinkFormat(rawText);

      expect(format).toBe('double_line');
    });

    it('returns unknown for empty or plain text', () => {
      expect(detectLinkFormat('')).toBe('unknown');
      expect(detectLinkFormat('   \n  ')).toBe('unknown');
      expect(detectLinkFormat('Just some plain text without any links')).toBe('unknown');
    });
  });

  describe('Format 1: Double-Line Parsing (parseDoubleLine)', () => {
    it('parses title above URL with blank line separators', () => {
      const raw = `Example Domain
https://example.com/

alimkarim.com
https://alimkarim.com/`;

      const items = parseDoubleLine(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('parses title above URL without blank lines', () => {
      const raw = `Example Domain
https://example.com/
alimkarim.com
https://alimkarim.com/`;

      const items = parseDoubleLine(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('falls back to domain title if URL line is not preceded by title', () => {
      const raw = `https://example.com/\nhttps://alimkarim.com/`;
      const items = parseDoubleLine(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example.com');
      expect(items[1].title).toBe('Alimkarim.com');
    });

    it('cleans trailing punctuation from URLs in double-line format', () => {
      const raw = `Example Domain\nhttps://example.com/.,`;
      const items = parseDoubleLine(raw);

      expect(items).toHaveLength(1);
      expect(items[0].url).toBe('https://example.com/');
    });
  });

  describe('Format 2: Colon Separated Parsing (parseColonSeparated)', () => {
    it('parses title and URL separated by colon', () => {
      const raw = `Example Domain: https://example.com/
alimkarim.com: https://alimkarim.com/`;

      const items = parseColonSeparated(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('extracts trailing description after URL when present', () => {
      const raw = `Example Domain: https://example.com/ - Helpful documentation`;
      const items = parseColonSeparated(raw);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[0].description).toBe('Helpful documentation');
    });

    it('ignores raw URL lines where protocol colon is not title separator', () => {
      const raw = `https://example.com/\nTitle: https://sub.example.com/`;
      const items = parseColonSeparated(raw);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Title');
      expect(items[0].url).toBe('https://sub.example.com/');
    });

    it('trims dirty whitespace around title and URL', () => {
      const raw = `   My Title   :    https://example.com/test    `;
      const items = parseColonSeparated(raw);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('My Title');
      expect(items[0].url).toBe('https://example.com/test');
    });
  });

  describe('Format 3: Markdown Hyperlinks Parsing (parseMarkdownLinks)', () => {
    it('parses standard markdown links', () => {
      const raw = `[Example Domain](https://example.com/)
[alimkarim.com](https://alimkarim.com/)`;

      const items = parseMarkdownLinks(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('parses optional description attribute in markdown link', () => {
      const raw = `[Example Domain](https://example.com/ "Official website")`;
      const items = parseMarkdownLinks(raw);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[0].description).toBe('Official website');
    });

    it('falls back to domain title when bracket text is empty', () => {
      const raw = `[](https://alimkarim.com/)`;
      const items = parseMarkdownLinks(raw);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Alimkarim.com');
      expect(items[0].url).toBe('https://alimkarim.com/');
    });
  });

  describe('Format 4: Raw URLs Parsing (parseRawUrls)', () => {
    it('parses raw URLs and extracts clean domain titles', () => {
      const raw = `https://example.com/
https://alimkarim.com/`;

      const items = parseRawUrls(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example.com');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('Alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('skips empty lines and ignores non-URL lines', () => {
      const raw = `
https://example.com/

Not a URL
https://alimkarim.com/
`;
      const items = parseRawUrls(raw);

      expect(items).toHaveLength(2);
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('strips trailing punctuation from raw URLs', () => {
      const raw = `https://example.com/.,;`;
      const items = parseRawUrls(raw);

      expect(items).toHaveLength(1);
      expect(items[0].url).toBe('https://example.com/');
    });
  });

  describe('Format 5: JSON Array Parsing (parseJsonArray)', () => {
    it('parses structured JSON array with title and url properties', () => {
      const raw = JSON.stringify([
        { title: 'Example Domain', url: 'https://example.com/' },
        { title: 'alimkarim.com', url: 'https://alimkarim.com/' },
      ]);

      const items = parseJsonArray(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('parses description and preserves provided id in JSON items', () => {
      const raw = JSON.stringify([
        {
          id: 'custom-123',
          title: 'Custom Title',
          url: 'https://example.com/',
          description: 'Detailed description',
        },
      ]);

      const items = parseJsonArray(raw);

      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('custom-123');
      expect(items[0].title).toBe('Custom Title');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[0].description).toBe('Detailed description');
    });

    it('supports alternative property names in JSON objects', () => {
      const raw = JSON.stringify([
        { name: 'Alt Name', link: 'https://example.com/', desc: 'Short desc' },
        { label: 'Alt Label', href: 'https://alimkarim.com/' },
      ]);

      const items = parseJsonArray(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Alt Name');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[0].description).toBe('Short desc');
      expect(items[1].title).toBe('Alt Label');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('parses JSON array of raw string URLs', () => {
      const raw = JSON.stringify(['https://example.com/', 'https://alimkarim.com/']);
      const items = parseJsonArray(raw);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example.com');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('Alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('parses a single JSON object', () => {
      const raw = JSON.stringify({ title: 'Single Object', url: 'https://example.com/' });
      const items = parseJsonArray(raw);

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Single Object');
      expect(items[0].url).toBe('https://example.com/');
    });

    it('handles malformed JSON gracefully without throwing', () => {
      const raw = '[{ unclosed json';
      const items = parseJsonArray(raw);

      expect(items).toEqual([]);
    });
  });

  describe('parseReferenceLinks with Auto-Detection & Forced Format', () => {
    it('automatically detects and parses Format 1 (Double-line)', () => {
      const sample = SAMPLE_CITATION_FORMATS.find((f) => f.id === 'double_line');
      expect(sample).toBeDefined();

      const items = parseReferenceLinks(sample ? sample.sampleText : '');

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('automatically detects and parses Format 2 (Colon separated)', () => {
      const sample = SAMPLE_CITATION_FORMATS.find((f) => f.id === 'colon');
      expect(sample).toBeDefined();

      const items = parseReferenceLinks(sample ? sample.sampleText : '');

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('automatically detects and parses Format 3 (Markdown)', () => {
      const sample = SAMPLE_CITATION_FORMATS.find((f) => f.id === 'markdown');
      expect(sample).toBeDefined();

      const items = parseReferenceLinks(sample ? sample.sampleText : '');

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('automatically detects and parses Format 4 (Raw URLs)', () => {
      const sample = SAMPLE_CITATION_FORMATS.find((f) => f.id === 'raw_url');
      expect(sample).toBeDefined();

      const items = parseReferenceLinks(sample ? sample.sampleText : '');

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example.com');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('Alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('automatically detects and parses Format 5 (JSON)', () => {
      const sample = SAMPLE_CITATION_FORMATS.find((f) => f.id === 'json');
      expect(sample).toBeDefined();

      const items = parseReferenceLinks(sample ? sample.sampleText : '');

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('Example Domain');
      expect(items[0].url).toBe('https://example.com/');
      expect(items[1].title).toBe('alimkarim.com');
      expect(items[1].url).toBe('https://alimkarim.com/');
    });

    it('honors forced format override when specified', () => {
      const raw = `Custom Title: https://example.com/`;
      const items = parseReferenceLinks(raw, 'colon');

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Custom Title');
      expect(items[0].url).toBe('https://example.com/');
    });

    it('falls back to auto-detection when forced format is auto', () => {
      const raw = `[Link](https://example.com/)`;
      const items = parseReferenceLinks(raw, 'auto');

      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Link');
    });

    it('returns empty array when input is blank', () => {
      expect(parseReferenceLinks('')).toEqual([]);
      expect(parseReferenceLinks('   ')).toEqual([]);
    });

    it('falls back to any recognizable links if format is unknown', () => {
      const dirty = `Some unstructured notes here:
Check this out: https://example.com/page
End of notes.`;

      const items = parseReferenceLinks(dirty);

      expect(items.length).toBeGreaterThan(0);
      expect(items[0].url).toBe('https://example.com/page');
    });
  });

  describe('SAMPLE_CITATION_FORMATS registry', () => {
    it('contains all 5 supported format samples', () => {
      expect(SAMPLE_CITATION_FORMATS).toHaveLength(5);

      const ids = SAMPLE_CITATION_FORMATS.map((sample) => sample.id);

      expect(ids).toContain('double_line');
      expect(ids).toContain('colon');
      expect(ids).toContain('markdown');
      expect(ids).toContain('raw_url');
      expect(ids).toContain('json');
    });

    it('every sample has label, description, and valid sampleText', () => {
      SAMPLE_CITATION_FORMATS.forEach((sample) => {
        expect(sample.label.length).toBeGreaterThan(0);
        expect(sample.description.length).toBeGreaterThan(0);
        expect(sample.sampleText.length).toBeGreaterThan(0);
      });
    });
  });
});
