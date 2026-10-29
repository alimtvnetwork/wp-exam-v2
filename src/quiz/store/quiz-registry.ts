import { FormModel, FormType, FormAccessType } from '@/lib/types/form';

export interface QuizRegistryItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  formType: FormType;
  formAccess?: FormAccessType;
  isSequential?: boolean;
  questionCount: number;
  totalPoints: number;
  passingScore?: number;
  timeLimitSeconds?: number;
  updatedAt: string;
  isCustom?: boolean;
  isPreset?: boolean;
  model: FormModel;
}

const CUSTOM_QUIZZES_STORAGE_KEY = 'wp_exam_custom_quizzes';

export const BUILTIN_PRESET_QUIZZES: QuizRegistryItem[] = [
  {
    id: 'intern-programmer',
    slug: 'intern-programmer',
    title: 'Intern Programmer Candidate Evaluation',
    description: 'Assessment covering foundational computer science, algorithm analysis, and web engineering principles.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: true,
    questionCount: 5,
    totalPoints: 30,
    passingScore: 70,
    timeLimitSeconds: 1800,
    updatedAt: '2026-10-20',
    isPreset: true,
    model: {
      id: 'intern-programmer',
      title: 'Intern Programmer Candidate Evaluation',
      description: 'Assessment covering foundational computer science, algorithm analysis, and web engineering principles.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        timeLimitSeconds: 1800,
        passingScore: 70,
        successMessage: 'Congratulations! Your score qualifies for technical interview review.',
        defaultQuestionLayout: 'presentation_split',
      },
      fields: [
        {
          id: 'q1',
          type: 'multiple_choice',
          label: 'What is the time complexity of searching an element in a balanced binary search tree?',
          description: 'Binary search trees maintain a sorted invariant where every left child is strictly smaller and every right child is strictly greater than the root.',
          isRequired: true,
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctAnswer: 'O(log n)',
          points: 10,
          group: 'Algorithms',
          layoutMode: 'presentation_split',
          kickerText: 'Question 01 • Algorithmic Complexity',
        },
        {
          id: 'q2',
          type: 'true_false',
          label: 'In JavaScript / TypeScript, arrays are passed by reference rather than by value.',
          isRequired: true,
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 10,
          group: 'Language Core',
        },
        {
          id: 'q3',
          type: 'dropdown',
          label: 'Select primary programming language for practical test:',
          isRequired: true,
          options: ['TypeScript / Node.js', 'PHP / Laravel', 'Python / Django', 'Go / Golang'],
          correctAnswer: 'TypeScript / Node.js',
          points: 10,
          group: 'Language Core',
        },
      ],
    },
  },
  {
    id: 'full-stack-architect',
    slug: 'full-stack-architect',
    title: 'Full-Stack Web Architecture Certification',
    description: 'Enterprise evaluation on REST API design, state management, and split-DB patterns.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: true,
    questionCount: 2,
    totalPoints: 30,
    passingScore: 80,
    timeLimitSeconds: 2400,
    updatedAt: '2026-10-21',
    isPreset: true,
    model: {
      id: 'full-stack-architect',
      title: 'Full-Stack Web Architecture Certification',
      description: 'Enterprise evaluation on REST API design, state management, and split-DB patterns.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        timeLimitSeconds: 2400,
        passingScore: 80,
        successMessage: 'Exemplary performance! Full-Stack certification verified.',
      },
      fields: [
        {
          id: 'fsa-1',
          type: 'multiple_choice',
          label: 'Which HTTP header is mandatory for Content Security Policy compliance?',
          isRequired: true,
          options: ['Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security', 'Access-Control-Allow-Origin'],
          correctAnswer: 'Content-Security-Policy',
          points: 15,
        },
        {
          id: 'fsa-2',
          type: 'true_false',
          label: 'SQLite split-database engines can run isolated WAL modes per individual user shard.',
          isRequired: true,
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 15,
        },
      ],
    },
  },
  {
    id: 'cybersecurity-essentials',
    slug: 'cybersecurity-essentials',
    title: 'Cybersecurity Fundamentals & Access Control',
    description: 'Practical security evaluation on OWASP Top 10, JWT sanitization, and SQL injection prevention.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: false,
    questionCount: 1,
    totalPoints: 20,
    passingScore: 75,
    timeLimitSeconds: 1200,
    updatedAt: '2026-10-21',
    isPreset: true,
    model: {
      id: 'cybersecurity-essentials',
      title: 'Cybersecurity Fundamentals & Access Control',
      description: 'Practical security evaluation on OWASP Top 10, JWT sanitization, and SQL injection prevention.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: false,
      isPublished: true,
      settings: {
        timeLimitSeconds: 1200,
        passingScore: 75,
        successMessage: 'Security compliance verified.',
      },
      fields: [
        {
          id: 'sec-1',
          type: 'multiple_choice',
          label: 'What is the most effective defense against SQL Injection vulnerabilities?',
          isRequired: true,
          options: [
            'Parameterized Queries / Prepared Statements',
            'Input String Escaping',
            'Client-side Regex Filtering',
            'Web Application Firewalls only',
          ],
          correctAnswer: 'Parameterized Queries / Prepared Statements',
          points: 20,
        },
      ],
    },
  },
  {
    id: 'employee-onboarding-eval',
    slug: 'employee-onboarding-eval',
    title: 'Employee Onboarding & Security Compliance',
    description: 'Mandatory knowledge check on workstation security, password policy, and engineering values.',
    formType: 'quiz',
    formAccess: 'public',
    isSequential: true,
    questionCount: 2,
    totalPoints: 20,
    passingScore: 80,
    timeLimitSeconds: 900,
    updatedAt: '2026-10-22',
    isPreset: true,
    model: {
      id: 'employee-onboarding-eval',
      title: 'Employee Onboarding & Security Compliance',
      description: 'Mandatory knowledge check on workstation security, password policy, and engineering values.',
      formType: 'quiz',
      formAccess: 'public',
      isSequential: true,
      isPublished: true,
      settings: {
        timeLimitSeconds: 900,
        passingScore: 80,
        successMessage: 'Security onboarding complete.',
      },
      fields: [
        {
          id: 'onb-1',
          type: 'true_false',
          label: 'Multi-factor authentication (MFA) is strictly required on all corporate accounts.',
          isRequired: true,
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 10,
        },
        {
          id: 'onb-2',
          type: 'multiple_choice',
          label: 'What is the standard procedure if a phishing email is detected?',
          isRequired: true,
          options: [
            'Report to Security Operations immediately',
            'Forward to external colleagues',
            'Reply asking to unsubscribe',
            'Ignore and leave in inbox',
          ],
          correctAnswer: 'Report to Security Operations immediately',
          points: 10,
        },
      ],
    },
  },
];

