import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react';
import {
  adminTourSteps,
  TOUR_COMPLETED_FLAG,
  REPLAY_TOUR_EVENT,
  type AdminTourStep,
} from './admin-tour-steps';

interface GuidedTourProps {
  steps: AdminTourStep[];
  onDone: () => void;
}

interface TargetGeometry {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Resolves an XPath against the document, returning the first matching
 * element or null. Used for tour targets so a renamed/removed tab degrades
 * to a skipped step instead of a broken spotlight.
 */
function resolveXPath(xpath: string): HTMLElement | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );

    const node = result.singleNodeValue;

    return node instanceof HTMLElement ? node : null;
  } catch {
    return null;
  }
}

function measureElement(element: HTMLElement): TargetGeometry {
  const rect = element.getBoundingClientRect();

  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ steps, onDone }) => {
  const [resolvedIndex, setResolvedIndex] = useState<number>(-1);
  const [geometry, setGeometry] = useState<TargetGeometry | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  const resolveFrom = useCallback(
    (startIndex: number): number => {
      for (let index = startIndex; index < steps.length; index += 1) {
        const element = resolveXPath(steps[index].targetXPath);

        if (element) {
          return index;
        }
      }

      return -1;
    },
    [steps],
  );

  // Resolve the first valid step on mount.
  useEffect(() => {
    const firstValid = resolveFrom(0);

    if (firstValid === -1) {
      onDone();

      return;
    }

    setResolvedIndex(firstValid);
  }, [resolveFrom, onDone]);

  // Measure the target and re-measure on scroll/resize.
  useEffect(() => {
    if (resolvedIndex === -1) {
      return;
    }

    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const remeasure = () => {
      const element = resolveXPath(steps[resolvedIndex].targetXPath);

      if (element) {
        setGeometry(measureElement(element));
      }
    };

    remeasure();

    window.addEventListener('scroll', remeasure, true);
    window.addEventListener('resize', remeasure);

    return () => {
      window.removeEventListener('scroll', remeasure, true);
      window.removeEventListener('resize', remeasure);
    };
  }, [resolvedIndex, steps]);

  // Move focus into the card on every step for screen-reader users.
  useEffect(() => {
    if (resolvedIndex !== -1 && cardRef.current) {
      cardRef.current.focus();
    }
  }, [resolvedIndex]);

  // Escape skips the tour and records completion.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDone]);

  const goToStep = useCallback(
    (nextIndex: number) => {
      const resolved = resolveFrom(nextIndex);

      if (resolved === -1) {
        onDone();

        return;
      }

      setResolvedIndex(resolved);
    },
    [resolveFrom, onDone],
  );

  if (resolvedIndex === -1 || !geometry) {
    return null;
  }

  const step = steps[resolvedIndex];
  const isLastStep = resolveFrom(resolvedIndex + 1) === -1;
  const stepNumber = resolvedIndex + 1;

  // Card placement: prefer the requested position, clamp to the viewport.
  const cardWidth = 320;
  let cardLeft = geometry.left + geometry.width + 16;
  let cardTop = geometry.top + geometry.height / 2 - 110;

  if (step.position === 'below') {
    cardLeft = geometry.left;
    cardTop = geometry.top + geometry.height + 16;
  }

  if (step.position === 'above') {
    cardLeft = geometry.left;
    cardTop = geometry.top - 260;
  }

  if (step.position === 'left') {
    cardLeft = geometry.left - cardWidth - 16;
    cardTop = geometry.top + geometry.height / 2 - 110;
  }

  if (cardLeft + cardWidth > window.innerWidth - 16) {
    cardLeft = Math.max(16, window.innerWidth - cardWidth - 16);
  }

  if (cardLeft < 16) {
    cardLeft = 16;
  }

  cardTop = Math.max(16, Math.min(cardTop, window.innerHeight - 280));

  const motionClass = prefersReducedMotion.current ? '' : 'transition-opacity duration-150';

  return (
    <div className="fixed inset-0 z-[10000]" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      {/* Spotlight cutout: huge box-shadow dims everything except the target. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute rounded-xl ${motionClass}`}
        style={{
          top: geometry.top - 6,
          left: geometry.left - 6,
          width: geometry.width + 12,
          height: geometry.height + 12,
          boxShadow: '0 0 0 9999px rgba(5, 5, 15, 0.62)',
          border: '2px solid hsl(var(--primary))',
        }}
      />

      {/* Instruction card: one idea at a time (single focus). */}
      <div
        ref={cardRef}
        tabIndex={-1}
        className={`absolute w-80 rounded-2xl border border-border bg-card p-5 shadow-2xl outline-none ${
          prefersReducedMotion.current ? '' : 'animate-ppt-slide-forward'
        }`}
        style={{ top: cardTop, left: cardLeft }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Step {stepNumber} of {steps.length}
          </p>

          <button
            type="button"
            onClick={onDone}
            aria-label="Skip tour"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="mt-1 text-sm font-bold text-foreground">{step.title}</h3>

        <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToStep(resolvedIndex - 1)}
            disabled={resolvedIndex === 0}
            className="text-xs gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDone}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Skip tour
            </button>

            <Button size="sm" onClick={() => goToStep(resolvedIndex + 1)} className="text-xs gap-1">
              {isLastStep ? 'Done' : 'Next'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Mounts the tour on first admin visit (600ms settle) and listens for the
 * replay event fired by GuidedTourReplayButton.
 */
export const GuidedTourManager: React.FC = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    let settleTimer: number | undefined;

    try {
      const isCompleted = window.localStorage.getItem(TOUR_COMPLETED_FLAG) === 'true';

      if (!isCompleted) {
        settleTimer = window.setTimeout(() => {
          setIsTourOpen(true);
        }, 600);
      }
    } catch {
      // Storage unavailable — do not auto-start, replay still works.
    }

    const handleReplay = () => {
      setIsTourOpen(true);
    };

    window.addEventListener(REPLAY_TOUR_EVENT, handleReplay);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener(REPLAY_TOUR_EVENT, handleReplay);
    };
  }, []);

  const handleDone = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_COMPLETED_FLAG, 'true');
    } catch {
      // Storage unavailable — the tour simply will not remember completion.
    }

    setIsTourOpen(false);
  }, []);

  if (!isTourOpen) {
    return null;
  }

  return <GuidedTour steps={adminTourSteps} onDone={handleDone} />;
};

export const GuidedTourReplayButton: React.FC = () => {
  const handleReplay = () => {
    try {
      window.localStorage.removeItem(TOUR_COMPLETED_FLAG);
    } catch {
      // Storage unavailable — replay still opens the tour.
    }

    window.dispatchEvent(new Event(REPLAY_TOUR_EVENT));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReplay}
      aria-label="Replay onboarding tour"
      title="Replay onboarding tour"
      className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
    >
      <GraduationCap className="w-4 h-4" />
      <span className="hidden lg:inline">Tour</span>
    </Button>
  );
};
