import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Circle,
  RotateCcw,
  Square,
  Video,
  VideoOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  VideoAnswerSubmission,
  formatVideoAnswerDuration,
  isVideoAnswerSubmission,
  normalizeVideoAnswerMaxSeconds,
  VIDEO_RECORDER_MIME_TYPE_CANDIDATES,
} from '@/lib/types/form';

export type VideoRecorderStatus =
  | 'idle'
  | 'requesting'
  | 'previewing'
  | 'recording'
  | 'recorded'
  | 'denied'
  | 'unavailable'
  | 'skipped';

export interface VideoAnswerRecorderProps {
  fieldId: string;
  label: string;
  value: unknown;
  onChange: (val: unknown) => void;
  maxSeconds?: number;
  prompt?: string;
}

/** Picks the most capable MediaRecorder MIME type the browser supports. */
function pickSupportedMimeType(): string {
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

  if (hasMediaRecorder) {
    const supported = VIDEO_RECORDER_MIME_TYPE_CANDIDATES.find((mime) =>
      MediaRecorder.isTypeSupported(mime)
    );

    if (supported) {
      return supported;
    }
  }

  return '';
}

/** Maps a getUserMedia failure to a recorder status + human-readable message. */
function describeCameraError(err: unknown): { status: 'denied' | 'unavailable'; message: string } {
  const name = err instanceof DOMException ? err.name : '';
  const isDenied = name === 'NotAllowedError' || name === 'SecurityError';

  if (isDenied) {
    return {
      status: 'denied',
      message:
        'Camera access was blocked. Allow camera and microphone access in your browser, then try again.',
    };
  }

  return {
    status: 'unavailable',
    message: 'No camera was found on this device, or the browser could not start it.',
  };
}

