import { QuestionReferenceLinkItem } from './types/form';

export type CitationFormatType =
  | 'double_line'
  | 'colon'
  | 'markdown'
  | 'raw_url'
  | 'json'
  | 'unknown';

export interface CitationFormatSample {
  id: CitationFormatType;
  label: string;
  description: string;
  sampleText: string;
}

export const SAMPLE_CITATION_FORMATS: CitationFormatSample[] = [
  {
    id: 'double_line',
    label: 'Double-Line',
    description: 'Title on the first line, followed by URL on the next line',
    sampleText: 'Example Domain\nhttps://example.com/\n\nalimkarim.com\nhttps://alimkarim.com/',
  },
  {
    id: 'colon',
    label: 'Colon Separated',
    description: 'Title and URL separated by a colon on the same line',
    sampleText: 'Example Domain: https://example.com/\nalimkarim.com: https://alimkarim.com/',
  },
  {
    id: 'markdown',
    label: 'Markdown Links',
    description: 'Standard markdown link syntax [Title](URL)',
    sampleText: '[Example Domain](https://example.com/)\n[alimkarim.com](https://alimkarim.com/)',
  },
  {
    id: 'raw_url',
    label: 'Raw URLs',
    description: 'Raw web addresses with automatic domain title extraction',
    sampleText: 'https://example.com/\nhttps://alimkarim.com/',
  },
  {
    id: 'json',
    label: 'JSON Array',
    description: 'Structured JSON objects with title and url fields',
    sampleText: '[\n  {\n    "title": "Example Domain",\n    "url": "https://example.com/"\n  },\n  {\n    "title": "alimkarim.com",\n    "url": "https://alimkarim.com/"\n  }\n]',
  },
];

export function generateLinkId(index?: number): string {
  const seed = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now().toString(36);

  if (typeof index === 'number') {
    return `link-${timestamp}-${index}-${seed}`;
  }

  return `link-${timestamp}-${seed}`;
}

export function extractDomainTitle(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return '';
  }

  const isPrefixed = /^https?:\/\//i.test(trimmed);
  const targetUrl = isPrefixed ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.replace(/^www\./i, '');

    if (!host) {
      return trimmed;
    }

    const formatted = host.charAt(0).toUpperCase() + host.slice(1);

    return formatted;
  } catch {
    const fallback = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    return fallback;
  }
}

export function isUrlLine(line: string): boolean {
  const trimmed = line.trim();

  if (!trimmed) {
    return false;
  }

  const hasHttp = /^https?:\/\/\S+/i.test(trimmed);

  return hasHttp;
}

export function isJsonFormat(trimmed: string): boolean {
  const isBracketWrapped = trimmed.startsWith('[') && trimmed.endsWith(']');
  const isBraceWrapped = trimmed.startsWith('{') && trimmed.endsWith('}');
  const isLikelyJson = isBracketWrapped || isBraceWrapped;

  if (!isLikelyJson) {
    return false;
  }

  try {
    const parsed = JSON.parse(trimmed);
    const isArray = Array.isArray(parsed);

    if (isArray) {
      return true;
    }

    if (parsed) {
      const isObject = typeof parsed === 'object';

      if (isObject) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function isMarkdownFormat(lines: string[]): boolean {
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    return false;
  }

  const markdownRegex = /\[.+?\]\((\S+?)\)/;
  const matchCount = nonEmptyLines.filter((line) => markdownRegex.test(line)).length;
  const isMarkdownMajority = matchCount > 0;

  return isMarkdownMajority;
}

export function isColonSeparatedLine(line: string): boolean {
  const trimmed = line.trim();
  const colonMatch = trimmed.match(/^([^:\r\n]+):\s*(https?:\/\/\S+)/i);

  if (!colonMatch) {
    return false;
  }

  const prefix = colonMatch[1].trim().toLowerCase();
  const isProtocolOnly = prefix === 'http' || prefix === 'https';

  if (isProtocolOnly) {
    return false;
  }

  return true;
}

export function isColonFormat(lines: string[]): boolean {
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    return false;
  }

  const colonLines = nonEmptyLines.filter((line) => isColonSeparatedLine(line));
  const hasColonLines = colonLines.length > 0;

  return hasColonLines;
}

export function isRawUrlFormat(lines: string[]): boolean {
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    return false;
  }

  const hasAllUrls = nonEmptyLines.every((line) => isUrlLine(line));

  return hasAllUrls;
}

