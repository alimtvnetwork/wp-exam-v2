import React, { useState } from 'react';
import { ArrowRight, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LayoutProps } from './version-1-classic';

type PreviewScreen = 'question' | 'result';

const TIME_LIMIT_OPTIONS = [0, 20, 30, 45];
const SAMPLE_SCORE = 78;

const STEPS = [
  {
    title: 'Pick a role template',
    description: 'Start with questions written for the job, then edit anything that doesn’t fit.',
  },
  {
    title: 'Set the rules',
    description: 'Time limit, pass mark, and what candidates see when they finish.',
  },
  {
    title: 'Share one link',
    description: 'Results arrive scored and ready to compare with the rest of your team.',
  },
];

const FAIRNESS_POINTS = [
  'Everyone answers the same questions under the same time limit.',
  'Answers are scored the same way every time, not by whoever is reviewing that day.',
  'Tab switches are logged, so you can see them in context when you review a result.',
];

const formatTimeLimit = (minutes: number) => {
  if (minutes === 0) {
    return 'No limit';
  }

  return `${minutes} min`;
};

export const Version5CinematicShowcase: React.FC<LayoutProps> = ({
  onAdminClick,
  onCandidateClick,
}) => {
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [passMark, setPassMark] = useState(70);
  const [isResultShown, setIsResultShown] = useState(true);
  const [previewScreen, setPreviewScreen] = useState<PreviewScreen>('question');

  const hasTimeLimit = timeLimitMinutes > 0;
  const isPassing = SAMPLE_SCORE >= passMark;

  return (
    <div className="w-full bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        <div className="max-w-4xl">
          <h1 className="v5-reveal font-heading text-4xl font-bold leading-[1.06] tracking-tight sm:text-6xl">
            Set the rules once.
            <span className="block text-muted-foreground">See exactly what candidates see.</span>
          </h1>
          <p className="v5-reveal v5-delay-1 mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Onboarding Quiz turns your hiring criteria into a short, fair assessment. Change a
            setting below and the candidate view updates as you go.
          </p>
          <div className="v5-reveal v5-delay-2 mt-9 flex flex-col gap-3 sm:flex-row">
            <Button onClick={onCandidateClick} className="h-12 rounded-lg px-6 text-sm font-semibold">
              Try it as a candidate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={onAdminClick}
              className="h-12 rounded-lg px-6 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              Sign in to build
            </Button>
          </div>
        </div>
      </section>

      {/* Studio: settings next to the candidate view */}
      <section
        className="v5-reveal v5-delay-3 mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6"
        aria-label="Assessment settings preview"
      >
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 lg:grid-cols-12">
          {/* Settings */}
          <div className="space-y-8 border-b border-border p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
            <p className="text-sm font-semibold">Assessment settings</p>

            <fieldset>
              <legend className="text-sm text-muted-foreground">Time limit</legend>
              <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
                {TIME_LIMIT_OPTIONS.map((minutes) => {
                  const isActive = minutes === timeLimitMinutes;

                  return (
                    <button
                      key={minutes}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setTimeLimitMinutes(minutes)}
                      className={`rounded-md px-2 py-2 text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {formatTimeLimit(minutes)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <div className="flex items-baseline justify-between">
                <span id="v5-pass-mark-label" className="text-sm text-muted-foreground">
                  Pass mark
                </span>
                <span className="v5-number text-sm font-semibold">{passMark}%</span>
              </div>
              <Slider
                value={[passMark]}
                onValueChange={(values) => setPassMark(values[0])}
                min={50}
                max={90}
                step={5}
                aria-labelledby="v5-pass-mark-label"
                className="mt-4"
              />
            </div>

            <fieldset>
              <legend className="text-sm text-muted-foreground">When they finish, candidates see</legend>
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                {[
                  { label: 'Their score', value: true },
                  { label: 'A thank-you note', value: false },
                ].map((choice) => {
                  const isActive = choice.value === isResultShown;

                  return (
                    <button
                      key={choice.label}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setIsResultShown(choice.value);
                        setPreviewScreen('result');
                      }}
                      className={`rounded-md px-2 py-2 text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Candidate view */}
          <div className="bg-muted/30 p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Candidate view</p>
              <div className="flex gap-1 text-xs" role="tablist" aria-label="Candidate screen">
                {(['question', 'result'] as const).map((screen) => {
                  const isActive = screen === previewScreen;

                  return (
                    <button
                      key={screen}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setPreviewScreen(screen)}
                      className={`rounded-md px-3 py-1.5 font-medium capitalize transition-colors ${
                        isActive ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {screen}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 min-h-[22rem] rounded-xl border border-border bg-background p-6 shadow-sm sm:p-7">
              {previewScreen === 'question' && (
                <div key="question" className="v5-swap">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Frontend Engineer</span>
                    <span
                      className={`inline-flex items-center gap-1.5 transition-opacity duration-300 ${
                        hasTimeLimit ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-hidden={!hasTimeLimit}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {hasTimeLimit ? `${timeLimitMinutes}:00 left` : ''}
                    </span>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/4 rounded-full bg-primary" />
                  </div>

                  <p className="mt-7 font-heading text-xl font-semibold leading-snug">
                    A teammate&apos;s pull request breaks the build. What do you do first?
                  </p>
                  <ul className="mt-5 space-y-2.5 text-sm">
                    {[
                      'Read the failing test output',
                      'Revert their commit straight away',
                      'Ask in the team channel who broke it',
                    ].map((option, index) => (
                      <li
                        key={option}
                        className={`rounded-lg border px-4 py-3 transition-colors ${
                          index === 0
                            ? 'border-primary bg-primary/5'
                            : 'border-border text-muted-foreground hover:border-foreground/30'
                        }`}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {previewScreen === 'result' && (
                <div key={`result-${isResultShown}`} className="v5-swap flex min-h-[19rem] flex-col justify-center text-center">
                  {isResultShown && (
                    <>
                      <p className="text-sm text-muted-foreground">Your score</p>
                      <p className="v5-number mt-2 font-heading text-6xl font-bold">{SAMPLE_SCORE}%</p>
                      <p
                        className={`mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                          isPassing ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isPassing && <Check className="h-4 w-4" />}
                        {isPassing ? 'Passed' : `Below the ${passMark}% pass mark`}
                      </p>
                      <p className="mx-auto mt-5 max-w-xs text-sm text-muted-foreground">
                        Pass mark {passMark}%. The hiring team will be in touch about next steps.
                      </p>
                    </>
                  )}

                  {!isResultShown && (
                    <>
                      <p className="font-heading text-2xl font-semibold">Thanks, you&apos;re all done.</p>
                      <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                        Your answers have been sent to the hiring team. They&apos;ll be in touch about
                        next steps.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        <ol className="mt-12 grid gap-12 border-t border-border pt-12 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="v5-number font-heading text-5xl font-bold text-primary/25">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Fairness */}
      <section className="mx-auto mt-32 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Fair to every candidate,
          <span className="block text-muted-foreground">and easy to defend.</span>
        </h2>
        <ul className="space-y-6">
          {FAIRNESS_POINTS.map((point) => (
            <li key={point} className="flex gap-4">
              <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="leading-7">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 py-32 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 border-t border-border pt-16 md:flex-row md:items-end">
          <h2 className="max-w-xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Your next hire could start with a short, fair assessment.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={onCandidateClick} className="h-12 rounded-lg px-6 text-sm font-semibold">
              Try it as a candidate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onAdminClick} className="h-12 rounded-lg px-6 text-sm font-semibold">
              Sign in to build
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
