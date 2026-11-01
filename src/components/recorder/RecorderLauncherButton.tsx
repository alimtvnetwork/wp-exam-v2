import React from "react";
import { ChevronDown, Circle, Download, History, Pause, Play, Radio, Square } from "lucide-react";
import { useRecorderStore } from "@/lib/recorder/recorder-store";
import { cn } from "@/lib/utils";

function formatTimer(sec: number): string {
  const min = Math.floor(sec / 60);
  const remaining = sec % 60;

  return `${String(min).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export function RecorderLauncherButton(): React.JSX.Element {
  const isRecording = useRecorderStore((s) => s.isRecording);
  const isPaused = useRecorderStore((s) => s.isPaused);
  const elapsedSec = useRecorderStore((s) => s.elapsedSec);
  const startRecording = useRecorderStore((s) => s.startRecording);
  const stopRecording = useRecorderStore((s) => s.stopRecording);
  const pauseRecording = useRecorderStore((s) => s.pauseRecording);
  const resumeRecording = useRecorderStore((s) => s.resumeRecording);
  const openExportModal = useRecorderStore((s) => s.openExportModal);
  const openPreviousBugs = useRecorderStore((s) => s.openPreviousBugs);

  return (
    <div className="inline-flex items-center gap-1 shrink-0">
      {/* Button 1: Recording Controller */}
      {isRecording ? (
        <div className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-1 py-0.5">
          {/* Status Badge */}
          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2 h-8 text-xs font-semibold uppercase tracking-wider font-mono border",
              isPaused
                ? "border-border text-muted-foreground"
                : "border-destructive/40 text-destructive animate-pulse",
            )}
          >
            {isPaused ? (
              <Play className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Circle className="h-2.5 w-2.5 fill-destructive text-destructive animate-ping" />
            )}
            <span>
              {isPaused ? `PAUSED ${formatTimer(elapsedSec)}` : `REC ${formatTimer(elapsedSec)}`}
            </span>
          </div>

          {/* Pause / Resume Inline Control */}
          <button
            type="button"
            onClick={isPaused ? resumeRecording : pauseRecording}
            title={isPaused ? "Resume Recording" : "Pause Recording"}
            aria-label={isPaused ? "Resume Recording" : "Pause Recording"}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 h-8 text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Pause</span>
              </>
            )}
          </button>

          {/* Stop Inline Control */}
          <button
            type="button"
            onClick={() => void stopRecording()}
            title="Stop Recording"
            aria-label="Stop Recording"
            className="flex shrink-0 items-center gap-1 rounded-md px-2 h-8 text-xs transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Square className="h-3 w-3 fill-current" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => startRecording()}
          title="Record Activity & Bug Report"
          aria-label="Start Bug Recorder"
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 h-8 text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <Radio className="h-4 w-4 text-destructive" />
          <span className="hidden sm:inline">Record Bug</span>
        </button>
      )}

      {/* Button 2: Export Suite (Always Visible) */}
      <button
        type="button"
        onClick={openExportModal}
        title="Export Suite (ZIP, Prompts, Telemetry)"
        aria-label="Export Bug Report"
        className="flex shrink-0 items-center gap-1 rounded-md px-2 h-8 text-xs transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <ChevronDown className="h-4 w-4" />
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Button 3: Previous Bugs (Always Visible) */}
      <button
        type="button"
        onClick={openPreviousBugs}
        title="Browse and export historical bug sessions"
        aria-label="Previous Bugs"
        className="flex shrink-0 items-center gap-1 rounded-md px-2 h-8 text-xs transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50"
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">Previous Bugs</span>
      </button>
    </div>
  );
}
