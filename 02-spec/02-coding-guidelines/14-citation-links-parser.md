# Coding Guideline 14: Universal 5-Format Citation & Reference Links Parser

## 1. Overview & Purpose
This guideline standardizes the parsing, extraction, and normalization of reference links and citations across the entire application ecosystem. Whenever users or AI agents input citations, links, or references—whether in form questions, rich cards, documentation, or import wizards—the system must support automated ingestion across 5 standard formats with zero data loss.

---

## 2. Supported Formats & Extraction Rules

### Format 1: Double-Line (Title above URL)
A human-readable format with the resource title on one line followed immediately by its corresponding URL on the subsequent line:
```text
Example Domain
https://example.com/

alimkarim.com
https://alimkarim.com/
```
- **Parsing Strategy**: Consecutive non-empty lines where the second line is a valid HTTP/HTTPS URL are paired as `{ title: line[0], url: line[1] }`.

### Format 2: Colon-Separated (Title: URL)
Standard key-value format on a single line:
```text
Example Domain: https://example.com/
alimkarim.com: https://alimkarim.com/
```
- **Parsing Strategy**: Split on the first `: http` boundary; line before colon is `title`, string starting with `http` is `url`.

### Format 3: Markdown Hyperlinks
Canonical Markdown link format:
```markdown
[Example Domain](https://example.com/)

[alimkarim.com](https://alimkarim.com/)
```
- **Parsing Strategy**: Regular expression extraction matching `\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)`.

### Format 4: Raw URL List (with JavaScript Domain Fallback)
Plain URLs without explicit titles:
```text
https://example.com/
https://alimkarim.com/
```
- **Parsing Strategy**: When title is not explicitly provided, JavaScript auto-derives a clean title from the hostname:
  ```typescript
  export function extractDomainTitle(url: string): string {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./i, '');
      const segments = host.split('.');
      if (segments.length > 0 && segments[0]) {
        return segments[0].charAt(0).toUpperCase() + segments[0].slice(1) + (segments.length > 1 ? '.' + segments.slice(1).join('.') : '');
      }
      return host || url;
    } catch {
      return url;
    }
  }
  ```
  Example: `https://alimkarim.com/` -> `Alimkarim.com`.

### Format 5: Structured JSON Array
Programmatic JSON array of citation objects:
```json
[
  {
    "title": "Example Domain",
    "url": "https://example.com/"
  },
  {
    "title": "alimkarim.com",
    "url": "https://alimkarim.com/"
  }
]
```
- **Parsing Strategy**: Parse with `JSON.parse` with try/catch fallback to line-based parsing.

---

## 3. Auto-Detection Logic

```typescript
export function detectLinkFormat(rawText: string): 'json' | 'markdown' | 'colon' | 'double_line' | 'raw_url' | 'unknown' {
  const trimmed = rawText.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return 'json';
    } catch {
      // Fall through to regex checks
    }
  }
  if (/\[.+?\]\(https?:\/\/[^\s\)]+\)/.test(trimmed)) {
    return 'markdown';
  }
  if (/^.+?:\s*https?:\/\//m.test(trimmed)) {
    return 'colon';
  }
  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  const urlCount = lines.filter(l => /^https?:\/\//i.test(l)).length;
  if (urlCount === lines.length && lines.length > 0) {
    return 'raw_url';
  }
  if (lines.length >= 2 && urlCount >= Math.floor(lines.length / 2)) {
    return 'double_line';
  }
  return 'unknown';
}
```

---

## 4. Reusability & Enforcement
1. All citation interfaces must provide an interactive "Quick Paste" area that auto-detects formats or lets users choose via format sample tabs.
2. When creating manual rows, typing in the current row must automatically append a new row so users do not have to click "+ Add" repeatedly.
3. Typography for small item counters must use Poppins (`font-sans`), saving Ubuntu exclusively for prominent section headings.
