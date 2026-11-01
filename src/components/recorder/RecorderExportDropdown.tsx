import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Download,
  FileCode,
  FileJson,
  Bot,
  Mail,
  HardDrive,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { resolveBackendBaseUrl } from "@/lib/recorder/backend-url";
import { useErrorHistoryStore } from "@/lib/recorder/error-history";
import { saveBugSession } from "@/lib/recorder/recorder-repository";
import {
  isArrowDown,
  isArrowUp,
  isEnterOrSpace,
  isEscape,
} from "@/lib/recorder/keyboard";
import { exportSessionToZip } from "@/lib/recorder/zip-builder";
import {
  generateV6LetterlyPrompt,
  generateV7LetterlyPrompt,
  getWorkspaceRoot,
} from "@/lib/recorder/prompt-v6-v7-builder";
import type { BugReportSummary, RecorderSession } from "@/lib/recorder/types";

export interface RecorderExportDropdownProps {
  session: RecorderSession;
  summary: BugReportSummary;
  onOpenEmailModal: () => void;
  onPrimaryClick?: () => void;
  className?: string;
  isCompact?: boolean;
  placement?: "top" | "bottom";
}

interface DropdownItem {
  id: string;
  label: string;
  sublabel: string;
  shortcut: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  action: () => Promise<void> | void;
  isLoading: boolean;
}

