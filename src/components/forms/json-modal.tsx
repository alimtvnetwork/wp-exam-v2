import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { FormModel, FormField } from '@/lib/types/form';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const profileTemplates: Record<string, FormModel> = {
  quiz: {
    title: 'Modern Full-Stack Technical Quiz',
    description: 'Timed assessment testing foundational TypeScript, React, and REST API architecture.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: true,
    isPublished: true,
    settings: {
      passingScore: 75,
      timeLimitSeconds: 600,
      successMessage: 'Congratulations! You passed the technical assessment.',
    },
    fields: [
      {
        id: 'tech-q1',
        type: 'multiple_choice',
        label: 'Which HTTP status code indicates that a resource was successfully created?',
        isRequired: true,
        options: ['200 OK', '201 Created', '204 No Content', '301 Moved Permanently'],
        correctAnswer: '201 Created',
        points: 10,
      },
      {
        id: 'tech-q2',
        type: 'true_false',
        label: 'SQLite databases support full ACID transactions and WAL mode.',
        isRequired: true,
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
      },
      {
        id: 'tech-q3',
        type: 'dropdown',
        label: 'Select the primary advantage of sequential single-question wizard progression:',
        isRequired: true,
        options: ['Reduces cognitive overload', 'Eliminates page scrolling', 'Prevents accidental skips', 'All of the above'],
        correctAnswer: 'All of the above',
        points: 10,
      },
    ],
  },
  employee_signup: {
    title: 'Employee Onboarding & Verification Profile',
    description: 'Complete mandatory onboarding credentials, department routing, and legal verification.',
    formType: 'employee_signup',
    formAccess: 'authenticated',
    isSequential: false,
    isPublished: true,
    settings: {
      successMessage: 'Your onboarding profile has been registered and routed to HR for credentials provisioning.',
    },
    fields: [
      {
        id: 'emp-1',
        type: 'short_answer',
        label: 'Full Legal Name',
        placeholder: 'e.g. Elena Vance',
        isRequired: true,
      },
      {
        id: 'emp-2',
        type: 'email',
        label: 'Company Work Email',
        placeholder: 'e.g. elena.vance@company.org',
        isRequired: true,
      },
      {
        id: 'emp-3',
        type: 'dropdown',
        label: 'Assigned Department / Team',
        options: ['Engineering & Architecture', 'Design & UX', 'Product Management', 'People & HR Operations'],
        isRequired: true,
      },
      {
        id: 'emp-4',
        type: 'file_upload',
        label: 'Upload Signed Employee NDA & Identity Verification (PDF)',
        isRequired: true,
      },
    ],
  },
  survey: {
    title: 'Public Community & Product Experience Survey',
    description: 'Gather respondent feedback and satisfaction ratings on the recent platform release.',
    formType: 'survey',
    formAccess: 'public',
    isSequential: true,
    isPublished: true,
    settings: {
      successMessage: 'Thank you for your valuable feedback! Our team reviews all responses.',
    },
    fields: [
      {
        id: 'surv-1',
        type: 'rating',
        label: 'How would you rate the responsiveness and UI quality of the exam platform (1-5)?',
        isRequired: true,
      },
      {
        id: 'surv-2',
        type: 'multiple_choice',
        label: 'Which device or environment did you use to complete this assessment?',
        options: ['Desktop / Laptop Browser', 'Mobile Smartphone', 'Tablet Device', 'Embedded Iframe'],
        isRequired: true,
      },
      {
        id: 'surv-3',
        type: 'paragraph',
        label: 'What additional features or improvements would you suggest?',
        placeholder: 'Provide open-ended suggestions...',
        isRequired: false,
      },
    ],
  },
};