export function isDoubleLineFormat(lines: string[]): boolean {
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  if (nonEmptyLines.length < 2) {
    return false;
  }

  let hasPair = false;

  for (let i = 0; i < nonEmptyLines.length - 1; i += 1) {
    const currentIsUrl = isUrlLine(nonEmptyLines[i]);
    const nextIsUrl = isUrlLine(nonEmptyLines[i + 1]);

    if (!currentIsUrl) {
      if (nextIsUrl) {
        hasPair = true;
      }
    }
  }

  return hasPair;
}

export function detectLinkFormat(rawText: string): CitationFormatType {
  const trimmed = (rawText || '').trim();

  if (!trimmed) {
    return 'unknown';
  }

  const isJson = isJsonFormat(trimmed);

  if (isJson) {
    return 'json';
  }

  const lines = trimmed.split(/\r?\n/);
  const isMd = isMarkdownFormat(lines);

  if (isMd) {
    return 'markdown';
  }

  const isColon = isColonFormat(lines);

  if (isColon) {
    return 'colon';
  }

  const isRaw = isRawUrlFormat(lines);

  if (isRaw) {
    return 'raw_url';
  }

  const isDouble = isDoubleLineFormat(lines);

  if (isDouble) {
    return 'double_line';
  }

  return 'unknown';
}

function getObjectProp(obj: Record<string, unknown>, keys: string[]): string {
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const val = obj[key];

    if (val) {
      return String(val).trim();
    }
  }

  return '';
}

function parseJsonEntry(entry: unknown, index: number): QuestionReferenceLinkItem | null {
  if (!entry) {
    return null;
  }

  const isString = typeof entry === 'string';

  if (isString) {
    const urlStr = (entry as string).trim();

    if (!urlStr) {
      return null;
    }

    return {
      id: generateLinkId(index),
      title: extractDomainTitle(urlStr),
      url: urlStr,
    };
  }

  const isObject = typeof entry === 'object';

  if (isObject) {
    const record = entry as Record<string, unknown>;
    const urlStr = getObjectProp(record, ['url', 'URL', 'link', 'Link', 'href', 'Href']);

    if (!urlStr) {
      return null;
    }

    const titleStr = getObjectProp(record, ['title', 'Title', 'name', 'Name', 'label', 'Label']);
    const resolvedTitle = titleStr || extractDomainTitle(urlStr);
    const descStr = getObjectProp(record, ['description', 'Description', 'desc', 'Desc']);
    const idVal = getObjectProp(record, ['id', 'ID', '_id']) || generateLinkId(index);

    const item: QuestionReferenceLinkItem = {
      id: idVal,
      title: resolvedTitle,
      url: urlStr,
    };

    if (descStr) {
      item.description = descStr;
    }

    return item;
  }

  return null;
}

export function parseJsonArray(rawText: string): QuestionReferenceLinkItem[] {
  const items: QuestionReferenceLinkItem[] = [];
  const trimmed = rawText.trim();

  if (!trimmed) {
    return items;
  }

  try {
    const parsed = JSON.parse(trimmed);
    const arrayData = Array.isArray(parsed) ? parsed : [parsed];

    arrayData.forEach((entry, idx) => {
      const parsedItem = parseJsonEntry(entry, idx);

      if (parsedItem) {
        items.push(parsedItem);
      }
    });

    return items;
  } catch {
    return items;
  }
}

export function parseMarkdownLinks(rawText: string): QuestionReferenceLinkItem[] {
  const items: QuestionReferenceLinkItem[] = [];
  const regex = /\[([^\]]*)\]\((https?:\/\/[^\s)"]+|[^\s)"]+)(?:\s+"([^"]*)")?\)/g;
  let match: RegExpExecArray | null = null;
  let index = 0;

  while ((match = regex.exec(rawText)) !== null) {
    const rawTitle = match[1].trim();
    const rawUrl = match[2].trim();
    const rawDesc = match[3] ? match[3].trim() : '';
    const title = rawTitle || extractDomainTitle(rawUrl);

    const item: QuestionReferenceLinkItem = {
      id: generateLinkId(index),
      title: title,
      url: rawUrl,
    };

    if (rawDesc) {
      item.description = rawDesc;
    }

    items.push(item);
    index += 1;
  }

  return items;
}

