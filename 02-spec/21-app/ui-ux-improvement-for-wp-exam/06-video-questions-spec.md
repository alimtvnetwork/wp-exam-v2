# Spec 06 — Video as Question Content

Parent program: `ui-ux-improvement-for-wp-exam` (task 69)
Sibling specs: `01-focus-minimalism-spec.md`, `02-animated-theme-controls-spec.md` (Spec Agent 1)

## User Request (Verbatim)

> "There should be a video. They can do answer from the video."

## Current-state summary

- **Video answers exist:** run 68 added `src/components/runner/video-answer-recorder.tsx` (getUserMedia + MediaRecorder — the candidate records a video as their answer).
- **Video questions do not exist:** there is no question field type that presents video content to the candidate. An author cannot attach a video to a question and ask the candidate to respond to it.
- No video storage story exists yet for either direction.

## Change plan

1. New question field type `video_prompt`:
   - Author side (FormBuilder): a "Video" question type that accepts either an upload or a URL. Uploaded blobs go to the **WordPress media library** (`wp.media` / `media_handle_upload` server-side) — this is the logged assumption: the media library is the durable store, not the plugin's own tables, so videos survive plugin updates and benefit from WP's MIME/size handling.
   - The field stores `{ attachmentId, url, posterUrl }` — never a raw blob in form JSON.
2. New renderer `src/components/runner/video-question-field.tsx`:
   - Renders the video player (native `<video controls preload="metadata">`) above the answer input, one focus at a time: the player is the hero of the question card; the answer control appears below it.
   - Pairs naturally with the existing `video-answer-recorder.tsx`: a `video_prompt` question can set `answerKind: 'video'` to chain watch → record. The recorder component is reused, not duplicated.
   - Player chrome follows the theme (border/glow tokens from the design system); no custom control bar in this spec — native controls are the accessible default.
3. Upload constraints enforced server-side: MIME allowlist (`video/mp4`, `video/webm`), size cap (default 128MB, filterable), and `current_user_can('upload_files')` on the upload endpoint. Client-side pre-check mirrors the cap for fast feedback but never replaces the server check.
4. Seeds: extend the demo fixtures with a `video-prompt-demo` item (URL-based, no blob — seeds must stay small and offline-friendly).

## Acceptance criteria

- AC-V1: An author can attach an MP4 to a question in the builder; the candidate sees the video player above the answer input in the runner. Evidence: dev-browser round trip with a small test video.
- AC-V2: Uploading a non-video file (e.g., `.exe` renamed to `.mp4`) is rejected server-side. Evidence: upload attempt returns an error; no attachment created.
- AC-V3: A `video_prompt` question with `answerKind: 'video'` chains into the existing recorder — no duplicate recorder code. Evidence: `gitmap aum search "getUserMedia" src/components/runner` shows hits only in `video-answer-recorder.tsx`.
- AC-V4: Form JSON contains `attachmentId`/`url`, never a base64 blob. Evidence: inspect a saved form containing a video question.

## Non-goals

- No video transcoding (WP handles what it handles; larger pipelines are a future program).
- No custom video player chrome (native controls).
- No video in the simulation demos beyond the seed URL item (demos stay lightweight).
- No changes to the answer recorder's capture logic.

## For future AI

**Why the WordPress media library and not plugin tables:** videos are large, binary, and long-lived. Storing blobs in form JSON would bloat every form load and break the revision/diff story; storing them in a custom table would reimplement what `wp.media` already does (MIME validation, thumbnails/posters, CDN-offload compatibility, deletion UX). The attachment ID is the stable reference — if the media item is deleted, the question degrades to a "video unavailable" state instead of a broken blob.

**Why native `<video controls>`:** custom players are an accessibility and maintenance liability (keyboard traps, screen-reader labels, fullscreen edge cases across browsers). The design-system polish budget is better spent on the question card around the player than on reinventing playback. If a branded player is ever required, it must still delegate to the native element for a11y.

**Why watch→record chaining reuses the recorder:** the recorder already owns the permission flow, the MediaRecorder lifecycle, and the upload path. A second implementation would double the bug surface for device-permission edge cases (denied camera, no microphone, iOS Safari quirks). Composition over duplication.