export const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose }) => {
  const store = useQuizStore();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedRole, setSelectedRole] = useState<'all' | 'subscriber' | 'editor' | 'administrator'>('all');
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  // Filter export according to selected role
  const getFilteredPayload = (): FormModel => {
    let filteredFields = [...store.fields];

    if (selectedRole === 'subscriber') {
      // In subscriber candidate export, strip correct answers to prevent answer leakage
      filteredFields = filteredFields.map((f) => ({
        ...f,
        correctAnswer: undefined,
      }));
    }

    return {
      title: store.title,
      description: store.description,
      formType: store.formType,
      formAccess: store.formAccess,
      isSequential: store.isSequential,
      isPublished: store.isPublished,
      settings: store.settings,
      fields: filteredFields,
    };
  };

  const exportPayload = getFilteredPayload();
  const exportJsonString = JSON.stringify(exportPayload, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJsonString);
      setStatusMessage('JSON copied to clipboard!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage('Failed to copy. Please manually select and copy.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'form'}-${selectedRole}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProfileTemplate = (templateKey: keyof typeof profileTemplates) => {
    const tpl = profileTemplates[templateKey];

    if (!tpl) {
      return;
    }

    store.setTitle(tpl.title);
    store.setDescription(tpl.description);
    store.setFormType(tpl.formType);
    store.setFormAccess(tpl.formAccess);
    store.setIsSequential(tpl.isSequential);
    store.updateSettings(tpl.settings);
    store.setFields(tpl.fields);

    setStatusMessage(`Loaded "${tpl.title}" into the form builder!`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText) as Partial<FormModel>;

      if (!parsed.title && !parsed.fields) {
        setStatusMessage('Error: JSON must contain at least a title or fields array.');
        return;
      }

      if (parsed.title) store.setTitle(parsed.title);
      if (parsed.description) store.setDescription(parsed.description);
      if (parsed.formType) store.setFormType(parsed.formType);
      if (parsed.formAccess) store.setFormAccess(parsed.formAccess);
      if (typeof parsed.isSequential === 'boolean') store.setIsSequential(parsed.isSequential);
      if (parsed.settings) store.updateSettings(parsed.settings);
      if (Array.isArray(parsed.fields)) {
        store.setFields(parsed.fields as FormField[]);
      }

      setStatusMessage('Successfully imported and hydrated form data!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON syntax';
      setStatusMessage(`Parse Error: ${msg}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border shadow-2xl rounded-2xl animate-card-entrance overflow-hidden">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">JSON Questions & Role Profile Engine</CardTitle>
              <CardDescription className="text-xs">
                Import or export questions, options, scoring, and role-based profiles with anti-cheat filters.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={activeTab === 'export' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('export')}
                className="text-xs h-7"
              >
                Export JSON
              </Button>
              <Button
                variant={activeTab === 'import' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('import')}
                className="text-xs h-7"
              >
                Import JSON
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Quick Profile Template Bar */}
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">
              1-Click Role & Profile Templates:
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => loadProfileTemplate('quiz')}
              >
                📋 Technical Quiz
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => loadProfileTemplate('employee_signup')}
              >
                👤 Employee Onboarding
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => loadProfileTemplate('survey')}
              >
                🌐 Public Survey
              </Button>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
              {statusMessage}
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold">Target Audience / Role:</Label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as typeof selectedRole)}
                    className="p-1 border rounded text-xs bg-background font-medium"
                  >
                    <option value="all">All Roles (Full Bundle with Scoring)</option>
                    <option value="subscriber">Subscriber / Candidate (Answers Hidden)</option>
                    <option value="editor">Editor (Authoring Questions & Answers)</option>
                    <option value="administrator">Administrator (Master Archive)</option>
                  </select>
                </div>
                <Badge variant="outline" className="text-xs">
                  {store.fields.length} Questions / Fields
                </Badge>
              </div>

              {selectedRole === 'subscriber' && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                  🔒 Anti-Cheat Active: Correct answers have been stripped from the exported package.
                </div>
              )}

              <Textarea
                readOnly
                value={exportJsonString}
                rows={11}
                className="font-mono text-xs bg-muted/40 p-3 leading-relaxed"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  Copy to Clipboard
                </Button>
                <Button size="sm" onClick={handleDownload} className="bg-primary">
                  Download .json
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium block mb-1">Paste JSON Configuration:</Label>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`{\n  "title": "Technical Exam",\n  "formType": "quiz",\n  "fields": [...]\n}`}
                  rows={11}
                  className="font-mono text-xs bg-muted/40 p-3"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Loads fields directly into the drag-and-drop editor.
                </span>
                <Button size="sm" onClick={handleImport} className="bg-primary">
                  Apply Import
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t bg-muted/10 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
