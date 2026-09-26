import React, { useState } from 'react';
import { Sparkles, Copy, Check, BookOpen, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export type SectionType = 'builder' | 'projects' | 'email' | 'invites' | 'runner';

interface AiSectionAssistantProps {
  section: SectionType;
  title?: string;
}

interface PromptConfig {
  sectionName: string;
  badge: string;
  description: string;
  sampleJson: string;
  systemPrompt: string;
}

const SECTION_PROMPTS: Record<SectionType, PromptConfig> = {
  builder: {
    sectionName: 'Form & Quiz Builder',
    badge: 'Universal Schema v2.5',
    description: 'Guidelines and JSON format for generating multi-step forms, knowledge evaluations, link fields, and conditional branching.',
    sampleJson: `{
  "title": "Software Engineering Candidate Assessment",
  "description": "Comprehensive evaluation covering frontend fundamentals and problem-solving.",
  "formType": "quiz",
  "formAccess": "public",
  "isSequential": true,
  "settings": {
    "timeLimitSeconds": 1800,
    "passingScore": 75,
    "successMessage": "Assessment completed! Results sent to your registered email."
  },
  "fields": [
    {
      "id": "field_name",
      "type": "short_answer",
      "label": "Candidate Full Name",
      "isRequired": true,
      "group": "Personal Information"
    },
    {
      "id": "field_portfolio",
      "type": "link",
      "label": "GitHub or Portfolio URL",
      "placeholder": "https://github.com/username",
      "isRequired": true,
      "group": "Personal Information",
      "validationRule": {
        "ruleType": "starts_with",
        "pattern": "https://",
        "errorMessage": "URL must begin with https://"
      }
    },
    {
      "id": "field_experience",
      "type": "single_choice",
      "label": "Do you have commercial TypeScript experience?",
      "isRequired": true,
      "options": ["Yes", "No"],
      "group": "Technical Experience"
    },
    {
      "id": "field_years",
      "type": "short_answer",
      "label": "Years of TypeScript Experience",
      "isRequired": false,
      "group": "Technical Experience",
      "validationRule": {
        "ruleType": "regex",
        "pattern": "^[0-9]+$",
        "errorMessage": "Please enter a valid numeric value"
      },
      "conditions": [
        {
          "parentFieldId": "field_experience",
          "operator": "equals",
          "expectedValue": "Yes",
          "action": "show"
        }
      ]
    }
  ]
}`,
    systemPrompt: `You are an expert Curriculum and Form Architect for WP Exam.
When asked to author an exam or candidate questionnaire, generate ONLY a valid JSON payload matching this exact schema:

Supported Field Types:
- multiple_choice (options array required, correctAnswer or correctAnswers array required for quiz)
- single_choice (options array required)
- true_false (options: ["True", "False"])
- short_answer, paragraph, email, phone, dropdown, rating, file_upload
- link (url validation, placeholder)
- regex_text (validationRule with ruleType: "regex"|"starts_with"|"ends_with"|"contains")

Conditional Logic:
Fields can have 'conditions' array referencing a parentFieldId with operator ("equals"|"not_equals") and action ("show"|"hide"|"require").

Output format: Return ONLY the JSON object without markdown formatting or commentary so it can be imported directly into the builder.`,
  },

  projects: {
    sectionName: 'Project & Curriculum Hierarchy',
    badge: '4-Tier Learning Tree',
    description: 'Instructions to structure 4-tier educational frameworks: Category -> Project -> Section -> Question.',
    sampleJson: `{
  "category": "Web Engineering",
  "project_title": "Full-Stack React & PHP Architect",
  "description": "Curriculum covering modern component design, REST APIs, and SQLite Split-DB.",
  "sections": [
    {
      "id": "sec_01",
      "title": "Phase 1: Architecture & Theme Variables",
      "content_type": "reading",
      "reading_content": "Study the 02-spec/07-design-system specifications before proceeding."
    },
    {
      "id": "sec_02",
      "title": "Phase 2: Coding Verification Checklist",
      "content_type": "checklist",
      "checklist": [
        { "id": "chk_1", "label": "No explicit == true boolean checks", "is_required": true },
        { "id": "chk_2", "label": "Monospace fonts use Ubuntu Mono", "is_required": true }
      ]
    },
    {
      "id": "sec_03",
      "title": "Phase 3: Final Knowledge Evaluation",
      "content_type": "quiz",
      "questions": []
    }
  ]
}`,
    systemPrompt: `You are an AI Instructional Designer for the WP Exam 4-tier curriculum engine.
Design learning paths structured into logical sequential phases:
1. Reading & Theory (markdown content)
2. Practical Milestones (interactive checklists)
3. Knowledge Gates (timed quizzes with score thresholds)

Output strict, clean JSON following the category-project-section specification.`,
  },

  email: {
    sectionName: 'Automated Email Gateway',
    badge: 'SMTP & Dispatch Templates',
    description: 'Guidelines to generate high-converting candidate invitations, score certificates, and automated delivery templates.',
    sampleJson: `{
  "template_type": "candidate_invitation",
  "subject": "Invitation: Complete your {{quiz_title}} Assessment",
  "placeholders_available": [
    "{{user_name}}",
    "{{quiz_title}}",
    "{{invite_url}}",
    "{{time_limit}}",
    "{{passing_score}}"
  ],
  "html_body": "<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'><h2>Hello {{user_name}},</h2><p>You have been invited to complete the <strong>{{quiz_title}}</strong> evaluation.</p><p><a href='{{invite_url}}' style='display:inline-block; padding: 12px 24px; background: #5C45FD; color: #FFF; text-decoration: none; border-radius: 8px;'>Begin Assessment &rarr;</a></p><p>Time limit: {{time_limit}} minutes | Passing score: {{passing_score}}%</p></div>"
}`,
    systemPrompt: `You are an Email Communication Specialist for WP Exam candidate notifications.
Author responsive, high-contrast HTML emails using standard inline CSS.
Always include dynamic placeholders:
- {{user_name}}
- {{quiz_title}}
- {{invite_url}}
- {{score_percent}}
- {{status}}

Ensure templates render cleanly in Outlook, Gmail, and Apple Mail without external stylesheet dependencies.`,
  },

  invites: {
    sectionName: 'User Invitations & Role Tokens',
    badge: 'RBAC Access Engine',
    description: 'Instructions for setting up secure role-based candidate invitations and single-use evaluation tokens.',
    sampleJson: `{
  "role_assignments": [
    { "role": "Subscriber (Respondent)", "access": "Single-attempt candidate exam" },
    { "role": "Contributor", "access": "Draft reviewer and question author" },
    { "role": "Instructor / Evaluator", "access": "Manual grading and feedback" }
  ]
}`,
    systemPrompt: `You are a Security & Assessment Coordinator.
Generate structured candidate invitation manifests with explicit role scoping and expiry configurations.`,
  },

  runner: {
    sectionName: 'Live Runner & Exam Focus Mode',
    badge: 'Candidate Execution Engine',
    description: 'Specifications for deep-linking candidate sessions, time limits, and distraction-free testing environments.',
    sampleJson: `{
  "execution_mode": "project_based",
  "project_slug": "intern-programmer",
  "query_parameters": {
    "project": "slug_or_id",
    "token": "access_token_string",
    "theme": "clean-wide"
  }
}`,
    systemPrompt: `You are an Exam Execution Specialist.
Ensure live candidate runners are scoped to discrete project identifiers and persist answers reliably.`,
  },
};

export const AiSectionAssistant: React.FC<AiSectionAssistantProps> = ({ section, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'json'>('prompt');

  const config = SECTION_PROMPTS[section] || SECTION_PROMPTS.builder;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success('AI Prompt copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5 bg-background border border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary shadow-xs transition-all font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>{title || 'AI Studio'}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto font-sans bg-card text-card-foreground border-border shadow-2xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <DialogTitle className="text-base font-bold text-foreground">
                AI Studio • {config.sectionName}
              </DialogTitle>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              {config.badge}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-2 border-b pb-2">
          <Button
            variant={activeTab === 'prompt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('prompt')}
            className={`text-xs h-7 gap-1.5 font-medium transition-all ${
              activeTab === 'prompt'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Master Prompt</span>
          </Button>

          <Button
            variant={activeTab === 'json' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('json')}
            className={`text-xs h-7 gap-1.5 font-medium transition-all ${
              activeTab === 'json'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Sample JSON Schema</span>
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'prompt' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Copy and paste this instruction into any AI model (ChatGPT, Claude, Antigravity):</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(config.systemPrompt)}
                className="text-xs h-7 gap-1.5 bg-background border border-border/80 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied!' : 'Copy Prompt'}</span>
              </Button>
            </div>

            <pre className="p-4 rounded-lg bg-muted/60 border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto text-foreground">
              {config.systemPrompt}
            </pre>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Verified schema format for importing directly into WP Exam:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(config.sampleJson)}
                className="text-xs h-7 gap-1.5 bg-background border border-border/80 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied JSON' : 'Copy JSON'}</span>
              </Button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 text-emerald-400 border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
              {config.sampleJson}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
