import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FormField,
  FieldType,
  StringMatchRuleType,
} from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BranchingRuleEditor } from './branching-rule-editor';
import {
  GripVertical,
  Trash2,
  SlidersHorizontal,
  GitBranch,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  Link as LinkIcon,
  CheckSquare,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface SortableFieldCardProps {
  id: string;
  index: number;
  field: FormField;
  otherFields: FormField[];
  isQuiz: boolean;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const SortableFieldCard: React.FC<SortableFieldCardProps> = ({
  id,
  index,
  field,
  otherFields,
  isQuiz,
  onUpdate,
  onRemove,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [testInputValue, setTestInputValue] = useState('');

  const isChoiceField =
    field.type === 'multiple_choice' ||
    field.type === 'single_choice' ||
    field.type === 'dropdown';
  const isLinkField = field.type === 'link';
  const isRegexField = field.type === 'regex_text';

  // Live validator test
  const getValidationFeedback = (): { isValid: boolean; message: string } => {
    if (!testInputValue || !field.validationRule) {
      return { isValid: true, message: 'Type sample to test validation' };
    }

    const { ruleType, pattern } = field.validationRule;

    if (!pattern) {
      return { isValid: true, message: 'No pattern specified' };
    }

    try {
      if (ruleType === 'regex') {
        const regex = new RegExp(pattern);
        const isMatched = regex.test(testInputValue);

        return isMatched
          ? { isValid: true, message: 'Pattern match successful' }
          : { isValid: false, message: field.validationRule.errorMessage || 'Failed regex check' };
      }

      if (ruleType === 'starts_with') {
        const hasPrefix = testInputValue.startsWith(pattern);

        return hasPrefix
          ? { isValid: true, message: `Starts with "${pattern}"` }
          : { isValid: false, message: `Must start with "${pattern}"` };
      }

      if (ruleType === 'ends_with') {
        const hasSuffix = testInputValue.endsWith(pattern);

        return hasSuffix
          ? { isValid: true, message: `Ends with "${pattern}"` }
          : { isValid: false, message: `Must end with "${pattern}"` };
      }

      if (ruleType === 'contains') {
        const hasSubstring = testInputValue.includes(pattern);

        return hasSubstring
          ? { isValid: true, message: `Contains "${pattern}"` }
          : { isValid: false, message: `Must contain "${pattern}"` };
      }

      if (ruleType === 'exact') {
        const isExact = testInputValue.trim().toLowerCase() === pattern.trim().toLowerCase();

        return isExact
          ? { isValid: true, message: 'Exact match verified' }
          : { isValid: false, message: `Must match "${pattern}" exactly` };
      }
    } catch (err) {
      return { isValid: false, message: `Invalid regex syntax: ${String(err)}` };
    }

    return { isValid: true, message: 'Valid' };
  };

  const testFeedback = getValidationFeedback();

  // Category badge color
  const getBadgeStyle = (type: FieldType) => {
    switch (type) {
      case 'multiple_choice':
      case 'single_choice':
      case 'true_false':
      case 'dropdown':
      case 'rating':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'short_answer':
      case 'paragraph':
      case 'email':
      case 'phone':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'regex_text':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'link':
      case 'file_upload':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/card mb-3.5">
      <Card
        className={`transition-all duration-200 border bg-card ${
          isDragging
            ? 'shadow-2xl ring-2 ring-primary border-primary/80 scale-[1.01] bg-card/95'
            : 'border-border/80 hover:border-primary/40 shadow-xs hover:shadow-md'
        }`}
      >
        {/* Card Header with Drag Affordance and Quick Actions */}
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border/60 bg-muted/15 space-y-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Dedicated Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
              title="Drag to reposition question"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Question Index & Badges */}
            <CardTitle className="text-xs font-semibold flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">
                #{index + 1}
              </span>

              <Badge
                variant="outline"
                className={`uppercase text-[10px] tracking-wide font-mono px-2 py-0.5 ${getBadgeStyle(
                  field.type
                )}`}
              >
                {field.type.replace('_', ' ')}
              </Badge>

              {field.group && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  📁 {field.group}
                </span>
              )}

              {isQuiz && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                  {field.points ?? 1} pt{(field.points ?? 1) > 1 ? 's' : ''}
                </span>
              )}

              {field.conditions && field.conditions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConditions(!showConditions)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 cursor-pointer hover:bg-amber-500/25 font-mono font-medium transition-colors"
                  title="Click to view branching rules"
                >
                  <GitBranch className="w-3 h-3" />
                  {field.conditions.length} Branch Rule(s)
                </button>
              )}

              {field.optionBranching && Object.keys(field.optionBranching).length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConditions(!showConditions)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 cursor-pointer hover:bg-indigo-500/25 font-mono font-medium transition-colors"
                  title="Click to view choice navigation routes"
                >
                  ⚡ Choice Jumps
                </button>
              )}
            </CardTitle>
          </div>

          {/* Action Floater Buttons */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`text-xs h-7 px-2 transition-all ${
                showAdvanced ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="Configure validation and format rules"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`text-xs h-7 px-2 transition-all ${
                showConditions || (field.conditions && field.conditions.length > 0)
                  ? 'bg-primary/15 text-primary font-semibold border border-primary/25'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setShowConditions(!showConditions)}
              title="Configure conditional logic and branching"
            >
              <GitBranch className="w-3.5 h-3.5 mr-1 text-primary" />
              <span className="hidden sm:inline">Branching</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => onDuplicate(id)}
              title="Duplicate this question"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
              onClick={() => onRemove(id)}
              title="Delete this question"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        {/* Card Content & Question Editor */}
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Primary Question / Field Label */}
            <div className="md:col-span-2">
              <Label className="text-xs font-semibold text-foreground block mb-1">
                Question Text / Prompt
              </Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(id, { label: e.target.value })}
                placeholder="Enter field label or question text..."
                className="font-medium text-sm bg-background text-foreground shadow-2xs focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Field Type Selector */}
            <div>
              <Label className="text-xs font-semibold text-foreground block mb-1">Type</Label>
              <select
                value={field.type}
                onChange={(e) => onUpdate(id, { type: e.target.value as FieldType })}
                className="w-full h-9 px-2 border border-input rounded-md text-xs bg-background text-foreground font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
              >
                <optgroup label="Choices & Quizzes">
                  <option value="multiple_choice" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Multiple Choice</option>
                  <option value="single_choice" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Single Choice</option>
                  <option value="true_false" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">True / False</option>
                  <option value="dropdown" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Dropdown Select</option>
                  <option value="rating" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Rating Scale (1-5)</option>
                </optgroup>
                <optgroup label="Text Inputs">
                  <option value="short_answer" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Short Answer</option>
                  <option value="paragraph" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Paragraph Text</option>
                  <option value="email" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Email Address</option>
                  <option value="phone" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">WhatsApp / Phone</option>
                </optgroup>
                <optgroup label="Media & Verification">
                  <option value="regex_text" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">🔤 Regex Verified Input</option>
                  <option value="link" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">🔗 Link / URL Field</option>
                  <option value="file_upload" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">File Upload</option>
                </optgroup>
              </select>
            </div>

            {/* Section / Module Grouping */}
            <div>
              <Label className="text-xs font-semibold text-foreground block mb-1">Module / Group</Label>
              <Input
                value={field.group || ''}
                onChange={(e) => onUpdate(id, { group: e.target.value })}
                placeholder="e.g. Core Skills, Coding"
                className="text-xs h-9 bg-background text-foreground shadow-2xs"
              />
            </div>
          </div>

          {/* Link Field Specific Settings */}
          {isLinkField && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Reference Link Configuration</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Target Link URL</Label>
                  <Input
                    value={field.url || ''}
                    onChange={(e) => onUpdate(id, { url: e.target.value })}
                    placeholder="https://company.org/spec"
                    className="text-xs h-8 font-mono bg-background text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Anchor Label</Label>
                  <Input
                    value={field.linkText || ''}
                    onChange={(e) => onUpdate(id, { linkText: e.target.value })}
                    placeholder="Review Official Guidelines"
                    className="text-xs h-8 bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Validation Rules Drawer */}
          {(showAdvanced || isRegexField) && (
            <div className="p-3.5 bg-muted/30 rounded-lg border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Code className="w-3.5 h-3.5 text-primary" />
                  <span>Validation & Format Verification Rules</span>
                </Label>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {field.validationRule?.ruleType || 'None'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Matching Rule</Label>
                  <select
                    value={field.validationRule?.ruleType || 'regex'}
                    onChange={(e) =>
                      onUpdate(id, {
                        validationRule: {
                          ruleType: e.target.value as StringMatchRuleType,
                          pattern: field.validationRule?.pattern || '',
                          errorMessage: field.validationRule?.errorMessage || '',
                        },
                      })
                    }
                    className="w-full h-8 px-2 border border-input rounded text-xs bg-background text-foreground dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                  >
                    <option value="regex" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Regular Expression (regex)</option>
                    <option value="starts_with" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Starts With Prefix</option>
                    <option value="ends_with" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Ends With Suffix</option>
                    <option value="contains" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Contains Substring</option>
                    <option value="exact" className="bg-popover text-popover-foreground dark:bg-slate-900 dark:text-slate-100">Exact Match</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Pattern / Expected Value</Label>
                  <Input
                    value={field.validationRule?.pattern || ''}
                    onChange={(e) =>
                      onUpdate(id, {
                        validationRule: {
                          ruleType: field.validationRule?.ruleType || 'regex',
                          pattern: e.target.value,
                          errorMessage: field.validationRule?.errorMessage || '',
                        },
                      })
                    }
                    placeholder="^[A-Z]{3}-[0-9]{4}$"
                    className="text-xs h-8 font-mono bg-background text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Custom Error Message</Label>
                  <Input
                    value={field.validationRule?.errorMessage || ''}
                    onChange={(e) =>
                      onUpdate(id, {
                        validationRule: {
                          ruleType: field.validationRule?.ruleType || 'regex',
                          pattern: field.validationRule?.pattern || '',
                          errorMessage: e.target.value,
                        },
                      })
                    }
                    placeholder="Must match valid pattern format"
                    className="text-xs h-8 bg-background text-foreground"
                  />
                </div>
              </div>

              {/* In-Card Realtime Validator Tester */}
              <div className="pt-2 border-t border-border flex items-center gap-3">
                <Label className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                  Live Test Pattern:
                </Label>
                <Input
                  value={testInputValue}
                  onChange={(e) => setTestInputValue(e.target.value)}
                  placeholder="Type sample input to verify regex..."
                  className="text-xs h-7 font-mono flex-1 bg-background text-foreground"
                />
                {testInputValue && (
                  <span
                    className={`text-xs flex items-center gap-1 font-medium ${
                      testFeedback.isValid ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {testFeedback.isValid ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{testFeedback.message}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Conditional Branching Drawer */}
          {showConditions && (
            <BranchingRuleEditor
              field={field}
              otherFields={otherFields}
              onUpdateConditions={(newConditions, matchMode) => {
                onUpdate(id, { conditions: newConditions, conditionMatch: matchMode });
              }}
              onUpdateOptionBranching={(newOptionBranching) => {
                onUpdate(id, { optionBranching: newOptionBranching });
              }}
            />
          )}

          {/* Choice Options Editor */}
          {isChoiceField && (
            <div className="p-3.5 bg-muted/20 rounded-xl space-y-2.5 border border-border/80">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Selectable Options & Answers
                </Label>
                {isQuiz && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Select &apos;Mark Correct&apos; for auto-grading
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {(field.options || []).map((opt, optIndex) => {
                  const isCorrect = field.correctAnswer === opt;

                  return (
                    <div key={optIndex} className="flex gap-2 items-center">
                      <span className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] text-muted-foreground font-bold shrink-0">
                        {String.fromCharCode(65 + optIndex)}
                      </span>

                      <Input
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(field.options || [])];
                          newOpts[optIndex] = e.target.value;
                          onUpdate(id, { options: newOpts });
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                        className="text-xs h-8 bg-background text-foreground flex-1"
                      />

                      {isQuiz && (
                        <Button
                          type="button"
                          variant={isCorrect ? 'default' : 'outline'}
                          size="sm"
                          className={`h-8 text-xs whitespace-nowrap transition-all ${
                            isCorrect
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => onUpdate(id, { correctAnswer: opt })}
                        >
                          {isCorrect ? '✓ Correct Answer' : 'Mark Correct'}
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          const newOpts = field.options?.filter((_, i) => i !== optIndex);
                          onUpdate(id, { options: newOpts });
                        }}
                        title="Delete option"
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 mt-1 text-primary hover:bg-primary/10 border-primary/30"
                onClick={() => {
                  const count = (field.options?.length || 0) + 1;
                  onUpdate(id, {
                    options: [...(field.options || []), `Option ${count}`],
                  });
                }}
              >
                + Add Option
              </Button>
            </div>
          )}

          {/* True / False Specific Correct Answer */}
          {field.type === 'true_false' && isQuiz && (
            <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl border border-border">
              <Label className="text-xs font-semibold text-foreground">Correct Answer:</Label>
              <div className="flex gap-2">
                {['True', 'False'].map((val) => {
                  const isSelected = field.correctAnswer === val;

                  return (
                    <Button
                      key={val}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`h-7 text-xs font-semibold transition-all ${
                        isSelected
                          ? val === 'True'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() =>
                        onUpdate(id, { correctAnswer: val, options: ['True', 'False'] })
                      }
                    >
                      {val}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Answer Exact Key for Quiz */}
          {field.type === 'short_answer' && isQuiz && (
            <div className="p-3 bg-muted/20 rounded-xl border border-border">
              <Label className="text-xs font-semibold text-foreground block mb-1">
                Exact Correct Answer (Auto-Graded):
              </Label>
              <Input
                value={field.correctAnswer || ''}
                onChange={(e) => onUpdate(id, { correctAnswer: e.target.value })}
                placeholder="e.g. React"
                className="text-xs h-8 bg-background text-foreground font-medium"
              />
            </div>
          )}

          {/* Card Footer: Required Toggle & Points */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={field.isRequired}
                onChange={(e) => onUpdate(id, { isRequired: e.target.checked })}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Required Field</span>
            </label>

            {isQuiz && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Scoring Points:</Label>
                <Input
                  type="number"
                  value={field.points ?? 1}
                  onChange={(e) => onUpdate(id, { points: Number(e.target.value) || 1 })}
                  className="w-16 h-7 text-xs font-mono bg-background text-foreground"
                  min={1}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
