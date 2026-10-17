import React from 'react';
import { Film } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { VideoAnswerRecorder } from './video-answer-recorder';
import { parseVideoEmbedUrl } from '@/lib/types/form';
import type { FormField } from '@/lib/types/form';

export interface VideoQuestionFieldProps {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
}

/**
 * VideoQuestionField — video as question content (Task-08).
 *
 * The video player is the hero of the question card (one focus at a time);
 * the answer control sits below it. When the author sets answerKind: 'video',
 * the answer chains into the existing VideoAnswerRecorder (watch → record)
 * instead of duplicating camera-capture logic.
 */
export const VideoQuestionField: React.FC<VideoQuestionFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  const embedInfo = parseVideoEmbedUrl(field.videoUrl);
  const hasVideo = Boolean(embedInfo && embedInfo.embedUrl);
  const isDirectVideo = Boolean(embedInfo && embedInfo.isDirectVideo);
  const isVideoAnswer = field.answerKind === 'video';
  const strValue = typeof value === 'string' ? value : '';

  return (
    <div className="space-y-3">
      {hasVideo ? (
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-border shadow-md bg-black/60">
          {isDirectVideo ? (
            <video
              controls
              preload="metadata"
              className="w-full h-full object-contain"
              src={embedInfo ? embedInfo.embedUrl : ''}
              poster={field.posterUrl}
            >
              Your browser does not support HTML5 video playback.
            </video>
          ) : (
            <iframe
              className="w-full h-full border-0"
              src={embedInfo ? embedInfo.embedUrl : ''}
              title={field.label || 'Question video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <div className="w-full aspect-video rounded-xl border-2 border-dashed border-border/80 flex flex-col items-center justify-center p-6 text-center bg-muted/20">
          <Film className="w-9 h-9 text-muted-foreground/50 mb-2" />

          <p className="text-xs font-semibold text-foreground">Video Unavailable</p>

          <p className="text-xs text-muted-foreground mt-1">
            No valid video URL was configured for this question.
          </p>
        </div>
      )}

      {field.videoCaption && (
        <p className="text-xs text-muted-foreground italic px-1">{field.videoCaption}</p>
      )}

      <div>
        {isVideoAnswer ? (
          <VideoAnswerRecorder
            fieldId={field.id}
            label={field.label}
            value={value}
            onChange={onChange}
            maxSeconds={field.videoAnswerMaxSeconds}
            prompt={field.videoAnswerPrompt}
          />
        ) : (
          <Textarea
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'Watch the video, then type your answer...'}
            rows={4}
            className="text-sm sm:text-base leading-relaxed bg-background min-h-[110px] rounded-xl p-3 sm:p-4 border border-border/80 focus-visible:ring-primary"
          />
        )}
      </div>
    </div>
  );
};
