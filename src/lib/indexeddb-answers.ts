const DB_NAME = 'wpexam_runner_db';
const DB_VERSION = 1;
const STORE_NAME = 'draft_sessions';
const KEY_PATH = 'formSlug';

export interface FormDraftSession {
  formSlug: string;
  answers: Record<string, unknown>;
  otherTexts: Record<string, string>;
  currentStep: number;
  stepHistory: number[];
  updatedAt: number;
}

export const isIndexedDBAvailable = (): boolean => {
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    return false;
  }

  const hasIndexedDB = 'indexedDB' in window;

  if (!hasIndexedDB) {
    return false;
  }

  return true;
};

const handleUpgradeNeeded = (event: IDBVersionChangeEvent): void => {
  const request = event.target as IDBOpenDBRequest;
  const db = request.result;
  const hasStore = db.objectStoreNames.contains(STORE_NAME);

  if (!hasStore) {
    db.createObjectStore(STORE_NAME, { keyPath: KEY_PATH });
  }
};

const attachOpenListeners = (
  request: IDBOpenDBRequest,
  resolve: (value: IDBDatabase | null) => void
): void => {
  request.onupgradeneeded = handleUpgradeNeeded;
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => resolve(null);
  request.onblocked = () => resolve(null);
};

const createDBOpenPromise = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      attachOpenListeners(request, resolve);
    } catch {
      resolve(null);
    }
  });
};

export const openDraftDB = (): Promise<IDBDatabase | null> => {
  const isAvailable = isIndexedDBAvailable();

  if (!isAvailable) {
    return Promise.resolve(null);
  }

  return createDBOpenPromise();
};

const attachTxListeners = (
  request: IDBRequest,
  tx: IDBTransaction,
  resolve: (value: boolean) => void
): void => {
  request.onerror = () => resolve(false);
  tx.onabort = () => resolve(false);
  tx.onerror = () => resolve(false);
  tx.oncomplete = () => resolve(true);
};

const performSaveTransaction = (
  db: IDBDatabase,
  draft: FormDraftSession
): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(draft);

      attachTxListeners(request, tx, resolve);
    } catch {
      resolve(false);
    }
  });
};

export const saveDraftToIndexedDB = async (
  draft: FormDraftSession
): Promise<boolean> => {
  const db = await openDraftDB();
  const hasDB = Boolean(db);

  if (!hasDB) {
    return false;
  }

  const isSaved = await performSaveTransaction(db as IDBDatabase, draft);

  return isSaved;
};

const extractDraftResult = (
  request: IDBRequest<FormDraftSession | undefined>
): FormDraftSession | null => {
  const result = request.result;
  const hasResult = Boolean(result);

  if (!hasResult) {
    return null;
  }

  return result as FormDraftSession;
};

const attachGetListeners = (
  request: IDBRequest<FormDraftSession | undefined>,
  tx: IDBTransaction,
  resolve: (val: FormDraftSession | null) => void
): void => {
  request.onsuccess = () => resolve(extractDraftResult(request));
  request.onerror = () => resolve(null);
  tx.onabort = () => resolve(null);
  tx.onerror = () => resolve(null);
};

const performGetTransaction = (
  db: IDBDatabase,
  formSlug: string
): Promise<FormDraftSession | null> => {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(formSlug);

      attachGetListeners(request, tx, resolve);
    } catch {
      resolve(null);
    }
  });
};

export const getDraftFromIndexedDB = async (
  formSlug: string
): Promise<FormDraftSession | null> => {
  const db = await openDraftDB();
  const hasDB = Boolean(db);

  if (!hasDB) {
    return null;
  }

  const draft = await performGetTransaction(db as IDBDatabase, formSlug);

  return draft;
};

const performClearTransaction = (
  db: IDBDatabase,
  formSlug: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(formSlug);

      attachTxListeners(request, tx, resolve);
    } catch {
      resolve(false);
    }
  });
};

export const clearDraftFromIndexedDB = async (
  formSlug: string
): Promise<boolean> => {
  const db = await openDraftDB();
  const hasDB = Boolean(db);

  if (!hasDB) {
    return false;
  }

  const isCleared = await performClearTransaction(db as IDBDatabase, formSlug);

  return isCleared;
};
