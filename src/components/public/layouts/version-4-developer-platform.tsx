import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Clock,
  GitBranch,
  Link2,
  ListChecks,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutProps } from './version-1-classic';

const DEMO_QUESTION = 'A page takes six seconds to load. What do you check first?';

const DEMO_OPTIONS = [
  'The network waterfall in DevTools',
  'Rewrite it in a newer framework',
  'Add more memory to the server',
];

const TICK_MS = 40;
const OPTION_GAP_TICKS = 8;
const SELECT_DELAY_TICKS = 18;
const TOTAL_TICKS = DEMO_QUESTION.length + DEMO_OPTIONS.length * OPTION_GAP_TICKS + SELECT_DELAY_TICKS;

const FEATURES = [
  {
    icon: ListChecks,
    title: 'Question formats that fit the role',
    description: 'Multiple choice, true or false, open answers, and image, audio or video prompts.',
  },
  {
    icon: GitBranch,
    title: 'Branching paths',
    description: 'Send strong answers to harder questions and route others to the fundamentals.',
  },
  {
    icon: Clock,
    title: 'Timers and focus logging',
    description: 'Set a time limit per assessment. Tab switches are logged for your review.',
  },
  {
    icon: Award,
    title: 'Certificates',
    description: 'Candidates who pass can receive a certificate automatically.',
  },
  {
    icon: Briefcase,
    title: 'Job role templates',
    description: 'Start from a role, adjust the questions, and reuse it for every opening.',
  },
  {
    icon: Palette,
    title: 'Nine built-in themes',
    description: 'Match the candidate experience to your employer brand.',
  },
];

const PIPELINE_COLUMNS = [
  { title: 'Invited', people: ['Maya R.', 'Daniel K.', 'Sofia L.'] },
  { title: 'Completed', people: ['Priya N. · 86%', 'Tom W. · 71%'] },
  { title: 'Shortlisted', people: ['Priya N.'] },
];

const useAuthoringDemo = () => {
  const [tick, setTick] = useState(0);
  const isComplete = tick >= TOTAL_TICKS;

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion) {
      setTick(TOTAL_TICKS);
    }
  }, []);

  useEffect(() => {
    if (isComplete) {
      return;
    }

    const timer = window.setTimeout(() => setTick((current) => current + 1), TICK_MS);

    return () => window.clearTimeout(timer);
  }, [tick, isComplete]);

  const typedQuestion = DEMO_QUESTION.slice(0, tick);
  const ticksAfterTyping = Math.max(0, tick - DEMO_QUESTION.length);
  const visibleOptionCount = Math.min(
    DEMO_OPTIONS.length,
    Math.floor(ticksAfterTyping / OPTION_GAP_TICKS),
  );
  const isAnswerSelected = isComplete;
  const isTyping = tick < DEMO_QUESTION.length;

  return {
    typedQuestion,
    visibleOptionCount,
    isAnswerSelected,
    isTyping,
    isComplete,
    replay: () => setTick(0),
  };
};

