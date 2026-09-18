import React, { useState } from 'react';
import { QuizEditor } from '../quiz/components/QuizEditor';
import { FormRunner } from '@/components/runner/FormRunner';
import { FocusQuizRunner } from '@/components/runner/FocusQuizRunner';
import { InvitesManager } from '@/components/admin/invites-manager';
import { HistoryManager } from '@/components/admin/history-manager';
import { EmailSettings } from '@/components/admin/email-settings';
import { SqliteStatus } from '@/components/admin/sqlite-status';
import { ProjectHierarchyManager } from '@/components/admin/project-hierarchy-manager';
import { AIInstructionStudio } from '@/components/admin/ai-instruction-studio';
import { BackupManager } from '@/components/admin/backup-manager';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AdminTab =
  | 'builder'
  | 'projects'
  | 'focus-runner'
  | 'runner'
  | 'invites'
  | 'history'
  | 'email'
  | 'ai-studio'
  | 'backups'
  | 'storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('builder');
  const store = useQuizStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation Tabs Header */}
        <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-primary">WP Exam</span>
            <Badge variant="secondary" className="text-xs">v2.5.0 • Multi-Theme & Split DB</Badge>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/80 p-1 rounded-xl flex-wrap justify-center">
            <Button
              variant={activeTab === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('builder')}
              className="text-xs h-8 px-2.5"
            >
              🛠 Builder
            </Button>
            <Button
              variant={activeTab === 'projects' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('projects')}
              className="text-xs h-8 px-2.5"
            >
              🌳 Projects
            </Button>
            <Button
              variant={activeTab === 'focus-runner' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('focus-runner')}
              className="text-xs h-8 px-2.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 font-bold"
            >
              🎯 Focus Quiz
            </Button>
            <Button
              variant={activeTab === 'runner' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('runner')}
              className="text-xs h-8 px-2.5"
            >
              🚀 Live Runner
            </Button>
            <Button
              variant={activeTab === 'invites' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('invites')}
              className="text-xs h-8 px-2.5"
            >
              ✉️ Invites
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="text-xs h-8 px-2.5"
            >
              📊 History
            </Button>
            <Button
              variant={activeTab === 'ai-studio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('ai-studio')}
              className="text-xs h-8 px-2.5"
            >
              🤖 AI Studio
            </Button>
            <Button
              variant={activeTab === 'email' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('email')}
              className="text-xs h-8 px-2.5"
            >
              ⚙️ Email
            </Button>
            <Button
              variant={activeTab === 'backups' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('backups')}
              className="text-xs h-8 px-2.5"
            >
              📦 Backups
            </Button>
            <Button
              variant={activeTab === 'storage' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('storage')}
              className="text-xs h-8 px-2.5"
            >
              🗄 SQLite
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'builder' && <QuizEditor />}

        {activeTab === 'projects' && (
          <div className="max-w-6xl mx-auto">
            <ProjectHierarchyManager onLaunchFocusRunner={() => setActiveTab('focus-runner')} />
          </div>
        )}

        {activeTab === 'focus-runner' && (
          <div className="max-w-xl mx-auto py-2">
            <FocusQuizRunner onBackToAdmin={() => setActiveTab('projects')} />
          </div>
        )}

        {activeTab === 'runner' && (
          <div className="max-w-3xl mx-auto py-4">
            <FormRunner
              form={{
                title: store.title,
                description: store.description,
                formType: store.formType,
                formAccess: store.formAccess,
                isSequential: store.isSequential,
                isPublished: true,
                settings: store.settings,
                fields: store.fields,
              }}
              onClose={() => setActiveTab('builder')}
            />
          </div>
        )}

        {activeTab === 'invites' && (
          <InvitesManager onNavigateToRunner={() => setActiveTab('runner')} />
        )}
        {activeTab === 'history' && <HistoryManager />}
        {activeTab === 'ai-studio' && (
          <div className="max-w-4xl mx-auto">
            <AIInstructionStudio />
          </div>
        )}
        {activeTab === 'email' && <EmailSettings />}
        {activeTab === 'backups' && (
          <div className="max-w-5xl mx-auto">
            <BackupManager />
          </div>
        )}
        {activeTab === 'storage' && <SqliteStatus />}
      </div>
    </div>
  );
};

export default Index;
