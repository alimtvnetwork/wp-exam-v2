import { describe, it, expect } from 'vitest';
import {
  parseVideoEmbedUrl,
  FormField,
  VideoAnswerSubmission,
  isVideoAnswerSubmission,
  normalizeVideoAnswerMaxSeconds,
  formatVideoAnswerDuration,
  DEFAULT_VIDEO_ANSWER_MAX_SECONDS,
} from '@/lib/types/form';
import { auditFormDesign } from '@/lib/design-validation-engine';

describe('Video Field Engine & URL Parser', () => {
  it('parses standard YouTube watch URLs', () => {
    const parsed = parseVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    expect(parsed).not.toBeNull();
    expect(parsed?.platform).toBe('youtube');
    expect(parsed?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(parsed?.isDirectVideo).toBe(false);
  });

  it('parses YouTube short URLs (youtu.be)', () => {
    const parsed = parseVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ');

    expect(parsed).not.toBeNull();
    expect(parsed?.platform).toBe('youtube');
    expect(parsed?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('parses YouTube Shorts URLs', () => {
    const parsed = parseVideoEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');

    expect(parsed).not.toBeNull();
    expect(parsed?.platform).toBe('youtube');
    expect(parsed?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('parses Vimeo video URLs', () => {
    const parsed = parseVideoEmbedUrl('https://vimeo.com/76979871');

    expect(parsed).not.toBeNull();
    expect(parsed?.platform).toBe('vimeo');
    expect(parsed?.embedUrl).toBe('https://player.vimeo.com/video/76979871');
    expect(parsed?.isDirectVideo).toBe(false);
  });

  it('parses Loom share URLs', () => {
    const parsed = parseVideoEmbedUrl('https://www.loom.com/share/d44f77c24f2b44d38c11aa5a3bf7778b');

    expect(parsed).not.toBeNull();
    expect(parsed?.platform).toBe('loom');
    expect(parsed?.embedUrl).toBe('https://www.loom.com/embed/d44f77c24f2b44d38c11aa5a3bf7778b');
    expect(parsed?.isDirectVideo).toBe(false);
  });

  it('detects direct MP4 and WebM video files', () => {
    const mp4Parsed = parseVideoEmbedUrl('https://storage.googleapis.com/demo/sample.mp4');

    expect(mp4Parsed).not.toBeNull();
    expect(mp4Parsed?.platform).toBe('direct');
    expect(mp4Parsed?.isDirectVideo).toBe(true);

    const webmParsed = parseVideoEmbedUrl('https://media.w3.org/2010/05/sintel/trailer.webm');

    expect(webmParsed).not.toBeNull();
    expect(webmParsed?.platform).toBe('direct');
    expect(webmParsed?.isDirectVideo).toBe(true);
  });

  it('returns null for empty or whitespace strings', () => {
    expect(parseVideoEmbedUrl('')).toBeNull();
    expect(parseVideoEmbedUrl('   ')).toBeNull();
    expect(parseVideoEmbedUrl(undefined)).toBeNull();
  });

  it('preserves videoUrl and videoCaption on FormField', () => {
    const videoField: FormField = {
      id: 'field-video-1',
      type: 'video',
      label: 'Watch the onboarding briefing video',
      isRequired: false,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoCaption: 'Watch the first 3 minutes before taking the test',
    };

    expect(videoField.type).toBe('video');
    expect(videoField.videoUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(videoField.videoCaption).toBe('Watch the first 3 minutes before taking the test');
  });

  it('exempts video fields from quiz points penalty in design-validation-engine', () => {    const fields: FormField[] = [
      {
        id: 'v1',
        type: 'video',
        label: 'Watch instructional briefing',
        isRequired: false,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        points: 0,
      },
      {
        id: 'q1',
        type: 'single_choice',
        label: 'Select primary database',
        isRequired: true,
        options: ['SQLite', 'MongoDB'],
        correctAnswer: 'SQLite',
        points: 10,
      },
    ];

    const report = auditFormDesign(fields, 'quiz');
    const pointsIssue = report.issues.find((i) => i.id === 'issue-points-v1');

    expect(pointsIssue).toBeUndefined();
  });
});

describe('Video Answer Submission Types & Helpers', () => {
  it('exposes a 120s default recording cap', () => {
    expect(DEFAULT_VIDEO_ANSWER_MAX_SECONDS).toBe(120);
  });

  it('normalizes per-question recording caps with a 120s fallback', () => {
    expect(normalizeVideoAnswerMaxSeconds(undefined)).toBe(120);
    expect(normalizeVideoAnswerMaxSeconds(null)).toBe(120);
    expect(normalizeVideoAnswerMaxSeconds(0)).toBe(120);
    expect(normalizeVideoAnswerMaxSeconds(-30)).toBe(120);
    expect(normalizeVideoAnswerMaxSeconds(NaN)).toBe(120);
    expect(normalizeVideoAnswerMaxSeconds(60)).toBe(60);
    expect(normalizeVideoAnswerMaxSeconds(90.7)).toBe(90);
  });

  it('formats recording durations as m:ss', () => {
    expect(formatVideoAnswerDuration(0)).toBe('0:00');
    expect(formatVideoAnswerDuration(5)).toBe('0:05');
    expect(formatVideoAnswerDuration(65)).toBe('1:05');
    expect(formatVideoAnswerDuration(120)).toBe('2:00');
  });

  it('recognizes valid video-answer submissions and rejects lookalikes', () => {
    const submission: VideoAnswerSubmission = {
      blobRef: 'blob:https://quiz.example/abc123',
      durationSeconds: 42,
      mimeType: 'video/webm',
      recordedAt: new Date().toISOString(),
    };

    expect(isVideoAnswerSubmission(submission)).toBe(true);
    expect(isVideoAnswerSubmission({ blobRef: 'blob:x', durationSeconds: 10 })).toBe(false);
    expect(isVideoAnswerSubmission(null)).toBe(false);
    expect(isVideoAnswerSubmission('blob:x')).toBe(false);
  });

  it('supports skipped video answers via skippedWithNote', () => {
    const skipped: VideoAnswerSubmission = {
      blobRef: '',
      durationSeconds: 0,
      mimeType: '',
      recordedAt: new Date().toISOString(),
      skippedWithNote: 'No camera on this device',
    };

    expect(isVideoAnswerSubmission(skipped)).toBe(true);
    expect(skipped.skippedWithNote).toBe('No camera on this device');
  });

  it('supports video_answer fields with additive per-question config', () => {
    const field: FormField = {
      id: 'field-video-answer-1',
      type: 'video_answer',
      label: 'Introduce yourself in a short video',
      isRequired: true,
      videoAnswerMaxSeconds: 90,
      videoAnswerPrompt: 'Keep it under 90 seconds.',
    };

    expect(field.type).toBe('video_answer');
    expect(field.videoAnswerMaxSeconds).toBe(90);
    expect(field.videoAnswerPrompt).toBe('Keep it under 90 seconds.');
  });
});
