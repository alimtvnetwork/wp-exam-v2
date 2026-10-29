import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LayoutProps } from './version-1-classic';

type VisitorRole = 'hiring' | 'candidate';

interface FairnessStatement {
  id: string;
  text: string;
  isFair: boolean;
}

const FAIRNESS_STATEMENTS: FairnessStatement[] = [
  { id: 'same-questions', text: 'Everyone answers the same questions.', isFair: true },
  { id: 'same-time', text: 'Everyone gets the same time limit.', isFair: true },
  { id: 'same-marking', text: 'Answers are marked the same way every time.', isFair: true },
  { id: 'reviewer-mood', text: 'The reviewer decides how strict to be on the day.', isFair: false },
];

const FAIR_STATEMENT_COUNT = FAIRNESS_STATEMENTS.filter((statement) => statement.isFair).length;

const ASSESSMENT_CONTENTS = [
  'multiple choice and true or false',
  'open, written answers',
  'image, audio or video prompts',
  'branching: harder questions for strong answers',
  'a time limit, with tab switches logged',
];

const RED_PEN = '#c8202f';
const BLUE_PEN = '#1e3a8a';

const useInView = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);

      return;
    }

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
};

const PenTick: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 40 40" className={`h-7 w-7 ${className}`} aria-hidden="true">
    <path
      pathLength={1}
      className="v5-draw"
      d="M6 22 L16 32 L35 7"
      fill="none"
      stroke={RED_PEN}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PenCross: React.FC = () => (
  <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
    <path
      pathLength={1}
      className="v5-draw"
      d="M9 9 L31 31 M31 9 L9 31"
      fill="none"
      stroke={RED_PEN}
      strokeWidth={3.5}
      strokeLinecap="round"
    />
  </svg>
);

const PenCircle: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 60 50" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
    <path
      pathLength={1}
      className="v5-draw"
      d="M33 4 C 52 4, 58 18, 55 28 C 51 42, 22 47, 9 38 C -1 30, 4 10, 24 5 C 30 3, 36 4, 40 6"
      fill="none"
      stroke={RED_PEN}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </svg>
);

const MarginNumber: React.FC<{ value: string }> = ({ value }) => (
  <span className="pr-3 text-right font-v5-serif text-2xl font-semibold sm:pr-5">{value}</span>
);

const Marks: React.FC<{ value: string }> = ({ value }) => (
  <span className="shrink-0 font-v5-serif text-sm italic text-[#1f1d1a]/55">({value})</span>
);