function parseColonLine(line: string, index: number): QuestionReferenceLinkItem | null {
  const trimmed = line.trim();

  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^([^:\r\n]+):\s*(https?:\/\/\S+)(.*)$/i);

  if (!match) {
    return null;
  }

  const rawTitle = match[1].trim();
  const lowerTitle = rawTitle.toLowerCase();
  const isProtocolOnly = lowerTitle === 'http' || lowerTitle === 'https';

  if (isProtocolOnly) {
    return null;
  }

  const rawUrl = match[2].trim();
  const trailing = match[3].trim().replace(/^[-–—|:]\s*/, '');
  const title = rawTitle || extractDomainTitle(rawUrl);

  const item: QuestionReferenceLinkItem = {
    id: generateLinkId(index),
    title: title,
    url: rawUrl,
  };

  if (trailing) {
    item.description = trailing;
  }

  return item;
}

export function parseColonSeparated(rawText: string): QuestionReferenceLinkItem[] {
  const items: QuestionReferenceLinkItem[] = [];
  const lines = rawText.split(/\r?\n/);
  let index = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const parsedItem = parseColonLine(lines[i], index);

    if (parsedItem) {
      items.push(parsedItem);
      index += 1;
    }
  }

  return items;
}

export function parseRawUrls(rawText: string): QuestionReferenceLinkItem[] {
  const items: QuestionReferenceLinkItem[] = [];
  const lines = rawText.split(/\r?\n/);
  let index = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    const hasUrl = isUrlLine(trimmed);

    if (hasUrl) {
      const cleanUrl = trimmed.replace(/[.,;]+$/, '');
      const title = extractDomainTitle(cleanUrl);

      items.push({
        id: generateLinkId(index),
        title: title,
        url: cleanUrl,
      });

      index += 1;
    }
  }

  return items;
}

export function parseDoubleLine(rawText: string): QuestionReferenceLinkItem[] {
  const items: QuestionReferenceLinkItem[] = [];
  const lines = rawText.split(/\r?\n/);
  let pendingTitle = '';
  let index = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();

    if (trimmed.length === 0) {
      continue;
    }

    const isUrl = isUrlLine(trimmed);

    if (isUrl) {
      const cleanUrl = trimmed.replace(/[.,;]+$/, '');
      const fallbackTitle = extractDomainTitle(cleanUrl);
      const title = pendingTitle || fallbackTitle;

      items.push({
        id: generateLinkId(index),
        title: title,
        url: cleanUrl,
      });

      pendingTitle = '';
      index += 1;
    }

    if (!isUrl) {
      pendingTitle = trimmed;
    }
  }

  return items;
}

function resolveTargetFormat(
  rawText: string,
  forcedFormat?: string
): CitationFormatType {
  if (forcedFormat) {
    const isAuto = forcedFormat === 'auto';

    if (isAuto) {
      return detectLinkFormat(rawText);
    }

    const validFormats: CitationFormatType[] = [
      'json',
      'markdown',
      'colon',
      'double_line',
      'raw_url',
    ];
    const isKnown = validFormats.includes(forcedFormat as CitationFormatType);

    if (isKnown) {
      return forcedFormat as CitationFormatType;
    }
  }

  const detected = detectLinkFormat(rawText);

  return detected;
}

function parseFallbackLinks(rawText: string): QuestionReferenceLinkItem[] {
  const mdItems = parseMarkdownLinks(rawText);

  if (mdItems.length > 0) {
    return mdItems;
  }

  const colonItems = parseColonSeparated(rawText);

  if (colonItems.length > 0) {
    return colonItems;
  }

  const urlItems = parseRawUrls(rawText);

  if (urlItems.length > 0) {
    return urlItems;
  }

  const doubleItems = parseDoubleLine(rawText);

  if (doubleItems.length > 0) {
    return doubleItems;
  }

  return [];
}

export function parseReferenceLinks(
  rawText: string,
  forcedFormat?: string
): QuestionReferenceLinkItem[] {
  const trimmed = (rawText || '').trim();

  if (!trimmed) {
    return [];
  }

  const resolvedFormat = resolveTargetFormat(trimmed, forcedFormat);

  if (resolvedFormat === 'json') {
    return parseJsonArray(trimmed);
  }

  if (resolvedFormat === 'markdown') {
    return parseMarkdownLinks(trimmed);
  }

  if (resolvedFormat === 'colon') {
    return parseColonSeparated(trimmed);
  }

  if (resolvedFormat === 'raw_url') {
    return parseRawUrls(trimmed);
  }

  if (resolvedFormat === 'double_line') {
    return parseDoubleLine(trimmed);
  }

  const fallbackItems = parseFallbackLinks(trimmed);

  return fallbackItems;
}
