import React from 'react';
import { QuizEditor } from '../quiz/components/QuizEditor';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">WP Exam Builder</h1>
        <QuizEditor />
      </div>
    </div>
  );
};

export default Index;
