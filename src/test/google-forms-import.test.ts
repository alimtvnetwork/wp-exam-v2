import { describe, it, expect } from 'vitest';
import {
  extractGoogleFormId,
  convertGoogleFormSchemaToWpExam,
  getSampleGoogleFormSchema,
  parseFbPublicLoadData,
  GoogleFormSchema,
} from '@/lib/google-forms-importer';

describe('Google Forms Importer Engine', () => {
  it('should extract Google Form ID from published viewform URL', () => {
    const publishedUrl =
      'https://docs.google.com/forms/d/e/1FAIpQLSc5J8bB0yCj5XG5G5G5G5G5G5G5G5G5G5G5G5/viewform';
    const formId = extractGoogleFormId(publishedUrl);
    expect(formId).toBe('1FAIpQLSc5J8bB0yCj5XG5G5G5G5G5G5G5G5G5G5G5G5');
  });

  it('should extract Google Form ID from edit URL', () => {
    const editUrl =
      'https://docs.google.com/forms/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
    const formId = extractGoogleFormId(editUrl);
    expect(formId).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  });

  it('should return raw form ID when passed directly', () => {
    const rawId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
    const formId = extractGoogleFormId(rawId);
    expect(formId).toBe(rawId);
  });

  it('should return null for invalid or non-Google Form URLs', () => {
    expect(extractGoogleFormId('')).toBeNull();
    expect(extractGoogleFormId('https://google.com')).toBeNull();
    expect(extractGoogleFormId('https://example.com/form/123')).toBeNull();
  });

  it('should convert standard Google Form API schema into WP Exam fields', () => {
    const schema: GoogleFormSchema = {
      formId: 'test-form-1',
      info: {
        title: 'Candidate Screening Form',
        description: 'Complete all questions accurately.',
      },
      items: [
        {
          itemId: 'i-1',
          title: 'Candidate Full Name',
          description: 'Official name',
          questionItem: {
            question: {
              questionId: 'q-1',
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        {
          itemId: 'i-2',
          title: 'Detailed Professional Summary',
          questionItem: {
            question: {
              questionId: 'q-2',
              required: false,
              textQuestion: { paragraph: true },
            },
          },
        },
        {
          itemId: 'i-3',
          title: 'Preferred Framework',
          questionItem: {
            question: {
              questionId: 'q-3',
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [{ value: 'React' }, { value: 'Vue' }, { value: 'Svelte' }],
              },
              grading: {
                pointValue: 20,
                correctAnswers: {
                  answers: [{ value: 'React' }],
                },
              },
            },
          },
        },
        {
          itemId: 'i-4',
          title: 'Core Technologies Used',
          questionItem: {
            question: {
              questionId: 'q-4',
              required: true,
              choiceQuestion: {
                type: 'CHECKBOX',
                options: [{ value: 'TypeScript' }, { value: 'Docker' }, { value: 'Kubernetes' }],
              },
              grading: {
                pointValue: 30,
                correctAnswers: {
                  answers: [{ value: 'TypeScript' }, { value: 'Docker' }],
                },
              },
            },
          },
        },
        {
          itemId: 'i-5',
          title: 'Department',
          questionItem: {
            question: {
              questionId: 'q-5',
              required: false,
              choiceQuestion: {
                type: 'DROP_DOWN',
                options: [{ value: 'Engineering' }, { value: 'Design' }, { value: 'Operations' }],
              },
            },
          },
        },
        {
          itemId: 'i-6',
          title: 'Rate your Docker expertise',
          questionItem: {
            question: {
              questionId: 'q-6',
              scaleQuestion: {
                low: 1,
                high: 5,
              },
            },
          },
        },
      ],
    };

    const result = convertGoogleFormSchemaToWpExam(schema);

    expect(result.isSuccess).toBe(true);
    expect(result.formTitle).toBe('Candidate Screening Form');
    expect(result.formDescription).toBe('Complete all questions accurately.');
    expect(result.fields).toHaveLength(6);

    // Verify Short Answer
    expect(result.fields[0].type).toBe('short_answer');
    expect(result.fields[0].label).toBe('Candidate Full Name');
    expect(result.fields[0].isRequired).toBe(true);

    // Verify Paragraph
    expect(result.fields[1].type).toBe('paragraph');
    expect(result.fields[1].label).toBe('Detailed Professional Summary');
    expect(result.fields[1].isRequired).toBe(false);

    // Verify Single Choice (Radio) with Points and Answer
    expect(result.fields[2].type).toBe('single_choice');
    expect(result.fields[2].options).toEqual(['React', 'Vue', 'Svelte']);
    expect(result.fields[2].points).toBe(20);
    expect(result.fields[2].correctAnswer).toBe('React');

    // Verify Multiple Choice (Checkbox)
    expect(result.fields[3].type).toBe('multiple_choice');
    expect(result.fields[3].options).toEqual(['TypeScript', 'Docker', 'Kubernetes']);
    expect(result.fields[3].points).toBe(30);
    expect(result.fields[3].correctAnswer).toEqual(['TypeScript', 'Docker']);

    // Verify Dropdown
    expect(result.fields[4].type).toBe('dropdown');
    expect(result.fields[4].options).toEqual(['Engineering', 'Design', 'Operations']);

    // Verify Rating Scale
    expect(result.fields[5].type).toBe('rating');
  });

  it('should handle section breaks and apply group metadata', () => {
    const schemaWithSections: GoogleFormSchema = {
      info: { title: 'Multi-Section Exam' },
      items: [
        {
          itemId: 'sec-1',
          title: 'General Information',
          pageBreakItem: {},
        },
        {
          itemId: 'i-1',
          title: 'Full Name',
          questionItem: {
            question: {
              questionId: 'q-1',
              textQuestion: { paragraph: false },
            },
          },
        },
        {
          itemId: 'sec-2',
          title: 'Technical Evaluation',
          pageBreakItem: {},
        },
        {
          itemId: 'i-2',
          title: 'Primary Language',
          questionItem: {
            question: {
              questionId: 'q-2',
              choiceQuestion: {
                type: 'RADIO',
                options: [{ value: 'Go' }, { value: 'Rust' }],
              },
            },
          },
        },
      ],
    };

    const result = convertGoogleFormSchemaToWpExam(schemaWithSections);
    expect(result.isSuccess).toBe(true);
    expect(result.fields).toHaveLength(2);
    expect(result.fields[0].group).toBe('General Information');
    expect(result.fields[1].group).toBe('Technical Evaluation');
  });

  it('should convert public FB_PUBLIC_LOAD_DATA_ format correctly', () => {
    const rawFbData = [
      null,
      [
        'Public Assessment Form Description',
        [
          [
            null,
            'Candidate Email Address',
            'Must be company email',
            0, // Short Answer
            [[null, null, 1]], // Required: 1
          ],
          [
            null,
            'Seniority Level',
            null,
            2, // Radio
            [[null, [['Junior'], ['Mid'], ['Senior']], 1]],
          ],
        ],
        null,
        null,
        null,
        null,
        null,
        null,
        'Public Assessment Form',
      ],
    ];

    const result = parseFbPublicLoadData(rawFbData);
    expect(result.isSuccess).toBe(true);
    expect(result.formTitle).toBe('Public Assessment Form');
    expect(result.formDescription).toBe('Public Assessment Form Description');
    expect(result.fields).toHaveLength(2);

    expect(result.fields[0].type).toBe('short_answer');
    expect(result.fields[0].label).toBe('Candidate Email Address');
    expect(result.fields[0].isRequired).toBe(true);

    expect(result.fields[1].type).toBe('single_choice');
    expect(result.fields[1].label).toBe('Seniority Level');
    expect(result.fields[1].options).toEqual(['Junior', 'Mid', 'Senior']);
  });

  it('should provide comprehensive official sample Google Form schema', () => {
    const sample = getSampleGoogleFormSchema();
    expect(sample.info.title).toContain('Senior Engineering');
    expect(sample.items.length).toBeGreaterThan(4);

    const result = convertGoogleFormSchemaToWpExam(sample);
    expect(result.isSuccess).toBe(true);
    expect(result.fields.length).toBe(6);
  });
});
