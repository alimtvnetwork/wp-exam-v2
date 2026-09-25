import { FormField, FieldType } from '@/lib/types/form';

export interface GoogleFormInfo {
  title: string;
  description?: string;
  documentTitle?: string;
}

export interface GoogleChoiceOption {
  value: string;
  isOther?: boolean;
}

export interface GoogleQuestionChoiceQuestion {
  type: 'RADIO' | 'CHECKBOX' | 'DROP_DOWN';
  options: GoogleChoiceOption[];
  shuffle?: boolean;
}

export interface GoogleQuestionTextQuestion {
  paragraph?: boolean;
}

export interface GoogleQuestionScaleQuestion {
  low: number;
  high: number;
  lowLabel?: string;
  highLabel?: string;
}

export interface GoogleQuestionItem {
  question: {
    questionId: string;
    required?: boolean;
    choiceQuestion?: GoogleQuestionChoiceQuestion;
    textQuestion?: GoogleQuestionTextQuestion;
    scaleQuestion?: GoogleQuestionScaleQuestion;
    grading?: {
      pointValue?: number;
      correctAnswers?: {
        answers: Array<{ value: string }>;
      };
    };
  };
}

export interface GoogleFormItem {
  itemId: string;
  title?: string;
  description?: string;
  questionItem?: GoogleQuestionItem;
  pageBreakItem?: Record<string, unknown>;
  textItem?: Record<string, unknown>;
}

export interface GoogleFormSchema {
  formId?: string;
  info: GoogleFormInfo;
  items: GoogleFormItem[];
  revisionId?: string;
  responderUri?: string;
}

export interface GoogleFormsImportResult {
  isSuccess: boolean;
  formTitle: string;
  formDescription: string;
  fields: FormField[];
  message: string;
  importedCount: number;
}

/**
 * Extracts the Form ID from a standard Google Forms URL.
 * Supports:
 * - https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform
 * - https://docs.google.com/forms/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
export function extractGoogleFormId(url: string): string | null {
  if (!url) {
    return null;
  }

  const cleanUrl = url.trim();

  // Pattern 1: Published viewform URL (/forms/d/e/<formId>/viewform)
  const publishedMatch = cleanUrl.match(/\/forms\/d\/e\/([a-zA-Z0-9_-]+)/);
  if (publishedMatch && publishedMatch[1]) {
    return publishedMatch[1];
  }

  // Pattern 2: Edit or standard URL (/forms/d/<formId>/edit)
  const standardMatch = cleanUrl.match(/\/forms\/d\/([a-zA-Z0-9_-]+)/);
  if (standardMatch && standardMatch[1]) {
    return standardMatch[1];
  }

  // Pattern 3: Raw form ID passed directly
  const isAlphanumericSlug = /^[a-zA-Z0-9_-]{20,80}$/.test(cleanUrl);
  if (isAlphanumericSlug) {
    return cleanUrl;
  }

  return null;
}

/**
 * Converts a Google Forms API v1 JSON object into WP Exam FormField items.
 */
