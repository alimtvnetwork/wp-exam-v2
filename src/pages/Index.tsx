import React, { useState } from 'react';
import { QuizEditor } from '../quiz/components/QuizEditor';
import { FormRunner } from '@/components/runner/FormRunner';
import { InvitesManager } from '@/components/admin/invites-manager';
import { HistoryManager } from '@/components/admin/history-manager';
import { EmailSettings } from '@/components/admin/email-settings';
import { SqliteStatus } from '@/components/admin/sqlite-status';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AdminTab = 'builder' | 'runner' | 'invites' | 'history' | 'email' | 'storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('builder');
  const store = useQuizStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation Tabs Header */}
        <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-primary">WP Exam</span>
            <Badge variant="secondary" className="text-xs">v2.1.0 • SQLite Ready</Badge>
          </div>
          <div className="flex items-center gap-1.5 bg-muted/80 p-1 rounded-xl flex-wrap justify-center">
            <Button
              variant={activeTab === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('builder')}
              className="text-xs h-8 px-3"
            >
              🛠 Builder
            </Button>
            <Button
              variant={activeTab === 'runner' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('runner')}
              className="text-xs h-8 px-3"
            >
              🚀 Live Runner
            </Button>
            <Button
              variant={activeTab === 'invites' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('invites')}
              className="text-xs h-8 px-3"
            >
              ✉️ Invites
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="text-xs h-8 px-3"
            >
              📊 History
            </Button>
            <Button
              variant={activeTab === 'email' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('email')}
              className="text-xs h-8 px-3"
            >
              ⚙️ Email
            </Button>
            <Button
              variant={activeTab === 'storage' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('storage')}
              className="text-xs h-8 px-3"
            >
              🗄 SQLite
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'builder' && <QuizEditor />}

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
        {activeTab === 'email' && <EmailSettings />}
        {activeTab === 'storage' && <SqliteStatus />}
      </div>
    </div>
  );
};

export default Index;