export function RecorderExportDropdown({
  session,
  summary,
  onOpenEmailModal,
  onPrimaryClick,
  className = "",
  isCompact = false,
  placement = "top",
}: RecorderExportDropdownProps): React.JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isCopyingPrompt, setIsCopyingPrompt] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      setIsDropdownOpen(false);
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const executeItemAction = async (item: DropdownItem): Promise<void> => {
    try {
      await item.action();
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const handleExportZip = async (): Promise<void> => {
    setIsExportingZip(true);

    try {
      toast.info("Generating ZIP bundle with snapshots and telemetry...");
      const result = await exportSessionToZip(session, summary);

      const clipboardPayload = [
        `# Bug Report Archive: ${result.filename}`,
        `Session: ${session.id}`,
        `Events: ${session.events.length} | Screenshots: ${session.screenshots.length}`,
        "",
        "## PowerShell Extraction Command:",
        result.extractionCommand,
        "",
        "## AI Execution Directive:",
        result.aiInstructions,
      ].join("\n");

      try {
        await navigator.clipboard.writeText(clipboardPayload);
        toast.success("ZIP exported! Download path & extraction command copied to clipboard.");
      } catch {
        toast.success(`ZIP exported to ${result.filename}!`);
      }
    } catch (err) {
      toast.error(`ZIP export failed: ${String(err)}`);
    } finally {
      setIsExportingZip(false);
      setIsDropdownOpen(false);
    }
  };

  const handleSaveLocal = async (): Promise<{ isSaved: boolean; savedDir?: string; idePrompt?: string }> => {
    setIsSavingLocal(true);
    const baseUrl = resolveBackendBaseUrl();

    try {
      if (!baseUrl) {
        await saveBugSession({ session, summary });
        toast.success("Saved to local IndexedDB (wp-exam-recorder)");

        return { isSaved: true };
      }

      const payload = {
        session_id: session.id,
        initialRoute: session.initialRoute,
        summary,
        screenshots: session.screenshots,
        events: session.events,
      };

      let res = await fetch(`${baseUrl}/bug-reports/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch("/bug-reports/local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        res = await fetch(`${baseUrl}/bug-reports/save-local`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        const result = data?.Results?.[0] || data?.results?.[0] || data || {};
        const savedDir = result.savedDir || `.logs/recorded-bugs/${session.id}`;
        toast.success(`Saved bug report and ${session.screenshots.length} snapshots to ${savedDir}!`);

        return { isSaved: true, savedDir, idePrompt: result.idePrompt };
      }

      toast.error("Failed to persist bug report to local machine directory");
    } catch (err) {
      toast.error(`Local persistence error: ${String(err)}`);
    } finally {
      setIsSavingLocal(false);
      setIsDropdownOpen(false);
    }

    return { isSaved: false };
  };

  const handleCopyPromptV6 = async (): Promise<void> => {
    setIsCopyingPrompt(true);

    try {
      const saveRes = await handleSaveLocal();
      const rawDir = saveRes?.savedDir || "";
      const workspaceRoot = rawDir.includes(":")
        ? rawDir.replace(/[\\/]\.logs[\\/].*$/, "").replace(/\\/g, "/")
        : getWorkspaceRoot();

      const splitDbErrors = useErrorHistoryStore.getState().history;
      const promptText = generateV6LetterlyPrompt(session, {
        summary,
        splitDbErrors,
        workspaceRoot,
        isAbsolute: true,
      });

      await navigator.clipboard.writeText(promptText);
      toast.success("Copied GitMap Letterly V6 Prompt to clipboard!");
    } catch {
      toast.info("V6 Prompt generated (clipboard write restricted)");
    } finally {
      setIsCopyingPrompt(false);
      setIsDropdownOpen(false);
    }
  };

  const handleCopyPromptV7 = async (): Promise<void> => {
    setIsCopyingPrompt(true);

    try {
      const saveRes = await handleSaveLocal();
      const rawDir = saveRes?.savedDir || "";
      const workspaceRoot = rawDir.includes(":")
        ? rawDir.replace(/[\\/]\.logs[\\/].*$/, "").replace(/\\/g, "/")
        : getWorkspaceRoot();

      const splitDbErrors = useErrorHistoryStore.getState().history;
      const promptText = generateV7LetterlyPrompt(session, {
        summary,
        splitDbErrors,
        workspaceRoot,
        isAbsolute: true,
      });

      await navigator.clipboard.writeText(promptText);
      toast.success("Copied GitMap Letterly V7 Prompt to clipboard!");
    } catch {
      toast.info("V7 Prompt generated (clipboard write restricted)");
    } finally {
      setIsCopyingPrompt(false);
      setIsDropdownOpen(false);
    }
  };

  const handleOpenEmail = (): void => {
    setIsDropdownOpen(false);
    onOpenEmailModal();
  };

  const handleCopySessionJson = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ session, summary }, null, 2));
      toast.success("Session JSON copied to clipboard");
    } catch {
      toast.info("Clipboard write restricted");
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const items: DropdownItem[] = [
    {
      id: "zip",
      label: "Export ZIP Bundle",
      sublabel: "Download archive with snapshots & JSON",
      shortcut: "Ctrl+Z",
      icon: Download,
      iconColor: "text-primary",
      action: handleExportZip,
      isLoading: isExportingZip,
    },
    {
      id: "v6",
      label: "Copy as Prompt (V6)",
      sublabel: "Tree Swarm (A=3, H=2, Cap=6) + Brain roadmap",
      shortcut: "Ctrl+6",
      icon: FileCode,
      iconColor: "text-primary",
      action: handleCopyPromptV6,
      isLoading: isCopyingPrompt,
    },
    {
      id: "v7",
      label: "Copy as Prompt (V7)",
      sublabel: "Dual modes + GitMap telemetry + AI Bot identity",
      shortcut: "Ctrl+7",
      icon: Bot,
      iconColor: "text-primary",
      action: handleCopyPromptV7,
      isLoading: isCopyingPrompt,
    },
    {
      id: "email",
      label: "Direct Email",
      sublabel: "Dispatch bug report directly to engineering",
      shortcut: "Ctrl+E",
      icon: Mail,
      iconColor: "text-primary",
      action: handleOpenEmail,
      isLoading: false,
    },
    {
      id: "local",
      label: "Save to Local Machine",
      sublabel: "Persist via backend or local IndexedDB",
      shortcut: "Ctrl+S",
      icon: HardDrive,
      iconColor: "text-primary",
      action: async () => {
        await handleSaveLocal();
      },
      isLoading: isSavingLocal,
    },
    {
      id: "json",
      label: "Copy Session JSON",
      sublabel: "Copy full session + summary JSON to clipboard",
      shortcut: "Ctrl+J",
      icon: FileJson,
      iconColor: "text-primary",
      action: handleCopySessionJson,
      isLoading: false,
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!isDropdownOpen) {
      if (isEnterOrSpace(e.key) || isArrowDown(e.key)) {
        e.preventDefault();
        setIsDropdownOpen(true);
        setActiveIndex(0);
      }

      return;
    }

    if (isEscape(e.key)) {
      e.preventDefault();
      setIsDropdownOpen(false);

      return;
    }

    if (isArrowDown(e.key)) {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % items.length);

      return;
    }

    if (isArrowUp(e.key)) {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);

      return;
    }

    if (isEnterOrSpace(e.key)) {
      e.preventDefault();
      const currentItem = items[activeIndex];

      if (currentItem) {
        void executeItemAction(currentItem);
      }
    }
  };

  const placementClasses = placement === "bottom"
    ? "top-full mt-2"
    : "bottom-full mb-2";

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center ${className}`}
    >
      <div className="inline-flex items-center rounded-lg border border-border bg-secondary shadow-sm">
        <button
          type="button"
          onClick={onPrimaryClick || handleExportZip}
          disabled={isExportingZip}
          title="Quick Export: ZIP Archive"
          className={`flex items-center gap-1.5 font-medium text-secondary-foreground hover:bg-secondary/80 rounded-l-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 ${
            isCompact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs"
          }`}
        >
          {isExportingZip ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Download className="h-3.5 w-3.5 text-primary" />
          )}
          <span>{isExportingZip ? "Exporting..." : isCompact ? "Export ZIP" : "Download ZIP"}</span>
        </button>

        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          title="Choose Export Format"
          className={`border-l border-border text-secondary-foreground hover:bg-secondary/80 rounded-r-lg transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
            isCompact ? "p-1" : "p-1.5"
          }`}
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isDropdownOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`absolute right-0 ${placementClasses} w-[360px] max-h-[min(380px,80vh)] overflow-y-auto scrollbar-thin rounded-xl border border-border bg-popover p-1.5 shadow-xl backdrop-blur-xl z-[10070] animate-in fade-in zoom-in-95`}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border mb-1 flex items-center justify-between">
            <span>Unified Export Suite</span>
            <span className="text-[9px] text-muted-foreground font-mono">{items.length} options</span>
          </div>

          <div className="flex flex-col gap-0.5">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isSelected = activeIndex === index;

              return (
                <button
                  key={item.id}
                  role="menuitem"
                  type="button"
                  onClick={() => void executeItemAction(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  disabled={item.isLoading}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors disabled:opacity-50 ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/60 hover:text-accent-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                    ) : (
                      <Icon className={`h-4 w-4 ${item.iconColor} shrink-0`} />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {item.sublabel}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded border border-border bg-muted/60">
                    {item.shortcut}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
