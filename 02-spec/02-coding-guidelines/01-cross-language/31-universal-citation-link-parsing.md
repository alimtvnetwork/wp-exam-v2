# Universal Citation & Reference Link Parsing Standard

## 1. Principle & Context
Applications and modules across the codebase that accept user-provided citation links, references, documentation links, or action item lists MUST support multi-format ingestion. Users frequently copy-paste reference materials from diverse sources (plain text notes, chat messages, markdown documentation, or structured data). The parser MUST seamlessly extract titles and URLs from all 5 canonical formats without failing or rejecting input.

## 2. The 5 Supported Ingestion Formats

### Format 1: Double-Line (Title above URL)
Title appears on line 1, and the valid HTTP/HTTPS URL appears on line 2 (separated by newlines).
```text
Example Domain
https://example.com/

alimkarim.com
https://alimkarim.com/
```

### Format 2: Colon Separated (Title: URL)
Title and URL appear on the same line separated by a colon (`:`).
```text
Example Domain: https://example.com/
alimkarim.com: https://alimkarim.com/
```

### Format 3: Markdown Hyperlinks
Standard Markdown link syntax `[Title](URL)`.
```markdown
[Example Domain](https://example.com/)
[alimkarim.com](https://alimkarim.com/)
```

### Format 4: Raw URLs (Domain-Derived Title Fallback)
A list of raw URLs with no preceding title. The ingestion parser MUST automatically derive a clean, capitalized domain title fallback (e.g., `https://alimkarim.com/` -> `Alimkarim.com` or `Example.com`).
```text
https://example.com/
https://alimkarim.com/
```

### Format 5: Structured JSON Array
A valid JSON array containing objects with `title` and `url` string attributes.
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

## 3. Implementation Rules
1. **Auto-Detection Priority**: The parser MUST first check for valid JSON (Format 5), then check for markdown syntax (Format 3), then inspect line structures for colons (Format 2), double-lines (Format 1), or raw URL lists (Format 4).
2. **Fallback Titling**: If a URL is supplied without an explicit title, domain extraction logic MUST generate a clean title using `URL.hostname` (stripping `www.` and capitalizing the first character).
3. **Resilience to Dirty Inputs**: The parser MUST ignore blank lines, trim trailing whitespace, sanitize leading and trailing punctuation, and skip malformed non-URL tokens without throwing unhandled exceptions.
4. **Shared Universal Engine**: In TypeScript/React frontend environments, this logic is encapsulated in `src/lib/citation-link-parser.ts` and exports `parseReferenceLinks()` and `SAMPLE_CITATION_FORMATS`.
