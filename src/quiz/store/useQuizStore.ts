import { create } from 'zustand';
import { FormField, FormModel, FormType, FormAccessType, FormSettings } from '@/lib/types/form';

interface QuizState {
  id?: number | string;
  title: string;
  description: string;
  formType: FormType;
  formAccess: FormAccessType;
  isSequential: boolean;
  isPublished: boolean;
  settings: FormSettings;
  fields: FormField[];
  isLoading: boolean;
  isSaving: boolean;

  // Backward compatibility aliases
  questions: FormField[];

  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setFormType: (type: FormType) => void;
  setFormAccess: (access: FormAccessType) => void;
  setIsSequential: (isSequential: boolean) => void;
  setIsPublished: (isPublished: boolean) => void;
  updateSettings: (settings: Partial<FormSettings>) => void;

  addField: (field: FormField) => void;
  updateField: (id: string, field: Partial<FormField>) => void;
  removeField: (id: string) => void;
  setFields: (fields: FormField[]) => void;

  // Backward compatibility methods
  addQuestion: (question: FormField) => void;
  updateQuestion: (id: string, question: Partial<FormField>) => void;
  removeQuestion: (id: string) => void;
  setQuestions: (questions: FormField[]) => void;

  resetForm: () => void;
  saveForm: () => Promise<any>;
  saveQuiz: () => Promise<any>;
}

const initialSettings: FormSettings = {
  timeLimitSeconds: 600,
  passingScore: 70,
  successMessage: 'Thank you! Your response has been recorded.',
};

const defaultFields: FormField[] = [
  {
    id: 'field-1',
    type: 'multiple_choice',
    label: 'What does HTML stand for?',
    placeholder: '',
    isRequired: true,
    options: ['HyperText Markup Language', 'High Tech Modern Language', 'Hyperlink Text Module'],
    correctAnswer: 'HyperText Markup Language',
    points: 10,
  },
  {
    id: 'field-2',
    type: 'true_false',
    label: 'CSS is used for structuring webpage content.',
    placeholder: '',
    isRequired: true,
    options: ['True', 'False'],
    correctAnswer: 'False',
    points: 10,
  },
];

export const useQuizStore = create<QuizState>((set, get) => ({
  id: undefined,
  title: 'Sample Sequential Knowledge Quiz',
  description: 'Evaluate foundational web development knowledge with sequential question progression.',
  formType: 'quiz',
  formAccess: 'public',
  isSequential: true,
  isPublished: true,
  settings: initialSettings,
  fields: defaultFields,
  questions: defaultFields,
  isLoading: false,
  isSaving: false,

  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setFormType: (formType) => set({ formType }),
  setFormAccess: (formAccess) => set({ formAccess }),
  setIsSequential: (isSequential) => set({ isSequential }),
  setIsPublished: (isPublished) => set({ isPublished }),
  updateSettings: (settingsUpdate) =>
    set((state) => ({
      settings: { ...state.settings, ...settingsUpdate },
    })),

  addField: (field) =>
    set((state) => {
      const updated = [...state.fields, field];
      return { fields: updated, questions: updated };
    }),

  updateField: (id, updated) =>
    set((state) => {
      const updatedFields = state.fields.map((f) => (f.id === id ? { ...f, ...updated } : f));
      return { fields: updatedFields, questions: updatedFields };
    }),

  removeField: (id) =>
    set((state) => {
      const updated = state.fields.filter((f) => f.id !== id);
      return { fields: updated, questions: updated };
    }),

  setFields: (fields) => set({ fields, questions: fields }),

  // Aliases
  addQuestion: (q) => get().addField(q),
  updateQuestion: (id, q) => get().updateField(id, q),
  removeQuestion: (id) => get().removeField(id),
  setQuestions: (qs) => get().setFields(qs),

  resetForm: () =>
    set({
      id: undefined,
      title: 'New Form',
      description: '',
      formType: 'employee_signup',
      formAccess: 'public',
      isSequential: false,
      isPublished: true,
      settings: initialSettings,
      fields: [],
      questions: [],
    }),

  saveForm: async () => {
    set({ isSaving: true });
    const state = get();
    const wpSettings = (window as any).wpExamSettings || {
      root: '/wp-json/',
      nonce: '',
    };

    const payload = {
      title: state.title,
      description: state.description,
      form_type: state.formType,
      form_access: state.formAccess,
      is_sequential: state.isSequential,
      is_published: state.isPublished,
      settings: state.settings,
      fields: state.fields.map((f, index) => ({
        field_label: f.label,
        field_type: f.type,
        field_placeholder: f.placeholder || '',
        is_required: f.isRequired,
        display_order: index + 1,
        options: f.options || [],
        correct_answer: f.correctAnswer || '',
        points: f.points || 1,
      })),
    };

    try {
      const url = state.id
        ? `${wpSettings.root}wp-exam/v1/admin/forms/${state.id}`
        : `${wpSettings.root}wp-exam/v1/admin/forms`;
      const method = state.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpSettings.nonce,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      set({ isSaving: false });
      return json;
    } catch (e) {
      set({ isSaving: false });
      throw e;
    }
  },

  saveQuiz: async () => {
    return get().saveForm();
  },
}));
