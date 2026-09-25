import React, { useState } from 'react';
import { FormField } from '@/lib/types/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Sparkles,
  Copy,
  Check,
  Code,
  FileJson,
  Upload,
  ArrowRight,
  Bot,
  HelpCircle,
} from 'lucide-react';

interface QuestionAiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: FormField;
  questionIndex: number;
  onUpdateQuestion: (updated: Partial<FormField>) => void;
}

export const QuestionAiStudioModal: React.FC<QuestionAiStudioModalProps> = ({
  isOpen,
  onClose,
  question,
  questionIndex,
  onUpdateQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'schema' | 'import'>('prompt');
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);
  const [isCopiedSchema, setIsCopiedSchema] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Generate clear LLM System Instruction Prompt
  const generatedAiPrompt = `You are an expert curriculum architect and psychometric exam question author.
Improve or generate variations for Question #${questionIndex + 1} for an assessment form.

CURRENT QUESTION CONTEXT:
- Type: ${question.type}
- Prompt/Label: "${question.label}"
- Section: "${question.group || 'General'}"
- Required: ${question.isRequired ? 'Yes' : 'No'}
- Points: ${question.points ?? 1}
${question.options && question.options.length > 0 ? `- Options:\n${question.options.map((o, idx) => `  [${String.fromCharCode(65 + idx)}] ${o}`).join('\n')}` : ''}
${question.correctAnswer ? `- Designated Correct Answer: ${Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}` : ''}
${question.placeholder ? `- Input Placeholder: "${question.placeholder}"` : ''}

OUTPUT CONTRACT:
Return ONLY a valid JSON object matching this schema (no surrounding markdown or markdown code blocks):
{
  "label": "Enhanced question text here",
  "type": "${question.type}",
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": "Option A",
  "points": 10,
  "isRequired": true,
  "placeholder": "Descriptive placeholder guidance..."
}`;

  // Current Question JSON
  const currentQuestionJson = JSON.stringify(question, null, 2);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedAiPrompt);
    setIsCopiedPrompt(true);
    toast.success('Copied AI prompt instructions to clipboard!');
    setTimeout(() => setIsCopiedPrompt(false), 2000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(currentQuestionJson);
    setIsCopiedSchema(true);
    toast.success('Copied Question JSON to clipboard!');
    setTimeout(() => setIsCopiedSchema(false), 2000);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);

      if (typeof parsed !== 'object' || parsed === null) {
        toast.error('Invalid JSON: Root must be a JSON object');
        return;
      }

      const updates: Partial<FormField> = {};

      if (typeof parsed.label === 'string') {
        updates.label = parsed.label;
      }

      if (typeof parsed.type === 'string') {
        updates.type = parsed.type;
      }

      if (Array.isArray(parsed.options)) {
        updates.options = parsed.options.map((o: unknown) => String(o));
      }

      if (parsed.correctAnswer !== undefined) {
        updates.correctAnswer = parsed.correctAnswer;
      }

      if (typeof parsed.points === 'number') {
        updates.points = parsed.points;
      }

      if (typeof parsed.isRequired === 'boolean') {
        updates.isRequired = parsed.isRequired;
      }

      if (typeof parsed.placeholder === 'string') {
        updates.placeholder = parsed.placeholder;
      }

      if (typeof parsed.group === 'string') {
        updates.group = parsed.group;
      }

      onUpdateQuestion(updates);
      toast.success(`Successfully applied AI updates to Question #${questionIndex + 1}!`);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`JSON Parse Error: ${message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-3 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>AI Instruction Studio</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Q#{questionIndex + 1}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Generate LLM instructions, inspect question JSON contracts, and import AI-generated schemas.
                </DialogDescription>
              </div>
            </div>

            <Badge variant="secondary" className="capitalize text-[10px] font-mono">
              {question.type.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'prompt' | 'schema' | 'import')} className="w-full space-y-4">
          <TabsList className="grid grid-cols-3 h-8 p-0.5 bg-muted/60 rounded-lg">
            <TabsTrigger
              value="prompt"
              className="text-xs py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 font-medium"
            >
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span>AI Prompt</span>
            </TabsTrigger>
            <TabsTrigger
              value="schema"
              className="text-xs py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 font-medium"
            >
              <Code className="w-3.5 h-3.5 text-sky-400" />
              <span>Current JSON</span>
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="text-xs py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center justify-center gap-1.5 font-medium"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import AI JSON</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: AI Prompt */}
          <TabsContent value="prompt" className="space-y-3 m-0 focus-visible:outline-none">
            <div className="flex items-center justify-between text-xs">
              <Label className="text-xs font-semibold text-foreground">
                Optimized Prompt Instructions for LLM:
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="h-6 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                {isCopiedPrompt ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{isCopiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-72 leading-relaxed custom-scrollbar">
              {generatedAiPrompt}
            </pre>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              Copy and paste this prompt into Claude, ChatGPT, or Gemini, then copy their JSON response into the Import tab.
            </p>
          </TabsContent>

          {/* Tab 2: Current JSON Schema */}
          <TabsContent value="schema" className="space-y-3 m-0 focus-visible:outline-none">
            <div className="flex items-center justify-between text-xs">
              <Label className="text-xs font-semibold text-foreground">
                Current Question State (JSON):
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySchema}
                className="h-6 text-[11px] gap-1 border-primary/30 text-primary hover:bg-primary/10"
              >
                {isCopiedSchema ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{isCopiedSchema ? 'Copied!' : 'Copy JSON'}</span>
              </Button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-72 leading-relaxed custom-scrollbar">
              {currentQuestionJson}
            </pre>
          </TabsContent>

          {/* Tab 3: Import AI JSON */}
          <TabsContent value="import" className="space-y-3 m-0 focus-visible:outline-none">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Paste AI Response JSON:
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Paste the JSON generated by your AI model. Fields matching label, options, correctAnswer, and points will be applied directly.
              </p>
            </div>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={`{\n  "label": "What is the primary function of CSS?",\n  "options": [\n    "Styling and visual formatting",\n    "Database querying",\n    "Server-side routing"\n  ],\n  "correctAnswer": "Styling and visual formatting",\n  "points": 10\n}`}
              rows={8}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary custom-scrollbar resize-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={handleApplyJson}
                disabled={!importJsonText.trim()}
                className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Apply JSON to Question</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-3 border-t border-border/80 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close Studio
          </Button>

          {activeTab !== 'import' && (
            <Button
              type="button"
              size="sm"
              onClick={() => setActiveTab('import')}
              className="text-xs gap-1"
            >
              <span>Go to Import</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
