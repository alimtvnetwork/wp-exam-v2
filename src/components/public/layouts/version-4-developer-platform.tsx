import React, { useEffect, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

type RowTone = 'shortlisted' | 'passed' | 'pending' | 'below';

interface BoardRow {
  name: string;
  role: string;
  score: string;
  status: string;
  tone: RowTone;
}

const FLAP_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.%';
const FLAP_TICK_MS = 28;
const FRAME_MS = 3600;

const COLUMN_WIDTHS = { name: 12, role: 9, score: 3, status: 11 };

const getColumnWidth = (cells: number) => `calc(${cells} * 1.05em + ${cells - 1} * 3px)`;

const BOARD_GRID_STYLE: React.CSSProperties = {
  gridTemplateColumns: `${getColumnWidth(COLUMN_WIDTHS.name)} ${getColumnWidth(COLUMN_WIDTHS.role)} ${getColumnWidth(COLUMN_WIDTHS.score)} 1fr`,
};

const BOARD_FRAMES: BoardRow[][] = [
  [
    { name: 'Maya Rossi', role: 'Frontend', score: '91', status: 'Shortlisted', tone: 'shortlisted' },
    { name: 'Daniel Kim', role: 'Backend', score: '84', status: 'Passed', tone: 'passed' },
    { name: 'Sofia Lopez', role: 'Design', score: '--', status: 'In progress', tone: 'pending' },
    { name: 'Tom Ward', role: 'Support', score: '58', status: 'Below bar', tone: 'below' },
    { name: 'Priya Nair', role: 'Frontend', score: '--', status: 'Invited', tone: 'pending' },
  ],
  [
    { name: 'Maya Rossi', role: 'Frontend', score: '91', status: 'Shortlisted', tone: 'shortlisted' },
    { name: 'Daniel Kim', role: 'Backend', score: '84', status: 'Passed', tone: 'passed' },
    { name: 'Sofia Lopez', role: 'Design', score: '77', status: 'Passed', tone: 'passed' },
    { name: 'Tom Ward', role: 'Support', score: '58', status: 'Below bar', tone: 'below' },
    { name: 'Priya Nair', role: 'Frontend', score: '--', status: 'In progress', tone: 'pending' },
  ],
  [
    { name: 'Maya Rossi', role: 'Frontend', score: '91', status: 'Shortlisted', tone: 'shortlisted' },
    { name: 'Daniel Kim', role: 'Backend', score: '84', status: 'Passed', tone: 'passed' },
    { name: 'Sofia Lopez', role: 'Design', score: '77', status: 'Passed', tone: 'passed' },
    { name: 'Tom Ward', role: 'Support', score: '58', status: 'Below bar', tone: 'below' },
    { name: 'Priya Nair', role: 'Frontend', score: '88', status: 'Shortlisted', tone: 'shortlisted' },
  ],
];

const TONE_CLASS: Record<RowTone, string> = {
  shortlisted: 'text-[#ff5a1f]',
  passed: 'text-[#ece8df]',
  pending: 'text-[#8f8b83]',
  below: 'text-[#5f5c56]',
};

const STEPS = [
  {
    number: '01',
    title: 'Write the test once',
    description: 'Pick a role template or start blank. Multiple choice, open answers, and image, audio or video prompts.',
  },
  {
    number: '02',
    title: 'Send one link',
    description: 'Candidates open it and start. No account, a clear time limit, and progress that saves as they go.',
  },
  {
    number: '03',
    title: 'Read the board',
    description: 'Every result is scored the same way and lands in one place. The shortlist is the top of the list.',
  },
];

const INDEX_ROWS = [
  { label: 'Formats', description: 'Multiple choice, true or false, open answers, media prompts.' },
  { label: 'Paths', description: 'Strong answers unlock harder questions. Others go back to basics.' },
  { label: 'Timing', description: 'Time limits per assessment. Tab switches are logged for review.' },
  { label: 'Output', description: 'Scores, a pipeline board, and certificates for people who pass.' },
  { label: 'Look', description: 'Nine built-in themes so the test feels like your company.' },
];

const toFlapString = (value: string, length: number) => {
  const upper = value.toUpperCase().padEnd(length).slice(0, length);

  return upper
    .split('')
    .map((char) => (FLAP_CHARS.includes(char) ? char : ' '))
    .join('');
};

const getIsReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FlapText: React.FC<{ value: string; length: number; tone: RowTone }> = ({ value, length, tone }) => {
  const target = toFlapString(value, length);
  const [display, setDisplay] = useState(() => (getIsReducedMotion() ? target : ' '.repeat(length)));

  useEffect(() => {
    if (getIsReducedMotion()) {
      setDisplay(target);

      return;
    }

    const timer = window.setInterval(() => {
      setDisplay((current) => {
        if (current === target) {
          window.clearInterval(timer);

          return current;
        }

        return current
          .split('')
          .map((char, index) => {
            const goal = target[index];

            if (char === goal) {
              return char;
            }

            const nextIndex = (FLAP_CHARS.indexOf(char) + 1) % FLAP_CHARS.length;

            return FLAP_CHARS[nextIndex];
          })
          .join('');
      });
    }, FLAP_TICK_MS);

    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <span className={`flex gap-[3px] ${TONE_CLASS[tone]}`}>
      <span className="sr-only">{value}</span>
      {display.split('').map((char, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="relative flex h-[1.6em] w-[1.05em] items-center justify-center overflow-hidden rounded-[2px] bg-[#1a1a19]"
        >
          <span key={char} className="v4-flap">
            {char === ' ' ? '\u00A0' : char}
          </span>
          <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
        </span>
      ))}
    </span>
  );
};

const useBoardFrames = () => {
  const [frameIndex, setFrameIndex] = useState(0);
  const lastFrame = BOARD_FRAMES.length - 1;
  const isFinished = frameIndex >= lastFrame;

  useEffect(() => {
    if (isFinished) {
      return;
    }

    const timer = window.setTimeout(() => setFrameIndex((current) => current + 1), FRAME_MS);

    return () => window.clearTimeout(timer);
  }, [frameIndex, isFinished]);

  return {
    rows: BOARD_FRAMES[frameIndex],
    isFinished,
    replay: () => setFrameIndex(0),
  };
};

export const Version4DeveloperPlatform: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
}) => {
  const board = useBoardFrames();

  return (
    <div className="w-full overflow-hidden bg-[#0d0d0c] text-[#ece8df] selection:bg-[#ff5a1f] selection:text-black">
      {/* Meta row */}
      <div className="border-b border-[#ece8df]/15">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-3 font-v4-mono text-[11px] uppercase tracking-wider text-[#ece8df]/55 sm:px-6 md:grid-cols-4">
          <span>Onboarding Quiz</span>
          <span className="hidden md:block">Hiring assessments</span>
          <span className="hidden md:block">Runs on WordPress</span>
          <span className="text-right">Issue 04 / Results</span>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20">
        <h1 className="font-v4-display text-[clamp(3.4rem,12.5vw,11.5rem)] uppercase leading-[0.84]">
          <span className="block overflow-hidden">
            <span className="v4-rise block">Every candidate.</span>
          </span>
          <span className="block overflow-hidden">
            <span className="v4-rise v4-delay-1 block text-[#ff5a1f]">One score.</span>
          </span>
          <span className="block overflow-hidden">
            <span className="v4-rise v4-delay-2 block">No guesswork.</span>
          </span>
        </h1>

        <div className="mt-12 grid gap-8 border-t border-[#ece8df]/15 pt-8 md:grid-cols-12">
          <p className="font-v4-mono text-[11px] uppercase tracking-wider text-[#ece8df]/55 md:col-span-3">
            For hiring teams
          </p>
          <div className="v4-fade v4-delay-3 md:col-span-9 lg:col-span-7">
            <p className="text-lg leading-8 text-[#ece8df]/80 sm:text-xl sm:leading-9">
              Write one assessment per role. Candidates take it from a single link. Every result
              lands on one board, scored the same way, so the shortlist is simply the top of the
              list.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCandidateClick}
                className="group inline-flex h-14 items-center justify-between gap-6 bg-[#ff5a1f] px-6 text-sm font-semibold text-black transition-colors hover:bg-[#ff7440]"
              >
                Try the candidate side
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={onAdminClick}
                className="inline-flex h-14 items-center justify-center border border-[#ece8df]/30 px-6 text-sm font-semibold transition-colors hover:border-[#ece8df] hover:bg-[#ece8df] hover:text-black"
              >
                Open the builder
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results board */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:mt-32 sm:px-6" aria-labelledby="v4-board-caption">
        <div className="flex items-baseline justify-between gap-4 font-v4-mono text-[11px] uppercase tracking-wider text-[#ece8df]/55">
          <span id="v4-board-caption">Fig. 1 — Results board, sample data</span>
          <button
            type="button"
            onClick={board.replay}
            disabled={!board.isFinished}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#ff5a1f] disabled:opacity-0"
          >
            <RotateCcw className="h-3 w-3" />
            Replay
          </button>
        </div>

        <div className="mt-3 overflow-x-auto border border-[#ece8df]/15 bg-[#050505]">
          <div className="min-w-[680px] p-5 font-v4-mono text-[14px] font-medium sm:p-8 md:text-[17px] lg:p-10 lg:text-[21px]">
            <div className="mb-4 grid gap-x-6 sm:gap-x-8" style={BOARD_GRID_STYLE}>
              {['Candidate', 'Role', 'Score', 'Status'].map((label) => (
                <span key={label} className="text-[10px] uppercase tracking-[0.2em] text-[#ece8df]/40">
                  {label}
                </span>
              ))}
            </div>

            <ul className="space-y-2.5" aria-label="Candidate results">
              {board.rows.map((row) => (
                <li key={row.name} className="grid gap-x-6 sm:gap-x-8" style={BOARD_GRID_STYLE}>
                  <FlapText value={row.name} length={COLUMN_WIDTHS.name} tone="passed" />
                  <FlapText value={row.role} length={COLUMN_WIDTHS.role} tone="pending" />
                  <FlapText value={row.score} length={COLUMN_WIDTHS.score} tone={row.tone} />
                  <FlapText value={row.status} length={COLUMN_WIDTHS.status} tone={row.tone} />
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between border-t border-[#ece8df]/10 pt-4 text-[10px] uppercase tracking-[0.2em] text-[#ece8df]/40">
              <span>Pass mark 70</span>
              <span>Frontend round 2</span>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="features" className="mx-auto mt-28 max-w-7xl px-4 sm:mt-40 sm:px-6">
        <h2 className="font-v4-display text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-[0.9]">
          How the board fills up
        </h2>
        <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <li key={step.number} className="group border-t border-[#ece8df]/25 pt-6">
              <span className="font-v4-display block text-[5.5rem] leading-none text-[#ff5a1f] transition-transform duration-300 group-hover:-translate-y-1">
                {step.number}
              </span>
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 max-w-sm leading-7 text-[#ece8df]/65">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Index */}
      <section className="mx-auto mt-28 grid max-w-7xl gap-10 px-4 sm:mt-40 sm:px-6 md:grid-cols-12">
        <h2 className="font-v4-display text-[clamp(2.5rem,6vw,4.5rem)] uppercase leading-[0.9] md:col-span-4">
          What goes into the test
        </h2>
        <dl className="md:col-span-8">
          {INDEX_ROWS.map((row) => (
            <div
              key={row.label}
              className="group grid gap-2 border-t border-[#ece8df]/15 py-6 transition-colors last:border-b hover:border-[#ff5a1f] sm:grid-cols-[10rem_1fr]"
            >
              <dt className="font-v4-mono text-xs uppercase tracking-[0.2em] text-[#ff5a1f]">{row.label}</dt>
              <dd className="text-lg leading-8 text-[#ece8df]/85">{row.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 sm:pb-40 sm:pt-40">
        <h2 className="font-v4-display text-[clamp(3.4rem,12vw,10.5rem)] uppercase leading-[0.84]">
          Your board
          <span className="block text-[#ff5a1f]">is empty.</span>
        </h2>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCandidateClick}
            className="group inline-flex h-14 items-center justify-between gap-6 bg-[#ff5a1f] px-6 text-sm font-semibold text-black transition-colors hover:bg-[#ff7440]"
          >
            Take a sample assessment
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={onAdminClick}
            className="inline-flex h-14 items-center justify-center border border-[#ece8df]/30 px-6 text-sm font-semibold transition-colors hover:border-[#ece8df] hover:bg-[#ece8df] hover:text-black"
          >
            Open the builder
          </button>
        </div>
      </section>
    </div>
  );
};
