import React from 'react';
import { FormField, FieldConditionRule } from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  EyeOff,
  Asterisk,
  GitBranch,
  Trash2,
  Plus,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { formatRuleDescription } from '@/lib/branching-engine';

interface BranchingRuleEditorProps {
  field: FormField;
  otherFields: FormField[];
  allFields?: FormField[];
  onUpdateConditions: (conditions: FieldConditionRule[], matchMode?: 'all' | 'any') => void;
  onUpdateOptionBranching?: (optionBranching: Record<string, string>) => void;
}

export const BranchingRuleEditor: React.FC<BranchingRuleEditorProps> = ({
  field,
  otherFields,
  allFields,
  onUpdateConditions,
  onUpdateOptionBranching,
}) => {
  const effectiveAllFields = allFields && allFields.length > 0 ? allFields : [field, ...otherFields];
  const currentFieldIndex = effectiveAllFields.findIndex((f) => f.id === field.id);
  const currentQuestionNumber = currentFieldIndex >= 0 ? currentFieldIndex + 1 : 1;

  const getQuestionNumber = (fieldId: string): number => {
    const idx = effectiveAllFields.findIndex((f) => f.id === fieldId);

    return idx >= 0 ? idx + 1 : 1;
  };

  const conditions = field.conditions || [];
  const conditionMatch = field.conditionMatch || 'all';
  const hasConditions = conditions.length > 0;
  const isChoiceField =
    field.type === 'multiple_choice' ||
    field.type === 'single_choice' ||
    field.type === 'dropdown' ||
    field.type === 'true_false';

  const handleAddCondition = () => {
    const firstOther = otherFields[0];
    const defaultExpected =
      firstOther?.type === 'true_false'
        ? 'True'
        : firstOther?.options && firstOther.options.length > 0
        ? firstOther.options[0]
        : 'Yes';

    const newRule: FieldConditionRule = {
      parentFieldId: firstOther?.id || '',
      operator: 'equals',
      expectedValue: defaultExpected,
      action: 'show',
    };

    onUpdateConditions([...conditions, newRule], conditionMatch);
  };

  const handleUpdateRule = (index: number, updated: Partial<FieldConditionRule>) => {
    const newConditions = conditions.map((rule, idx) => {
      if (idx === index) {
        const merged = { ...rule, ...updated };

        // Auto-adjust default expected value if parent field changed
        if (updated.parentFieldId && updated.parentFieldId !== rule.parentFieldId) {
          const parent = otherFields.find((f) => f.id === updated.parentFieldId);
          if (parent?.type === 'true_false') {
            merged.expectedValue = 'True';
          } else if (parent?.options && parent.options.length > 0) {
            merged.expectedValue = parent.options[0];
          } else {
            merged.expectedValue = '';
          }
        }

        return merged;
      }
      return rule;
    });

    onUpdateConditions(newConditions, conditionMatch);
  };

  const handleRemoveRule = (index: number) => {
    const newConditions = conditions.filter((_, idx) => idx !== index);
    onUpdateConditions(newConditions, conditionMatch);
  };

  const handleToggleMatchMode = (mode: 'all' | 'any') => {
    onUpdateConditions(conditions, mode);
  };

  const handleOptionBranchChange = (optionValue: string, targetId: string) => {
    if (!onUpdateOptionBranching) return;

    const currentBranching = { ...(field.optionBranching || {}) };

    if (!targetId || targetId === '__next__') {
      delete currentBranching[optionValue];
    } else {
      currentBranching[optionValue] = targetId;
    }

    onUpdateOptionBranching(currentBranching);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-xs">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>Conditional Branching & Logic</span>
              <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">
                {conditions.length} Active Rule(s)
              </Badge>
            </h4>
            <p className="text-xs text-muted-foreground">
              Dynamically display, hide, or require this question based on candidate answers.
            </p>
          </div>
        </div>

        {/* AND / OR Match Mode Toggle (when 2+ rules exist) */}
        {conditions.length >= 2 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1 text-xs">
            <span className="text-xs font-medium text-muted-foreground px-1">Logic:</span>
            <button
              type="button"
              onClick={() => handleToggleMatchMode('all')}
              className={`rounded px-2 py-0.5 text-xs font-semibold transition-all ${
                conditionMatch === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ALL (AND)
            </button>
            <button
              type="button"
              onClick={() => handleToggleMatchMode('any')}
              className={`rounded px-2 py-0.5 text-xs font-semibold transition-all ${
                conditionMatch === 'any'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ANY (OR)
            </button>
          </div>
        )}
      </div>

      {/* No Other Fields Warning */}
      {otherFields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-center">
          <HelpCircle className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground" />
          <p className="text-xs font-medium text-foreground">No other questions available</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add at least one other question to establish conditional dependencies.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Rules List */}
          {conditions.map((rule, ruleIdx) => {
            const parentField = otherFields.find((f) => f.id === rule.parentFieldId);
            const isParentTrueFalse = parentField?.type === 'true_false';
            const hasParentOptions = Boolean(parentField?.options && parentField.options.length > 0);
            const isValuelessOp = rule.operator === 'is_not_empty' || rule.operator === 'is_empty';
            const isJumpAction = rule.action === 'jump_to';

            return (
              <div
                key={ruleIdx}
                className="relative rounded-xl border border-border/80 bg-background/80 p-3 shadow-xs transition-all hover:border-primary/40 space-y-2.5"
              >
                {/* Rule Header Bar */}
                <div className="flex items-center justify-between text-xs pb-1 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      Rule #{ruleIdx + 1}
                    </span>
                    {rule.action === 'show' && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-medium gap-1">
                        <Eye className="w-3 h-3" /> Show Field
                      </Badge>
                    )}
                    {rule.action === 'hide' && (
                      <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-medium gap-1">
                        <EyeOff className="w-3 h-3" /> Hide Field
                      </Badge>
                    )}
                    {rule.action === 'require' && (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-medium gap-1">
                        <Asterisk className="w-3 h-3" /> Require Field
                      </Badge>
                    )}
                    {rule.action === 'jump_to' && (
                      <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-medium gap-1">
                        <GitBranch className="w-3 h-3" /> Jump Navigation
                      </Badge>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemoveRule(ruleIdx)}
                    title="Delete rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Main 4-Column Rule Configuration Grid */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 items-end">
                  {/* Action Selector */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Action
                    </Label>
                    <select
                      value={rule.action}
                      onChange={(e) =>
                        handleUpdateRule(ruleIdx, {
                          action: e.target.value as FieldConditionRule['action'],
                        })
                      }
                      className="w-full h-8 px-2 py-1 text-xs font-medium bg-background text-foreground border border-input rounded-md shadow-xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                    >
                      <option value="show" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Show Field If
                      </option>
                      <option value="hide" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Hide Field If
                      </option>
                      <option value="require" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Require Field If
                      </option>
                      <option value="jump_to" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Jump to Question If
                      </option>
                    </select>
                  </div>

                  {/* Parent Field Selector */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Parent Question
                    </Label>
                    <select
                      value={rule.parentFieldId}
                      onChange={(e) => handleUpdateRule(ruleIdx, { parentFieldId: e.target.value })}
                      className="w-full h-8 px-2 py-1 text-xs font-medium bg-background text-foreground border border-input rounded-md shadow-xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 truncate"
                    >
                      {otherFields.map((of) => {
                        const qNum = getQuestionNumber(of.id);
                        const isPreceding = qNum < currentQuestionNumber;
                        const timingBadge = isPreceding ? ' (Earlier)' : ' (Later)';
                        const truncatedLabel =
                          of.label.length > 30 ? of.label.slice(0, 30) + '...' : of.label;

                        return (
                          <option
                            key={of.id}
                            value={of.id}
                            className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100"
                          >
                            #{qNum}: {truncatedLabel || of.id}{timingBadge}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Operator Selector */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Operator
                    </Label>
                    <select
                      value={rule.operator}
                      onChange={(e) =>
                        handleUpdateRule(ruleIdx, {
                          operator: e.target.value as FieldConditionRule['operator'],
                        })
                      }
                      className="w-full h-8 px-2 py-1 text-xs font-medium bg-background text-foreground border border-input rounded-md shadow-xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                    >
                      <option value="equals" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Equals (=)
                      </option>
                      <option value="not_equals" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Does Not Equal (≠)
                      </option>
                      <option value="contains" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Contains
                      </option>
                      <option value="is_not_empty" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Is Answered (Not Empty)
                      </option>
                      <option value="is_empty" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Is Left Empty
                      </option>
                      <option value="greater_than" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Greater Than (&gt;)
                      </option>
                      <option value="less_than" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        Less Than (&lt;)
                      </option>
                      <option value="greater_than_or_equal" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        At Least (≥)
                      </option>
                      <option value="less_than_or_equal" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">
                        At Most (≤)
                      </option>
                    </select>
                  </div>

                  {/* Smart Expected Value Selector */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Expected Value
                    </Label>
                    {isValuelessOp ? (
                      <div className="h-8 px-2.5 flex items-center rounded-md border border-border bg-muted/40 text-xs text-muted-foreground italic">
                        No value needed
                      </div>
                    ) : isParentTrueFalse ? (
                      <div className="flex gap-1 h-8">
                        {['True', 'False'].map((val) => {
                          const isSelected =
                            String(rule.expectedValue).toLowerCase() === val.toLowerCase();
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleUpdateRule(ruleIdx, { expectedValue: val })}
                              className={`flex-1 text-xs font-medium rounded border transition-all ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground border-primary font-bold'
                                  : 'bg-background text-muted-foreground border-input hover:text-foreground dark:bg-slate-900'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    ) : hasParentOptions && parentField?.options ? (
                      <select
                        value={rule.expectedValue}
                        onChange={(e) => handleUpdateRule(ruleIdx, { expectedValue: e.target.value })}
                        className="w-full h-8 px-2 py-1 text-xs font-medium bg-background text-foreground border border-input rounded-md shadow-xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 truncate"
                      >
                        {parentField.options.map((opt, optIdx) => (
                          <option
                            key={optIdx}
                            value={opt}
                            className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100"
                          >
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={rule.expectedValue}
                        onChange={(e) => handleUpdateRule(ruleIdx, { expectedValue: e.target.value })}
                        placeholder="e.g. Yes, Completed"
                        className="h-8 text-xs bg-background text-foreground border-input dark:bg-slate-900 dark:text-slate-100"
                      />
                    )}
                  </div>
                </div>

                {/* Additional Target Question Selector for jump_to Action */}
                {isJumpAction && (
                  <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                    <Label className="text-xs font-medium text-indigo-400 whitespace-nowrap flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" /> Jump Target:
                    </Label>
                    <select
                      value={rule.jumpToFieldId || ''}
                      onChange={(e) => handleUpdateRule(ruleIdx, { jumpToFieldId: e.target.value })}
                      className="flex-1 h-8 px-2 text-xs bg-background text-foreground border border-input rounded-md dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="">Select Target Question to Jump to...</option>
                      {otherFields.map((of) => {
                        const qNum = getQuestionNumber(of.id);
                        const isPreceding = qNum < currentQuestionNumber;
                        const directionLabel = isPreceding ? ' (Loops backward)' : ' (Forward)';

                        return (
                          <option key={of.id} value={of.id}>
                            #{qNum}: {of.label}{directionLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Human-Readable Natural Language Rule Summary */}
                <div className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs font-mono text-muted-foreground flex items-center gap-1.5 border border-border/40">
                  <Sparkles className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">
                    {formatRuleDescription(rule, effectiveAllFields)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add Rule Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-8 border-dashed border-primary/40 text-primary hover:bg-primary/5 hover:border-primary gap-1.5"
            onClick={handleAddCondition}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Branching Condition Rule</span>
          </Button>
        </div>
      )}

      {/* Option-Level Navigation Branching for Choice & True/False fields */}
      {isChoiceField && onUpdateOptionBranching && (
        <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
              <span>Direct Option Branching (Choice Navigation)</span>
            </Label>
            <Badge variant="outline" className="text-xs">
              Optional Jumps
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure target questions when a candidate selects a specific option.
          </p>

          <div className="space-y-1.5 pt-1">
            {(field.type === 'true_false' ? ['True', 'False'] : field.options || []).map(
              (opt, optIdx) => {
                const currentTarget = field.optionBranching?.[opt] || '__next__';

                return (
                  <div
                    key={optIdx}
                    className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 rounded-lg bg-muted/20 border border-border/60 text-xs"
                  >
                    <div className="font-medium text-foreground truncate max-w-[200px]">
                      Option: <span className="font-mono text-primary font-bold">"{opt}"</span>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        ➔ Route to:
                      </span>
                      <select
                        value={currentTarget}
                        onChange={(e) => handleOptionBranchChange(opt, e.target.value)}
                        className="h-7 px-2 text-xs bg-background text-foreground border border-input rounded-md dark:bg-slate-900 dark:text-slate-100 max-w-[260px] truncate"
                      >
                        <option value="__next__">Default (Next Question)</option>
                        {otherFields.map((of) => {
                          const qNum = getQuestionNumber(of.id);
                          const isPreceding = qNum < currentQuestionNumber;
                          const dirLabel = isPreceding ? ' (Loops backward)' : '';

                          return (
                            <option key={of.id} value={of.id}>
                              Jump to #{qNum}: {of.label.slice(0, 32)}{dirLabel}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};
