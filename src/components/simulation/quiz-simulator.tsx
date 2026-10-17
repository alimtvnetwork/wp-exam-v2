import React, { useState, useMemo } from 'react';
import { seedConditionalFixtures } from '@/quiz/store/exam-store';
import {
  getNextStepIndex,
  evaluateConditionRule,
  describeSkippedSteps,
  formatRuleDescription,
} from '@/lib/branching-engine';
import type { FormField, FieldConditionRule } from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getStoryForStep } from './simulation-stories';
import { ArrowRight, RotateCcw, FlaskConical, GitBranch, CircleCheck } from 'lucide-react';

interface QuizSimulatorProps {
  fixtureSlug: string;
}

interface StoryEvent {
  stepIndex: number;
  title: string;
  body: string;
  ruleText: string;
  skippedLabels: string[];
}

const CHOICE_TYPES = new Set(['multiple_choice', 'single_choice', 'true_false', 'boolean', 'dropdown']);
const TEXT_TYPES = new Set(['short_answer', 'text', 'email', 'phone', 'whatsapp', 'link', 'regex_text', 'date']);

function defaultOptionsFor(field: FormField): string[] {
  if (field.options && field.options.length > 0) {
    return field.options;
  }

  if (field.type === 'true_false') {
    return ['True', 'False'];
  }

  if (field.type === 'boolean') {
    return ['Yes', 'No'];
  }

  return [];
}

/**
 * Human-readable explanation of why the run moved from one step to another.
 * Mirrors the evaluation order inside getNextStepIndex so the narration is
 * truthful — never a mock.
 */
function describeTransition(
  fields: FormField[],
  fromIndex: number,
  toIndex: number,
  answers: Record<string, unknown>,
): string {
  const fromField = fields[fromIndex];
  const toField = fields[toIndex];

  if (!fromField) {
    return 'Simulation started.';
  }

  const answer = answers[fromField.id];
  const hasAnswer = answer !== undefined && answer !== null;

  if (hasAnswer && fromField.optionBranching) {
    const answerKey = Array.isArray(answer) ? answer.join(',') : String(answer);
    const targetId = fromField.optionBranching[answerKey];

    if (targetId && toField && toField.id === targetId) {
      return `Answer "${answerKey}" branches directly to "${toField.label || toField.id}".`;
    }
  }

  const jumpRules = (fromField.conditions || []).filter(
    (rule: FieldConditionRule) => rule.action === 'jump_to' && rule.jumpToFieldId,
  );

  for (const rule of jumpRules) {
    const isTargetMatch = toField && rule.jumpToFieldId === toField.id;
    const isRuleMet = evaluateConditionRule(rule, answers);

    if (isTargetMatch && isRuleMet) {
      return formatRuleDescription(rule, fields);
    }
  }

  if (toField && fromField.branchTarget === toField.id) {
    return `Default branch target is "${toField.label || toField.id}".`;
  }

  if (toIndex === fromIndex + 1) {
    return 'No branching rule fired — moved to the next step in order.';
  }

  return 'Moved forward by the visibility rules of the upcoming steps.';
}

function isEmptyValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return value === undefined || value === null || String(value).trim() === '';
}

