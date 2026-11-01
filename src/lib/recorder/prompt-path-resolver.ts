import type { CapturedScreenshot, RecorderSession } from "./types";

export interface PromptImageRef {
  sequenceNumber: number;
  instanceId: string;
  actionDescriptor: string;
  absolutePath: string;
  relativePath?: string;
  dataUrl?: string;
  fullScreenPath?: string;
  elementCropPath?: string;
}

export interface DiscreteIdeImageLinkParams {
  sequenceNumber: number;
  instance: string;
  what: string;
  sessionId: string;
  baseDir?: string;
  workspaceRoot?: string;
  isAbsolute?: boolean;
}

export function sanitizeIdentifier(text: string): string {
  const sanitized = text
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  return sanitized || "item";
}

export function sanitizeSlug(title: string): string {
  const withoutPrefix = title
    .toLowerCase()
    .replace(/^(\d{1,3}[-_.\s]+)+/, "");

  const cleaned = withoutPrefix
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return cleaned || "task";
}

export function normalizeRelativePath(rawPath: string): string {
  return rawPath
    .replace(/\\/g, "/")
    .replace(/^[a-zA-Z]:[\/\\]?/, "")
    .replace(/^\/+/, "");
}

/**
 * Browser-only resolver: there is no filesystem workspace root, so this
 * resolves an explicitly provided root when given, otherwise "".
 * All prompt paths stay relative (`.logs/recorded-bugs/<id>/...`).
 */
export function getWorkspaceRoot(explicitRoot?: string): string {
  if (explicitRoot && explicitRoot.trim().length > 0) {
    return explicitRoot.trim().replace(/\\/g, "/").replace(/\/+$/, "");
  }

  return "";
}

/**
 * Returns a relative, display-only path for the task error database.
 * The browser has no filesystem access; this value is used in prompt
 * text only, never for actual file I/O.
 */
export function getAppDbPath(dbName = "task.db"): string {
  return `wp-exam/db/${dbName}`;
}

/**
 * Normalizes any input to a relative forward-slash path.
 * Never produces an absolute filesystem path.
 */
export function ensureAbsoluteWindowsPath(p: string, workspaceRoot?: string): string {
  const explicit = getWorkspaceRoot(workspaceRoot);
  const raw = (p || explicit || "").trim().replace(/\\/g, "/");

  return raw
    .replace(/^[A-Za-z]:[\/\\]?/, "")
    .replace(/^\/+/, "")
    .replace(/^\.\//, "");
}

/**
 * Converts an absolute or partial path back to a clean relative forward-slash path.
 */
export function toRelativeWorkspacePath(p: string, workspaceRoot?: string): string {
  if (!p) {
    return "";
  }

  const clean = normalizeRelativePath(p.trim());
  const root = getWorkspaceRoot(workspaceRoot);

  if (!root) {
    return clean.replace(/^\.\//, "").replace(/^\/+/, "");
  }

  const rootPosix = root.replace(/\\/g, "/").replace(/\/+$/, "");

  if (clean.toLowerCase().startsWith(rootPosix.toLowerCase())) {
    return clean.slice(rootPosix.length).replace(/^\/+/, "");
  }

  return clean.replace(/^\.\//, "");
}

export function formatDiscreteIdeImageLink(params: DiscreteIdeImageLinkParams): string {
  const seq = String(params.sequenceNumber).padStart(2, "0");
  const instance = sanitizeIdentifier(params.instance || "snap");
  const what = sanitizeIdentifier(params.what || "target");
  const fileName = `${seq}_${instance}_${what}.png`;

  const relPath = `.logs/recorded-bugs/${params.sessionId}/screenshots/${fileName}`;

  return `@[${fileName}](file;${relPath})`;
}

export function formatDiagnosticEvidenceLink(
  snapTitle: string,
  index: number,
  eventType: string,
  sessionId: string,
  baseDir?: string,
  workspaceRoot?: string,
  isAbsolute?: boolean,
): string {
  const seq = String(index + 1).padStart(2, "0");
  const instance = sanitizeIdentifier(eventType || "snap");
  const desc = sanitizeIdentifier(snapTitle || `step_${seq}`);
  const safeFileName = `${seq}_${instance}_${desc}.png`;

  const relPath = `.logs/recorded-bugs/${sessionId}/screenshots/${safeFileName}`;

  return `@[${safeFileName}](file;${relPath})`;
}

export function formatIdeImageLink(ref: PromptImageRef): string {
  const seq = String(ref.sequenceNumber).padStart(2, "0");
  const instance = sanitizeIdentifier(ref.instanceId || "inst01");
  const desc = sanitizeIdentifier(ref.actionDescriptor || "snapshot");
  const fileName = `${seq}_${instance}_${desc}.png`;

  const targetPath = normalizeRelativePath(ref.absolutePath || ref.relativePath || fileName);

  return `@[${fileName}](file;${targetPath})`;
}

export function resolveImageRefs(
  session: RecorderSession,
  baseDir?: string,
  workspaceRoot?: string,
  isAbsolute?: boolean,
): PromptImageRef[] {
  const sessionId =
    session.id ||
    (session as unknown as { session_id?: string }).session_id ||
    (session as unknown as { sessionId?: string }).sessionId ||
    "session";
  const folder = `.logs/recorded-bugs/${sessionId}`;

  return session.screenshots.map((snap: CapturedScreenshot, idx: number) => {
    const seq = snap.seqNumber ?? (idx + 1);
    const seqStr = String(seq).padStart(2, "0");
    const instance = sanitizeIdentifier(snap.source || "inst01");
    const desc = sanitizeIdentifier(snap.title || `step_${seqStr}`);
    const fileName = `${seqStr}_${instance}_${desc}.png`;
    const relPath = `${folder}/screenshots/${fileName}`;

    const fullScreenPath = `${folder}/screenshots/${seqStr}_fullscreen_${desc}.png`;
    const elementCropPath = `${folder}/screenshots/${seqStr}_element_${desc}.png`;

    return {
      sequenceNumber: seq,
      instanceId: instance,
      actionDescriptor: desc,
      absolutePath: relPath,
      relativePath: relPath,
      dataUrl: snap.dataUrl,
      fullScreenPath,
      elementCropPath,
    };
  });
}