export function convertGoogleFormSchemaToWpExam(schema: GoogleFormSchema): GoogleFormsImportResult {
  if (!schema || !schema.info) {
    return {
      isSuccess: false,
      formTitle: '',
      formDescription: '',
      fields: [],
      message: 'Invalid Google Form schema: Missing info object.',
      importedCount: 0,
    };
  }

  const formTitle = schema.info.title || schema.info.documentTitle || 'Imported Google Form';
  const formDescription = schema.info.description || '';
  const fields: FormField[] = [];
  let currentGroup = '';

  const items = schema.items || [];

  for (const item of items) {
    // Section / Page Break handling
    if (item.pageBreakItem) {
      if (item.title) {
        currentGroup = item.title;
      }
      continue;
    }

    // Process questions
    if (item.questionItem && item.questionItem.question) {
      const q = item.questionItem.question;
      const questionTitle = item.title || 'Untitled Question';
      const questionDesc = item.description || '';
      const isRequired = Boolean(q.required);
      const points = q.grading?.pointValue ?? 10;
      const correctAnswers = q.grading?.correctAnswers?.answers?.map((a) => a.value) || [];

      let fieldType: FieldType = 'short_answer';
      let options: string[] | undefined = undefined;
      let correctAnswer: string | string[] | undefined = undefined;

      if (q.choiceQuestion) {
        const choiceType = q.choiceQuestion.type;
        options = q.choiceQuestion.options?.map((o) => o.value).filter(Boolean) || [];

        if (choiceType === 'CHECKBOX') {
          fieldType = 'multiple_choice';
          correctAnswer = correctAnswers.length > 0 ? correctAnswers : (options[0] ? [options[0]] : undefined);
        } else if (choiceType === 'DROP_DOWN') {
          fieldType = 'dropdown';
          correctAnswer = correctAnswers[0] || options[0];
        } else {
          // Default to single_choice for RADIO
          fieldType = 'single_choice';
          correctAnswer = correctAnswers[0] || options[0];
        }
      } else if (q.textQuestion) {
        if (q.textQuestion.paragraph) {
          fieldType = 'paragraph';
        } else {
          fieldType = 'short_answer';
        }
      } else if (q.scaleQuestion) {
        fieldType = 'rating';
      }

      const newField: FormField = {
        id: `field-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: fieldType,
        label: questionTitle,
        placeholder: questionDesc,
        isRequired,
        options,
        correctAnswer,
        points,
        group: currentGroup || undefined,
      };

      fields.push(newField);
    }
  }

  return {
    isSuccess: true,
    formTitle,
    formDescription,
    fields,
    message: `Successfully converted ${fields.length} questions from Google Form.`,
    importedCount: fields.length,
  };
}

/**
 * Parses embedded FB_PUBLIC_LOAD_DATA_ from published Google Forms viewform HTML.
 * When Google Forms renders a public form, all questions are serialized into this array.
 */
export function parseGoogleFormsPublicHtml(html: string): GoogleFormsImportResult {
  if (!html) {
    return {
      isSuccess: false,
      formTitle: '',
      formDescription: '',
      fields: [],
      message: 'HTML content is empty.',
      importedCount: 0,
    };
  }

  try {
    const scriptMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);

    if (scriptMatch && scriptMatch[1]) {
      const parsedData = JSON.parse(scriptMatch[1]);
      return parseFbPublicLoadData(parsedData);
    }

    // Fallback: heuristic regex parsing of title and question blocks
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);

    const formTitle = titleMatch ? titleMatch[1].replace(' - Google Forms', '').trim() : 'Google Form (Public)';
    const formDescription = descMatch ? descMatch[1].trim() : '';

    return {
      isSuccess: true,
      formTitle,
      formDescription,
      fields: generateHeuristicQuestions(html),
      message: 'Parsed Google Form using heuristic content extraction.',
      importedCount: 0,
    };
  } catch (err) {
    return {
      isSuccess: false,
      formTitle: '',
      formDescription: '',
      fields: [],
      message: `Failed to parse Google Forms HTML: ${String(err)}`,
      importedCount: 0,
    };
  }
}

/**
 * Parses the FB_PUBLIC_LOAD_DATA_ array structure from Google Forms.
 * Schema layout:
 * - data[1][1]: items array
 * - data[1][8]: form title
 * - data[1][0]: form description
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseFbPublicLoadData(data: any[]): GoogleFormsImportResult {
  if (!Array.isArray(data) || !data[1]) {
    return {
      isSuccess: false,
      formTitle: '',
      formDescription: '',
      fields: [],
      message: 'Invalid Google Form public data structure.',
      importedCount: 0,
    };
  }

  const formData = data[1];
  const formTitle = formData[8] || 'Imported Google Form';
  const formDescription = formData[0] || '';
  const rawItems = formData[1] || [];

  const fields: FormField[] = [];

  for (const item of rawItems) {
    if (!Array.isArray(item)) {
      continue;
    }

    const title = item[1] || 'Question';
    const desc = item[2] || '';
    const qTypeIndex = item[3];
    const subItems = item[4] || [];

    let fieldType: FieldType = 'short_answer';
    let options: string[] | undefined = undefined;
    let isRequired = false;

    if (Array.isArray(subItems) && subItems[0]) {
      const qConfig = subItems[0];
      isRequired = Boolean(qConfig[2]);

      const rawOptions = qConfig[1];
      if (Array.isArray(rawOptions)) {
        options = rawOptions.map((opt: unknown) => (Array.isArray(opt) ? String(opt[0]) : String(opt))).filter(Boolean);
      }
    }

    // Google Forms type indexes:
    // 0: Short Answer, 1: Paragraph, 2: Multiple Choice (Radio), 3: Dropdown, 4: Checkbox, 5: Linear Scale
    switch (qTypeIndex) {
      case 2:
        fieldType = 'single_choice';
        break;
      case 4:
        fieldType = 'multiple_choice';
        break;
      case 3:
        fieldType = 'dropdown';
        break;
      case 1:
        fieldType = 'paragraph';
        break;
      case 5:
        fieldType = 'rating';
        break;
      default:
        fieldType = 'short_answer';
        break;
    }

    fields.push({
      id: `field-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: fieldType,
      label: title,
      placeholder: desc,
      isRequired,
      options,
      points: 10,
    });
  }

  return {
    isSuccess: true,
    formTitle,
    formDescription,
    fields,
    message: `Extracted ${fields.length} questions from public Google Form.`,
    importedCount: fields.length,
  };
}

/**
 * Heuristic fallback parser when script data is stripped or obfuscated.
 */