export const VideoAnswerRecorder: React.FC<VideoAnswerRecorderProps> = ({
  fieldId,
  label,
  value,
  onChange,
  maxSeconds,
  prompt,
}) => {
  const capSeconds = normalizeVideoAnswerMaxSeconds(maxSeconds);
  const storedAnswer = isVideoAnswerSubmission(value) ? value : null;
  const storedIsSkipped = storedAnswer === null
    ? false
    : storedAnswer.durationSeconds === 0 || Boolean(storedAnswer.skippedWithNote);

  const initialStatus: VideoRecorderStatus = storedAnswer === null
    ? 'idle'
    : storedIsSkipped
      ? 'skipped'
      : 'recorded';

  const [status, setStatus] = useState<VideoRecorderStatus>(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(
    storedAnswer && storedAnswer.blobRef.startsWith('blob:') ? storedAnswer.blobRef : null
  );
  const [clipDuration, setClipDuration] = useState(storedAnswer?.durationSeconds ?? 0);
  const [skipNote, setSkipNote] = useState(storedAnswer?.skippedWithNote ?? '');
  const [isNotingSkip, setIsNotingSkip] = useState(false);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef(0);
  const elapsedRef = useRef(0);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopCameraStream = () => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;

    if (recorder === null) {
      return;
    }

    const isInactive = recorder.state === 'inactive';

    if (isInactive) {
      return;
    }

    recorder.stop();
  };

  const startCamera = async () => {
    setErrorMessage(null);
    setStatus('requesting');

    const isServerSide = typeof navigator === 'undefined';

    if (isServerSide) {
      setErrorMessage('This browser does not support camera capture.');
      setStatus('unavailable');

      return;
    }

    const hasCapture = typeof navigator.mediaDevices?.getUserMedia === 'function';

    if (hasCapture) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;

        const liveVideo = liveVideoRef.current;

        if (liveVideo) {
          liveVideo.srcObject = stream;
          liveVideo.play().catch(() => undefined);
        }

        setStatus('previewing');

        return;
      } catch (err) {
        const mapped = describeCameraError(err);
        setErrorMessage(mapped.message);
        setStatus(mapped.status);
        toast.error(mapped.message);

        return;
      }
    }

    setErrorMessage('This browser does not support camera capture.');
    setStatus('unavailable');
  };

  const startRecording = () => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    const mimeType = pickSupportedMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    chunksRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event: BlobEvent) => {
      const hasData = Boolean(event.data) && event.data.size > 0;

      if (hasData) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      stopTimer();

      const actualSeconds = Math.min(elapsedRef.current, capSeconds);
      const finalMime = recorder.mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type: finalMime });
      const url = URL.createObjectURL(blob);
      const recordedAt = new Date().toISOString();

      setClipUrl(url);
      setClipDuration(actualSeconds);
      setElapsedSeconds(actualSeconds);
      setStatus('recorded');

      const submission: VideoAnswerSubmission = {
        blobRef: url,
        durationSeconds: actualSeconds,
        mimeType: finalMime,
        recordedAt,
      };
      onChange(submission);
      toast.success('Video answer recorded. Review it below.');
    };

    recordingStartedAtRef.current = Date.now();
    elapsedRef.current = 0;
    setElapsedSeconds(0);

    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordingStartedAtRef.current) / 1000);
      elapsedRef.current = elapsed;
      setElapsedSeconds(elapsed);

      const hasReachedCap = elapsed >= capSeconds;

      if (hasReachedCap) {
        stopRecording();
        toast.info(`Recording stopped automatically at the ${formatVideoAnswerDuration(capSeconds)} limit.`);
      }
    }, 500);

    recorder.start(250);
    setStatus('recording');
  };

  const handleRerecord = () => {
    stopTimer();
    stopRecording();

    const previousUrl = clipUrl;

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    setClipUrl(null);
    setClipDuration(0);
    setElapsedSeconds(0);
    elapsedRef.current = 0;
    onChange(null);
    setStatus('previewing');
  };

  const handleSkipConfirm = () => {
    stopTimer();
    stopRecording();
    stopCameraStream();

    const trimmedNote = skipNote.trim();
    const submission: VideoAnswerSubmission = {
      blobRef: '',
      durationSeconds: 0,
      mimeType: '',
      recordedAt: new Date().toISOString(),
      skippedWithNote: trimmedNote || 'Skipped: could not record a video answer.',
    };

    onChange(submission);
    setIsNotingSkip(false);
    setStatus('skipped');
  };

  const handleRetryCamera = () => {
    setIsNotingSkip(false);
    setErrorMessage(null);
    void startCamera();
  };

  useEffect(() => {
    return () => {
      stopTimer();

      const recorder = recorderRef.current;
      const isRecording = recorder?.state === 'recording';
      const isPaused = recorder?.state === 'paused';
      const canStop = isRecording || isPaused;

      if (canStop) {
        try {
          recorder?.stop();
        } catch {
          // Recorder already torn down; nothing to finalize.
        }
      }

      const stream = streamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const isLive = status === 'previewing' || status === 'recording';
  const isBlocked = status === 'denied' || status === 'unavailable';

  return (
    <div className="space-y-3" data-testid={`video-answer-recorder-${fieldId}`}>
      {prompt && (
        <p className="text-sm text-muted-foreground leading-relaxed">{prompt}</p>
      )}

      {status === 'idle' && (
        <button
          type="button"
          onClick={() => void startCamera()}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/30 bg-background/50 p-8 transition-all cursor-pointer"
        >
          <span className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <Video className="w-6 h-6" />
          </span>
          <span className="text-sm font-bold text-foreground">Enable camera to record</span>
          <span className="text-xs text-muted-foreground">
            Record a short video answer (up to {formatVideoAnswerDuration(capSeconds)}) for: {label}
          </span>
        </button>
      )}

      {status === 'requesting' && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          <Camera className="w-5 h-5 animate-pulse text-primary" />
          <span>Requesting camera access…</span>
        </div>
      )}

      {isLive && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-border bg-black">
            <video
              ref={liveVideoRef}
              muted
              playsInline
              autoPlay
              className="w-full aspect-video object-cover"
              aria-label={`Live camera preview for ${label}`}
            />

            {status === 'recording' && (
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">REC</span>
                <span className="text-xs font-mono text-white">
                  {formatVideoAnswerDuration(elapsedSeconds)} / {formatVideoAnswerDuration(capSeconds)}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status === 'previewing' && (
              <Button type="button" onClick={startRecording} className="gap-1.5">
                <Circle className="w-4 h-4 fill-current" />
                Start recording
              </Button>
            )}

            {status === 'recording' && (
              <Button type="button" variant="destructive" onClick={stopRecording} className="gap-1.5">
                <Square className="w-4 h-4 fill-current" />
                Stop
              </Button>
            )}

            <span className="text-xs text-muted-foreground font-mono">
              Max length: {formatVideoAnswerDuration(capSeconds)}
            </span>
          </div>
        </div>
      )}

      {status === 'recorded' && clipUrl && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-emerald-500/30 bg-black">
            <video
              src={clipUrl}
              controls
              playsInline
              className="w-full aspect-video object-cover"
              aria-label={`Recorded video answer for ${label}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Recording ready · {formatVideoAnswerDuration(clipDuration)}
            </span>

            <Button type="button" variant="outline" size="sm" onClick={handleRerecord} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Re-record
            </Button>
          </div>
        </div>
      )}

      {isBlocked && (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4"
        >
          <div className="flex items-start gap-2.5">
            <VideoOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                {status === 'denied' ? 'Camera permission denied' : 'No camera available'}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{errorMessage}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={handleRetryCamera}>
              Try camera again
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsNotingSkip(true)}
            >
              Skip with a note
            </Button>
          </div>

          {isNotingSkip && (
            <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
              <Textarea
                value={skipNote}
                onChange={(e) => setSkipNote(e.target.value)}
                placeholder="Explain briefly why you could not record (optional)"
                rows={2}
                className="text-sm"
              />

              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={handleSkipConfirm}>
                  Skip this question
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsNotingSkip(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'skipped' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Skipped — {skipNote.trim() ? skipNote.trim() : 'no note provided'}
            </span>
          </span>

          <Button type="button" size="sm" variant="ghost" onClick={handleRetryCamera}>
            Try camera again
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoAnswerRecorder;
