import React, { useState, useEffect } from "react";
import { X, Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { resolveBackendBaseUrl } from "@/lib/recorder/backend-url";
import type { BugReportSummary, RecorderSession } from "@/lib/recorder/types";

export interface RecorderEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: RecorderSession;
  summary?: BugReportSummary;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LAST_RECIPIENT_KEY = "cat_vision_last_direct_email_recipient";

export function RecorderEmailModal({
  isOpen,
  onClose,
  session,
  summary,
}: RecorderEmailModalProps): React.JSX.Element | null {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [operatorNotes, setOperatorNotes] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    isSuccess: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedRecipient =
        (typeof window !== "undefined" && localStorage.getItem(LAST_RECIPIENT_KEY)) ||
        "support@catvision.ai";

      setRecipientEmail(savedRecipient);
      setSenderEmail("telemetry@catvision.ai");
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isEmailValid = EMAIL_REGEX.test(recipientEmail.trim());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid) {
      toast.error("Please provide a valid recipient email address.");

      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    const targetRecipient = recipientEmail.trim();

    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_RECIPIENT_KEY, targetRecipient);
    }

    const title = summary?.title || `Recorded Issue: ${session.id}`;
    const messageParts = [
      summary?.description ? `Description:\n${summary.description}` : "",
      `Expected Behavior:\n${summary?.expectedBehavior || "N/A"}`,
      `Actual Behavior:\n${summary?.actualBehavior || "N/A"}`,
      operatorNotes.trim() ? `Operator Notes:\n${operatorNotes.trim()}` : "",
      `Session ID: ${session.id}`,
      `Route: ${session.initialRoute} ➔ ${session.finalRoute || session.initialRoute}`,
      `Captured Events: ${session.events.length}`,
      `Diagnostic Screenshots: ${session.screenshots.length}`,
    ].filter(Boolean);

    const eventCount = session.events.length;
    const screenshotCount = session.screenshots.length;

    let isDelivered = false;
    let detailMessage = "";

    try {
      const baseUrl = resolveBackendBaseUrl();

      if (baseUrl) {
        const res = await fetch(`${baseUrl}/bug-reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary,
            sessionId: session.id,
            route: session.initialRoute,
            eventCount,
            screenshotCount,
          }),
        });

        if (res.ok) {
          isDelivered = true;
          detailMessage = `Bug report successfully dispatched to ${targetRecipient}!`;
        } else {
          detailMessage = `Backend returned HTTP ${res.status}`;
        }
      } else {
        // No backend: open the user's mail client with a pre-filled bug report.
        const bodyText = messageParts.join("\n\n");
        window.location.href =
          "mailto:?subject=" +
          encodeURIComponent(`Bug report: ${title}`) +
          "&body=" +
          encodeURIComponent(bodyText);
        isDelivered = true;
        detailMessage = "Opening your email client to send the bug report.";
      }
    } catch (err) {
      detailMessage = err instanceof Error ? err.message : "Error contacting backend";
    }

    setIsSending(false);

    if (isDelivered) {
      setStatusMessage({ isSuccess: true, text: detailMessage });
      toast.success(detailMessage);
      window.setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      const failureNotice = detailMessage || "Failed to dispatch email. Please check network/backend.";
      setStatusMessage({ isSuccess: false, text: failureNotice });
      toast.error(failureNotice);
    }
  };

  return (
    <div
      data-recorder-modal="true"
      className="fixed inset-0 z-[10070] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-popover p-5 shadow-2xl text-foreground flex flex-col gap-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Direct Email Bug Dispatch</h3>
              <p className="text-[11px] text-muted-foreground">
                Dispatch telemetry and diagnostics directly to engineering
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Recipient Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. support@catvision.ai, developer@company.com"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {!isEmailValid && recipientEmail.length > 0 && (
              <span className="text-[10px] text-destructive mt-0.5 block">
                Please enter a valid email address.
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Sender Email (Optional)
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="telemetry@catvision.ai"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Operator Notes / Context
            </label>
            <textarea
              rows={2}
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="Add extra context or steps to reproduce..."
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-2.5 text-[11px] text-foreground flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Report Title:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px]">
                {summary?.title || "Untitled Issue"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telemetry Payload:</span>
              <span className="font-mono text-primary">
                {session.events.length} evts · {session.screenshots.length} snaps
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session ID:</span>
              <span className="font-mono text-muted-foreground">{session.id}</span>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                statusMessage.isSuccess
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {statusMessage.isSuccess ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSending || !isEmailValid}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{isSending ? "Dispatching..." : "Send Email"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
