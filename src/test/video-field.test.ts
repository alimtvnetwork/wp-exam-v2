import { describe, it, expect } from 'vitest';
import { parseVideoEmbedUrl, FormField } from '@/lib/types/form';
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

  it('exempts video fields from quiz points penalty in design-validation-engine', () => {
    const fields: FormField[] = [
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
