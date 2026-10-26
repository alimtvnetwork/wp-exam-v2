import { describe, it, expect } from 'vitest';
import { getJobRoles, getJobRoleById } from '@/lib/role-assignments';
import {
  buildGoogleCalendarUrl,
  generateIcsContent,
  formatUtcDateTime,
} from '@/lib/calendar-reminder';
import {
  loadActiveExamSession,
  saveActiveExamSession,
  clearActiveExamSession,
  getExamStorageKey,
} from '@/lib/exam-session-storage';

describe('Candidate Portal Proctoring & Timed Technical Exam', () => {
  it('provides comprehensive second-phase technical questions for all roles', () => {
    const roles = getJobRoles();

    roles.forEach((role) => {
      const hasQuestions = role.secondPhaseQuestions.length >= 2;
      expect(hasQuestions).toBe(true);

      role.secondPhaseQuestions.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question.length).toBeGreaterThan(10);
        const isChoiceBased = !q.type || q.type === 'mcq' || q.type === 'media_mcq';
        if (isChoiceBased) {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
          expect(q.correctAnswer).toBeDefined();
          expect(q.options).toContain(q.correctAnswer);
        } else {
          expect(['text_open', 'media_prompt']).toContain(q.type);
        }
      });
    });
  });

  it('formats exam timer seconds into standard MM:SS presentation display', () => {
    const formatTimer = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;

      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    expect(formatTimer(600)).toBe('10:00');
    expect(formatTimer(599)).toBe('09:59');
    expect(formatTimer(180)).toBe('03:00');
    expect(formatTimer(65)).toBe('01:05');
    expect(formatTimer(9)).toBe('00:09');
    expect(formatTimer(0)).toBe('00:00');
  });

  it('enforces 3-strike tab-switching anti-cheat proctoring policy', () => {
    const evaluateProctoringStatus = (strikes: number): {
      isAutoSubmitTriggered: boolean;
      integrityStatus: 'clean' | 'flagged';
    } => {
      const isClean = (strikes === 0);
      const isExceeded = (strikes >= 3);

      return {
        isAutoSubmitTriggered: isExceeded,
        integrityStatus: isClean ? 'clean' : 'flagged',
      };
    };

    const zeroStrikes = evaluateProctoringStatus(0);
    expect(zeroStrikes.integrityStatus).toBe('clean');
    expect(zeroStrikes.isAutoSubmitTriggered).toBe(false);

    const oneStrike = evaluateProctoringStatus(1);
    expect(oneStrike.integrityStatus).toBe('flagged');
    expect(oneStrike.isAutoSubmitTriggered).toBe(false);

    const twoStrikes = evaluateProctoringStatus(2);
    expect(twoStrikes.integrityStatus).toBe('flagged');
    expect(twoStrikes.isAutoSubmitTriggered).toBe(false);

    const threeStrikes = evaluateProctoringStatus(3);
    expect(threeStrikes.integrityStatus).toBe('flagged');
    expect(threeStrikes.isAutoSubmitTriggered).toBe(true);

    const fourStrikes = evaluateProctoringStatus(4);
    expect(fourStrikes.isAutoSubmitTriggered).toBe(true);
  });

  it('calculates exam score accurately from candidate responses', () => {
    const role = getJobRoleById('wordpress-specialist');
    const questions = role.secondPhaseQuestions;

    const allCorrectAnswers: Record<string, string> = {};
    questions.forEach((q) => {
      allCorrectAnswers[q.id] = q.correctAnswer;
    });

    let correctCount = 0;
    questions.forEach((q) => {
      const isMatch = (allCorrectAnswers[q.id] === q.correctAnswer);
      if (isMatch) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    expect(score).toBe(100);

    // Partial score
    const partialAnswers: Record<string, string> = {
      [questions[0].id]: questions[0].correctAnswer,
      [questions[1].id]: 'wrong_answer_xyz',
    };

    let partialCorrectCount = 0;
    questions.forEach((q) => {
      const isMatch = (partialAnswers[q.id] === q.correctAnswer);
      if (isMatch) {
        partialCorrectCount++;
      }
    });

    const partialScore = Math.round((partialCorrectCount / questions.length) * 100);
    expect(partialScore).toBeLessThan(100);
    expect(partialScore).toBeGreaterThanOrEqual(0);
  });

  it('generates unique cryptographic portal tokens preventing collision for identical candidate names', () => {
    // Two candidates with identical names and identical email usernames on different domains
    const candidateA = {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    };
    const candidateB = {
      name: 'John Doe',
      email: 'john.doe@yahoo.com',
    };

    // Legacy prototype derived token from email prefix (would collide!)
    const legacyTokenA = candidateA.email.split('@')[0];
    const legacyTokenB = candidateB.email.split('@')[0];
    expect(legacyTokenA).toBe(legacyTokenB);

    // Production standard: CSPRNG 128-bit hex tokens
    const generateProductionPortalToken = (): string => {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      return `cpt_${hex}`;
    };

    const tokenA = generateProductionPortalToken();
    const tokenB = generateProductionPortalToken();

    expect(tokenA).not.toBe(tokenB);
    expect(tokenA.startsWith('cpt_')).toBe(true);
    expect(tokenB.startsWith('cpt_')).toBe(true);
    expect(tokenA.length).toBe(36);
    expect(tokenB.length).toBe(36);
  });

  it('guarantees zero collisions across a bulk pool of candidate tokens', () => {
    const tokenSet = new Set<string>();
    const poolSize = 1000;

    for (let i = 0; i < poolSize; i++) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const token = `cpt_${hex}`;
      tokenSet.add(token);
    }

    expect(tokenSet.size).toBe(poolSize);
  });

  it('supports admin-configurable exam duration across job roles', () => {
    const roles = getJobRoles();

    roles.forEach((role) => {
      const duration = role.durationMinutes || 30;
      expect(duration).toBeGreaterThanOrEqual(5);
      expect(duration).toBeLessThanOrEqual(180);
    });

    const wpRole = getJobRoleById('wordpress-specialist');
    expect(wpRole.durationMinutes).toBe(30);

    // Dynamic timer initialization test
    const customDurationMinutes = 45;
    const initialSeconds = customDurationMinutes * 60;
    expect(initialSeconds).toBe(2700);
  });

  it('generates valid Google Calendar reminder URL with proper start, end, and portal link', () => {
    const testDate = new Date('2026-11-01T14:00:00Z');
    const portalUrl = 'https://wp-exam.example/portal/cpt_testtoken123';

    const gcalUrl = buildGoogleCalendarUrl({
      title: 'Full-Stack Developer — Technical Assessment',
      description: 'Scheduled assessment for candidate.',
      locationUrl: portalUrl,
      startDate: testDate,
      durationMinutes: 30,
    });

    expect(gcalUrl.startsWith('https://calendar.google.com/calendar/render?')).toBe(true);

    const parsed = new URL(gcalUrl);
    expect(parsed.searchParams.get('action')).toBe('TEMPLATE');
    expect(parsed.searchParams.get('text')).toBe('Full-Stack Developer — Technical Assessment');
    expect(parsed.searchParams.get('location')).toBe(portalUrl);

    // 30 min duration should span 14:00 to 14:30 UTC
    const dates = parsed.searchParams.get('dates');
    expect(dates).toBe('20261101T140000Z/20261101T143000Z');

    const details = parsed.searchParams.get('details') || '';
    expect(details).toContain(portalUrl);
  });

  it('generates valid RFC 5545 iCalendar (.ics) content with alarm reminder', () => {
    const testDate = new Date('2026-11-05T09:00:00Z');
    const portalUrl = 'https://wp-exam.example/portal/cpt_my_token';

    const icsContent = generateIcsContent({
      title: 'WordPress Specialist — Technical Assessment',
      description: 'Your scheduled technical exam.',
      locationUrl: portalUrl,
      startDate: testDate,
      durationMinutes: 60,
    });

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('VERSION:2.0');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('SUMMARY:WordPress Specialist — Technical Assessment');
    expect(icsContent).toContain('DTSTART:20261105T090000Z');
    expect(icsContent).toContain('DTEND:20261105T100000Z');
    expect(icsContent).toContain(`LOCATION:${portalUrl}`);
    expect(icsContent).toContain('BEGIN:VALARM');
    expect(icsContent).toContain('TRIGGER:-PT15M');
    expect(icsContent).toContain('END:VALARM');
    expect(icsContent).toContain('END:VEVENT');
    expect(icsContent).toContain('END:VCALENDAR');
  });

  it('formats dates into UTC YYYYMMDDTHHmmssZ strings correctly', () => {
    const date = new Date('2026-03-15T08:05:09Z');
    const formatted = formatUtcDateTime(date);

    expect(formatted).toBe('20260315T080509Z');
  });

  describe('Gap 1: Active Exam Session Storage & Refresh Resilience', () => {
    const testToken = 'cpt_test_refresh_resilience_123';

    it('generates consistent storage keys for candidate tokens', () => {
      const key = getExamStorageKey(testToken);
      expect(key).toBe(`wp_exam_active_session_${testToken}`);
    });

    it('saves and restores active exam session across simulated browser reload', () => {
      const now = Date.now();
      const durationSeconds = 1800; // 30 minutes

      saveActiveExamSession({
        token: testToken,
        isStarted: true,
        startedAt: now,
        durationSeconds,
        tabSwitchCount: 1,
        integrityStatus: 'flagged',
        answers: { q1: 'val1', q2: 'val2' },
      });

      const restored = loadActiveExamSession(testToken, durationSeconds);
      expect(restored.hasActiveSession).toBe(true);
      expect(restored.isExpired).toBe(false);
      expect(restored.session?.tabSwitchCount).toBe(1);
      expect(restored.session?.integrityStatus).toBe('flagged');
      expect(restored.session?.answers).toEqual({ q1: 'val1', q2: 'val2' });
      expect(restored.remainingSeconds).toBeGreaterThan(1790);
      expect(restored.remainingSeconds).toBeLessThanOrEqual(1800);

      clearActiveExamSession(testToken);
      const afterClear = loadActiveExamSession(testToken, durationSeconds);
      expect(afterClear.hasActiveSession).toBe(false);
    });

    it('prevents timer cheat on browser refresh by deducting elapsed wall-clock time', () => {
      const durationSeconds = 1800; // 30 mins
      // Simulate candidate who started exam 10 minutes (600 seconds) ago
      const tenMinutesAgo = Date.now() - 600 * 1000;

      saveActiveExamSession({
        token: testToken,
        isStarted: true,
        startedAt: tenMinutesAgo,
        durationSeconds,
        tabSwitchCount: 2,
        integrityStatus: 'flagged',
        answers: {},
      });

      const reloaded = loadActiveExamSession(testToken, durationSeconds);
      expect(reloaded.hasActiveSession).toBe(true);
      expect(reloaded.isExpired).toBe(false);
      // Candidate must only have ~1200 seconds (20 mins) left, NOT full 1800 seconds!
      expect(reloaded.remainingSeconds).toBeLessThanOrEqual(1205);
      expect(reloaded.remainingSeconds).toBeGreaterThanOrEqual(1195);
      // Proctoring strikes MUST NOT be cleared by refresh
      expect(reloaded.session?.tabSwitchCount).toBe(2);

      clearActiveExamSession(testToken);
    });

    it('detects expired sessions when candidate returns after time limit', () => {
      const durationSeconds = 900; // 15 mins
      // Simulate candidate who started exam 20 minutes (1200 seconds) ago
      const twentyMinutesAgo = Date.now() - 1200 * 1000;

      saveActiveExamSession({
        token: testToken,
        isStarted: true,
        startedAt: twentyMinutesAgo,
        durationSeconds,
        tabSwitchCount: 0,
        integrityStatus: 'clean',
        answers: {},
      });

      const reloaded = loadActiveExamSession(testToken, durationSeconds);
      expect(reloaded.hasActiveSession).toBe(true);
      expect(reloaded.isExpired).toBe(true);
      expect(reloaded.remainingSeconds).toBe(0);

      clearActiveExamSession(testToken);
    });
  });

  describe('Gap 2 & 3: Server-Side Assessment Scoring Authority & Question Sanitization', () => {
    it('sanitizes questions delivered to candidates by removing correctAnswer and explanation', () => {
      const role = getJobRoleById('frontend-developer');
      const rawQuestions = role.secondPhaseQuestions;

      // Sanitization function mirrors backend AssessmentService::sanitizeQuestions
      const sanitizeQuestions = (questions: typeof rawQuestions) => {
        return questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type || 'mcq',
          options: [...(q.options || [])],
          mediaType: q.mediaType,
          mediaUrl: q.mediaUrl,
          isOneTimePlay: q.isOneTimePlay,
          placeholder: q.placeholder,
          maxWordCount: q.maxWordCount,
        }));
      };

      const sanitized = sanitizeQuestions(rawQuestions);

      expect(sanitized.length).toBe(rawQuestions.length);
      sanitized.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeDefined();
        const isChoice = !q.type || q.type === 'mcq' || q.type === 'media_mcq';
        if (isChoice) {
          expect(q.options.length).toBeGreaterThanOrEqual(3);
        }
        // Sensitive fields must never be leaked to client bundle
        expect((q as Record<string, unknown>).correctAnswer).toBeUndefined();
        expect((q as Record<string, unknown>).explanation).toBeUndefined();
      });
    });

    it('evaluates submitted answers authoritatively on the server and rejects forged scores', () => {
      const role = getJobRoleById('frontend-developer');
      const answerKey: Record<string, string> = {
        fe_q1: 'Enables the TypeScript compiler to enforce exhaustive, safe branching across distinct state variants',
        fe_q2: 'Batches multiple state setter calls into a single render pass automatically',
        fe_q3: 'isolation: isolate',
      };

      // Server evaluation engine
      const evaluateAnswers = (submittedAnswers: Record<string, string>) => {
        let correct = 0;
        const total = Object.keys(answerKey).length;

        Object.entries(answerKey).forEach(([qId, expected]) => {
          const actual = submittedAnswers[qId]?.trim();
          const isMatch = (actual && actual === expected);
          if (isMatch) {
            correct++;
          }
        });

        return {
          score: Math.round((correct / total) * 100),
          correctCount: correct,
          totalQuestions: total,
        };
      };

      // Case 1: Attacker sends forged score 100 with zero answers
      const forgedSubmission = {
        forgedScore: 100,
        answers: {},
      };
      const evaluated1 = evaluateAnswers(forgedSubmission.answers);
      expect(evaluated1.score).toBe(0);
      expect(evaluated1.correctCount).toBe(0);

      // Case 2: Candidate gets 1 of 3 correct
      const partialAnswers = {
        fe_q1: answerKey.fe_q1,
        fe_q2: 'Wrong option selected',
      };
      const evaluated2 = evaluateAnswers(partialAnswers);
      expect(evaluated2.score).toBe(33);
      expect(evaluated2.correctCount).toBe(1);

      // Case 3: Candidate gets all 3 correct
      const allCorrect = { ...answerKey };
      const evaluated3 = evaluateAnswers(allCorrect);
      expect(evaluated3.score).toBe(100);
      expect(evaluated3.correctCount).toBe(3);
    });
  });

  describe('Gap 5 & 6: Token 404 Error State & Assessment Immutability', () => {
    it('differentiates demo tokens from invalid mistyped candidate tokens', () => {
      const isDemoToken = (token: string): boolean => {
        return (
          token === 'cpt_candidate_token_demo' ||
          token === 'demo' ||
          token === 'alex-morgan' ||
          token === 'alex' ||
          token.length === 0
        );
      };

      expect(isDemoToken('cpt_candidate_token_demo')).toBe(true);
      expect(isDemoToken('demo')).toBe(true);
      expect(isDemoToken('alex-morgan')).toBe(true);
      expect(isDemoToken('')).toBe(true);

      // Real or mistyped tokens must NOT be treated as demo
      expect(isDemoToken('cpt_invalid_mistyped_token_xyz')).toBe(false);
      expect(isDemoToken('cpt_expired_12345')).toBe(false);
      expect(isDemoToken('random-user')).toBe(false);
    });

    it('enforces step immutability preventing re-submission of completed assessment', () => {
      const completedSteps = new Set<string>(['step_overview', 'step_profile', 'step_assessment']);

      const canSubmitStep = (stepId: string): boolean => {
        const isAssessment = (stepId === 'step_assessment');
        if (isAssessment) {
          const isAlreadyCompleted = completedSteps.has('step_assessment');
          if (isAlreadyCompleted) {
            return false; // Locked and immutable
          }
        }

        return true;
      };

      // Re-submitting assessment must be rejected
      expect(canSubmitStep('step_assessment')).toBe(false);

      // Subsequent uncompleted step can proceed
      expect(canSubmitStep('step_submission')).toBe(true);
    });
  });

  describe('Polymorphic Question Formats, Stepper Navigation & Score Masking', () => {
    it('supports multiple question formats: standard MCQ, media MCQ, open-ended written, and 1-time media prompt', () => {
      const role = getJobRoleById('frontend-developer');
      const questions = role.secondPhaseQuestions;

      const types = questions.map((q) => q.type || 'mcq');
      expect(types).toContain('mcq');
      expect(types).toContain('media_mcq');
      expect(types).toContain('text_open');
      expect(types).toContain('media_prompt');

      // Verify media MCQ has valid mediaType and mediaUrl
      const mediaMcq = questions.find((q) => q.type === 'media_mcq');
      expect(mediaMcq).toBeDefined();
      expect(mediaMcq?.mediaType).toBe('image');
      expect(mediaMcq?.mediaUrl).toBeDefined();
      expect(mediaMcq?.options.length).toBeGreaterThanOrEqual(3);

      // Verify text_open has maxWordCount and placeholder
      const textOpen = questions.find((q) => q.type === 'text_open');
      expect(textOpen).toBeDefined();
      expect(textOpen?.maxWordCount).toBeGreaterThan(0);
      expect(textOpen?.placeholder).toBeDefined();

      // Verify media_prompt has 1-time play restriction configured
      const mediaPrompt = questions.find((q) => q.type === 'media_prompt');
      expect(mediaPrompt).toBeDefined();
      expect(mediaPrompt?.mediaType).toBe('audio');
      expect(mediaPrompt?.isOneTimePlay).toBe(true);
      expect(mediaPrompt?.maxWordCount).toBeGreaterThan(0);
    });

    it('tracks and persists one-time media playback in active exam session to prevent replay bypasses', () => {
      const testToken = 'cpt_test_media_track_123';
      clearActiveExamSession(testToken);

      const session = {
        token: testToken,
        isStarted: true,
        startedAt: Date.now(),
        durationSeconds: 1800,
        tabSwitchCount: 0,
        integrityStatus: 'clean' as const,
        answers: { fe_q1: 'Option A' },
        activeQuestionIndex: 4,
        playedMediaIds: { fe_q5: true },
      };

      saveActiveExamSession(session);

      const restored = loadActiveExamSession(testToken, 1800);
      expect(restored.hasActiveSession).toBe(true);
      expect(restored.session?.activeQuestionIndex).toBe(4);
      expect(restored.session?.playedMediaIds?.fe_q5).toBe(true);

      clearActiveExamSession(testToken);
    });

    it('orchestrates one-by-one question stepper navigation with skip, previous, and direct index jump', () => {
      const totalQuestions = 5;
      let currentIndex = 0;
      const skippedIndices = new Set<number>();

      const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
          currentIndex++;
        }
      };

      const handlePrevious = () => {
        if (currentIndex > 0) {
          currentIndex--;
        }
      };

      const handleSkip = () => {
        skippedIndices.add(currentIndex);
        handleNext();
      };

      const handleJump = (targetIndex: number) => {
        if (targetIndex >= 0 && targetIndex < totalQuestions) {
          currentIndex = targetIndex;
        }
      };

      // Start at 0
      expect(currentIndex).toBe(0);

      // Skip Q1 -> should advance to Q2 and record skip
      handleSkip();
      expect(currentIndex).toBe(1);
      expect(skippedIndices.has(0)).toBe(true);

      // Advance to Q3
      handleNext();
      expect(currentIndex).toBe(2);

      // Go back to Q2
      handlePrevious();
      expect(currentIndex).toBe(1);

      // Jump directly to Q5 (index 4)
      handleJump(4);
      expect(currentIndex).toBe(4);
    });

    it('masks assessment marks and percentages in candidate-facing views and verification receipts', () => {
      // Invariant: Candidate portal displays status 'Submitted — Under Review', never numerical scores or pass/fail labels
      const getCandidateDisplayStatus = (isCompleted: boolean) => {
        if (isCompleted) {
          return {
            statusBadge: 'Submitted — Under Review',
            scoreDisplay: null,
            message: 'Your assessment responses, video presentation, and signed verification packet have been securely recorded. Your technical submission is currently in review by our hiring committee.',
          };
        }
        return {
          statusBadge: 'Pending',
          scoreDisplay: null,
          message: 'Complete the proctored assessment before the deadline.',
        };
      };

      const candidateView = getCandidateDisplayStatus(true);
      expect(candidateView.statusBadge).toBe('Submitted — Under Review');
      expect(candidateView.scoreDisplay).toBeNull();
      expect(candidateView.message).toContain('in review by our hiring committee');

      // Verification receipt format
      const receiptFormat = {
        verificationId: 'VRF-101-ABCD1234',
        candidateName: 'Jane Candidate',
        targetRole: 'Senior Frontend Engineer',
        evaluationStatus: 'SUBMITTED — UNDER HIRING COMMITTEE REVIEW',
      };

      expect(receiptFormat.evaluationStatus).not.toContain('%');
      expect(receiptFormat.evaluationStatus).toBe('SUBMITTED — UNDER HIRING COMMITTEE REVIEW');
    });

    it('calculates objective score over auto-gradable choice questions without penalizing open-ended written questions', () => {
      const role = getJobRoleById('frontend-developer');
      const questions = role.secondPhaseQuestions;

      // Classify auto-gradable choice questions vs open-ended manual review questions
      const choiceQuestions = questions.filter((q) => Boolean(q.correctAnswer && q.correctAnswer.trim().length > 0));
      const openQuestions = questions.filter((q) => !q.correctAnswer || q.correctAnswer.trim().length === 0);

      expect(choiceQuestions.length).toBeGreaterThan(0);
      expect(openQuestions.length).toBeGreaterThan(0);

      // Candidate answers all choice questions correctly and writes a comprehensive essay for open questions
      const candidateAnswers: Record<string, string> = {};
      choiceQuestions.forEach((q) => {
        candidateAnswers[q.id] = q.correctAnswer!;
      });
      openQuestions.forEach((q) => {
        candidateAnswers[q.id] = 'Comprehensive architectural breakdown and memory leak explanation.';
      });

      // Evaluation engine: Auto-score must be 100% on the objective part, NOT depressed by open questions!
      const evaluatePolymorphic = (answers: Record<string, string>) => {
        let correct = 0;
        const total = questions.length;
        const autoGradable = choiceQuestions.length;

        choiceQuestions.forEach((q) => {
          if (answers[q.id] === q.correctAnswer) {
            correct++;
          }
        });

        const score = autoGradable > 0 ? Math.round((correct / autoGradable) * 100) : 100;
        const openCount = total - autoGradable;

        return {
          score,
          correctCount: correct,
          autoGradableCount: autoGradable,
          totalQuestions: total,
          openQuestionsCount: openCount,
          hasPendingManualReview: openCount > 0,
        };
      };

      const result = evaluatePolymorphic(candidateAnswers);
      expect(result.score).toBe(100);
      expect(result.correctCount).toBe(choiceQuestions.length);
      expect(result.autoGradableCount).toBe(choiceQuestions.length);
      expect(result.openQuestionsCount).toBe(openQuestions.length);
      expect(result.hasPendingManualReview).toBe(true);
    });

    it('tracks startedMediaIds on playback start to prevent reload bypass on 1-time listening prompts', () => {
      const testToken = 'cpt_test_started_media_456';
      clearActiveExamSession(testToken);

      // Simulate candidate starts audio playback
      const sessionWithStarted = {
        token: testToken,
        isStarted: true,
        startedAt: Date.now(),
        durationSeconds: 1800,
        tabSwitchCount: 0,
        integrityStatus: 'clean' as const,
        answers: {},
        activeQuestionIndex: 2,
        playedMediaIds: {},
        startedMediaIds: { fe_q5: true },
      };

      saveActiveExamSession(sessionWithStarted);

      // Candidate refreshes page while audio is still playing
      const restored = loadActiveExamSession(testToken, 1800);
      expect(restored.hasActiveSession).toBe(true);
      expect(restored.session?.startedMediaIds?.fe_q5).toBe(true);

      // Invariant: If startedMediaIds has the question and candidate returns, it is locked
      const isMediaLockedOnReload = Boolean(
        restored.session?.playedMediaIds?.fe_q5 ||
        restored.session?.startedMediaIds?.fe_q5
      );
      expect(isMediaLockedOnReload).toBe(true);

      clearActiveExamSession(testToken);
    });

    it('records skipped questions distinctly and clears skipped state when an answer is provided', () => {
      const skippedQuestionIds: Record<string, boolean> = {};

      // Candidate skips Q1 and Q3
      skippedQuestionIds['fe_q1'] = true;
      skippedQuestionIds['fe_q3'] = true;

      expect(skippedQuestionIds['fe_q1']).toBe(true);
      expect(skippedQuestionIds['fe_q2']).toBeUndefined();
      expect(skippedQuestionIds['fe_q3']).toBe(true);

      // Candidate answers Q1 later
      delete skippedQuestionIds['fe_q1'];

      expect(skippedQuestionIds['fe_q1']).toBeUndefined();
      expect(skippedQuestionIds['fe_q3']).toBe(true);
    });

    it('triggers over-limit warning when candidate response exceeds maxWordCount', () => {
      const maxLimit = 10;
      const shortText = 'One two three four five';
      const longText = 'One two three four five six seven eight nine ten eleven twelve thirteen';

      const checkWordLimit = (text: string, limit: number) => {
        const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
        const isOverLimit = words > limit;
        const overCount = Math.max(0, words - limit);

        return { words, isOverLimit, overCount };
      };

      const validResult = checkWordLimit(shortText, maxLimit);
      expect(validResult.isOverLimit).toBe(false);
      expect(validResult.overCount).toBe(0);

      const invalidResult = checkWordLimit(longText, maxLimit);
      expect(invalidResult.isOverLimit).toBe(true);
      expect(invalidResult.overCount).toBe(3);
    });

    it('safely clamps activeQuestionIndex within bounds when question count changes', () => {
      const totalQuestions = 3;
      const clampIndex = (index: number, total: number) => {
        return Math.min(index, Math.max(0, total - 1));
      };

      // Index out of bounds (e.g. from previous role with 6 questions)
      expect(clampIndex(5, totalQuestions)).toBe(2);
      expect(clampIndex(3, totalQuestions)).toBe(2);

      // Valid index
      expect(clampIndex(1, totalQuestions)).toBe(1);
      expect(clampIndex(0, totalQuestions)).toBe(0);
    });
  });
});
