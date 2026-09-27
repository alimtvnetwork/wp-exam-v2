import { FormField, QuestionLayoutMode, QuestionActionChecklistItem, QuestionReferenceLinkItem, AnswerPlacementMode } from './types/form';

export interface ResolveLayoutModeParams {
  runtimeOverride?: QuestionLayoutMode | 'default';
  fieldMode?: QuestionLayoutMode;
  formDefaultMode?: QuestionLayoutMode;
}

export function resolveQuestionLayoutMode(params: ResolveLayoutModeParams): QuestionLayoutMode {
  const runtime = params.runtimeOverride;
  if (runtime) {
    if (runtime !== 'default') {
      return runtime;
    }
  }

  const field = params.fieldMode;
  if (field) {
    return field;
  }

  const formDef = params.formDefaultMode;
  if (formDef) {
    return formDef;
  }

  return 'standard';
}

export interface ResolveAnswerPlacementParams {
  fieldPlacement?: AnswerPlacementMode;
  formDefaultPlacement?: AnswerPlacementMode;
}

export function resolveAnswerPlacement(params: ResolveAnswerPlacementParams): AnswerPlacementMode {
  const field = params.fieldPlacement;
  if (field) {
    return field;
  }

  const formDef = params.formDefaultPlacement;
  if (formDef) {
    return formDef;
  }

  return 'right';
}

export interface ExtractReferencesParams {
  field?: FormField;
}

export function extractQuestionReferences(params: ExtractReferencesParams): QuestionReferenceLinkItem[] {
  const result: QuestionReferenceLinkItem[] = [];
  const field = params.field;

  if (!field) {
    return result;
  }

  const links = field.referenceLinks;
  if (links) {
    links.forEach((link) => {
      result.push({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
      });
    });
  }

  const citations = field.citations;
  if (citations) {
    citations.forEach((cit) => {
      const url = cit.url;
      if (url) {
        const hasExisting = result.some((item) => item.url === url);
        if (!hasExisting) {
          result.push({
            id: cit.id,
            title: cit.title,
            url: url,
          });
        }
      }
    });
  }

  return result;
}

export interface ExtractChecklistParams {
  field?: FormField;
}

export function extractQuestionChecklist(params: ExtractChecklistParams): QuestionActionChecklistItem[] {
  const result: QuestionActionChecklistItem[] = [];
  const field = params.field;

  if (!field) {
    return result;
  }

  const checklist = field.actionChecklist;
  if (checklist) {
    checklist.forEach((item) => {
      result.push({
        id: item.id,
        label: item.label,
        isRequired: Boolean(item.isRequired),
      });
    });
  }

  const citations = field.citations;
  if (citations) {
    citations.forEach((cit) => {
      const isReq = Boolean(cit.isRequiredCheck);
      if (isReq) {
        const hasExisting = result.some((item) => item.id === cit.id);
        if (!hasExisting) {
          result.push({
            id: cit.id,
            label: cit.title,
            isRequired: true,
          });
        }
      }
    });
  }

  return result;
}

export interface ChecklistVerificationParams {
  items: QuestionActionChecklistItem[];
  completedMap: Record<string, boolean>;
}

export interface ChecklistVerificationResult {
  isAllCompleted: boolean;
  isMandatorySatisfied: boolean;
  completedCount: number;
  totalCount: number;
  missingMandatoryLabels: string[];
}

export function verifyChecklistCompletion(params: ChecklistVerificationParams): ChecklistVerificationResult {
  const items = params.items;
  const completedMap = params.completedMap;
  const missingLabels: string[] = [];
  let completedCount = 0;

  for (const item of items) {
    const isDone = Boolean(completedMap[item.id]);
    if (isDone) {
      completedCount++;
    }

    const isReq = Boolean(item.isRequired);
    if (isReq) {
      if (!isDone) {
        missingLabels.push(item.label);
      }
    }
  }

  const totalCount = items.length;
  const isAllCompleted = totalCount === completedCount;
  const isMandatorySatisfied = missingLabels.length === 0;

  return {
    isAllCompleted,
    isMandatorySatisfied,
    completedCount,
    totalCount,
    missingMandatoryLabels: missingLabels,
  };
}

export interface CheckQuestionLockedParams {
  isSequential: boolean;
  targetIndex: number;
  currentStep: number;
  fieldIds: string[];
  answers: Record<string, unknown>;
}

export function isQuestionLockedForNavigation(params: CheckQuestionLockedParams): boolean {
  if (!params.isSequential) {
    return false;
  }

  const isCurrentOrPast = params.targetIndex <= params.currentStep;
  if (isCurrentOrPast) {
    return false;
  }

  for (let i = 0; i < params.targetIndex; i++) {
    const fid = params.fieldIds[i];
    if (fid) {
      const val = params.answers[fid];
      const hasVal = val !== undefined && val !== '';
      const isArr = Array.isArray(val);
      const isAns = isArr ? val.length > 0 : hasVal;
      if (!isAns) {
        return true;
      }
    }
  }

  return false;
}