export function getCustomQuizzes(): QuizRegistryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse custom quizzes from localStorage:', error);
  }

  return [];
}

export function saveCustomQuiz(model: FormModel, slug: string): QuizRegistryItem {
  const customList = getCustomQuizzes();
  const targetSlug = slug || (model as { slug?: string }).slug || 'assessment-quiz';
  const targetId = String(model.id || targetSlug);
  const now = new Date().toISOString().split('T')[0];

  const totalPoints = (model.fields || []).reduce((acc, f) => acc + (f.points || 0), 0);
  const questionCount = (model.fields || []).length;

  const newItem: QuizRegistryItem = {
    id: targetId,
    slug: targetSlug,
    title: model.title || 'Untitled Assessment Form',
    description: model.description || '',
    formType: model.formType || 'quiz',
    formAccess: model.formAccess || 'public',
    isSequential: Boolean(model.isSequential),
    questionCount,
    totalPoints,
    passingScore: model.settings?.passingScore ?? 70,
    timeLimitSeconds: model.settings?.timeLimitSeconds,
    updatedAt: now,
    isCustom: true,
    model: {
      ...model,
      id: targetId,
    },
  };

  const existingIndex = customList.findIndex(
    (item) => item.slug === targetSlug || item.id === targetId
  );

  let updatedList: QuizRegistryItem[];
  if (existingIndex >= 0) {
    updatedList = [...customList];
    updatedList[existingIndex] = newItem;
  } else {
    updatedList = [newItem, ...customList];
  }

  try {
    localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to persist custom quiz to localStorage:', err);
  }

  return newItem;
}

export function deleteCustomQuiz(idOrSlug: string): boolean {
  const customList = getCustomQuizzes();
  const filtered = customList.filter(
    (item) => item.id !== idOrSlug && item.slug !== idOrSlug
  );

  if (filtered.length !== customList.length) {
    try {
      localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Failed to update custom quizzes after deletion:', err);
    }
  }

  return false;
}

export function duplicateCustomQuiz(item: QuizRegistryItem): QuizRegistryItem {
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const newSlug = `${item.slug}-copy-${randomSuffix}`;
  const newTitle = `${item.title} (Copy)`;

  const clonedModel: FormModel = {
    ...item.model,
    id: newSlug,
    title: newTitle,
    fields: (item.model.fields || []).map((f, idx) => ({
      ...f,
      id: `copy-${idx}-${Math.random().toString(36).substring(2, 7)}`,
    })),
  };

  return saveCustomQuiz(clonedModel, newSlug);
}

export function getAllQuizzes(): QuizRegistryItem[] {
  const customList = getCustomQuizzes();
  const customSlugs = new Set(customList.map((item) => item.slug));

  const uniquePresets = BUILTIN_PRESET_QUIZZES.filter(
    (preset) => !customSlugs.has(preset.slug)
  );

  return [...customList, ...uniquePresets];
}
