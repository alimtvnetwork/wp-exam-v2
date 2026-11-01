import { create } from "zustand";

/**
 * Minimal error-history store for the bug recorder.
 *
 * Replaces cat-my-v12's errorStore module: the recorder only needs
 * the recorded error history (`useErrorHistoryStore.getState().history`),
 * which `recorder-store.stopRecording()` snapshots into the stopped session.
 */
export interface ErrorHistoryEntry {
  id: string;
  code: string;
  message: string;
  level: string;
  correlationId?: string;
  triggerComponent?: string;
  stackTrace?: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

type PushErrorInput = Omit<ErrorHistoryEntry, "id" | "createdAt"> &
  Partial<Pick<ErrorHistoryEntry, "id" | "createdAt">>;

export const useErrorHistoryStore = create<{
  history: ErrorHistoryEntry[];
  pushError: (entry: PushErrorInput) => void;
  clear: () => void;
}>((set) => ({
  history: [],
  pushError: (entry) =>
    set((state) => ({
      history: [
        ...state.history,
        {
          ...entry,
          id: entry.id ?? `err-${Date.now()}-${state.history.length + 1}`,
          createdAt: entry.createdAt ?? new Date().toISOString(),
        },
      ],
    })),
  clear: () => set({ history: [] }),
}));

let captureStarted = false;

function normalizeStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }

  return undefined;
}

/**
 * Attaches window-level "error" and "unhandledrejection" listeners that push
 * entries into the error history. Idempotent — calling twice is a no-op.
 */
export function startErrorCapture(): void {
  if (captureStarted || typeof window === "undefined") {
    return;
  }

  captureStarted = true;

  window.addEventListener("error", (event) => {
    useErrorHistoryStore.getState().pushError({
      code: "window.onerror",
      message: event.message || "Uncaught runtime error",
      level: "error",
      stackTrace: normalizeStack(event.error),
      details: {
        filename: (event as ErrorEvent).filename,
        lineno: (event as ErrorEvent).lineno,
        colno: (event as ErrorEvent).colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    useErrorHistoryStore.getState().pushError({
      code: "unhandledrejection",
      message: reason instanceof Error ? reason.message : String(reason ?? "Unhandled promise rejection"),
      level: "error",
      stackTrace: normalizeStack(reason),
    });
  });
}
