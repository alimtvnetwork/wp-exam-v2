import React, { useState } from 'react';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import {
  FormField,
  FieldType,
  FormType,
  FormAccessType,
  StringMatchRuleType,
  FieldValidationRule,
  FieldConditionRule,
} from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormRunner } from '@/components/runner/FormRunner';
import { JsonModal } from './json-modal';
import { AiSectionAssistant } from '@/components/admin/ai-section-assistant';
import {
  Link as LinkIcon,
  Code,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Layers,
  Eye,
  Save,
  FileJson,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableFieldItem = ({ id, index }: { id: string; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const { fields, formType, removeField, updateField } = useQuizStore();
  const field = fields.find((f) => f.id === id);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [testInputValue, setTestInputValue] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!field) return null;

  const isChoiceField =
    field.type === 'multiple_choice' ||
    field.type === 'single_choice' ||
    field.type === 'dropdown';

  const isLinkField = field.type === 'link';
  const isRegexField = field.type === 'regex_text';
  const isTextLikeField =
    field.type === 'short_answer' ||
    field.type === 'paragraph' ||
    field.type === 'email' ||
    field.type === 'link' ||
    field.type === 'regex_text';

  const isQuiz = formType === 'quiz';
  const otherFields = fields.filter((f) => f.id !== id);

  // Real-time regex test helper
  const getValidationFeedback = (): { isValid: boolean; message: string } => {
    if (!testInputValue || !field.validationRule) {
      return { isValid: true, message: '' };
    }
    const { ruleType, pattern, errorMessage } = field.validationRule;
    if (!pattern) return { isValid: true, message: '' };

    try {
      if (ruleType === 'starts_with') {
        const matches = testInputValue.startsWith(pattern);
        return {
          isValid: matches,
          message: matches ? '✓ Matches prefix requirement' : errorMessage || `Must start with "${pattern}"`,
        };
      }
      if (ruleType === 'ends_with') {
        const matches = testInputValue.endsWith(pattern);
        return {
          isValid: matches,
          message: matches ? '✓ Matches suffix requirement' : errorMessage || `Must end with "${pattern}"`,
        };
      }
      if (ruleType === 'contains') {
        const matches = testInputValue.includes(pattern);
        return {
          isValid: matches,
          message: matches ? '✓ Contains required text' : errorMessage || `Must contain "${pattern}"`,
        };
      }
      if (ruleType === 'regex') {
        const regex = new RegExp(pattern);
        const matches = regex.test(testInputValue);
        return {
          isValid: matches,
          message: matches ? '✓ Matches regular expression pattern' : errorMessage || 'Invalid format',
        };
      }
      if (ruleType === 'exact') {
        const matches = testInputValue === pattern;
        return {
          isValid: matches,
          message: matches ? '✓ Exact match' : errorMessage || 'Input does not match expected value',
        };
      }
    } catch {
      return { isValid: false, message: 'Invalid regular expression pattern' };
    }
    return { isValid: true, message: '' };
  };

  const testFeedback = getValidationFeedback();

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="border border-border/80 shadow-sm hover:border-primary/50 transition-colors bg-card">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-muted/20 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground"
              title="Drag to reorder"
            >
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.87868 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.87868 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.87868 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.87868 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{index + 1}</span>
              <Badge variant="secondary" className="uppercase text-[10px] tracking-wide font-mono">
                {field.type.replace('_', ' ')}
              </Badge>
              {field.group && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  📁 {field.group}
                </span>
              )}
            </CardTitle>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
              <span>Validation</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConditions(!showConditions)}
            >
              <span>🔀 Branching</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive text-xs h-7 px-2"
              onClick={() => removeField(id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground block mb-1">Field Label / Question</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(id, { label: e.target.value })}
                placeholder="Enter field label or question text..."
                className="font-medium text-sm bg-background"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground block mb-1">Field Type</Label>
              <select
                value={field.type}
                onChange={(e) => updateField(id, { type: e.target.value as FieldType })}
                className="w-full h-9 p-2 border border-input rounded-md text-xs bg-background font-medium"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="single_choice">Single Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
                <option value="paragraph">Paragraph Text</option>
                <option value="email">Email Address</option>
                <option value="phone">Phone Number</option>
                <option value="link">🔗 Link / URL Field</option>
                <option value="regex_text">🔤 Regex Verified Input</option>
                <option value="dropdown">Dropdown Select</option>
                <option value="rating">Rating Scale (1-5)</option>
                <option value="file_upload">File Upload</option>
              </select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground block mb-1">Section / Group</Label>
              <Input
                value={field.group || ''}
                onChange={(e) => updateField(id, { group: e.target.value })}
                placeholder="e.g. Personal Info, Coding"
                className="text-xs h-9 bg-background"
              />
            </div>
          </div>

          {/* Link Field Specific Settings */}
          {isLinkField && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link Field Configuration</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Target Link URL</Label>
                  <Input
                    value={field.url || ''}
                    onChange={(e) => updateField(id, { url: e.target.value })}
                    placeholder="https://company.org/spec"
                    className="text-xs h-8 font-mono bg-background"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Display Text / Anchor Label</Label>
                  <Input
                    value={field.linkText || ''}
                    onChange={(e) => updateField(id, { linkText: e.target.value })}
                    placeholder="View Documentation or Resource"
                    className="text-xs h-8 bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Advanced Validation Rules Drawer */}
          {(showAdvanced || isRegexField) && (
            <div className="p-3 bg-muted/40 rounded-lg border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-primary" />
                  <span>Validation & String Matching Criteria</span>
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
                      updateField(id, {
                        validationRule: {
                          ruleType: e.target.value as StringMatchRuleType,
                          pattern: field.validationRule?.pattern || '',
                          errorMessage: field.validationRule?.errorMessage || '',
                        },
                      })
                    }
                    className="w-full h-8 p-1.5 border border-input rounded text-xs bg-background"
                  >
                    <option value="regex">Regular Expression (regex)</option>
                    <option value="starts_with">Starts With Prefix</option>
                    <option value="ends_with">Ends With Suffix</option>
                    <option value="contains">Contains Substring</option>
                    <option value="exact">Exact Match</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Pattern / Expected Value</Label>
                  <Input
                    value={field.validationRule?.pattern || ''}
                    onChange={(e) =>
                      updateField(id, {
                        validationRule: {
                          ruleType: field.validationRule?.ruleType || 'regex',
                          pattern: e.target.value,
                          errorMessage: field.validationRule?.errorMessage || '',
                        },
                      })
                    }
                    placeholder="^[a-zA-Z0-9_]+$ or https://"
                    className="text-xs h-8 font-mono bg-background"
                  />
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground block mb-1">Custom Error Message</Label>
                  <Input
                    value={field.validationRule?.errorMessage || ''}
                    onChange={(e) =>
                      updateField(id, {
                        validationRule: {
                          ruleType: field.validationRule?.ruleType || 'regex',
                          pattern: field.validationRule?.pattern || '',
                          errorMessage: e.target.value,
                        },
                      })
                    }
                    placeholder="Must match valid pattern format"
                    className="text-xs h-8 bg-background"
                  />
                </div>
              </div>

              {/* In-Builder Realtime Regex Tester */}
              <div className="pt-2 border-t border-border flex items-center gap-3">
                <Label className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                  Test Validator:
                </Label>
                <Input
                  value={testInputValue}
                  onChange={(e) => setTestInputValue(e.target.value)}
                  placeholder="Type a sample value to test matching..."
                  className="text-xs h-7 font-mono flex-1 bg-background"
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
            <div className="p-3 bg-muted/40 rounded-lg border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <span>🔀 Conditional Display & Requirement Logic</span>
                </Label>
                <Badge variant="outline" className="text-[10px]">
                  {field.conditions?.length || 0} Rule(s)
                </Badge>
              </div>

              {otherFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">Add other fields first to establish conditional dependencies.</p>
              ) : (
                <div className="space-y-2">
                  {(field.conditions || []).map((cond, condIdx) => (
                    <div key={condIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-background p-2 rounded border">
                      <div>
                        <Label className="text-[10px] text-muted-foreground block">Action</Label>
                        <select
                          value={cond.action}
                          onChange={(e) => {
                            const newConds = [...(field.conditions || [])];
                            newConds[condIdx].action = e.target.value as 'show' | 'hide' | 'require';
                            updateField(id, { conditions: newConds });
                          }}
                          className="w-full text-xs p-1 border rounded"
                        >
                          <option value="show">Show Field If</option>
                          <option value="hide">Hide Field If</option>
                          <option value="require">Require Field If</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-[10px] text-muted-foreground block">Parent Field</Label>
                        <select
                          value={cond.parentFieldId}
                          onChange={(e) => {
                            const newConds = [...(field.conditions || [])];
                            newConds[condIdx].parentFieldId = e.target.value;
                            updateField(id, { conditions: newConds });
                          }}
                          className="w-full text-xs p-1 border rounded"
                        >
                          {otherFields.map((of) => (
                            <option key={of.id} value={of.id}>
                              {of.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-[10px] text-muted-foreground block">Operator</Label>
                        <select
                          value={cond.operator}
                          onChange={(e) => {
                            const newConds = [...(field.conditions || [])];
                            newConds[condIdx].operator = e.target.value as FieldConditionRule['operator'];
                            updateField(id, { conditions: newConds });
                          }}
                          className="w-full text-xs p-1 border rounded"
                        >
                          <option value="equals">Equals</option>
                          <option value="not_equals">Does Not Equal</option>
                          <option value="contains">Contains</option>
                          <option value="is_not_empty">Is Not Empty</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 pt-3">
                        <Input
                          value={cond.expectedValue}
                          onChange={(e) => {
                            const newConds = [...(field.conditions || [])];
                            newConds[condIdx].expectedValue = e.target.value;
                            updateField(id, { conditions: newConds });
                          }}
                          placeholder="Expected value"
                          className="text-xs h-7 flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            const newConds = field.conditions?.filter((_, i) => i !== condIdx);
                            updateField(id, { conditions: newConds });
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 mt-1 gap-1"
                    onClick={() => {
                      const newRule: FieldConditionRule = {
                        parentFieldId: otherFields[0]?.id || '',
                        operator: 'equals',
                        expectedValue: 'Yes',
                        action: 'show',
                      };
                      updateField(id, { conditions: [...(field.conditions || []), newRule] });
                    }}
                  >
                    + Add Branching Rule
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Standard Field Controls */}
          <div className="flex items-center gap-6 py-1">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={field.isRequired}
                onChange={(e) => updateField(id, { isRequired: e.target.checked })}
                className="rounded"
              />
              <span>Required Field</span>
            </label>

            {isQuiz && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Points:</Label>
                <Input
                  type="number"
                  value={field.points ?? 1}
                  onChange={(e) => updateField(id, { points: Number(e.target.value) || 1 })}
                  className="w-16 h-7 text-xs font-mono"
                  min={1}
                />
              </div>
            )}
          </div>

          {/* Options editor for choice fields */}
          {isChoiceField && (
            <div className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border/80">
              <Label className="text-xs font-semibold">Selectable Options</Label>
              {(field.options || []).map((opt, optIndex) => (
                <div key={optIndex} className="flex gap-2 items-center">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(field.options || [])];
                      newOpts[optIndex] = e.target.value;
                      updateField(id, { options: newOpts });
                    }}
                    placeholder={`Option ${optIndex + 1}`}
                    className="text-xs h-8 bg-background"
                  />
                  {isQuiz && (
                    <Button
                      type="button"
                      variant={field.correctAnswer === opt ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs whitespace-nowrap"
                      onClick={() => updateField(id, { correctAnswer: opt })}
                    >
                      {field.correctAnswer === opt ? '✓ Correct' : 'Mark Correct'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      const newOpts = field.options?.filter((_, i) => i !== optIndex);
                      updateField(id, { options: newOpts });
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 mt-1"
                onClick={() => {
                  updateField(id, { options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] });
                }}
              >
                + Add Option
              </Button>
            </div>
          )}

          {/* True / False specific correct answer */}
          {field.type === 'true_false' && isQuiz && (
            <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg border">
              <Label className="text-xs font-semibold">Correct Answer:</Label>
              <div className="flex gap-2">
                {['True', 'False'].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    variant={field.correctAnswer === val ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => updateField(id, { correctAnswer: val, options: ['True', 'False'] })}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Short answer correct answer for quiz */}
          {field.type === 'short_answer' && isQuiz && (
            <div className="p-3 bg-muted/40 rounded-lg border">
              <Label className="text-xs font-semibold block mb-1">Exact Correct Answer:</Label>
              <Input
                value={field.correctAnswer || ''}
                onChange={(e) => updateField(id, { correctAnswer: e.target.value })}
                placeholder="e.g. HyperText Markup Language"
                className="text-xs h-8 bg-background"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const FormBuilder = () => {
  const {
    title,
    description,
    formType,
    formAccess,
    isSequential,
    settings,
    fields,
    isSaving,
    setTitle,
    setDescription,
    setFormType,
    setFormAccess,
    setIsSequential,
    updateSettings,
    addField,
    setFields,
    saveForm,
    resetForm,
  } = useQuizStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      setFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const handleQuickAdd = (type: FieldType) => {
    const newId = `field-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const defaults: Record<string, Partial<FormField>> = {
      multiple_choice: {
        label: 'Select the best option',
        options: ['Choice A', 'Choice B', 'Choice C'],
        correctAnswer: 'Choice A',
      },
      true_false: {
        label: 'State whether this claim is True or False',
        options: ['True', 'False'],
        correctAnswer: 'True',
      },
      link: {
        label: 'Reference Documentation Link',
        url: 'https://careers.developers-organism.com',
        linkText: 'Open Official Reference',
      },
      regex_text: {
        label: 'Enter Alphanumeric Identification Code',
        placeholder: 'e.g. EMP_8820',
        validationRule: {
          ruleType: 'regex',
          pattern: '^[A-Z]{3}_[0-9]{4}$',
          errorMessage: 'Format must be AAA_0000',
        },
      },
      short_answer: {
        label: 'Provide short response',
      },
      paragraph: {
        label: 'Detailed explanation or commentary',
      },
      email: {
        label: 'Candidate Verified Email Address',
        placeholder: 'candidate@company.org',
      },
      phone: {
        label: 'Candidate Direct WhatsApp Number',
        placeholder: '+880 1700 000000',
      },
      dropdown: {
        label: 'Select Engineering Specialty',
        options: ['Frontend React', 'Backend PHP / Laravel', 'Full-Stack Lead', 'DevOps / QA'],
      },
      rating: {
        label: 'Rate your confidence level in modern TypeScript (1-5)',
      },
      file_upload: {
        label: 'Upload CV / Work Samples (PDF, ZIP)',
      },
    };

    addField({
      id: newId,
      type,
      label: defaults[type]?.label || 'New Field',
      placeholder: defaults[type]?.placeholder || '',
      isRequired: true,
      options: defaults[type]?.options,
      correctAnswer: defaults[type]?.correctAnswer,
      url: defaults[type]?.url,
      linkText: defaults[type]?.linkText,
      validationRule: defaults[type]?.validationRule,
      points: 10,
    });
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving form to WordPress backend...');
      await saveForm();
      setSaveStatus('Form saved successfully!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setSaveStatus(`Saved locally (API simulated: ${message})`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  // Group filter calculation
  const distinctGroups = Array.from(new Set(fields.map((f) => f.group).filter(Boolean))) as string[];
  const displayedFields =
    selectedGroupFilter === 'all'
      ? fields
      : fields.filter((f) => f.group === selectedGroupFilter);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Form & Question Builder</h1>
            <Badge variant="secondary" className="text-xs font-mono">v2.5</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Design multi-stage assessments, link fields, conditional branching, and regex-validated questionnaires.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Instruction Studio Button */}
          <AiSectionAssistant section="builder" title="AI Architect" />

          {/* Compacted JSON Import/Export Actions Menu */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJsonModalOpen(true)}
            className="text-xs h-8 gap-1.5 border-border"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Actions ▾</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs h-8 gap-1.5 border-border"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </Button>

          <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-primary text-xs h-8 gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Form'}</span>
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs text-center font-medium">
          {saveStatus}
        </div>
      )}

      {/* Form Configuration Card */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="py-4 border-b border-border bg-muted/10">
          <CardTitle className="text-base font-semibold">Form Details & Workflow Rules</CardTitle>
          <CardDescription className="text-xs">Configure purpose, access permissions, and scoring rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold block mb-1">Form Purpose / Type</Label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as FormType)}
                className="w-full h-9 p-2 border border-input rounded-md text-xs bg-background font-medium"
              >
                <option value="quiz">Knowledge Quiz (Graded & Scored)</option>
                <option value="employee_signup">Candidate Application / Onboarding</option>
                <option value="survey">Public Survey & Evaluation</option>
                <option value="general_form">General Multi-Step Form</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold block mb-1">Access Control</Label>
              <select
                value={formAccess}
                onChange={(e) => setFormAccess(e.target.value as FormAccessType)}
                className="w-full h-9 p-2 border border-input rounded-md text-xs bg-background"
              >
                <option value="public">Public (Open to All Candidates)</option>
                <option value="authenticated">Authenticated / Token Only</option>
              </select>
            </div>

            <div className="flex flex-col justify-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <Label htmlFor="sequential-toggle" className="text-xs font-semibold cursor-pointer">
                  Sequential Progression
                </Label>
                <Switch
                  id="sequential-toggle"
                  checked={isSequential}
                  onCheckedChange={setIsSequential}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">Presents questions one-at-a-time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <Label className="text-xs font-semibold block mb-1">Form Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter form or quiz title..."
                className="text-sm bg-background"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold block mb-1">Description / Subtitle</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary or instructions..."
                className="text-sm bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fields List Container */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">Fields & Question Sequence</h2>
            <Badge variant="outline" className="font-mono text-xs">{fields.length} items</Badge>
          </div>

          {distinctGroups.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Filter Group:</span>
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="text-xs h-7 px-2 border rounded bg-background"
              >
                <option value="all">All Groups</option>
                {distinctGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayedFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {displayedFields.map((field, index) => (
              <SortableFieldItem key={field.id} id={field.id} index={index} />
            ))}
          </SortableContext>
        </DndContext>

        {displayedFields.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground space-y-2">
            <p className="font-medium text-sm">No fields found for this view.</p>
            <p className="text-xs">Use the toolbar below to add inputs, question types, or link items.</p>
          </div>
        )}

        {/* Quick Add Toolbar */}
        <div className="mt-6 p-4 bg-card rounded-xl border border-border space-y-2.5 shadow-sm" data-testid="quick-add-toolbar">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              + Quick Add Field / Controller Type
            </Label>
            <span className="text-[10px] text-muted-foreground font-mono">12 Field Types Supported</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('multiple_choice')}>
              Multiple Choice
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('true_false')}>
              True / False
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('short_answer')}>
              Short Answer
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('paragraph')}>
              Paragraph
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('link')}>
              🔗 Link / URL
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('regex_text')}>
              🔤 Regex Input
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('email')}>
              Email
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('phone')}>
              Phone
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('dropdown')}>
              Dropdown
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('rating')}>
              Rating
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => handleQuickAdd('file_upload')}>
              File Upload
            </Button>
          </div>
        </div>
      </div>

      {/* JSON Import/Export Modal */}
      <JsonModal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} />

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-card rounded-2xl border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h3 className="text-lg font-bold">Interactive Preview</h3>
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
            <FormRunner
              form={{
                title,
                description,
                formType,
                formAccess,
                isSequential,
                isPublished: true,
                settings,
                fields,
              }}
              onClose={() => setIsPreviewOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
