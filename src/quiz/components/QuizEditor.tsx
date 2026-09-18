import React from 'react';
import { useQuizStore } from '../store/useQuizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableQuestion = ({ id, index }: { id: string, index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const { questions, removeQuestion, updateQuestion } = useQuizStore();
  const question = questions.find(q => q.id === id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!question) return null;

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab p-2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.87868 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.87868 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.87868 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.87868 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </div>
            <CardTitle className="text-sm font-medium">Question {index + 1} - {question.type.replace('_', ' ')}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => removeQuestion(id)}>Remove</Button>
        </CardHeader>
        <CardContent>
          <Input 
            value={question.text} 
            onChange={(e) => updateQuestion(id, { text: e.target.value })} 
            placeholder="Enter question text..."
            className="mb-2"
          />
          {question.type === 'multiple_choice' && (
            <div className="space-y-2">
              {question.options?.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...(question.options || [])];
                      newOpts[i] = e.target.value;
                      updateQuestion(id, { options: newOpts });
                    }} 
                    placeholder={`Option ${i + 1}`}
                  />
                  <Button variant="outline" onClick={() => {
                    const newOpts = question.options?.filter((_, idx) => idx !== i);
                    updateQuestion(id, { options: newOpts });
                  }}>X</Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => {
                updateQuestion(id, { options: [...(question.options || []), ''] });
              }}>Add Option</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const QuizEditor = () => {
  const { title, description, questions, setTitle, setDescription, addQuestion, setQuestions, saveQuiz } = useQuizStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const handleAddQuestion = (type: 'multiple_choice' | 'short_answer' | 'true_false') => {
    addQuestion({
      id: Math.random().toString(36).substring(7),
      type,
      text: '',
      options: type === 'multiple_choice' ? ['', ''] : undefined
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Quiz Title" 
            className="text-lg font-semibold"
          />
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Quiz Description" 
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">Questions</h2>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            {questions.map((q, index) => (
              <SortableQuestion key={q.id} id={q.id} index={index} />
            ))}
          </SortableContext>
        </DndContext>

        <div className="flex gap-2 mt-4">
          <Button onClick={() => handleAddQuestion('multiple_choice')} variant="secondary">Add Multiple Choice</Button>
          <Button onClick={() => handleAddQuestion('short_answer')} variant="secondary">Add Short Answer</Button>
          <Button onClick={() => handleAddQuestion('true_false')} variant="secondary">Add True/False</Button>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={() => {
          saveQuiz().then(() => alert('Saved successfully')).catch(e => alert('Error saving: ' + e.message));
        }}>Save Quiz</Button>
      </div>
    </div>
  );
};
