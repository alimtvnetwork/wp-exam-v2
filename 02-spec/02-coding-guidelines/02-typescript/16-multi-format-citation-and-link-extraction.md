# TypeScript Standard 16: Multi-Format Citation and Link Extraction Pattern

## Status: Active
## Domain: 02-typescript (Frontend & Data Ingestion)

---

## 1. Context & Standard Pattern

Applications frequently accept pasted reference links, documentation citations, and external resources from diverse sources. Instead of forcing users into strict individual input rows, modules MUST provide universal multi-format string extraction capable of auto-detecting and parsing 5 standardized formats into structured records:

```ts
export interface ExtractedLinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
}
```

---

## 2. The 5 Canonical Ingestion Formats

### Format 1: Double-Line (Title Above URL)
Consecutive non-empty line pairs where the first line represents the title and the second line represents the HTTP(S) URL.
```text
Example Domain
https://example.com/

alimkarim.com
https://alimkarim.com/
```

### Format 2: Colon-Separated (Title: URL)
Single-line key-value format where the title is separated from the URL by a colon.
```text
Example Domain: https://example.com/
alimkarim.com: https://alimkarim.com/
```

### Format 3: Markdown Hyperlinks
Standard Markdown link syntax `[Title](URL)` across single or multiple lines.
```markdown
[Example Domain](https://example.com/)
[alimkarim.com](https://alimkarim.com/)
```

### Format 4: Raw URL List (Auto-Domain Title Fallback)
Bare URL strings. When no title is supplied, the engine extracts the clean domain or path as a readable fallback title (e.g. `example.com`).
```text
https://example.com/
https://alimkarim.com/
```

### Format 5: Structured JSON Array
Raw JSON string containing an array of objects with `title` and `url` keys.
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

---

## 3. Reference Implementation Specification

1. **Auto-Detection**: The parser checks JSON first (`try JSON.parse`), then Markdown regex, then Colon key-values, then Double-Line pairs, falling back to Raw URL extraction.
2. **Title Sanitization**: Trims whitespace, eliminates surrounding quotes or brackets, and normalizes URLs.
3. **Empty URL Skipping**: Incomplete or invalid URL lines are safely ignored without crashing the parser.
4. **Reusability**: Exported as `extractLinksFromText(rawText: string, format?: 'auto' | 'double_line' | 'colon' | 'markdown' | 'raw_url' | 'json'): ExtractedLinkItem[]`.
