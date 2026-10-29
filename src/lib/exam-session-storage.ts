/**
 * Active Exam Session Storage & Anti-Cheat Refresh Resilience.
 * Ensures timer countdown, proctoring strikes, and candidate answers
 * persist across accidental page refreshes or network drops.
 */

export interface ActiveExamSession {
  token: string;
  isStarted: boolean;
  startedAt: number;
  durationSeconds: number;
  tabSwitchCount: number;
  integrityStatus: 'clean' | 'flagged';
  answers: Record<string, string>;
  activeQuestionIndex?: number;
  playedMediaIds?: Record<string, boolean>;
  startedMediaIds?: Record<string, boolean>;
}

export interface SessionLoadResult {
  hasActiveSession: boolean;
  session: ActiveExamSession | null;
  remainingSeconds: number;
  isExpired: boolean;
}

export function getExamStorageKey(token: string): string {
  const cleanToken = token.trim();

  return `wp_exam_active_session_${cleanToken}`;
}

export function loadActiveExamSession(token: string, totalDurationSeconds: number): SessionLoadResult {
  const isWindowDefined = (typeof window !== 'undefined');

  if (!isWindowDefined) {
    return {
      hasActiveSession: false,
      session: null,
      remainingSeconds: totalDurationSeconds,
      isExpired: false,
    };
  }

  try {
    const raw = localStorage.getItem(getExamStorageKey(token));
    const hasRaw = Boolean(raw);

    if (!hasRaw) {
      return {
        hasActiveSession: false,
        session: null,
        remainingSeconds: totalDurationSeconds,
        isExpired: false,
      };
    }

    const data: ActiveExamSession = JSON.parse(raw as string);
    const hasData = Boolean(data);

    if (!hasData) {
      return {
        hasActiveSession: false,
        session: null,
        remainingSeconds: totalDurationSeconds,
        isExpired: false,
      };
    }

    const isStarted = Boolean(data.isStarted);

    if (!isStarted) {
      return {
        hasActiveSession: false,
        session: null,
        remainingSeconds: totalDurationSeconds,
        isExpired: false,
      };
    }

    const hasStartedAt = (typeof data.startedAt === 'number');

    if (!hasStartedAt) {
      return {
        hasActiveSession: false,
        session: null,
        remainingSeconds: totalDurationSeconds,
        isExpired: false,
      };
    }

    // Guard against future-dated timestamps
    const now = Date.now();
    const isFutureDated = (data.startedAt > now);
    const safeStartedAt = isFutureDated ? now : data.startedAt;
    const duration = data.durationSeconds || totalDurationSeconds;
    const elapsedSeconds = Math.max(0, Math.floor((now - safeStartedAt) / 1000));
    const remainingSeconds = Math.max(0, duration - elapsedSeconds);
    const isExpired = (remainingSeconds <= 0);

    return {
      hasActiveSession: true,
      session: {
        token: data.token || token,
        isStarted: true,
        startedAt: safeStartedAt,
        durationSeconds: duration,
        tabSwitchCount: Number(data.tabSwitchCount) || 0,
        integrityStatus: (data.integrityStatus === 'flagged') ? 'flagged' : 'clean',
        answers: data.answers || {},
        activeQuestionIndex: typeof data.activeQuestionIndex === 'number' ? data.activeQuestionIndex : 0,
        playedMediaIds: (data.playedMediaIds && typeof data.playedMediaIds === 'object') ? data.playedMediaIds : {},
        startedMediaIds: (data.startedMediaIds && typeof data.startedMediaIds === 'object') ? data.startedMediaIds : {},
      },
      remainingSeconds,
      isExpired,
    };
  } catch {
    return {
      hasActiveSession: false,
      session: null,
      remainingSeconds: totalDurationSeconds,
      isExpired: false,
    };
  }
}

export function saveActiveExamSession(session: ActiveExamSession): void {
  const isWindowDefined = (typeof window !== 'undefined');

  if (!isWindowDefined) {
    return;
  }

  try {
    const key = getExamStorageKey(session.token);
    const serialized = JSON.stringify(session);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.error('Failed to save exam session:', err);
  }
}

export function clearActiveExamSession(token: string): void {
  const isWindowDefined = (typeof window !== 'undefined');

  if (!isWindowDefined) {
    return;
  }

  try {
    const key = getExamStorageKey(token);
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear exam session:', err);
  }
}
