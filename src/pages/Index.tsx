import React, { useState } from 'react';
import { QuizEditor } from '../quiz/components/QuizEditor';
import { FormRunner } from '@/components/runner/FormRunner';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'builder' | 'runner'>('builder');
  const store = useQuizStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container mx-auto px-4">
        {/* Navigation Tabs Header */}
        <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-primary">WP Exam</span>
            <Badge variant="secondary" className="text-xs">v2.0.0</Badge>
          </div>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'builder' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('builder')}
              className="text-xs"
            >
              🛠 Form & Quiz Builder
            </Button>
            <Button
              variant={activeTab === 'runner' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('runner')}
              className="text-xs"
            >
              🚀 Public Runner Demo
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'builder' ? (
          <QuizEditor />
        ) : (
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
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
