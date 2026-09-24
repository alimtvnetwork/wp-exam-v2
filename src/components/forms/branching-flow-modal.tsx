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
  Eye,
  EyeOff,
  Asterisk,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  evaluateFieldVisibility,
  evaluateFieldRequired,
  formatRuleDescription,
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
  const [simulationAnswers, setSimulationAnswers] = useState<Record<string, unknown>>({});

  const handleSimulateAnswer = (fieldId: string, value: unknown) => {
    setSimulationAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleResetSimulation = () => {
    setSimulationAnswers({});
  };

  const conditionalCount = fields.filter(
    (f) => (f.conditions && f.conditions.length > 0) || f.optionBranching
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card text-foreground border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Quiz & Form Branching Architecture Flow</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {fields.length} Questions | {conditionalCount} Conditional
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Overview of all conditional rules, jump targets, and a real-time reactive simulator.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Live Simulator Header */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Play className="w-3.5 h-3.5" />
              <span>Interactive Branching Simulator</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetSimulation}
              className="h-6 text-[11px] gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset State</span>
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Test candidate inputs below to preview which questions appear, hide, or become required in real-time.
          </p>
        </div>

        {/* Question Dependency List */}
        <div className="space-y-3 pt-2">
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
                {/* Field Title & Status Badge */}
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

                {/* Condition Rules Details */}
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

                {/* Outgoing Option Branching */}
                {hasOptionBranching && (
                  <div className="pt-2 space-y-1">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                      Outgoing Choice Routes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(field.optionBranching || {}).map(([opt, targetId]) => {
                        const targetField = fields.find((f) => f.id === targetId);
                        const targetLabel = targetField ? targetField.label : targetId;
                        return (
                          <span
                            key={opt}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono"
                          >
                            <span>"{opt}"</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{targetLabel.slice(0, 24)}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Interactive Answer Simulator Input */}
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
      </DialogContent>
    </Dialog>
  );
};
