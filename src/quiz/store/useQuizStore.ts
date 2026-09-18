import { create } from 'zustand';

export type QuestionType = 'multiple_choice' | 'short_answer' | 'true_false';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
}

export interface QuizState {
  title: string;
  description: string;
  questions: Question[];
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  addQuestion: (q: Question) => void;
  updateQuestion: (id: string, q: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  setQuestions: (questions: Question[]) => void;
  saveQuiz: () => Promise<void>;
  loadQuiz: (id: number) => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  title: '',
  description: '',
  questions: [],
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  addQuestion: (q) => set((state) => ({ questions: [...state.questions, q] })),
  updateQuestion: (id, q) => set((state) => ({
    questions: state.questions.map((question) => question.id === id ? { ...question, ...q } : question)
  })),
  removeQuestion: (id) => set((state) => ({
    questions: state.questions.filter((q) => q.id !== id)
  })),
  setQuestions: (questions) => set({ questions }),
  saveQuiz: async () => {
    const { title, description, questions } = get();
    // @ts-ignore
    const wpSettings = window.wpExamSettings || { root: 'http://localhost/wp-json/', nonce: '' };
    
    const response = await fetch(`${wpSettings.root}wp-exam/v1/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': wpSettings.nonce
      },
      body: JSON.stringify({ title, description, questions })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save quiz');
    }
  },
  loadQuiz: async (id: number) => {
    // @ts-ignore
    const wpSettings = window.wpExamSettings || { root: 'http://localhost/wp-json/', nonce: '' };
    
    const response = await fetch(`${wpSettings.root}wp-exam/v1/quizzes/${id}`, {
      headers: {
        'X-WP-Nonce': wpSettings.nonce
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load quiz');
    }
    
    const data = await response.json();
    set({
      title: data.title,
      description: data.description,
      questions: data.questions || []
    });
  }
}));
