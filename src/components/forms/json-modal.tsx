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

export const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose }) => {
  const store = useQuizStore();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedRole, setSelectedRole] = useState('all');
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const exportPayload: FormModel = {
    title: store.title,
    description: store.description,
    formType: store.formType,
    formAccess: store.formAccess,
    isSequential: store.isSequential,
    isPublished: store.isPublished,
    settings: store.settings,
    fields: store.fields,
  };

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
    a.download = `${store.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'form'}.json`;
    a.click();
    URL.revokeObjectURL(url);
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

      setStatusMessage('Successfully imported form data!');
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
              <CardTitle className="text-lg font-bold">JSON Questions & Form Engine</CardTitle>
              <CardDescription className="text-xs">
                Import or export questions, options, scoring, and role-based configurations.
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
          {statusMessage && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
              {statusMessage}
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Role Filter:</Label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="p-1 border rounded text-xs bg-background"
                  >
                    <option value="all">All Roles (Full Bundle)</option>
                    <option value="subscriber">Subscriber / Respondent</option>
                    <option value="editor">Editor</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>
                <Badge variant="outline" className="text-xs">
                  {store.fields.length} Questions / Fields
                </Badge>
              </div>

              <Textarea
                readOnly
                value={exportJsonString}
                rows={12}
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
                  placeholder={`{\n  "title": "My Quiz",\n  "formType": "quiz",\n  "fields": [...]\n}`}
                  rows={12}
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
