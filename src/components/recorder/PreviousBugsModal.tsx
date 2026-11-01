import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, History, RefreshCw, FolderArchive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRecorderStore } from "@/lib/recorder/recorder-store";
import { isEscape } from "@/lib/recorder/keyboard";
import {
  fetchBugSessions,
  fetchBugSessionDetail,
  type BugSessionItem,
} from "@/lib/recorder/recorder-repository";
import { RecorderEmailModal } from "./RecorderEmailModal";
import { PreviousBugsFilterBar } from "./PreviousBugsFilterBar";
import { BugSessionCard } from "./BugSessionCard";
import type { BugReportSummary, IssueCategoryType, RecorderSession } from "@/lib/recorder/types";

export interface PreviousBugsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PreviousBugsModal({
  isOpen,
  onClose,
}: PreviousBugsModalProps): React.JSX.Element | null {
  const isStoreOpen = useRecorderStore((s) => s.isPreviousBugsOpen);
  const storeClose = useRecorderStore((s) => s.closePreviousBugs);
  const isVisible = isOpen !== undefined ? isOpen : isStoreOpen;
  const handleClose = onClose || storeClose;

  const [sessions, setSessions] = useState<BugSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeSessionForEmail, setActiveSessionForEmail] = useState<{
    session: RecorderSession;
    summary: BugReportSummary;
  } | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await fetchBugSessions({ limit: 100 });
      setSessions(data);
    } catch {
      toast.error("Failed to load past bug sessions from IndexedDB");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      void loadSessions();
    }
  }, [isVisible, loadSessions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEscape(e.key)) {
        handleClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, handleClose]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const isCategoryMatch =
        selectedCategory === "all" ||
        s.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const isSearchMatch =
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.sessionId.toLowerCase().includes(query) ||
        s.initialRoute.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query));

      return isCategoryMatch && isSearchMatch;
    });
  }, [sessions, selectedCategory, searchQuery]);

  const handleOpenEmail = async (item: BugSessionItem) => {
    // IMPROVEMENT (wp-exam-v2 port): hydrate the email session with the real
    // events/screenshots from fetchBugSessionDetail when they are present,
    // instead of hardcoding empty arrays like the source did.
    let events: RecorderSession["events"] = [];
    let screenshots: RecorderSession["screenshots"] = [];

    try {
      const detail = (await fetchBugSessionDetail(item.sessionId)) as unknown as {
        events?: unknown[];
        screenshots?: Array<{
          sequenceNumber: number;
          title?: string;
          fileName?: string;
          createdAt?: number;
        }>;
      } | null;

      if (detail?.events && detail.events.length > 0) {
        events = detail.events as unknown as RecorderSession["events"];
      }

      if (detail?.screenshots && detail.screenshots.length > 0) {
        screenshots = detail.screenshots.map((s) => ({
          id: `snap-${s.sequenceNumber}`,
          title: s.title || s.fileName || "snapshot",
          timestamp: new Date((s.createdAt || 0) * 1000).toISOString(),
          elapsedMs: 0,
          dataUrl: "",
          source: "manual",
        }));
      }
    } catch {
      // Fall back to an empty telemetry payload; the email modal still renders.
    }

    const summary: BugReportSummary = {
      title: item.title,
      category: item.category as IssueCategoryType,
      description: item.description || "",
      expectedBehavior: item.expectedBehavior || "",
      actualBehavior: item.actualBehavior || "",
    };

    const session: RecorderSession = {
      id: item.sessionId,
      startedAt: new Date(item.createdAt * 1000).toISOString(),
      stoppedAt: new Date(item.persistedAt * 1000).toISOString(),
      durationMs: item.durationMs,
      events,
      screenshots,
      routeHistory: [item.initialRoute],
      initialRoute: item.initialRoute,
      finalRoute: item.finalRoute || item.initialRoute,
      summary,
    };

    setActiveSessionForEmail({ session, summary });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Previous Bug Sessions"
        className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      >
        <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/30">
                <History className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground tracking-wide">
                    Recorded Bug Sessions
                  </h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-mono text-primary border border-border">
                    IndexedDB
                  </span>
                  <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                    {sessions.length} sessions
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Historical telemetry recordings, prompt artifacts, and error snapshots persisted in the browser (IndexedDB).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSessions}
                disabled={isLoading}
                title="Refresh sessions list"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:text-foreground transition disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-secondary/60 text-secondary-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <PreviousBugsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Session Cards List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[300px]">
            {isLoading && sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-xs font-mono">Loading recorded sessions...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
                <FolderArchive className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-foreground">No Recorded Bug Sessions Found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm text-center">
                  {searchQuery
                    ? "No sessions match your search criteria. Try a different query or reset filters."
                    : "No recorded bug sessions in local storage. Click the 'Record Bug' button in the top navigation bar to record an issue."}
                </p>
              </div>
            ) : (
              filteredSessions.map((item) => (
                <BugSessionCard
                  key={item.sessionId}
                  item={item}
                  onOpenEmail={handleOpenEmail}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {activeSessionForEmail && (
        <RecorderEmailModal
          isOpen={true}
          onClose={() => setActiveSessionForEmail(null)}
          session={activeSessionForEmail.session}
          summary={activeSessionForEmail.summary}
        />
      )}
    </>
  );
}
