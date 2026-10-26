/**
 * Candidate Portal Input & URL Validation Engine.
 * Normalizes submission URLs, validates video and portfolio links,
 * and defends against unsafe protocols and malformed inputs.
 */

const UNSAFE_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Normalizes a candidate-submitted URL by trimming whitespace,
 * stripping dangerous protocols, and ensuring a valid https:// scheme.
 */
export const normalizeWebUrl = (raw: string): string => {
  const trimmed = raw.trim();
  const isEmpty = (trimmed.length === 0);

  if (isEmpty) {
    return '';
  }

  const lower = trimmed.toLowerCase();

  for (const proto of UNSAFE_PROTOCOLS) {
    const isUnsafe = lower.startsWith(proto);

    if (isUnsafe) {
      return '';
    }
  }

  const hasHttp = lower.startsWith('http://');
  const hasHttps = lower.startsWith('https://');

  if (hasHttp) {
    return trimmed;
  }

  if (hasHttps) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

/**
 * Validates whether an input represents a syntactically valid HTTP/HTTPS URL with domain.
 */
export const isValidHttpUrl = (raw: string): boolean => {
  const normalized = normalizeWebUrl(raw);
  const isEmpty = (normalized.length === 0);

  if (isEmpty) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    const isHttp = (parsed.protocol === 'http:');
    const isHttps = (parsed.protocol === 'https:');
    const hasValidProtocol = (isHttp || isHttps);

    if (!hasValidProtocol) {
      return false;
    }

    const host = parsed.hostname;
    const hasDot = host.includes('.');
    const isHostValid = (hasDot && host.length >= 4);

    return isHostValid;
  } catch {
    return false;
  }
};

/**
 * Identifies if a URL belongs to a well-known video hosting platform.
 */
export const isRecognizedVideoPlatform = (raw: string): boolean => {
  const isValid = isValidHttpUrl(raw);

  if (!isValid) {
    return false;
  }

  const normalized = normalizeWebUrl(raw).toLowerCase();
  const videoKeywords = [
    'loom.com',
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'drive.google.com',
    'onedrive.live.com',
    'dropbox.com',
    'wistia.com',
    'vidyard.com',
  ];

  return videoKeywords.some((domain) => normalized.includes(domain));
};

/**
 * Validates candidate introductory video URL (required for Step 4).
 */
export const isValidVideoUrl = (raw: string): boolean => {
  return isValidHttpUrl(raw);
};

/**
 * Validates candidate portfolio/GitHub URL (optional for Step 4).
 */
export const isValidPortfolioUrl = (raw: string): boolean => {
  const trimmed = raw.trim();
  const isEmpty = (trimmed.length === 0);

  if (isEmpty) {
    return true;
  }

  return isValidHttpUrl(trimmed);
};
