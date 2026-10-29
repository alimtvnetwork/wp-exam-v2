import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

const MIST = '#e6edf2';
const INK = '#14202b';
const TEAL = '#1f6f8b';

const LIMITS = [15, 20, 30, 45];

const NOTES = [
  { title: 'Shown first', text: 'The limit is on the screen before the first question.' },
  { title: 'The same for everyone', text: 'Two people on the same paper get the same number of minutes.' },
  { title: 'Progress', text: 'Work saves if someone steps away before the time ends.' },
];

const getIsReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const padTime = (value: number) => String(value).padStart(2, '0');

const ClockDial: React.FC<{ minuteAngle: number; secondAngle: number }> = ({ minuteAngle, secondAngle }) => (
  <svg viewBox="0 0 400 400" className="w-full max-w-[460px]" aria-hidden="true">
    <circle cx="200" cy="200" r="188" fill="#f7fafc" stroke={INK} strokeWidth="2" />
    <circle cx="200" cy="200" r="176" fill="none" stroke={INK} strokeWidth="1" opacity="0.2" />
    {Array.from({ length: 60 }, (_, index) => {
      const isHour = index % 5 === 0;
      const angle = (index / 60) * Math.PI * 2;

      return (
        <line
          key={index}
          x1={200 + Math.sin(angle) * (isHour ? 150 : 160)}
          y1={200 - Math.cos(angle) * (isHour ? 150 : 160)}
          x2={200 + Math.sin(angle) * 170}
          y2={200 - Math.cos(angle) * 170}
          stroke={INK}
          strokeWidth={isHour ? 2.5 : 1}
          opacity={isHour ? 1 : 0.35}
        />
      );
    })}
    <line
      x1="200"
      y1="214"
      x2="200"
      y2="78"
      stroke={INK}
      strokeWidth="5"
      strokeLinecap="round"
      transform={`rotate(${minuteAngle} 200 200)`}
    />
    <line
      x1="200"
      y1="220"
      x2="200"
      y2="52"
      stroke={TEAL}
      strokeWidth="2"
      strokeLinecap="round"
      transform={`rotate(${secondAngle} 200 200)`}
    />
    <circle cx="200" cy="200" r="7" fill={TEAL} />
  </svg>
);

export const Version6TelemetryHub: React.FC<LayoutProps> = ({ onAdminClick, onCandidateClick }) => {
  const [minutes, setMinutes] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);

  const chooseMinutes = (value: number) => {
    setMinutes(value);
    setSecondsLeft(value * 60);
  };

  useEffect(() => {
    if (getIsReducedMotion()) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 0) {
          return minutes * 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [minutes]);

  const minuteValue = Math.floor(secondsLeft / 60);
  const secondValue = secondsLeft % 60;
  const minuteLabel = padTime(minuteValue);
  const secondLabel = padTime(secondValue);
  const minuteAngle = (minuteValue % 60) * 6 + secondValue * 0.1;
  const secondAngle = secondValue * 6;

  return (
    <div className="font-v6 w-full" style={{ backgroundColor: MIST, color: INK }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16">
        <div className="mx-auto w-full max-w-[460px]">
          <ClockDial minuteAngle={minuteAngle} secondAngle={secondAngle} />
          <p
            className="mt-5 text-center text-4xl font-semibold tabular-nums tracking-tight"
            aria-live="polite"
            aria-label={`${minuteLabel}:${secondLabel}`}
          >
            {minuteLabel}
            <span className="v6-blink" style={{ color: TEAL }}>
              :
            </span>
            {secondLabel}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-50">Onboarding Quiz · One clock</p>
          <h1 className="mt-4 max-w-md text-[clamp(2.2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.03em]">
            The same hour, for every candidate.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-8 opacity-75">
            You choose the limit once. It does not change from one person to the next.
          </p>

          <div className="mt-8 flex flex-col gap-2" role="group" aria-label="Choose a time limit">
            {LIMITS.map((limit) => {
              const isActive = limit === minutes;

              return (
                <button
                  key={limit}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => chooseMinutes(limit)}
                  className="flex h-12 w-full max-w-xs items-center justify-between border px-4 text-left text-sm font-semibold tabular-nums"
                  style={{
                    borderColor: isActive ? TEAL : 'rgba(20,32,43,0.18)',
                    backgroundColor: isActive ? '#f7fafc' : 'transparent',
                  }}
                >
                  <span>{limit} min</span>
                  <span aria-hidden="true" className="h-2 w-2" style={{ backgroundColor: isActive ? TEAL : 'transparent' }} />
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCandidateClick}
              className="group inline-flex h-11 items-center justify-center gap-2 px-5 text-[13px] font-semibold text-[#e6edf2]"
              style={{ backgroundColor: INK }}
            >
              Try a timed paper
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex h-11 items-center justify-center border border-[#14202b]/30 px-5 text-[13px] font-semibold hover:border-[#14202b]"
            >
              Open the builder
            </button>
          </div>

          <div id="features" className="mt-8 max-w-sm border-t border-[#14202b]/15 pt-5">
            {NOTES.map((note) => (
              <p key={note.title} className="border-b border-[#14202b]/10 py-3 text-sm leading-6 last:border-b-0">
                <span className="font-semibold">{note.title}. </span>
                <span className="opacity-70">{note.text}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
