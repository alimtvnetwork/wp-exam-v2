import { create } from "zustand";
import { toast } from "sonner";
import {
  type AddEventParams,
  type AddScreenshotParams,
  type BugReportSummary,
  type CapturedScreenshot,
  IssueCategoryType,
  type RecorderEvent,
  type RecorderSession,
  RecorderStatusType,
} from "./types";
import { useErrorHistoryStore } from "@/lib/recorder/error-history";
import { resolveBackendBaseUrl } from "@/lib/recorder/backend-url";
import { saveBugSession } from "@/lib/recorder/recorder-repository";
import {
  createEmptySession,
  generateSemanticDefaultTitle,
  generateSemanticSessionId,
} from "./session-factory";

export { createEmptySession, generateSemanticDefaultTitle, generateSemanticSessionId };

interface RecorderStoreState {
  status: RecorderStatusType;
  isRecording: boolean;
  isPaused: boolean;
  isExportModalOpen: boolean;
  isPreviousBugsOpen: boolean;
  isEventExplorerOpen: boolean;
  isHoverRecording: boolean;
  isHoverRecordEnabled: boolean;
  hoverTargetsCache: Set<string>;
  hasEvents: boolean;
  hasScreenshots: boolean;
  session: RecorderSession | null;
  elapsedSec: number;

  startRecording: (initialRoute?: string) => void;
  stopRecording: () => Promise<string | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  openEventExplorer: () => void;
  closeEventExplorer: () => void;
  setEventExplorerOpen: (isOpen: boolean) => void;
  openPreviousBugs: () => void;
  closePreviousBugs: () => void;
  setPreviousBugsOpen: (isOpen: boolean) => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  setExportModalOpen: (isOpen: boolean) => void;
  toggleHoverRecord: () => void;
  toggleHoverRecording: () => void;
  setHoverRecordEnabled: (isEnabled: boolean) => void;
  setHoverRecording: (isEnabled: boolean) => void;
  hasRecordedHover: (key: string) => boolean;
  markHoverRecorded: (key: string) => void;
  clearHoverTargetsCache: () => void;
  addEvent: (params: AddEventParams) => void;
  addScreenshot: (params: AddScreenshotParams) => string;
  setSummary: (summary: BugReportSummary) => void;
  tickElapsed: () => void;
}