export const Version5CinematicShowcase: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
}) => {
  const [visitorRole, setVisitorRole] = useState<VisitorRole | null>(null);
  const [tickedIds, setTickedIds] = useState<string[]>([]);
  const blanks = useInView<HTMLDivElement>();
  const contents = useInView<HTMLOListElement>();

  const fairTickCount = FAIRNESS_STATEMENTS.filter(
    (statement) => statement.isFair && tickedIds.includes(statement.id),
  ).length;
  const hasUnfairTick = FAIRNESS_STATEMENTS.some((statement) =>
    tickedIds.includes(statement.id) ? !statement.isFair : false,
  );
  const isFairnessComplete = fairTickCount === FAIR_STATEMENT_COUNT;
  const isFairnessPerfect = isFairnessComplete ? !hasUnfairTick : false;
  const isPaperPerfect = visitorRole !== null ? isFairnessPerfect : false;

  const toggleStatement = (id: string) => {
    setTickedIds((current) =>
      current.includes(id) ? current.filter((tickedId) => tickedId !== id) : [...current, id],
    );
  };

  const handleRoleContinue = () => {
    if (visitorRole === 'hiring') {
      onAdminClick();

      return;
    }

    onCandidateClick();
  };

  return (
    <div className="w-full bg-[#e7e0d1] px-3 py-10 text-[#1f1d1a] sm:px-6 sm:py-20">
      <article
        className="relative mx-auto max-w-5xl bg-[#fbf8f1] pb-16 pr-5 pt-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_40px_80px_-40px_rgba(70,50,20,0.45)] sm:pb-24 sm:pr-14 sm:pt-12"
        aria-label="Onboarding Quiz hiring assessment paper"
      >
        {/* Margin line and punched holes */}
        <div aria-hidden="true" className="absolute inset-y-0 left-10 w-px bg-[#e4a2a2] sm:left-20" />
        <div aria-hidden="true" className="absolute inset-y-0 left-2 hidden flex-col justify-around sm:left-5 sm:flex">
          {[0, 1, 2].map((hole) => (
            <span key={hole} className="h-5 w-5 rounded-full bg-[#e7e0d1] shadow-[inset_0_2px_3px_rgba(0,0,0,0.18)]" />
          ))}
        </div>

        {/* Paper header */}
        <header className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[5rem_1fr]">
          <span />
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-[#1f1d1a] pb-4">
            <div className="font-v5-serif text-xs uppercase tracking-[0.25em] text-[#1f1d1a]/70">
              Onboarding Quiz · Hiring assessment · Paper 1
            </div>
            <div className="flex items-end gap-6 font-v5-serif text-sm">
              <span className="hidden sm:inline">
                Name <span className="inline-block w-32 border-b border-[#1f1d1a]/50" />
              </span>
              <span className="flex items-end gap-2">
                Score
                <span className="relative flex h-12 w-14 items-center justify-center border border-[#1f1d1a]/60 bg-[#fbf8f1]">
                  {isPaperPerfect && (
                    <>
                      <span className="v5-write v5-delay-1 font-v5-hand text-4xl font-bold leading-none" style={{ color: RED_PEN }}>
                        A
                      </span>
                      <PenCircle className="-inset-2 h-16 w-[4.5rem]" />
                      <span className="sr-only">Full marks</span>
                    </>
                  )}
                </span>
              </span>
            </div>
          </div>
        </header>

        {/* Title */}
        <div className="mt-12 grid grid-cols-[2.5rem_1fr] sm:mt-16 sm:grid-cols-[5rem_1fr]">
          <span />
          <div>
            <h1 className="v5-fade font-v5-serif text-[clamp(2.75rem,8vw,6rem)] font-medium leading-[0.98] tracking-[-0.02em]">
              Hiring, marked{' '}
              <span className="relative inline-block italic">
                fairly.
                <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute -bottom-3 left-0 h-5 w-full" aria-hidden="true">
                  <path
                    pathLength={1}
                    className="v5-draw v5-delay-3"
                    d="M3 15 C 60 7, 120 20, 180 11 S 270 8, 297 13"
                    fill="none"
                    stroke={RED_PEN}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="v5-fade v5-delay-1 mt-10 max-w-2xl font-v5-serif text-xl italic leading-9 text-[#1f1d1a]/80">
              Instructions: answer all questions. Onboarding Quiz turns each role into a short
              assessment that every candidate takes the same way, and that gets marked the same
              way too.
            </p>
            <p className="mt-3 font-v5-serif text-sm uppercase tracking-[0.2em] text-[#1f1d1a]/50">
              Time allowed: about two minutes
            </p>
          </div>
        </div>

        {/* Question 1 */}
        <section className="mt-16 grid grid-cols-[2.5rem_1fr] sm:mt-20 sm:grid-cols-[5rem_1fr]" aria-labelledby="v5-q1">
          <MarginNumber value="1" />
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="v5-q1" className="font-v5-serif text-2xl font-medium sm:text-3xl">
                Which best describes you?
              </h2>
              <Marks value="1 mark" />
            </div>

            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">Which best describes you?</legend>
              {[
                { value: 'hiring' as const, letter: 'A', label: 'I hire people and want to build an assessment.' },
                { value: 'candidate' as const, letter: 'B', label: 'I’ve been sent an assessment to take.' },
              ].map((option) => {
                const isChosen = visitorRole === option.value;

                return (
                  <label key={option.value} className="group flex cursor-pointer items-center gap-4 py-1">
                    <input
                      type="radio"
                      name="v5-role"
                      value={option.value}
                      checked={isChosen}
                      onChange={() => setVisitorRole(option.value)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1f1d1a] font-v5-serif text-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#1e3a8a] ${
                        isChosen ? 'bg-[#1f1d1a] text-[#fbf8f1]' : 'group-hover:bg-[#1f1d1a]/10'
                      }`}
                    >
                      {option.letter}
                    </span>
                    <span className="font-v5-serif text-lg sm:text-xl">{option.label}</span>
                    {isChosen && <PenTick />}
                  </label>
                );
              })}
            </fieldset>

            {visitorRole !== null && (
              <div className="v5-fade mt-6 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={handleRoleContinue}
                  className="group inline-flex h-12 items-center gap-3 bg-[#1f1d1a] px-6 font-v5-serif text-lg text-[#fbf8f1] transition-colors hover:bg-[#1e3a8a]"
                >
                  {visitorRole === 'hiring' ? 'Open the builder' : 'Start your assessment'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <span className="v5-write v5-delay-1 font-v5-hand text-3xl" style={{ color: RED_PEN }}>
                  good, start here
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Question 2 */}
        <section className="mt-16 grid grid-cols-[2.5rem_1fr] sm:mt-20 sm:grid-cols-[5rem_1fr]" aria-labelledby="v5-q2">
          <MarginNumber value="2" />
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="v5-q2" className="font-v5-serif text-2xl font-medium sm:text-3xl">
                Tick every statement that makes an assessment fair.
              </h2>
              <Marks value="3 marks" />
            </div>

            <ul className="mt-6 space-y-2">
              {FAIRNESS_STATEMENTS.map((statement) => {
                const isTicked = tickedIds.includes(statement.id);
                const isMarkedWrong = isTicked ? !statement.isFair : false;

                return (
                  <li key={statement.id}>
                    <label className="group flex cursor-pointer items-center gap-4 py-1">
                      <input
                        type="checkbox"
                        checked={isTicked}
                        onChange={() => toggleStatement(statement.id)}
                        className="peer sr-only"
                      />
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center border-[1.5px] border-[#1f1d1a] font-v5-hand text-2xl leading-none transition-colors group-hover:bg-[#1f1d1a]/10 peer-focus-visible:ring-2 peer-focus-visible:ring-[#1e3a8a]">
                        {isTicked && <span aria-hidden="true" style={{ color: BLUE_PEN }}>✕</span>}
                      </span>
                      <span className="font-v5-serif text-lg sm:text-xl">{statement.text}</span>
                      {isTicked && (isMarkedWrong ? <PenCross /> : <PenTick />)}
                    </label>
                    {isMarkedWrong && (
                      <p className="v5-write ml-10 font-v5-hand text-3xl leading-tight" style={{ color: RED_PEN }}>
                        no, that’s the problem we fix
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 max-w-2xl font-v5-serif text-lg leading-8 text-[#1f1d1a]/75">
              Onboarding Quiz holds every candidate to the first three, every time, so a result
              means the same thing whoever reviews it.
            </p>
            {isFairnessPerfect && (
              <p className="v5-write mt-2 font-v5-hand text-3xl" style={{ color: RED_PEN }} role="status">
                3/3, well done
              </p>
            )}
          </div>
        </section>

        {/* Question 3 */}
        <section className="mt-16 grid grid-cols-[2.5rem_1fr] sm:mt-20 sm:grid-cols-[5rem_1fr]" aria-labelledby="v5-q3">
          <MarginNumber value="3" />
          <div ref={blanks.ref}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="v5-q3" className="font-v5-serif text-2xl font-medium sm:text-3xl">
                Fill in the blanks.
              </h2>
              <Marks value="2 marks" />
            </div>
            <p className="mt-6 max-w-3xl font-v5-serif text-xl leading-[2.4rem] sm:text-2xl sm:leading-[2.75rem]">
              You write the questions once, send candidates{' '}
              <span className="inline-block min-w-[4.5rem] border-b border-[#1f1d1a] text-center">
                {blanks.isInView && (
                  <span className="v5-write font-v5-hand text-3xl" style={{ color: BLUE_PEN }}>
                    one
                  </span>
                )}
              </span>{' '}
              link, and every result comes back already{' '}
              <span className="inline-block min-w-[7rem] border-b border-[#1f1d1a] text-center">
                {blanks.isInView && (
                  <span className="v5-write v5-delay-2 font-v5-hand text-3xl" style={{ color: BLUE_PEN }}>
                    marked
                  </span>
                )}
              </span>
              .
              {blanks.isInView && <PenTick className="ml-2 inline-block align-middle [&_path]:[animation-delay:900ms]" />}
            </p>
          </div>
        </section>

        {/* Question 4 */}
        <section className="mt-16 grid grid-cols-[2.5rem_1fr] sm:mt-20 sm:grid-cols-[5rem_1fr]" aria-labelledby="v5-q4">
          <MarginNumber value="4" />
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="v5-q4" className="font-v5-serif text-2xl font-medium sm:text-3xl">
                List what you can put in an assessment.
              </h2>
              <Marks value="5 marks" />
            </div>
            <div className="relative">
              <ol ref={contents.ref} className="mt-4 space-y-0">
                {ASSESSMENT_CONTENTS.map((item, index) => (
                  <li key={item} className="flex h-12 items-end gap-3 border-b border-[#1f1d1a]/25 pb-1">
                    <span className="font-v5-serif text-base text-[#1f1d1a]/50">{String.fromCharCode(97 + index)})</span>
                    <span
                      className={`font-v5-hand text-[1.7rem] leading-none ${contents.isInView ? 'v5-write' : 'opacity-0'}`}
                      style={{ color: BLUE_PEN, animationDelay: `${index * 260}ms` }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
              {contents.isInView && (
                <span
                  className="v5-write absolute -top-2 right-0 hidden rotate-[-6deg] font-v5-hand text-4xl md:block"
                  style={{ color: RED_PEN, animationDelay: '1500ms' }}
                >
                  5/5
                </span>
              )}
            </div>
          </div>
        </section>

        {/* End of paper */}
        <footer className="mt-20 grid grid-cols-[2.5rem_1fr] sm:mt-28 sm:grid-cols-[5rem_1fr]">
          <span />
          <div>
            <p className="text-center font-v5-serif text-sm uppercase tracking-[0.35em] text-[#1f1d1a]/60">
              End of paper
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onCandidateClick}
                className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-[#1f1d1a] px-6 font-v5-serif text-lg text-[#fbf8f1] transition-colors hover:bg-[#1e3a8a] sm:w-auto"
              >
                Take a sample assessment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={onAdminClick}
                className="inline-flex h-12 w-full items-center justify-center border-[1.5px] border-[#1f1d1a] px-6 font-v5-serif text-lg transition-colors hover:bg-[#1f1d1a] hover:text-[#fbf8f1] sm:w-auto"
              >
                Open the builder
              </button>
            </div>
            <p className="mt-14 text-right font-v5-serif text-xs italic text-[#1f1d1a]/45">Page 1 of 1</p>
          </div>
        </footer>
      </article>
    </div>
  );
};
