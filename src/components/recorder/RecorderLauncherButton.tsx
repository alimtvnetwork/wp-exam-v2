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
    <div className="inline-flex items-center gap-1.5 shrink-0">
      {/* Button 1: Recording Controller */}
      {isRecording ? (
        <div className="inline-flex items-center gap-1 rounded border border-rose-800/60 bg-rose-950/40 p-0.5">
          {/* Status Badge */}
          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider font-mono",
              isPaused
                ? "bg-amber-950/80 text-amber-300 border border-amber-500/80"
                : "bg-rose-950/80 text-rose-300 border border-rose-500/80 animate-pulse",
            )}
          >
            {isPaused ? (
              <Play className="h-3 w-3 fill-amber-400 text-amber-400" />
            ) : (
              <Circle className="h-2.5 w-2.5 fill-rose-500 text-rose-500 animate-ping" />
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
            className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-all border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="hidden sm:inline">Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-amber-300" />
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
            className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-all border border-rose-600/70 bg-rose-900/60 text-rose-200 hover:bg-rose-800 hover:text-white"
          >
            <Square className="h-3 w-3 fill-rose-300 text-rose-300" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => startRecording()}
          title="Record Activity & Bug Report"
          aria-label="Start Bug Recorder"
          className="flex shrink-0 items-center gap-1.5 rounded px-2.5 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60 bg-slate-900/60"
        >
          <Radio className="h-3.5 w-3.5 text-rose-400" />
          <span>Record Bug</span>
        </button>
      )}

      {/* Button 2: Export Suite (Always Visible) */}
      <button
        type="button"
        onClick={openExportModal}
        title="Export Suite (ZIP, Prompts, Telemetry)"
        aria-label="Export Bug Report"
        className="flex shrink-0 items-center gap-1 rounded px-2 sm:px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all border border-cyan-600/70 bg-cyan-950/70 text-cyan-200 hover:bg-cyan-900 hover:text-white"
      >
        <ChevronDown className="h-3 w-3 text-cyan-400" />
        <Download className="h-3 w-3 text-cyan-300" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Button 3: Previous Bugs (Always Visible) */}
      <button
        type="button"
        onClick={openPreviousBugs}
        title="Browse and export historical bug sessions"
        aria-label="Previous Bugs"
        className="flex shrink-0 items-center gap-1 rounded px-2 sm:px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60 bg-slate-900/60"
      >
        <History className="h-3.5 w-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Previous Bugs</span>
      </button>
    </div>
  );
}
