import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

interface SampleCandidate {
  name: string;
  role: string;
  score: number;
}

const STONE = '#e7e3d8';
const INK = '#1a1a18';
const MARK = '#243fdb';

const PASS_MARK_MIN = 50;
const PASS_MARK_MAX = 95;

const CANDIDATES: SampleCandidate[] = [
  { name: 'Maya Rossi', role: 'Frontend', score: 91 },
  { name: 'Priya Nair', role: 'Frontend', score: 88 },
  { name: 'Daniel Kim', role: 'Backend', score: 84 },
  { name: 'Sofia Lopez', role: 'Design', score: 77 },
  { name: 'Tom Ward', role: 'Support', score: 58 },
];

const FACTS = [
  { label: 'Questions', text: 'Multiple choice, open answers, and image, audio or video prompts.' },
  { label: 'Branching', text: 'Strong answers can be sent to a harder section.' },
  { label: 'Time', text: 'A time limit is shown before the first question. Progress saves if someone steps away.' },
  { label: 'The list', text: 'Every paper is marked the same way, then placed on one list.' },
];

const clampPassMark = (value: number) => Math.min(PASS_MARK_MAX, Math.max(PASS_MARK_MIN, value));

export const Version2ModernSaas: React.FC<LayoutProps> = ({ onAdminClick, onCandidateClick }) => {
  const [passMark, setPassMark] = useState(70);
  const throughCount = CANDIDATES.filter((candidate) => candidate.score >= passMark).length;

  return (
    <div className="font-v2 w-full" style={{ backgroundColor: STONE, color: INK }}>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-4 border-b border-[#1a1a18]/20 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-60">
            Onboarding Quiz · One pass mark
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onCandidateClick}
              className="group inline-flex h-11 items-center justify-center gap-2 px-5 text-[13px] font-semibold text-[#e7e3d8] transition-colors hover:bg-[#243fdb]"
              style={{ backgroundColor: INK }}
            >
              Try a paper
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex h-11 items-center justify-center border border-[#1a1a18]/40 px-5 text-[13px] font-semibold transition-colors hover:border-[#1a1a18]"
            >
              Open the builder
            </button>
          </div>
        </div>

        <div className="mt-14 grid items-start gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="text-[clamp(2.6rem,5vw,4.4rem)] font-medium leading-[0.96] tracking-[-0.03em]">
              Everyone meets the same bar.
            </h1>
            <p className="mt-6 max-w-sm text-lg leading-8 opacity-75">
              You set the pass mark once. Every candidate in the round is marked against it, and the list splits on that line.
            </p>

            <p className="mt-12 text-[11px] font-medium uppercase tracking-[0.22em] opacity-50">Pass mark</p>
            <p className="mt-2 text-[5.25rem] font-medium leading-none tracking-[-0.04em] tabular-nums">{passMark}</p>
            <label className="mt-6 block">
              <span className="sr-only">Pass mark</span>
              <input
                type="range"
                className="v2-range"
                min={PASS_MARK_MIN}
                max={PASS_MARK_MAX}
                value={passMark}
                onChange={(event) => setPassMark(clampPassMark(Number(event.target.value)))}
              />
            </label>
            <div className="mt-2 flex justify-between text-[11px] font-medium uppercase tracking-[0.16em] opacity-45">
              <span>{PASS_MARK_MIN}</span>
              <span>Drag</span>
              <span>{PASS_MARK_MAX}</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between gap-4 text-[11px] font-medium uppercase tracking-[0.18em] opacity-50">
              <span>Sample round</span>
              <span>
                {throughCount} through
              </span>
            </div>
            <div className="relative mt-4">
              <ul aria-label="Candidates against the pass mark">
                {CANDIDATES.map((candidate) => {
                  const isThrough = candidate.score >= passMark;

                  return (
                    <li
                      key={candidate.name}
                      className={`grid h-16 grid-cols-[3.5rem_1fr_auto] items-center gap-4 border-b border-[#1a1a18]/15 transition-opacity duration-300 motion-reduce:transition-none ${
                        isThrough ? 'opacity-100' : 'opacity-35'
                      }`}
                    >
                      <span className="text-lg tabular-nums">{candidate.score}</span>
                      <span>
                        <span className="block text-lg font-medium leading-tight">{candidate.name}</span>
                        <span className="text-[11px] uppercase tracking-[0.16em] opacity-60">{candidate.role}</span>
                      </span>
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: isThrough ? MARK : INK }}
                      >
                        {isThrough ? 'Through' : 'Below'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-1 right-0 flex items-center transition-[top] duration-300 ease-out motion-reduce:transition-none"
                style={{ top: `${throughCount * 4}rem` }}
              >
                <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: MARK }} />
                <span className="h-0.5 flex-1" style={{ backgroundColor: MARK }} />
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="mt-24 border-t border-[#1a1a18]/20 pt-10">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] opacity-50">What the paper holds</h2>
          <dl className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm font-semibold">{fact.label}</dt>
                <dd className="mt-2 text-sm leading-6 opacity-70">{fact.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
};