function generateHeuristicQuestions(html: string): FormField[] {
  const fields: FormField[] = [];
  const questionMatches = html.matchAll(/role="heading"[^>]*>([^<]+)<\/span>/gi);

  for (const match of questionMatches) {
    const label = match[1].trim();
    if (label && !label.includes('Google Forms') && !label.includes('Sign in')) {
      fields.push({
        id: `field-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        type: 'short_answer',
        label,
        isRequired: true,
        points: 10,
      });
    }
  }

  return fields;
}

/**
 * Fetches Google Form directly from Google Forms API v1 via Access Token.
 */
export async function fetchGoogleFormViaApi(
  formId: string,
  accessToken: string
): Promise<GoogleFormsImportResult> {
  const cleanId = formId.trim();
  const cleanToken = accessToken.trim();

  if (!cleanId) {
    return {
      isSuccess: false,
      formTitle: '',
      formDescription: '',
      fields: [],
      message: 'Form ID is required.',
      importedCount: 0,
    };
  }

  if (!cleanToken) {
    return {
      isSuccess: false,
      formTitle: '',
      formDescription: '',
      fields: [],
      message: 'Google Cloud OAuth access token is required.',
      importedCount: 0,
    };
  }

  const endpoint = `https://forms.googleapis.com/v1/forms/${cleanId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        isSuccess: false,
        formTitle: '',
        formDescription: '',
        fields: [],
        message: `Google API Error (${response.status}): ${errText || response.statusText}`,
        importedCount: 0,
      };
    }

    const data: GoogleFormSchema = await response.json();
    return convertGoogleFormSchemaToWpExam(data);
  } catch (err) {
    return {
      isSuccess: false,
      formTitle: '',
      formDescription: '',
      fields: [],
      message: `Network failure connecting to Google Forms API: ${String(err)}`,
      importedCount: 0,
    };
  }
}

/**
 * Provides a ready-to-test comprehensive Google Form sample schema.
 */
export function getSampleGoogleFormSchema(): GoogleFormSchema {
  return {
    formId: 'sample-google-form-101',
    info: {
      title: 'Senior Engineering Screening Assessment',
      description: 'Official candidate assessment imported directly from Google Forms.',
      documentTitle: 'Senior Engineering Screening',
    },
    items: [
      {
        itemId: 'item-1',
        title: 'Full Legal Name',
        description: 'As printed on official identity credentials',
        questionItem: {
          question: {
            questionId: 'q-1',
            required: true,
            textQuestion: { paragraph: false },
          },
        },
      },
      {
        itemId: 'item-2',
        title: 'Primary Programming Stack',
        description: 'Select your principal language and framework',
        questionItem: {
          question: {
            questionId: 'q-2',
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: [
                { value: 'TypeScript / React & Node.js' },
                { value: 'PHP 8.2+ / WordPress & Laravel' },
                { value: 'Go / Microservices & Distributed Systems' },
                { value: 'Python / AI Agents & Automation' },
              ],
            },
            grading: {
              pointValue: 15,
              correctAnswers: {
                answers: [{ value: 'TypeScript / React & Node.js' }],
              },
            },
          },
        },
      },
      {
        itemId: 'item-3',
        title: 'Which architectural principles do you actively enforce?',
        description: 'Select all compliant design patterns',
        questionItem: {
          question: {
            questionId: 'q-3',
            required: true,
            choiceQuestion: {
              type: 'CHECKBOX',
              options: [
                { value: 'Separation of Concerns & Split Database Architecture' },
                { value: 'Affirmative Implicit Booleans (no explicit true checks)' },
                { value: 'Zero-Storage CI/CD Pipelines (Console & Step Summaries)' },
                { value: 'Tight Busy-Polling Loops in Production' },
              ],
            },
            grading: {
              pointValue: 20,
              correctAnswers: {
                answers: [
                  { value: 'Separation of Concerns & Split Database Architecture' },
                  { value: 'Affirmative Implicit Booleans (no explicit true checks)' },
                  { value: 'Zero-Storage CI/CD Pipelines (Console & Step Summaries)' },
                ],
              },
            },
          },
        },
      },
      {
        itemId: 'item-4',
        title: 'Select Engineering Department',
        questionItem: {
          question: {
            questionId: 'q-4',
            required: false,
            choiceQuestion: {
              type: 'DROP_DOWN',
              options: [
                { value: 'Core Platform Engineering' },
                { value: 'Frontend Experience & UI/UX' },
                { value: 'DevOps & Infrastructure' },
                { value: 'Autonomous AI Quality Assurance' },
              ],
            },
          },
        },
      },
      {
        itemId: 'item-5',
        title: 'Architecture & System Design Summary',
        description: 'Explain your approach to designing zero-downtime, scalable APIs.',
        questionItem: {
          question: {
            questionId: 'q-5',
            required: true,
            textQuestion: { paragraph: true },
            grading: {
              pointValue: 25,
            },
          },
        },
      },
      {
        itemId: 'item-6',
        title: 'Rate your confidence in Autonomous AI Agent architectures',
        questionItem: {
          question: {
            questionId: 'q-6',
            required: false,
            scaleQuestion: {
              low: 1,
              high: 5,
              lowLabel: 'Beginner',
              highLabel: 'Principal Architect',
            },
          },
        },
      },
    ],
  };
}
