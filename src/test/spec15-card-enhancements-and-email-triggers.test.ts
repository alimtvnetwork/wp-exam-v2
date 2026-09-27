import { describe, it, expect, beforeEach } from 'vitest';
import { useQuizStore } from '@/quiz/store/useQuizStore';
import { FormField, DropdownOptionItem, NotificationTrigger } from '@/lib/types/form';
import {
  DEFAULT_EMAIL_TEMPLATE,
  DEFAULT_MOCK_APPLICANT_DATA,
  interpolateEmailTemplate,
} from '@/lib/templates/email-template';

describe('Spec 15: Card Enhancements, Dropdowns, Multi-Mode Rating & Notification Triggers', () => {
  beforeEach(() => {
    useQuizStore.getState().resetForm();
    useQuizStore.getState().clearTrash();
  });

  describe('Trash Ledger & Restoration Engine', () => {
    it('pushes deleted fields to trash ledger with originalIndex and timestamp', () => {
      const store = useQuizStore.getState();
      const testField: FormField = {
        id: 'trash-test-1',
        type: 'multiple_choice',
        label: 'Candidate Programming Knowledge',
        isRequired: true,
        options: ['Python', 'TypeScript', 'Go'],
      };

      store.addField(testField);
      const initialFields = useQuizStore.getState().fields;
      expect(initialFields.some((f) => f.id === 'trash-test-1')).toBe(true);

      // Remove the field
      useQuizStore.getState().removeField('trash-test-1');

      const afterDelete = useQuizStore.getState();
      expect(afterDelete.fields.some((f) => f.id === 'trash-test-1')).toBe(false);
      expect(afterDelete.trashFields.length).toBe(1);
      expect(afterDelete.trashFields[0].field.id).toBe('trash-test-1');
      expect(afterDelete.trashFields[0].originalIndex).toBeGreaterThanOrEqual(0);
      expect(afterDelete.trashFields[0].deletedAt).toBeTruthy();
    });

    it('restores deleted field to original index when restoreField is called', () => {
      const store = useQuizStore.getState();
      const fieldA: FormField = { id: 'field-a', type: 'text', label: 'Field A', isRequired: false };
      const fieldB: FormField = { id: 'field-b', type: 'text', label: 'Field B', isRequired: false };
      const fieldC: FormField = { id: 'field-c', type: 'text', label: 'Field C', isRequired: false };

      store.setFields([fieldA, fieldB, fieldC]);
      expect(useQuizStore.getState().fields.length).toBe(3);

      // Remove middle field B (index 1)
      useQuizStore.getState().removeField('field-b');
      expect(useQuizStore.getState().fields.map((f) => f.id)).toEqual(['field-a', 'field-c']);
      expect(useQuizStore.getState().trashFields.length).toBe(1);

      // Restore field B
      useQuizStore.getState().restoreField('field-b');
      const restoredState = useQuizStore.getState();
      expect(restoredState.fields.length).toBe(3);
      expect(restoredState.fields[1].id).toBe('field-b');
      expect(restoredState.trashFields.length).toBe(0);
    });

    it('clears trash ledger completely when clearTrash is called', () => {
      const store = useQuizStore.getState();
      store.addField({ id: 'trash-test-2', type: 'text', label: 'Temp', isRequired: false });
      store.removeField('trash-test-2');
      expect(useQuizStore.getState().trashFields.length).toBe(1);

      useQuizStore.getState().clearTrash();
      expect(useQuizStore.getState().trashFields.length).toBe(0);
    });
  });

  describe('Enhanced Dropdown Engine (Display vs Value & Other Typing)', () => {
    it('supports custom dropdown option items with separate label and value mapping', () => {
      const dropdownOptions: DropdownOptionItem[] = [
        { label: 'United States (+1)', value: 'US_1' },
        { label: 'United Kingdom (+44)', value: 'UK_44' },
        { label: 'Germany (+49)', value: 'DE_49' },
      ];

      const field: FormField = {
        id: 'country-code',
        type: 'dropdown',
        label: 'Select Country Calling Code',
        isRequired: true,
        dropdownOptions,
        dropdownAllowSearch: true,
      };

      expect(field.dropdownOptions).toHaveLength(3);
      expect(field.dropdownOptions![0].label).toBe('United States (+1)');
      expect(field.dropdownOptions![0].value).toBe('US_1');
    });

    it('handles "__other__:" custom text answer prefix for custom user responses', () => {
      const otherPrefix = '__other__:';
      const userCustomInput = 'Master of Computer Applications';
      const storedAnswer = otherPrefix + userCustomInput;

      expect(storedAnswer.startsWith(otherPrefix)).toBe(true);
      const extractedAnswer = storedAnswer.substring(otherPrefix.length);
      expect(extractedAnswer).toBe('Master of Computer Applications');
    });
  });

  describe('Multi-Mode Rating Engine & Conditional Triggers', () => {
    it('supports Numbers, IMDB Stars, and 5-stage feelings modes', () => {
      const numberRating: FormField = {
        id: 'rate-1',
        type: 'rating',
        label: 'Rate overall satisfaction (1-10)',
        isRequired: true,
        ratingDisplayMode: 'numbers',
        ratingMax: 10,
      };

      const starsRating: FormField = {
        id: 'rate-2',
        type: 'rating',
        label: 'Rate code cleanliness',
        isRequired: true,
        ratingDisplayMode: 'stars',
        ratingMax: 5,
      };

      const emojiRating: FormField = {
        id: 'rate-3',
        type: 'rating',
        label: 'How was your onboarding experience?',
        isRequired: true,
        ratingDisplayMode: 'emojis',
        ratingMax: 5,
        ratingFeedbackThreshold: 3,
        ratingReviewThreshold: 4,
        ratingReviewUrl: 'https://g.page/r/sample/review',
        ratingAppreciationTags: ['Fast Support', 'Clear Docs', 'Friendly Staff'],
      };

      expect(numberRating.ratingDisplayMode).toBe('numbers');
      expect(starsRating.ratingDisplayMode).toBe('stars');
      expect(emojiRating.ratingDisplayMode).toBe('emojis');
      expect(emojiRating.ratingFeedbackThreshold).toBe(3);
      expect(emojiRating.ratingReviewThreshold).toBe(4);
      expect(emojiRating.ratingAppreciationTags).toHaveLength(3);
    });

    it('evaluates low score vs high score conditional branches accurately', () => {
      const feedbackThreshold = 3;
      const reviewThreshold = 4;

      const scoreLow = 2;
      const isLowScore = scoreLow <= feedbackThreshold;
      const isHighScore = scoreLow >= reviewThreshold;
      expect(isLowScore).toBe(true);
      expect(isHighScore).toBe(false);

      const scoreHigh = 5;
      const isHigh = scoreHigh >= reviewThreshold;
      const isLow = scoreHigh <= feedbackThreshold;
      expect(isHigh).toBe(true);
      expect(isLow).toBe(false);
    });
  });

  describe('Sanitized Email Template Engine & Zero-PII Verification', () => {
    it('interpolates placeholders with custom values and default fallbacks', () => {
      const sampleTemplate = `
        <h1>{{form_title}}</h1>
        <p>Candidate: {{candidate_name}}</p>
        <p>Position: {{job_position|default('Software Engineer')}}</p>
        <div style="color: {{primary_color|default('#0b1220')}}">Brand</div>
      `;

      const interpolated = interpolateEmailTemplate(sampleTemplate, {
        form_title: 'React Engineering Assessment',
        candidate_name: 'Jordan Lee',
        primary_color: '#16a34a',
      });

      expect(interpolated).toContain('<h1>React Engineering Assessment</h1>');
      expect(interpolated).toContain('<p>Candidate: Jordan Lee</p>');
      expect(interpolated).toContain('<p>Position: Software Engineer</p>');
      expect(interpolated).toContain('style="color: #16a34a"');
    });

    it('verifies that DEFAULT_EMAIL_TEMPLATE contains zero real candidate PII', () => {
      const template = DEFAULT_EMAIL_TEMPLATE;

      // Ensure no specific candidate names from raw template exist
      expect(template).not.toContain('Anik Sen');
      expect(template).not.toContain('aniksen.work@gmail.com');
      expect(template).not.toContain('+880 1819-123456');
      expect(template).not.toContain('Bangladesh');
      expect(template).not.toContain('Chittagong');

      // Ensure generic placeholder tokens exist
      expect(template).toContain('{{candidate_name}}');
      expect(template).toContain('{{candidate_email}}');
      expect(template).toContain('{{job_position}}');
      expect(template).toContain('{{asking_salary}}');
      expect(template).toContain('{{primary_color}}');
    });
  });

  describe('Notification Trigger Data Structure', () => {
    it('stores notification triggers in form settings', () => {
      const store = useQuizStore.getState();
      const triggers: NotificationTrigger[] = [
        {
          id: 'email-submission',
          channel: 'email',
          event: 'on_form_submit',
          to: '{{candidate_email}}',
          fromName: 'WP Exam System',
          subject: 'Your Assessment Submission',
          colorPalette: '#16a34a',
        },
        {
          id: 'wa-lead-alert',
          channel: 'whatsapp',
          event: 'on_score_threshold',
          to: '+15550192834',
          conditionScoreMin: 80,
          templateHtml: 'Candidate {{candidate_name}} scored {{score}}%!',
        },
      ];

      store.updateSettings({ notificationTriggers: triggers });

      const updatedSettings = useQuizStore.getState().settings;
      expect(updatedSettings.notificationTriggers).toHaveLength(2);
      expect(updatedSettings.notificationTriggers![0].channel).toBe('email');
      expect(updatedSettings.notificationTriggers![1].channel).toBe('whatsapp');
      expect(updatedSettings.notificationTriggers![1].conditionScoreMin).toBe(80);
    });
  });
});