export const QuizSimulator: React.FC<QuizSimulatorProps> = ({ fixtureSlug }) => {
  const fixture = useMemo(
    () => seedConditionalFixtures.find((entry) => entry.slug === fixtureSlug),
    [fixtureSlug],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [draftText, setDraftText] = useState('');
  const [validationHint, setValidationHint] = useState<string | null>(null);

  if (!fixture) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Unknown simulation fixture: <span className="font-mono">{fixtureSlug}</span>
      </div>
    );
  }

  const fields = fixture.form.fields || [];
  const field = fields[currentStep];
  const isChoiceField = field ? CHOICE_TYPES.has(field.type) : false;
  const isTextField = field ? TEXT_TYPES.has(field.type) || field.type === 'paragraph' : false;

  const toggleOption = (option: string) => {
    setValidationHint(null);

    setSelectedOptions((previous) => {
      const isSelected = previous.includes(option);

      if (isSelected) {
        return previous.filter((item) => item !== option);
      }

      return [...previous, option];
    });
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setVisitedSteps([0]);
    setSkippedSteps([]);
    setStoryEvents([]);
    setIsComplete(false);
    setSelectedOptions([]);
    setDraftText('');
    setValidationHint(null);
  };

  const handleContinue = () => {
    if (!field) {
      return;
    }

    const value: unknown = isChoiceField ? selectedOptions : draftText;

    if (field.isRequired && isEmptyValue(value)) {
      setValidationHint('Please answer this step before continuing.');

      return;
    }

    const newAnswers = { ...answers, [field.id]: value };
    const nextStep = getNextStepIndex(fields, currentStep, newAnswers);

    const newSkipped: number[] = [];

    for (let index = currentStep + 1; index < nextStep; index += 1) {
      const isAlreadyCounted = visitedSteps.includes(index) || skippedSteps.includes(index);

      if (!isAlreadyCounted) {
        newSkipped.push(index);
      }
    }

    const ruleText = describeTransition(fields, currentStep, nextStep, newAnswers);
    const skippedLabels = newSkipped.map((index) => {
      const skippedField = fields[index];
      const label = skippedField ? skippedField.label || skippedField.id : `Step ${index + 1}`;

      return `Skipped "${label}" — ${ruleText}`;
    });

    const story = getStoryForStep(fixtureSlug, nextStep);

    if (story) {
      setStoryEvents((previous) => [
        ...previous,
        {
          stepIndex: nextStep,
          title: story.title,
          body: story.body,
          ruleText,
          skippedLabels,
        },
      ]);
    }

    setAnswers(newAnswers);
    setSkippedSteps((previous) => [...previous, ...newSkipped]);
    setSelectedOptions([]);
    setDraftText('');
    setValidationHint(null);

    if (nextStep >= fields.length) {
      setIsComplete(true);

      return;
    }

    setVisitedSteps((previous) => [...previous, nextStep]);
    setCurrentStep(nextStep);
  };

  const finalSkippedSummary = isComplete ? describeSkippedSteps(fields, answers) : [];
  const latestStory = storyEvents.length > 0 ? storyEvents[storyEvents.length - 1] : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FlaskConical className="w-4 h-4 text-primary" />
          <span>Simulation — {fixture.form.title}</span>
          <Badge variant="outline" className="text-xs font-mono">demo</Badge>
        </div>

        <Button variant="ghost" size="sm" onClick={handleRestart} className="text-xs gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Restart demo
        </Button>
      </div>

      {/* Branch-map strip: visited / current / skipped steps */}
      <div className="flex items-center gap-1.5" role="list" aria-label="Simulation progress">
        {fields.map((stepField, index) => {
          const isVisited = visitedSteps.includes(index);
          const isCurrent = index === currentStep && !isComplete;
          const isSkipped = skippedSteps.includes(index);

          return (
            <div
              key={stepField.id}
              role="listitem"
              title={
                isSkipped
                  ? `"${stepField.label || stepField.id}" — skipped by rule`
                  : stepField.label || stepField.id
              }
              className={`h-2 flex-1 rounded-full transition-opacity duration-200 ${
                isCurrent
                  ? 'bg-primary ring-2 ring-primary/40'
                  : isVisited
                    ? 'bg-primary/70'
                    : isSkipped
                      ? 'bg-muted opacity-40'
                      : 'bg-muted'
              }`}
            />
          );
        })}
      </div>

      {!isComplete && field && (
        <div key={field.id} className="animate-ppt-slide-forward space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-mono text-muted-foreground">
              Step {currentStep + 1} of {fields.length}
            </p>

            <h3 className="text-lg font-bold font-heading text-foreground">{field.label}</h3>

            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>

          {isChoiceField && (
            <div className="flex flex-wrap gap-2">
              {defaultOptionsFor(field).map((option) => {
                const isSelected = selectedOptions.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    aria-pressed={isSelected}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background text-foreground border-border hover:border-primary/60'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {isTextField && field.type === 'paragraph' && (
            <textarea
              value={draftText}
              onChange={(event) => {
                setDraftText(event.target.value);
                setValidationHint(null);
              }}
              placeholder={field.placeholder || 'Type your answer…'}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}

          {isTextField && field.type !== 'paragraph' && (
            <Input
              value={draftText}
              onChange={(event) => {
                setDraftText(event.target.value);
                setValidationHint(null);
              }}
              placeholder={field.placeholder || 'Type your answer…'}
              className="text-sm"
            />
          )}

          {!isChoiceField && !isTextField && (
            <Input
              value={draftText}
              onChange={(event) => {
                setDraftText(event.target.value);
                setValidationHint(null);
              }}
              placeholder="Type your answer…"
              className="text-sm"
            />
          )}

          {validationHint && (
            <p className="text-xs font-medium text-destructive">{validationHint}</p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleContinue} className="gap-1.5 text-sm font-semibold">
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Latest story point: one narrated beat at a time (single focus) */}
      {latestStory && !isComplete && (
        <div
          key={`story-${latestStory.stepIndex}-${storyEvents.length}`}
          className="rounded-2xl border border-primary/25 bg-primary/5 p-5 space-y-2 animate-ppt-slide-forward"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <GitBranch className="w-3.5 h-3.5" />
            <span>What just happened</span>
          </div>

          <h4 className="text-sm font-bold text-foreground">{latestStory.title}</h4>

          <p className="text-sm text-muted-foreground">{latestStory.body}</p>

          <p className="text-xs text-foreground/80 border-l-2 border-primary/50 pl-3">
            Why: {latestStory.ruleText}
          </p>

          {latestStory.skippedLabels.map((label) => (
            <p key={label} className="text-xs text-muted-foreground">
              {label}
            </p>
          ))}
        </div>
      )}

      {isComplete && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 text-center animate-ppt-slide-forward">
          <CircleCheck className="w-8 h-8 text-emerald-500 mx-auto" />

          <h3 className="text-lg font-bold font-heading text-foreground">Simulation complete</h3>

          <p className="text-sm text-muted-foreground">
            You visited {visitedSteps.length} of {fields.length} steps. Answers were kept in this
            demo only — nothing was saved.
          </p>

          {finalSkippedSummary.length > 0 && (
            <div className="text-left rounded-xl bg-muted/40 border border-border/60 p-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Steps skipped by your answers
              </p>

              {finalSkippedSummary.map((label) => (
                <p key={label} className="text-xs text-muted-foreground">
                  {label}
                </p>
              ))}
            </div>
          )}

          <Button onClick={handleRestart} variant="outline" className="gap-1.5 text-sm">
            <RotateCcw className="w-4 h-4" />
            Try different answers
          </Button>
        </div>
      )}
    </div>
  );
};
