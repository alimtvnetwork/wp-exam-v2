import React, { useState } from 'react';
import { Bot, Copy, Check, Sparkles, CheckCircle2, AlertCircle, FileCode, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const AIInstructionStudio: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedPromptType, setSelectedPromptType] = useState<'onboarding' | 'exam' | 'screenshot'>('onboarding');
  const [testJsonInput, setTestJsonInput] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const getSystemPrompt = () => {
    if (selectedPromptType === 'onboarding') {
      return `You are an expert instructional designer and exam creator for WP Exam.
Given the company documentation or reading material, construct a comprehensive 3-stage onboarding curriculum in JSON.

SCHEMA CONTRACT:
{
  "project_id": "proj_unique_slug",
  "title": "Module Title",
  "description": "Short summary",
  "pipeline_order": ["sec_reading", "sec_checklist", "sec_quiz"],
  "sections": [
    {
      "id": "sec_reading",
      "title": "1. Essential Documentation",
      "content_type": "reading",
      "reading_content": "Markdown text summarizing the 10-page document...",
      "video_url": "https://..."
    },
    {
      "id": "sec_checklist",
      "title": "2. Verification Checklist",
      "content_type": "checklist",
      "checklist": [
        { "id": "c1", "label": "Action item completed", "is_required": true }
      ]
    },
    {
      "id": "sec_quiz",
      "title": "3. Focus Quiz",
      "content_type": "quiz",
      "questions": [
        {
          "id": "q1",
          "type": "mcq",
          "title": "**What** is the primary guideline?",
          "subtitle": "Select one",
          "options": ["Option A", "Option B", "Option C"],
          "correctAnswer": "Option A",
          "hint": "Refer back to section 1",
          "points": 10
        }
      ]
    }
  ]
}

Ensure all JSON is syntactically valid with zero markdown codeblock wrappers.`;
    }

    if (selectedPromptType === 'screenshot') {
      return `You are a visual design to JSON compiler for WP Exam.
Analyze the provided screenshot of the quiz/survey UI.
Extract the question title (highlighting primary keywords with **bold** syntax), subtitle instructions, option labels, icons/emojis, and layout (1-column or 2-column).

SCHEMA CONTRACT:
{
  "title": "Extracted Screen Title",
  "subtitle": "Select all that apply / Select one",
  "layout": "1-column" | "2-column",
  "type": "mcq" | "multiselect",
  "options": [
    { "label": "Option Label", "icon": "💬" }
  ],
  "correctAnswer": ["Option Label"]
}`;
    }

    return `You are an assessment author for WP Exam.
Generate a rigorous 10-question technical quiz covering the provided topic.
Include multiple choice questions, multi-select questions, and mind-map / URL submission questions with verification rules.
Provide helpful hints and anti-cheat scoring rules.`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getSystemPrompt());
    setCopied(true);
    toast.success('Prompt copied to clipboard! Paste it into ChatGPT, Claude, or Gemini.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleValidateJson = () => {
    if (!testJsonInput.trim()) {
      toast.error('Please paste JSON to validate.');
      return;
    }

    try {
      const parsed = JSON.parse(testJsonInput);
      if (!parsed.title) {
        setValidationResult({
          isValid: false,
          message: 'Validation Failed: Root object must have a "title" string.',
        });
        return;
      }
      setValidationResult({
        isValid: true,
        message: `Valid JSON structure! Detected "${parsed.title}" with ${
          Array.isArray(parsed.sections) ? parsed.sections.length : 0
        } sections.`,
      });
      toast.success('JSON is valid and ready for import!');
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      setValidationResult({
        isValid: false,
        message: 'Syntax Error in JSON: ' + errMsg,
      });
      toast.error('Invalid JSON syntax.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            AI Instruction & Prompt Studio
          </h2>
          <p className="text-sm text-slate-400">
            Generate instructions for external AI models (ChatGPT, Claude, Gemini) to automatically create projects, curriculum, and quizzes from plain documents or screenshots.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={selectedPromptType === 'onboarding' ? 'default' : 'outline'}
          onClick={() => setSelectedPromptType('onboarding')}
          className={selectedPromptType === 'onboarding' ? 'bg-indigo-600 text-white' : 'border-slate-800 text-slate-300'}
        >
          Curriculum & Onboarding Prompt
        </Button>
        <Button
          size="sm"
          variant={selectedPromptType === 'screenshot' ? 'default' : 'outline'}
          onClick={() => setSelectedPromptType('screenshot')}
          className={selectedPromptType === 'screenshot' ? 'bg-indigo-600 text-white' : 'border-slate-800 text-slate-300'}
        >
          Screenshot to Focus UI Prompt
        </Button>
        <Button
          size="sm"
          variant={selectedPromptType === 'exam' ? 'default' : 'outline'}
          onClick={() => setSelectedPromptType('exam')}
          className={selectedPromptType === 'exam' ? 'bg-indigo-600 text-white' : 'border-slate-800 text-slate-300'}
        >
          Technical Exam Prompt
        </Button>
      </div>

      {/* Prompt Display Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Target AI System Prompt & Schema Contract</span>
          </div>

          <Button
            size="sm"
            onClick={handleCopyPrompt}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied!' : 'Copy AI Prompt'}
          </Button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
          {getSystemPrompt()}
        </pre>
      </div>

      {/* Interactive JSON Validation Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            Test & Validate AI-Generated JSON
          </h3>
          <Button size="sm" onClick={handleValidateJson} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">
            Validate JSON
          </Button>
        </div>

        <Textarea
          placeholder="Paste JSON received from your AI model here to test its schema conformance..."
          rows={6}
          value={testJsonInput}
          onChange={(e) => setTestJsonInput(e.target.value)}
          className="p-3.5 bg-slate-950 border-slate-800 text-xs font-mono text-slate-200"
        />

        {validationResult && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              validationResult.isValid
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            {validationResult.isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{validationResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