export const useRecorderStore = create<RecorderStoreState>((set, get) => ({
  status: RecorderStatusType.Idle,
  isRecording: false,
  isPaused: false,
  isExportModalOpen: false,
  isPreviousBugsOpen: false,
  isEventExplorerOpen: false,
  isHoverRecording: false,
  isHoverRecordEnabled: false,
  hoverTargetsCache: new Set<string>(),
  hasEvents: false,
  hasScreenshots: false,
  session: null,
  elapsedSec: 0,

  startRecording: (initialRoute = window.location.pathname) => {
    const session = createEmptySession(initialRoute);

    set({
      status: RecorderStatusType.Recording,
      isRecording: true,
      isPaused: false,
      isExportModalOpen: false,
      isPreviousBugsOpen: false,
      isHoverRecording: false,
      isHoverRecordEnabled: false,
      hoverTargetsCache: new Set<string>(),
      hasEvents: false,
      hasScreenshots: false,
      session,
      elapsedSec: 0,
    });
  },

  stopRecording: async (): Promise<string | null> => {
    const current = get().session;

    if (!current) {
      return null;
    }

    const stoppedAt = new Date().toISOString();
    const durationMs = Date.now() - new Date(current.startedAt).getTime();
    const finalRoute = window.location.pathname;

    const activeErrors = useErrorHistoryStore.getState().history.map((err) => ({
      id: err.id,
      code: err.code,
      message: err.message,
      level: err.level,
      correlationId: err.correlationId,
      triggerComponent: err.triggerComponent,
      stackTrace: err.stackTrace,
      createdAt: err.createdAt,
      details: err.details,
    }));

    const stoppedSession: RecorderSession = {
      ...current,
      stoppedAt,
      durationMs,
      finalRoute,
      errors: activeErrors,
      isHoverRecording: get().isHoverRecordEnabled,
      isHoverRecordEnabled: get().isHoverRecordEnabled,
    };

    set({
      status: RecorderStatusType.Stopped,
      isRecording: false,
      isPaused: false,
      isExportModalOpen: false,
      session: stoppedSession,
    });

    const baseUrl = resolveBackendBaseUrl();
    let savedSessionId = stoppedSession.id;

    const defaultSummary: BugReportSummary = stoppedSession.summary ?? {
      title: generateSemanticDefaultTitle(stoppedSession.initialRoute),
      category: IssueCategoryType.UiGlitch,
      description: `Industrial session recorded on ${stoppedSession.initialRoute}`,
      expectedBehavior: "Expected normal operation without visual or logical defects.",
      actualBehavior: "Captured interactions and diagnostic snapshots.",
    };

    if (baseUrl) {
      try {
        const payload = {
          sessionId: stoppedSession.id,
          session_id: stoppedSession.id,
          initialRoute: stoppedSession.initialRoute,
          finalRoute: stoppedSession.finalRoute,
          durationMs: stoppedSession.durationMs,
          summary: defaultSummary,
          screenshots: stoppedSession.screenshots,
          events: stoppedSession.events,
          errors: stoppedSession.errors,
        };

        let res = await fetch(`${baseUrl}/bug-reports/save-local`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch("/bug-reports/save-local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json();
          const resPayload = data?.Results?.[0] || data?.results?.[0] || data?.data || data || {};

          if (resPayload.sessionId) {
            savedSessionId = resPayload.sessionId;
          }
        }
      } catch {
        /* fall through */
      }
    }

    try {
      await saveBugSession({
        session: stoppedSession,
        summary: defaultSummary,
        errors: stoppedSession.errors,
      });
    } catch (err) {
      console.warn("Failed to persist bug session locally:", err);
    }

    const eventCount = stoppedSession.events.length;

    if (baseUrl) {
      toast.success(
        `Recording stopped. Session saved to database (#${savedSessionId}) with ${eventCount} events and dual snapshots.`,
      );
    } else {
      toast.success(
        `Recording stopped. Session saved locally (#${savedSessionId}) with ${eventCount} events and dual snapshots.`,
      );
    }

    return savedSessionId;
  },

  pauseRecording: () => {
    if (!get().isRecording) {
      return;
    }

    set({
      status: RecorderStatusType.Paused,
      isPaused: true,
    });
  },

  resumeRecording: () => {
    const { session } = get();

    if (!session) {
      return;
    }

    const updatedSession = { ...session };
    delete updatedSession.stoppedAt;

    set({
      status: RecorderStatusType.Recording,
      isRecording: true,
      isPaused: false,
      isExportModalOpen: false,
      session: updatedSession,
    });
  },

  cancelRecording: () => {
    set({
      status: RecorderStatusType.Idle,
      isRecording: false,
      isPaused: false,
      isExportModalOpen: false,
      isPreviousBugsOpen: false,
      isEventExplorerOpen: false,
      isHoverRecording: false,
      isHoverRecordEnabled: false,
      hoverTargetsCache: new Set<string>(),
      hasEvents: false,
      hasScreenshots: false,
      session: null,
      elapsedSec: 0,
    });
  },

  openEventExplorer: () => {
    set({ isEventExplorerOpen: true });
  },

  closeEventExplorer: () => {
    set({ isEventExplorerOpen: false });
  },

  setEventExplorerOpen: (isOpen: boolean) => {
    set({ isEventExplorerOpen: isOpen });
  },

  openPreviousBugs: () => {
    set({ isPreviousBugsOpen: true });
  },

  closePreviousBugs: () => {
    set({ isPreviousBugsOpen: false });
  },

  setPreviousBugsOpen: (isOpen: boolean) => {
    set({ isPreviousBugsOpen: isOpen });
  },

  openExportModal: () => {
    const { session } = get();

    if (!session) {
      set({ session: createEmptySession(window.location.pathname) });
    }

    set({ isExportModalOpen: true });
  },

  closeExportModal: () => {
    set({ isExportModalOpen: false });
  },

  setExportModalOpen: (isOpen: boolean) => {
    if (isOpen && !get().session) {
      set({ session: createEmptySession(window.location.pathname) });
    }

    set({ isExportModalOpen: isOpen });
  },

  hasRecordedHover: (key: string) => {
    return get().hoverTargetsCache.has(key);
  },

  markHoverRecorded: (key: string) => {
    const updated = new Set(get().hoverTargetsCache);
    updated.add(key);
    set({ hoverTargetsCache: updated });
  },

  clearHoverTargetsCache: () => {
    set({ hoverTargetsCache: new Set<string>() });
  },

  toggleHoverRecord: () => {
    const current = get().isHoverRecordEnabled;
    const next = !current;

    set({ isHoverRecordEnabled: next, isHoverRecording: next });
  },

  toggleHoverRecording: () => {
    get().toggleHoverRecord();
  },

  setHoverRecordEnabled: (isEnabled: boolean) => {
    set({ isHoverRecordEnabled: isEnabled, isHoverRecording: isEnabled });
  },

  setHoverRecording: (isEnabled: boolean) => {
    get().setHoverRecordEnabled(isEnabled);
  },

  addEvent: (params: AddEventParams) => {
    const { session, isRecording, isPaused } = get();

    if (!isRecording || isPaused || !session) {
      return;
    }

    const timestamp = new Date().toISOString();
    const elapsedMs = Date.now() - new Date(session.startedAt).getTime();
    const id = `evt-${Date.now()}-${session.events.length + 1}`;
    const seqNumber = params.seqNumber ?? (session.events.length + 1);

    const newEvent: RecorderEvent = {
      ...params,
      seqNumber,
      selector: params.selector ?? "",
      id,
      timestamp,
      elapsedMs,
    };

    const hasRoute = session.routeHistory.includes(params.route);
    const updatedRoutes = hasRoute ? session.routeHistory : [...session.routeHistory, params.route];

    set({
      hasEvents: true,
      session: {
        ...session,
        events: [...session.events, newEvent],
        routeHistory: updatedRoutes,
        finalRoute: params.route,
      },
    });
  },

  addScreenshot: (params: AddScreenshotParams): string => {
    const { session } = get();

    if (!session) {
      return "";
    }

    const timestamp = new Date().toISOString();
    const elapsedMs = Date.now() - new Date(session.startedAt).getTime();
    const id = `snap-${Date.now()}-${session.screenshots.length + 1}`;
    const seqNumber = params.seqNumber ?? (session.screenshots.length + 1);

    const newScreenshot: CapturedScreenshot = {
      ...params,
      seqNumber,
      id,
      timestamp,
      elapsedMs,
    };

    set({
      hasScreenshots: true,
      session: {
        ...session,
        screenshots: [...session.screenshots, newScreenshot],
      },
    });

    return id;
  },

  setSummary: (summary: BugReportSummary) => {
    const { session } = get();

    if (!session) {
      return;
    }

    set({
      session: {
        ...session,
        summary,
      },
    });
  },

  tickElapsed: () => {
    const { isRecording, isPaused, elapsedSec } = get();

    if (!isRecording || isPaused) {
      return;
    }

    set({ elapsedSec: elapsedSec + 1 });
  },
}));
