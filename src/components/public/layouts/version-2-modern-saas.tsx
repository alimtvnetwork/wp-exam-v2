import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

type RoleId = 'frontend' | 'support' | 'sales' | 'design';

interface PaperScene {
  name: string;
  form: string;
}

interface HousePaper {
  id: RoleId;
  name: string;
  minutes: number;
  questions: number;
  passMark: number;
  scenes: PaperScene[];
}

const DESK = '#14211b';
const PAPER = '#f4f0e4';
const INK = '#1c1914';
const COPPER = '#7c4e30';

const PROGRAMME = [
  { numeral: 'I', title: 'The brief', note: 'You write the questions once, for a single role.' },
  { numeral: 'II', title: 'The sitting', note: 'Every candidate opens one link and takes the same paper.' },
  { numeral: 'III', title: 'The interval', note: 'The time limit is shown first. Progress saves if they step away.' },
  { numeral: 'IV', title: 'The verdict', note: 'Every paper is marked the same way, then placed on one list.' },
];

const PAPERS: HousePaper[] = [
  {
    id: 'frontend',
    name: 'Frontend developer',
    minutes: 30,
    questions: 18,
    passMark: 70,
    scenes: [
      { name: 'HTML & CSS', form: 'Multiple choice' },
      { name: 'JavaScript', form: 'Code reading' },
      { name: 'Performance, for strong answers', form: 'Open answers' },
    ],
  },
  {
    id: 'support',
    name: 'Customer support',
    minutes: 20,
    questions: 12,
    passMark: 65,
    scenes: [
      { name: 'Product basics', form: 'Multiple choice' },
      { name: 'A written reply', form: 'Open answer' },
      { name: 'An upset caller', form: 'Audio prompt' },
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    minutes: 25,
    questions: 14,
    passMark: 70,
    scenes: [
      { name: 'Discovery', form: 'Multiple choice' },
      { name: 'Objections', form: 'Open answer' },
      { name: 'The pitch', form: 'Video prompt' },
    ],
  },
  {
    id: 'design',
    name: 'Product designer',
    minutes: 30,
    questions: 15,
    passMark: 75,
    scenes: [
      { name: 'A visual critique', form: 'Image prompt' },
      { name: 'Accessibility', form: 'True or false' },
      { name: 'A design brief', form: 'Open answer' },
    ],
  },
];

export const Version2ModernSaas: React.FC<LayoutProps> = ({ onAdminClick, onCandidateClick }) => {
  const [activeRoleId, setActiveRoleId] = useState<RoleId>('frontend');
  const activePaper = PAPERS.find((paper) => paper.id === activeRoleId) ?? PAPERS[0];

  return (
    <div className="font-v2 w-full px-3 py-12 sm:px-6 sm:py-20" style={{ backgroundColor: DESK, color: PAPER }}>
      <article
        className="v2-fade mx-auto max-w-6xl shadow-[0_40px_80px_-36px_rgba(0,0,0,0.7)]"
        style={{ backgroundColor: PAPER, color: INK }}
        aria-label="Onboarding Quiz house programme"
      >
        <header className="flex items-center justify-between gap-6 px-6 py-5 sm:px-12">
          <span className="text-[11px] uppercase tracking-[0.28em]">Onboarding Quiz</span>
          <span className="text-[11px] uppercase tracking-[0.28em] opacity-60">House programme</span>
        </header>
        <div className="v2-rule mx-6 h-0.5 origin-left sm:mx-12" style={{ backgroundColor: COPPER }} />

        <div className="grid md:grid-cols-2">
          <div className="border-b border-[#1c1914]/15 px-6 py-12 sm:px-12 md:border-b-0 md:border-r md:py-16">
            <p className="text-[11px] uppercase tracking-[0.28em] opacity-55">For hiring teams</p>
            <h1 className="mt-6 text-[clamp(2.7rem,5vw,4.6rem)] font-medium leading-[0.96] tracking-[-0.02em]">
              Hiring,
              <span className="block italic">by appointment.</span>
            </h1>
            <p className="mt-8 max-w-sm text-lg leading-8 opacity-80">
              One paper for each role. Every candidate sits it the same way. You read one list at the end.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCandidateClick}
                className="group inline-flex h-12 items-center justify-center gap-3 px-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#f4f0e4] transition-colors hover:bg-[#7c4e30]"
                style={{ backgroundColor: INK }}
              >
                Take a sitting
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={onAdminClick}
                className="inline-flex h-12 items-center justify-center border border-[#1c1914]/35 px-6 text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors hover:border-[#1c1914]"
              >
                Open the builder
              </button>
            </div>

            <ol id="features" className="mt-16" aria-label="Programme">
              {PROGRAMME.map((item) => (
                <li key={item.numeral} className="grid grid-cols-[2.5rem_1fr] gap-2 border-t border-[#1c1914]/15 py-5">
                  <span className="pt-1 text-lg italic" style={{ color: COPPER }}>
                    {item.numeral}
                  </span>
                  <div>
                    <h2 className="text-2xl font-medium">{item.title}</h2>
                    <p className="mt-1 leading-7 opacity-70">{item.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="px-6 py-12 sm:px-12 md:py-16">
            <p className="text-[11px] uppercase tracking-[0.28em] opacity-55">This evening’s papers</p>
            <h2 className="mt-4 text-3xl font-medium italic">Sample sittings.</h2>
            <p className="mt-3 max-w-sm leading-7 opacity-70">The questions are yours to write. These show the shape of a paper.</p>

            <div className="mt-10" role="group" aria-label="Choose a paper">
              {PAPERS.map((paper) => {
                const isActive = paper.id === activeRoleId;

                return (
                  <button
                    key={paper.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveRoleId(paper.id)}
                    className="flex w-full items-center gap-3 border-t border-[#1c1914]/15 py-3.5 text-left transition-colors last:border-b"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0"
                      style={{ backgroundColor: isActive ? COPPER : 'transparent' }}
                    />
                    <span className={isActive ? 'text-2xl italic' : 'text-lg opacity-55'}>{paper.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="v2-fade mt-10" key={activePaper.id}>
              <p className="text-[11px] uppercase tracking-[0.22em] opacity-55">
                {activePaper.minutes} min · {activePaper.questions} questions · pass mark {activePaper.passMark}%
              </p>
              <ul className="mt-6 space-y-4" aria-label={`${activePaper.name} paper`}>
                {activePaper.scenes.map((scene) => (
                  <li key={scene.name} className="flex items-baseline gap-3 text-lg">
                    <span>{scene.name}</span>
                    <span aria-hidden="true" className="mb-1 flex-1 border-b border-dotted border-[#1c1914]/30" />
                    <span className="shrink-0 text-sm italic opacity-60">{scene.form}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onCandidateClick}
                className="group mt-10 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]"
              >
                Sit this paper
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-6 border-t border-[#1c1914]/15 px-6 py-5 text-[11px] uppercase tracking-[0.22em] opacity-50 sm:px-12">
          <span>Sample programme</span>
          <button type="button" onClick={onAdminClick} className="tracking-[0.18em] hover:opacity-100">
            Arrange a sitting
          </button>
        </footer>
      </article>
    </div>
  );
};