export const Version4DeveloperPlatform: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
}) => {
  const demo = useAuthoringDemo();
  const visibleOptions = DEMO_OPTIONS.slice(0, demo.visibleOptionCount);

  return (
    <div className="w-full bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-20 text-center sm:px-6 sm:pt-28">
        <p className="v4-reveal text-sm font-medium text-primary">Onboarding Quiz for hiring teams</p>

        <h1 className="v4-reveal v4-delay-1 mx-auto mt-5 max-w-4xl font-heading text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
          Build hiring assessments candidates actually finish.
        </h1>

        <p className="v4-reveal v4-delay-2 mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Write questions for the role, send one link, and review scored results with your team.
          It runs on your own WordPress site.
        </p>

        <div className="v4-reveal v4-delay-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={onCandidateClick}
            className="h-12 rounded-lg px-6 text-sm font-semibold"
          >
            Try the candidate experience
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={onAdminClick}
            className="h-12 rounded-lg px-6 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Open the builder
          </Button>
        </div>
      </section>

      {/* Product view: builder and candidate side by side */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6" aria-label="Builder and candidate preview">
        <div className="v4-reveal v4-delay-4 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-border px-5 py-3 text-xs text-muted-foreground">
            <span>Frontend Engineer · Assessment</span>
            <span>Saved</span>
          </div>

          <div className="grid lg:grid-cols-2">
            {/* Builder */}
            <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Builder</p>

              <label className="mt-5 block text-xs text-muted-foreground" htmlFor="v4-demo-question">
                Question 3
              </label>
              <div
                id="v4-demo-question"
                className="mt-2 min-h-[4.5rem] rounded-lg border border-border bg-background px-4 py-3 text-base leading-6"
              >
                {demo.typedQuestion}
                {demo.isTyping && <span aria-hidden="true" className="v4-caret ml-0.5 inline-block h-5 w-px translate-y-1 bg-primary" />}
              </div>

              <ul className="mt-4 space-y-2">
                {visibleOptions.map((option, index) => (
                  <li
                    key={option}
                    className="v4-pop flex items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {index === 0 && <span className="text-xs font-medium text-primary">Correct</span>}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span>10 points</span>
                <span>If wrong, go to: Fundamentals</span>
              </div>
            </div>

            {/* Candidate preview */}
            <div className="bg-background/60 p-6 sm:p-8">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium uppercase tracking-wide">What the candidate sees</span>
                <span>Question 3 of 8</span>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[37.5%] rounded-full bg-primary" />
              </div>

              <p className="mt-6 min-h-[3.5rem] font-heading text-lg font-semibold leading-snug sm:text-xl">
                {demo.typedQuestion}
              </p>

              <ul className="mt-5 space-y-2.5">
                {visibleOptions.map((option, index) => {
                  const isChosen = index === 0;
                  const isHighlighted = isChosen ? demo.isAnswerSelected : false;

                  return (
                    <li
                      key={option}
                      className={`v4-pop rounded-xl border px-4 py-3 text-sm transition-colors duration-300 ${
                        isHighlighted
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {option}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={demo.replay}
            disabled={!demo.isComplete}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </button>
        </div>
      </section>

      {/* Build / Send / Review */}
      <section className="mx-auto mt-24 max-w-6xl space-y-24 px-4 sm:mt-32 sm:space-y-32 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium text-primary">Build</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              One assessment, different paths.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">
              Strong answers lead to harder questions. Weaker ones lead to the fundamentals, so
              every candidate gets a fair read on what they actually know.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8" aria-hidden="true">
            <div className="flex flex-col items-center gap-4 text-sm">
              <div className="rounded-lg border border-border bg-background px-4 py-2">Warm-up questions</div>
              <div className="h-6 w-px bg-border" />
              <div className="rounded-lg border border-primary/60 bg-primary/10 px-4 py-2 text-primary">Score above 70%?</div>
              <div className="grid w-full grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-px bg-border" />
                  <div className="w-full rounded-lg border border-border bg-background px-3 py-2 text-center">Advanced</div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-px bg-border" />
                  <div className="w-full rounded-lg border border-border bg-background px-3 py-2 text-center">Fundamentals</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:order-2">
            <p className="text-sm font-medium text-primary">Send</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              One link. No account to create.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">
              Candidates open the link and start. Progress saves as they go, so a dropped
              connection doesn&apos;t cost them their answers.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:order-1" aria-hidden="true">
            <p className="text-xs text-muted-foreground">Invite link</p>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm">
              <Link2 className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">careers.yourcompany.com/apply/frontend-engineer</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span>One attempt</span>
              <span>45 minute limit</span>
              <span>Expires in 7 days</span>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium text-primary">Review</p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Scores land on a board your team already understands.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">
              Every result is scored the same way, so moving someone forward is a decision you
              can explain.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6" aria-hidden="true">
            {PIPELINE_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="mb-3 text-xs text-muted-foreground">
                  {column.title} · {column.people.length}
                </p>
                <div className="space-y-2">
                  {column.people.map((person) => (
                    <div
                      key={person}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      {person}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature list */}
      <section id="features" className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
        <h2 className="max-w-xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Everything else you&apos;d expect.
        </h2>
        <dl className="mt-12 grid gap-x-12 gap-y-10 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title}>
                <dt className="flex items-center gap-3 font-semibold">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {feature.title}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl">
          See it from the candidate&apos;s side first.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
          Take a sample assessment in a few minutes, then open the builder to make your own.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={onCandidateClick} className="h-12 rounded-lg px-6 text-sm font-semibold">
            Take a sample assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={onAdminClick}
            className="h-12 rounded-lg px-6 text-sm font-semibold"
          >
            Open the builder
          </Button>
        </div>
      </section>
    </div>
  );
};
