import React, { useState } from 'react';
import { FormField } from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  GitBranch,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Play,
  RotateCcw,
  Compass,
  Layers,
} from 'lucide-react';
import {
  evaluateFieldVisibility,
  evaluateFieldRequired,
  formatRuleDescription,
  getNextStepIndex,
  rewindStep,
  detectBranchingCycles,
} from '@/lib/branching-engine';

interface BranchingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FormField[];
}

export const BranchingFlowModal: React.FC<BranchingFlowModalProps> = ({
  isOpen,
  onClose,
  fields,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'wizard'>('architecture');
  const [simulationAnswers, setSimulationAnswers] = useState<Record<string, unknown>>({});
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardHistory, setWizardHistory] = useState<number[]>([]);

  const cycleReport = detectBranchingCycles(fields);

  const handleSimulateAnswer = (fieldId: string, value: unknown) => {
    setSimulationAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleResetSimulation = () => {
    setSimulationAnswers({});
    setWizardStep(0);
    setWizardHistory([]);
  };

  const handleWizardNext = () => {
    const nextIndex = getNextStepIndex(fields, wizardStep, simulationAnswers);

    setWizardHistory((prev) => [...prev, wizardStep]);
    setWizardStep(nextIndex);
  };

  const handleWizardPrev = () => {
    const res = rewindStep(fields, { currentStep: wizardStep, history: wizardHistory }, simulationAnswers);

    setWizardStep(res.currentStep);
    setWizardHistory(res.history);
  };

  const conditionalCount = fields.filter(
    (f) => (f.conditions && f.conditions.length > 0) || f.optionBranching
  ).length;

  const currentWizardField = fields[wizardStep];
  const isWizardComplete = wizardStep >= fields.length;
  const hasHistory = wizardHistory.length > 0;
  const isArchitectureView = activeTab === 'architecture';

  const previewNextIndex =
    currentWizardField !== undefined
      ? getNextStepIndex(fields, wizardStep, simulationAnswers)
      : wizardStep + 1;

  const isJumpPredicted = previewNextIndex !== wizardStep + 1;
  const predictedTargetField = fields[previewNextIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card text-foreground border-border">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <span>Branching Architecture & Flow Simulator</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {fields.length} Questions | {conditionalCount} Conditional
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Inspect dependency rules, detect cycles, and test sequential candidate journeys.
                </DialogDescription>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                  isArchitectureView
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wizard')}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                  !isArchitectureView
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Step Simulator</span>
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Cycle Detection Status Banner */}
        {cycleReport.hasCycles ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 flex items-start gap-2.5 text-xs text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Circular Branching Loop Detected</div>
              <p className="text-[11px] opacity-90 mt-0.5">{cycleReport.description}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium text-[11px]">
                Branching Flow Validated: Directed Acyclic Graph (DAG) verified. No circular jump loops detected.
              </span>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-[10px] font-mono">
              DAG Safe
            </Badge>
          </div>
        )}

        {/* Global Reset Bar */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-primary font-medium text-[11px]">
            <Play className="w-3.5 h-3.5" />
            <span>
              Simulated answers: <strong className="font-mono">{Object.keys(simulationAnswers).length}</strong> answered
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetSimulation}
            className="h-6 text-[11px] gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Simulation</span>
          </Button>
        </div>

        {/* TAB 1: Architecture Overview */}
        {isArchitectureView && (
          <div className="space-y-3 pt-1">
            {fields.map((field, index) => {
              const isVisible = evaluateFieldVisibility(field, simulationAnswers, fields);
              const isRequired = evaluateFieldRequired(field, simulationAnswers, fields);
              const hasConditions = Boolean(field.conditions && field.conditions.length > 0);
              const hasOptionBranching = Boolean(
                field.optionBranching && Object.keys(field.optionBranching).length > 0
              );

              return (
                <div
                  key={field.id}
                  className={`rounded-xl border p-3 transition-all ${
                    isVisible
                      ? 'border-border bg-background shadow-xs'
                      : 'border-border/40 bg-muted/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-foreground truncate max-w-[420px]">
                        {field.label}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {field.type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isVisible ? (
                        <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active / Visible
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border border-border text-[10px] gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden by Rule
                        </Badge>
                      )}
                      {isRequired && (
                        <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px]">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Incoming Rules */}
                  {hasConditions && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Incoming Rules ({field.conditions?.length}):
                      </span>
                      <div className="space-y-1">
                        {field.conditions?.map((rule, ruleIdx) => (
                          <div
                            key={ruleIdx}
                            className="flex items-center gap-2 text-xs font-mono rounded bg-muted/40 p-1.5 border border-border/40"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-foreground text-[11px]">
                              {formatRuleDescription(rule, fields)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outgoing Routes */}
                  {hasOptionBranching && (
                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                        Outgoing Choice Routes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(field.optionBranching || {}).map(([opt, targetId]) => {
                          const targetIndex = fields.findIndex((f) => f.id === targetId);
                          const targetField = fields[targetIndex];
                          const targetLabel = targetField ? targetField.label : targetId;
                          const targetNum = targetIndex >= 0 ? targetIndex + 1 : '?';

                          return (
                            <span
                              key={opt}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono"
                            >
                              <span>"{opt}"</span>
                              <ArrowRight className="w-3 h-3" />
                              <span>#{targetNum}: {targetLabel.slice(0, 24)}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inline Simulator Input */}
                  <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Simulate Answer:
                    </span>
                    {field.type === 'true_false' ? (
                      <div className="flex gap-1">
                        {['True', 'False'].map((val) => (
                          <Button
                            key={val}
                            type="button"
                            variant={simulationAnswers[field.id] === val ? 'default' : 'outline'}
                            size="sm"
                            className="h-6 text-[10px] px-2"
                            onClick={() => handleSimulateAnswer(field.id, val)}
                          >
                            {val}
                          </Button>
                        ))}
                      </div>
                    ) : field.options && field.options.length > 0 ? (
                      <select
                        value={String(simulationAnswers[field.id] || '')}
                        onChange={(e) => handleSimulateAnswer(field.id, e.target.value)}
                        className="h-6 px-2 text-[11px] bg-background text-foreground border border-input rounded dark:bg-slate-900 dark:text-slate-100 max-w-[280px]"
                      >
                        <option value="">(No answer selected)</option>
                        {field.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={String(simulationAnswers[field.id] || '')}
                        onChange={(e) => handleSimulateAnswer(field.id, e.target.value)}
                        placeholder="Type test value..."
                        className="h-6 px-2 text-[11px] bg-background text-foreground border border-input rounded dark:bg-slate-900 dark:text-slate-100 max-w-[220px]"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Interactive Step Simulator (Sequential Walkthrough) */}
        {!isArchitectureView && (
          <div className="space-y-4 pt-1">
            {isWizardComplete ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-foreground">
                  Sequential Flow Completed!
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  The candidate reached the end of the form. Total questions traversed in this path: <strong>{wizardHistory.length}</strong>.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetSimulation}
                  className="gap-1.5 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Walkthrough</span>
                </Button>
              </div>
            ) : currentWizardField ? (
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
                {/* Step Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      Step {wizardHistory.length + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Question #{wizardStep + 1} of {fields.length})
                    </span>
                  </div>

                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {currentWizardField.type.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Prompt */}
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {currentWizardField.label}
                  </h3>
                  {currentWizardField.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentWizardField.description}
                    </p>
                  )}
                </div>

                {/* Answer Controls */}
                <div className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2">
                  <span className="text-xs font-medium text-foreground block">
                    Select candidate answer:
                  </span>

                  {currentWizardField.type === 'true_false' ? (
                    <div className="flex gap-2">
                      {['True', 'False'].map((val) => {
                        const isSelected = simulationAnswers[currentWizardField.id] === val;

                        return (
                          <Button
                            key={val}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs px-4"
                            onClick={() => handleSimulateAnswer(currentWizardField.id, val)}
                          >
                            {val}
                          </Button>
                        );
                      })}
                    </div>
                  ) : currentWizardField.options && currentWizardField.options.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentWizardField.options.map((opt) => {
                        const isSelected = simulationAnswers[currentWizardField.id] === opt;

                        return (
                          <Button
                            key={opt}
                            type="button"
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            className="justify-start text-xs h-9 px-3 truncate"
                            onClick={() => handleSimulateAnswer(currentWizardField.id, opt)}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={String(simulationAnswers[currentWizardField.id] || '')}
                      onChange={(e) => handleSimulateAnswer(currentWizardField.id, e.target.value)}
                      placeholder="Type simulated candidate answer..."
                      className="w-full h-8 px-3 text-xs bg-background text-foreground border border-input rounded-md"
                    />
                  )}
                </div>

                {/* Predicted Next Destination Notification */}
                {isJumpPredicted && predictedTargetField && (
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center gap-2 text-xs text-indigo-400 font-mono">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      ⚡ Jump rule will route candidate directly to #{previewNextIndex + 1}: "{predictedTargetField.label.slice(0, 36)}"
                    </span>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasHistory}
                    onClick={handleWizardPrev}
                    className="gap-1.5 text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Step</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleWizardNext}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <span>{previewNextIndex >= fields.length ? 'Complete Flow' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
