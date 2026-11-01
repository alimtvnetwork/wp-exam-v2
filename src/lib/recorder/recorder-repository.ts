import type { BugReportSummary, CapturedScreenshot, RecorderEvent, RecorderSession } from "./types";

export interface BugScreenshotRecord {
  bugScreenshotId: number;
  sessionId: string;
  sequenceNumber: number;
  fileName: string;
  diskPath: string;
  relPath: string;
  title: string | null;
  descriptor: string | null;
  targetComponent: string | null;
  createdAt: number;
}

export interface BugSessionItem {
  bugSessionId: number;
  sessionId: string;
  title: string;
  category: string;
  description: string | null;
  expectedBehavior: string | null;
  actualBehavior: string | null;
  initialRoute: string;
  finalRoute: string | null;
  durationMs: number;
  eventCount: number;
  screenshotCount: number;
  errorCount: number;
  promptV6Path: string | null;
  promptV7Path: string | null;
  diskDirPath: string;
  isArchived: boolean;
  createdAt: number;
  persistedAt: number;
}

export interface BugSessionDetail extends BugSessionItem {
  screenshots: BugScreenshotRecord[];
  events: RecorderEvent[];
  sessionEvents: RecorderEvent[];
  sessionSnapshots: CapturedScreenshot[];
  promptV6Content?: string;
  promptV7Content?: string;
}

export interface SaveBugSessionInput {
  session: RecorderSession;
  summary: BugReportSummary;
  errors?: Array<Record<string, unknown>>;
}

const DB_NAME = "wp-exam-recorder";
const STORE_NAME = "bug-sessions";
const DB_VERSION = 1;

interface StoredBugSession {
  sessionId: string;
  item: BugSessionItem;
  session: RecorderSession;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "sessionId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB."));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionToPromise(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed."));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDatabase();

  try {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const result = await fn(store);
    await transactionToPromise(tx);

    return result;
  } finally {
    db.close();
  }
}

function toBugScreenshotRecord(
  snap: CapturedScreenshot,
  index: number,
  sessionId: string,
  createdAt: number,
): BugScreenshotRecord {
  const seq = snap.seqNumber ?? index + 1;

  return {
    bugScreenshotId: index,
    sessionId,
    sequenceNumber: seq,
    fileName: `screenshot-${seq}.png`,
    diskPath: "",
    relPath: "",
    title: snap.title ?? null,
    descriptor: null,
    targetComponent: null,
    createdAt,
  };
}

export async function saveBugSession(input: SaveBugSessionInput): Promise<string> {
  const { session, summary, errors } = input;
  const now = Date.now();
  const errorList = errors ?? session.errors ?? [];

  const item: BugSessionItem = {
    bugSessionId: now,
    sessionId: session.id,
    title: summary.title,
    category: summary.category,
    description: summary.description ?? null,
    expectedBehavior: summary.expectedBehavior ?? null,
    actualBehavior: summary.actualBehavior ?? null,
    initialRoute: session.initialRoute,
    finalRoute: session.finalRoute ?? null,
    durationMs: session.durationMs,
    eventCount: session.events.length,
    screenshotCount: session.screenshots.length,
    errorCount: errorList.length,
    promptV6Path: null,
    promptV7Path: null,
    diskDirPath: "indexeddb",
    isArchived: false,
    createdAt: now,
    persistedAt: now,
  };

  const record: StoredBugSession = { sessionId: session.id, item, session };

  await withStore("readwrite", async (store) => {
    await requestToPromise(store.put(record));
  });

  return session.id;
}

export async function fetchBugSessions(
  params?: { limit?: number; offset?: number; category?: string },
): Promise<BugSessionItem[]> {
  try {
    const records = await withStore("readonly", (store) =>
      requestToPromise<StoredBugSession[]>(store.getAll()),
    );

    const categoryFilter = params?.category?.trim().toLowerCase();
    const filtered = categoryFilter
      ? records.filter((r) => r.item.category?.toLowerCase() === categoryFilter)
      : records;

    const sorted = [...filtered].sort((a, b) => b.item.createdAt - a.item.createdAt);
    const offset = params?.offset ?? 0;
    const limit = params?.limit;
    const sliced = limit === undefined ? sorted.slice(offset) : sorted.slice(offset, offset + limit);

    return sliced.map((r) => r.item);
  } catch (err) {
    console.warn("[recorder-repository] fetchBugSessions failed:", err);

    return [];
  }
}

export async function fetchBugSessionDetail(sessionId: string): Promise<BugSessionDetail | null> {
  try {
    const record = await withStore("readonly", (store) =>
      requestToPromise<StoredBugSession | undefined>(store.get(sessionId)),
    );

    if (!record) {
      return null;
    }

    const createdAt = Date.now();
    const screenshots = record.session.screenshots.map((snap, idx) =>
      toBugScreenshotRecord(snap, idx, record.sessionId, createdAt),
    );

    return {
      ...record.item,
      screenshots,
      events: record.session.events,
      sessionEvents: record.session.events,
      sessionSnapshots: record.session.screenshots,
    };
  } catch (err) {
    console.warn("[recorder-repository] fetchBugSessionDetail failed:", err);

    return null;
  }
}
