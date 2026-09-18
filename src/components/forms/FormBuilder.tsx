import React, { useState } from 'react';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { FormField, FieldType, FormType } from '@/lib/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormRunner } from '@/components/runner/FormRunner';
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!field) return null;

  const isChoiceField =
    field.type === 'multiple_choice' ||
    field.type === 'single_choice' ||
    field.type === 'dropdown';

  const isQuiz = formType === 'quiz';

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="border shadow-sm hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20 border-b">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted text-muted-foreground"
              title="Drag to reorder"
            >
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.87868 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.87868 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.87868 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.87868 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span>#{index + 1}</span>
              <Badge variant="secondary" className="uppercase text-[10px] tracking-wide">
                {field.type.replace('_', ' ')}
              </Badge>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive text-xs h-7 px-2"
              onClick={() => removeField(id)}
            >
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground block mb-1">Field Label / Question</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(id, { label: e.target.value })}
                placeholder="Enter field label or question text..."
                className="font-medium text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground block mb-1">Field Type</Label>
              <select
                value={field.type}
                onChange={(e) => updateField(id, { type: e.target.value as FieldType })}
                className="w-full p-2 border rounded-md text-xs bg-background"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="single_choice">Single Choice</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
                <option value="paragraph">Paragraph Text</option>
                <option value="email">Email Address</option>
                <option value="phone">Phone Number</option>
                <option value="dropdown">Dropdown Select</option>
                <option value="rating">Rating Scale (1-5)</option>
                <option value="file_upload">File Upload</option>
              </select>
            </div>
          </div>

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
                  className="w-16 h-7 text-xs"
                  min={1}
                />
              </div>
            )}
          </div>

          {/* Options editor for choice fields */}
          {isChoiceField && (
            <div className="p-3 bg-muted/40 rounded-lg space-y-2 border">
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
                    className="text-xs h-8"
                  />
                  {isQuiz && (
                    <Button
                      type="button"
                      variant={field.correctAnswer === opt ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs"
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
                className="text-xs h-8"
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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
      employee_signup: {
        label: 'Employee Full Legal Name',
      },
      email: {
        label: 'Official Email Address',
        placeholder: 'employee@company.org',
      },
      phone: {
        label: 'Direct Phone Number',
        placeholder: '+1 (555) 000-0000',
      },
      dropdown: {
        label: 'Select Assigned Department',
        options: ['Engineering', 'Design', 'Product', 'Operations'],
      },
      rating: {
        label: 'Rate your onboarding experience (1-5)',
      },
      file_upload: {
        label: 'Upload Identification / Resume (PDF, DOCX)',
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
      points: 10,
    });
  };

  const handleSave = async () => {
    try {
      setSaveStatus('Saving form to WordPress backend...');
      await saveForm();
      setSaveStatus('Form saved successfully!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setSaveStatus(`Saved locally (API simulated: ${err.message})`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WordPress Form & Quiz Builder</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create sequential quizzes, employee onboarding sign-ups, and public surveys.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
            👁 Live Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-primary">
            {isSaving ? 'Saving...' : '💾 Save Form'}
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm text-center font-medium">
          {saveStatus}
        </div>
      )}

      {/* Form Configuration Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Form Details & Workflow Rules</CardTitle>
          <CardDescription>Configure target audience, submission mode, and grading policy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold block mb-1">Form Purpose / Type</Label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as FormType)}
                className="w-full p-2 border rounded-md text-sm bg-background font-medium"
              >
                <option value="quiz">Knowledge Quiz (Graded & Scored)</option>
                <option value="employee_signup">Employee Sign-Up / Onboarding Form</option>
                <option value="survey">Public Feedback Survey</option>
                <option value="general_form">General Contact Form</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold block mb-1">Access Control</Label>
              <select
                value={formAccess}
                onChange={(e) => setFormAccess(e.target.value as any)}
                className="w-full p-2 border rounded-md text-sm bg-background"
              >
                <option value="public">Public (Open to Guests & Visitors)</option>
                <option value="authenticated">Authenticated Users Only</option>
              </select>
            </div>

            <div className="flex flex-col justify-center gap-1.5 p-2 rounded-lg bg-muted/40 border">
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
              <span className="text-[11px] text-muted-foreground">
                {isSequential ? 'One question/step at a time' : 'All fields on single page'}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground block mb-1">Form Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2026 Engineering Onboarding or CSS Architecture Quiz"
              className="text-lg font-bold"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground block mb-1">Description / Instructions</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or instructions for respondents..."
              rows={2}
            />
          </div>

          {formType === 'quiz' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border">
              <div>
                <Label className="text-xs font-semibold block mb-1">Passing Score Threshold (%)</Label>
                <Input
                  type="number"
                  value={settings?.passingScore ?? 70}
                  onChange={(e) => updateSettings({ passingScore: Number(e.target.value) || 0 })}
                  className="h-8 text-sm"
                  min={1}
                  max={100}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold block mb-1">Time Limit (Seconds, 0 = unlimited)</Label>
                <Input
                  type="number"
                  value={settings?.timeLimitSeconds ?? 600}
                  onChange={(e) => updateSettings({ timeLimitSeconds: Number(e.target.value) || 0 })}
                  className="h-8 text-sm"
                  min={0}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fields List Container */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Fields & Questions</h2>
            <Badge variant="outline">{fields.length} items</Badge>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((field, index) => (
              <SortableFieldItem key={field.id} id={field.id} index={index} />
            ))}
          </SortableContext>
        </DndContext>

        {fields.length === 0 && (
          <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground space-y-2">
            <p className="font-medium text-sm">No fields added yet.</p>
            <p className="text-xs">Use the quick-add toolbar below to add questions or input fields.</p>
          </div>
        )}

        {/* Quick Add Toolbar */}
        <div className="mt-6 p-4 bg-card rounded-xl border space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            + Quick Add Field / Question
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('multiple_choice')}>
              Multiple Choice
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('true_false')}>
              True / False
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('short_answer')}>
              Short Answer
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('paragraph')}>
              Paragraph
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('email')}>
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('phone')}>
              Phone
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('dropdown')}>
              Dropdown
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('rating')}>
              Rating
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickAdd('file_upload')}>
              File Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <div className="flex justify-end mb-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="shadow"
              >
                ✕ Close Preview
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
