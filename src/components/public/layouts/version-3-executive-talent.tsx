import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

type LineId = 'frontend' | 'support' | 'sales' | 'design';

interface MapStop {
  x: number;
  label: string;
  format: string;
  alternative?: { label: string; format: string };
}

interface MapLine {
  id: LineId;
  name: string;
  color: string;
  onColor: string;
  y: number;
  labelSide: 'above' | 'below';
  path: string;
  branchPath?: string;
  branchY?: number;
  stops: MapStop[];
  minutes: number;
  passMark: number;
  questions: number;
}

const NIGHT = '#0c0f14';
const INK = '#eceff3';
const RIVER = '#132235';

const START = { x: 160, y: 300 };
const END = { x: 1040, y: 300 };

const LINES: MapLine[] = [
  {
    id: 'frontend',
    name: 'Frontend developer',
    color: '#2fbf71',
    onColor: NIGHT,
    y: 120,
    labelSide: 'below',
    path: 'M160 300 L340 120 H860 L1040 300',
    branchPath: 'M600 120 L660 60 H780 L840 120',
    branchY: 60,
    stops: [
      { x: 420, label: 'HTML & CSS', format: 'Multiple choice' },
      { x: 540, label: 'JavaScript', format: 'Code reading' },
      {
        x: 720,
        label: 'Fundamentals',
        format: 'Multiple choice',
        alternative: { label: 'Performance', format: 'Open answers, harder' },
      },
    ],
    minutes: 30,
    passMark: 70,
    questions: 18,
  },
  {
    id: 'support',
    name: 'Customer support',
    color: '#4c9dff',
    onColor: NIGHT,
    y: 240,
    labelSide: 'above',
    path: 'M160 300 L220 240 H980 L1040 300',
    stops: [
      { x: 380, label: 'Product basics', format: 'Multiple choice' },
      { x: 600, label: 'Written reply', format: 'Open answer' },
      { x: 820, label: 'Upset caller', format: 'Audio prompt' },
    ],
    minutes: 20,
    passMark: 65,
    questions: 12,
  },
  {
    id: 'sales',
    name: 'Sales',
    color: '#f5b72e',
    onColor: NIGHT,
    y: 360,
    labelSide: 'below',
    path: 'M160 300 L220 360 H980 L1040 300',
    stops: [
      { x: 380, label: 'Discovery', format: 'Multiple choice' },
      { x: 600, label: 'Objections', format: 'Open answer' },
      { x: 820, label: 'The pitch', format: 'Video prompt' },
    ],
    minutes: 25,
    passMark: 70,
    questions: 14,
  },
  {
    id: 'design',
    name: 'Product designer',
    color: '#d16bb4',
    onColor: NIGHT,
    y: 480,
    labelSide: 'below',
    path: 'M160 300 L340 480 H860 L1040 300',
    stops: [
      { x: 450, label: 'Visual critique', format: 'Image prompt' },
      { x: 600, label: 'Accessibility', format: 'True or false' },
      { x: 750, label: 'Design brief', format: 'Open answer' },
    ],
    minutes: 30,
    passMark: 75,
    questions: 15,
  },
];

const MAP_KEY = [
  {
    symbol: 'interchange',
    title: 'Every line starts at one link',
    description: 'Candidates open a single link. No account, no download.',
  },
  {
    symbol: 'stop',
    title: 'Each stop is a section',
    description: 'Multiple choice, true or false, open answers, or an image, audio or video prompt.',
  },
  {
    symbol: 'branch',
    title: 'Lines can split',
    description: 'Strong answers take the harder stop. Everyone else stays on the main line.',
  },
  {
    symbol: 'terminus',
    title: 'Every line ends at one board',
    description: 'Each result is scored the same way and lands in one list you can compare.',
  },
] as const;

const SERVICE_NOTES = [
  { label: 'Time limits', description: 'Shown before the first stop, so nobody is surprised halfway.' },
  { label: 'Progress', description: 'Saves between stops if a candidate loses their connection.' },
  { label: 'Fair play', description: 'Tab switches are logged so you can review them with the score.' },
  { label: 'Certificates', description: 'Issued at the end of the line to people who pass.' },
  { label: 'Your colours', description: 'Built-in themes so the test looks like your company.' },
];

const getIsReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KeySymbol: React.FC<{ symbol: (typeof MAP_KEY)[number]['symbol'] }> = ({ symbol }) => (
  <svg viewBox="0 0 80 40" className="h-10 w-20" aria-hidden="true">
    {symbol === 'interchange' && (
      <>
        <path d="M24 20 H76" stroke={LINES[1].color} strokeWidth={8} />
        <circle cx={22} cy={20} r={13} fill={NIGHT} stroke={INK} strokeWidth={5} />
      </>
    )}
    {symbol === 'stop' && (
      <>
        <path d="M4 26 H76" stroke={LINES[0].color} strokeWidth={8} />
        <rect x={37} y={10} width={6} height={12} fill={LINES[0].color} />
      </>
    )}
    {symbol === 'branch' && (
      <>
        <path d="M4 30 H76" stroke={LINES[0].color} strokeWidth={8} />
        <path d="M18 30 L36 12 H50 L66 28" stroke={LINES[0].color} strokeWidth={8} fill="none" strokeLinejoin="round" />
      </>
    )}
    {symbol === 'terminus' && (
      <>
        <path d="M4 20 H56" stroke={LINES[3].color} strokeWidth={8} />
        <circle cx={58} cy={20} r={13} fill={NIGHT} stroke={INK} strokeWidth={5} />
      </>
    )}
  </svg>
);

const NetworkMap: React.FC<{ activeId: LineId; onSelect: (id: LineId) => void }> = ({ activeId, onSelect }) => {
  const [isReducedMotion] = useState(getIsReducedMotion);
  const activeLine = LINES.find((line) => line.id === activeId) ?? LINES[0];

  return (
    <svg
      viewBox="0 0 1200 560"
      className="font-v3 block w-full min-w-[860px]"
      role="img"
      aria-label="Sample network map: four role assessments drawn as lines that start at one link and end at one results board"
    >
      <path d="M0 425 C 220 395, 330 455, 560 425 S 900 395, 1200 440" stroke={RIVER} strokeWidth={38} fill="none" />

      {LINES.map((line, lineIndex) => {
        const isActive = line.id === activeId;
        const lineDelay = { animationDelay: `${lineIndex * 180}ms` };

        return (
          <g
            key={line.id}
            className="cursor-pointer transition-opacity duration-300"
            opacity={isActive ? 1 : 0.38}
            onMouseEnter={() => onSelect(line.id)}
            onClick={() => onSelect(line.id)}
          >
            <path
              d={line.path}
              pathLength={1}
              className="v3-draw"
              style={lineDelay}
              stroke={line.color}
              strokeWidth={10}
              fill="none"
              strokeLinejoin="round"
            />
            {line.branchPath && (
              <path
                d={line.branchPath}
                pathLength={1}
                className="v3-draw"
                style={{ animationDelay: `${lineIndex * 180 + 700}ms` }}
                stroke={line.color}
                strokeWidth={10}
                fill="none"
                strokeLinejoin="round"
              />
            )}

            {line.stops.map((stop) => {
              const isAbove = line.labelSide === 'above';

              return (
                <g key={stop.label} className="v3-fade" style={{ animationDelay: `${lineIndex * 180 + 900}ms` }}>
                  <rect x={stop.x - 3} y={isAbove ? line.y - 15 : line.y + 5} width={6} height={10} fill={line.color} />
                  <text
                    x={stop.x}
                    y={isAbove ? line.y - 24 : line.y + 36}
                    textAnchor="middle"
                    fontSize={17}
                    fontWeight={600}
                    fill={INK}
                  >
                    {stop.label}
                  </text>
                  {stop.alternative && line.branchY !== undefined && (
                    <>
                      <rect x={stop.x - 3} y={line.branchY - 15} width={6} height={10} fill={line.color} />
                      <text x={stop.x} y={line.branchY - 24} textAnchor="middle" fontSize={17} fontWeight={600} fill={INK}>
                        {stop.alternative.label}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {!isReducedMotion && (
        <circle key={activeLine.id} r={9} fill="#fff" stroke={activeLine.color} strokeWidth={5}>
          <animateMotion dur="7s" repeatCount="indefinite" path={activeLine.path} />
        </circle>
      )}

      {[START, END].map((point) => (
        <circle key={point.x} cx={point.x} cy={point.y} r={21} fill={NIGHT} stroke={INK} strokeWidth={7} />
      ))}
      <text x={START.x - 36} y={START.y + 2} textAnchor="end" fontSize={19} fontWeight={800} fill={INK}>
        Link sent
      </text>
      <text x={START.x - 36} y={START.y + 24} textAnchor="end" className="font-v3-mono" fontSize={12} fill={INK} opacity={0.6}>
        ONE LINK
      </text>
      <text x={END.x + 36} y={END.y + 2} fontSize={19} fontWeight={800} fill={INK}>
        Results
      </text>
      <text x={END.x + 36} y={END.y + 24} className="font-v3-mono" fontSize={12} fill={INK} opacity={0.6}>
        ONE LIST
      </text>
    </svg>
  );
};

export const Version3ExecutiveTalent: React.FC<LayoutProps> = ({ onAdminClick, onCandidateClick }) => {
  const [activeId, setActiveId] = useState<LineId>('frontend');
  const activeLine = LINES.find((line) => line.id === activeId) ?? LINES[0];

  return (
    <div className="font-v3 w-full overflow-hidden text-[#eceff3]" style={{ backgroundColor: NIGHT }}>
      {/* Line colour strip */}
      <div className="flex h-1.5" aria-hidden="true">
        {LINES.map((line) => (
          <span key={line.id} className="flex-1" style={{ backgroundColor: line.color }} />
        ))}
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="v3-fade font-v3-mono text-xs uppercase tracking-[0.2em] text-[#eceff3]/60">
            Onboarding Quiz · Assessment network
          </p>
          <h1 className="v3-fade mt-5 text-[clamp(2.6rem,6vw,5.25rem)] font-extrabold leading-[0.95] tracking-[-0.02em]">
            Every hiring test,
            <span className="block">mapped out.</span>
          </h1>
        </div>
        <div className="v3-fade lg:col-span-5" style={{ animationDelay: '150ms' }}>
          <p className="text-lg leading-8 text-[#eceff3]/80">
            Each role gets its own line. Every candidate rides the same stops in the same order, and
            arrives at one board with a score you can compare.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCandidateClick}
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#eceff3] px-6 text-sm font-bold text-[#0c0f14] transition-colors hover:bg-[#4c9dff]"
            >
              Try a sample assessment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#eceff3] px-6 text-sm font-bold transition-colors hover:bg-[#eceff3] hover:text-[#0c0f14]"
            >
              Open the builder
            </button>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-labelledby="v3-map-caption">
        <div className="flex flex-col gap-4 border-t-2 border-[#eceff3] pt-4 md:flex-row md:items-center md:justify-between">
          <span id="v3-map-caption" className="font-v3-mono text-xs uppercase tracking-[0.2em] text-[#eceff3]/60">
            Map 1 · Sample routes
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a line">
            {LINES.map((line) => {
              const isActive = line.id === activeId;

              return (
                <button
                  key={line.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveId(line.id)}
                  onMouseEnter={() => setActiveId(line.id)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border-2 px-3.5 text-sm font-bold transition-colors"
                  style={{
                    borderColor: line.color,
                    backgroundColor: isActive ? line.color : 'transparent',
                    color: isActive ? line.onColor : INK,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-5 rounded-full"
                    style={{ backgroundColor: isActive ? line.onColor : line.color }}
                  />
                  {line.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <NetworkMap activeId={activeId} onSelect={setActiveId} />
        </div>

        {/* Line diagram for the chosen line */}
        <div className="mt-8 grid gap-10 border-t border-[#eceff3]/20 pt-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <span className="block h-2.5 w-16 rounded-full" style={{ backgroundColor: activeLine.color }} aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">{activeLine.name} line</h2>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-[#eceff3]/20 py-5">
              {[
                { label: 'Time limit', value: `${activeLine.minutes} min` },
                { label: 'Questions', value: String(activeLine.questions) },
                { label: 'Pass mark', value: `${activeLine.passMark}%` },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="font-v3-mono text-[11px] uppercase tracking-[0.15em] text-[#eceff3]/55">{item.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCandidateClick}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: activeLine.color, color: activeLine.onColor }}
              >
                Ride this line as a candidate
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={onAdminClick}
                className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold underline-offset-4 hover:underline"
              >
                Build one like it
              </button>
            </div>
          </div>

          <ol className="relative md:col-span-6 md:col-start-7" aria-label={`Stops on the ${activeLine.name} line`}>
            <span
              aria-hidden="true"
              className="absolute bottom-5 left-[13px] top-5 w-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: activeLine.color }}
            />
            {[
              { label: 'Link sent', format: 'The candidate opens one link', isInterchange: true },
              ...activeLine.stops.map((stop) => ({ ...stop, isInterchange: false })),
              { label: 'Results board', format: 'Scored and ready to compare', isInterchange: true },
            ].map((stop) => (
              <li key={stop.label} className="relative flex gap-6 py-3">
                <span className="relative z-10 flex w-[34px] shrink-0 justify-center pt-1" aria-hidden="true">
                  {stop.isInterchange ? (
                    <span className="h-6 w-6 rounded-full border-[5px] border-[#eceff3] bg-[#0c0f14]" />
                  ) : (
                    <span className="mt-1.5 h-1.5 w-6 translate-x-3" style={{ backgroundColor: activeLine.color }} />
                  )}
                </span>
                <div>
                  <p className={stop.isInterchange ? 'text-lg font-extrabold' : 'text-lg font-bold'}>{stop.label}</p>
                  <p className="font-v3-mono text-xs uppercase tracking-[0.12em] text-[#eceff3]/55">{stop.format}</p>
                  {'alternative' in stop && stop.alternative && (
                    <p className="mt-2 text-sm text-[#eceff3]/75">
                      Strong answers switch to <strong>{stop.alternative.label}</strong> ({stop.alternative.format.toLowerCase()}).
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Map key */}
      <section id="features" className="mx-auto mt-24 max-w-7xl px-4 sm:mt-32 sm:px-6">
        <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-none tracking-tight">How to read the map</h2>
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {MAP_KEY.map((item) => (
            <li key={item.title} className="border-t-2 border-[#eceff3] pt-5">
              <KeySymbol symbol={item.symbol} />
              <h3 className="mt-4 text-lg font-extrabold">{item.title}</h3>
              <p className="mt-2 leading-7 text-[#eceff3]/70">{item.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Service notes */}
      <section className="mx-auto mt-24 grid max-w-7xl gap-10 px-4 sm:mt-32 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-none tracking-tight">Service notes</h2>
          <p className="mt-4 max-w-xs leading-7 text-[#eceff3]/70">What every line has, whichever role it is for.</p>
        </div>
        <dl className="md:col-span-8">
          {SERVICE_NOTES.map((note, index) => (
            <div key={note.label} className="grid gap-2 border-t border-[#eceff3]/20 py-5 last:border-b sm:grid-cols-[11rem_1fr]">
              <dt className="flex items-center gap-3 font-extrabold">
                <span
                  aria-hidden="true"
                  className="h-2 w-6 rounded-full"
                  style={{ backgroundColor: LINES[index % LINES.length].color }}
                />
                {note.label}
              </dt>
              <dd className="text-lg leading-8 text-[#eceff3]/80">{note.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 sm:pb-32 sm:pt-32">
        <div className="rounded-[28px] border border-[#eceff3]/12 bg-[#151a21] px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="flex h-1.5 max-w-[12rem] overflow-hidden rounded-full" aria-hidden="true">
            {LINES.map((line) => (
              <span key={line.id} className="flex-1" style={{ backgroundColor: line.color }} />
            ))}
          </div>
          <h2 className="mt-8 text-[clamp(2.2rem,5vw,4.25rem)] font-extrabold leading-[0.98] tracking-tight">
            Open your first line.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-white/70">
            Start with one role. Add more lines when you hire for more.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onAdminClick}
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-bold text-[#0c0f14] transition-colors hover:bg-[#f5b72e]"
            >
              Build your first assessment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onCandidateClick}
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/40 px-6 text-sm font-bold transition-colors hover:border-white"
            >
              Take a sample assessment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
