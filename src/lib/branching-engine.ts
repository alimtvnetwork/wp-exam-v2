import { FormField, FieldConditionRule } from '@/lib/types/form';

/**
 * Evaluates whether a single condition rule is satisfied against current answers.
 */
export function evaluateConditionRule(
  rule: FieldConditionRule,
  answers: Record<string, unknown>
): boolean {
  const actualValue = answers[rule.parentFieldId];
  const hasValue = actualValue !== undefined && actualValue !== null && actualValue !== '';

  if (rule.operator === 'is_empty') {
    return !hasValue;
  }

  if (rule.operator === 'is_not_empty') {
    return hasValue;
  }

  const isMissingValue = !hasValue;

  if (isMissingValue) {
    return false;
  }

  const actualString = String(actualValue).trim().toLowerCase();
  const expectedString = String(rule.expectedValue ?? '').trim().toLowerCase();

  if (rule.operator === 'equals') {
    const isMatched = actualString === expectedString;

    return isMatched;
  }

  if (rule.operator === 'not_equals') {
    const isDifferent = actualString !== expectedString;

    return isDifferent;
  }

  if (rule.operator === 'contains') {
    if (Array.isArray(actualValue)) {
      const hasItem = actualValue.some(
        (item) => String(item).trim().toLowerCase() === expectedString
      );

      return hasItem;
    }

    const hasSubstring = actualString.includes(expectedString);

    return hasSubstring;
  }

  return false;
}

/**
 * Authoritatively determines whether a field is currently visible given active answers.
 */
export function evaluateFieldVisibility(
  field: FormField,
  answers: Record<string, unknown>,
  _allFields?: FormField[]
): boolean {
  const conditions = field.conditions || [];
  const hasConditions = conditions.length > 0;

  if (!hasConditions) {
    return true;
  }

  const showConditions = conditions.filter((c) => c.action === 'show');
  const hideConditions = conditions.filter((c) => c.action === 'hide');

  const hasShowRules = showConditions.length > 0;
  const hasHideRules = hideConditions.length > 0;

  const isMatchAny = field.conditionMatch === 'any';

  // Evaluate show conditions: if show conditions exist, field must satisfy them
  let isShowSatisfied = true;

  if (hasShowRules) {
    if (isMatchAny) {
      isShowSatisfied = showConditions.some((rule) => evaluateConditionRule(rule, answers));
    } else {
      isShowSatisfied = showConditions.every((rule) => evaluateConditionRule(rule, answers));
    }
  }

  if (!isShowSatisfied) {
    return false;
  }

  // Evaluate hide conditions: if hide condition is met, field is hidden
  if (hasHideRules) {
    const isHidden = isMatchAny
      ? hideConditions.some((rule) => evaluateConditionRule(rule, answers))
      : hideConditions.every((rule) => evaluateConditionRule(rule, answers));

    if (isHidden) {
      return false;
    }
  }

  return true;
}

/**
 * Authoritatively determines whether a field is currently required.
 * Hidden fields are NEVER required.
 */
export function evaluateFieldRequired(
  field: FormField,
  answers: Record<string, unknown>,
  allFields?: FormField[]
): boolean {
  const isVisible = evaluateFieldVisibility(field, answers, allFields);

  if (!isVisible) {
    return false;
  }

  const requireConditions = (field.conditions || []).filter((c) => c.action === 'require');
  const hasRequireRules = requireConditions.length > 0;

  if (hasRequireRules) {
    const isMatchAny = field.conditionMatch === 'any';
    const isRequireSatisfied = isMatchAny
      ? requireConditions.some((rule) => evaluateConditionRule(rule, answers))
      : requireConditions.every((rule) => evaluateConditionRule(rule, answers));

    if (isRequireSatisfied) {
      return true;
    }
  }

  return field.isRequired;
}

/**
 * Finds the next visible step index in sequential mode, honoring option-level and condition-level jumps.
 */
export function getNextStepIndex(
  fields: FormField[],
  currentStep: number,
  answers: Record<string, unknown>
): number {
  const currentField = fields[currentStep];

  if (!currentField) {
    return currentStep + 1;
  }

  // 1. Check option-level branching for choice / true_false fields
  const currentAnswer = answers[currentField.id];
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== null;

  if (hasAnswer && currentField.optionBranching) {
    const targetFieldId = currentField.optionBranching[String(currentAnswer)];

    if (targetFieldId) {
      const targetIndex = fields.findIndex((f) => f.id === targetFieldId);
      const isTargetValid = targetIndex >= 0;

      if (isTargetValid) {
        const isTargetVisible = evaluateFieldVisibility(fields[targetIndex], answers, fields);

        if (isTargetVisible) {
          return targetIndex;
        }
      }
    }
  }

  // 2. Check condition-level jump_to action
  const jumpConditions = (currentField.conditions || []).filter(
    (c) => c.action === 'jump_to' && c.jumpToFieldId
  );

  for (const rule of jumpConditions) {
    const isRuleMet = evaluateConditionRule(rule, answers);

    if (isRuleMet && rule.jumpToFieldId) {
      const targetIndex = fields.findIndex((f) => f.id === rule.jumpToFieldId);
      const isTargetValid = targetIndex >= 0;

      if (isTargetValid) {
        return targetIndex;
      }
    }
  }

  // 3. Check default branchTarget on currentField
  if (currentField.branchTarget) {
    const targetIndex = fields.findIndex((f) => f.id === currentField.branchTarget);
    const isTargetValid = targetIndex >= 0;

    if (isTargetValid) {
      const isTargetVisible = evaluateFieldVisibility(fields[targetIndex], answers, fields);

      if (isTargetVisible) {
        return targetIndex;
      }
    }
  }

  // 4. Default sequential progression: scan forward for next visible field
  let nextIndex = currentStep + 1;

  while (nextIndex < fields.length) {
    const isVisible = evaluateFieldVisibility(fields[nextIndex], answers, fields);

    if (isVisible) {
      return nextIndex;
    }

    nextIndex += 1;
  }

  return nextIndex;
}

/**
 * Finds the previous visible step index in sequential mode.
 */
export function getPreviousStepIndex(
  fields: FormField[],
  currentStep: number,
  answers: Record<string, unknown>
): number {
  let prevIndex = currentStep - 1;

  while (prevIndex >= 0) {
    const isVisible = evaluateFieldVisibility(fields[prevIndex], answers, fields);

    if (isVisible) {
      return prevIndex;
    }

    prevIndex -= 1;
  }

  return 0;
}

/**
 * Human-readable natural language summary of a branching rule.
 */
export function formatRuleDescription(
  rule: FieldConditionRule,
  allFields: FormField[]
): string {
  const parentField = allFields.find((f) => f.id === rule.parentFieldId);
  const parentName = parentField ? parentField.label : rule.parentFieldId || 'Unknown Field';

  const actionLabels: Record<string, string> = {
    show: 'SHOW this question',
    hide: 'HIDE this question',
    require: 'REQUIRE this question',
    jump_to: 'JUMP TO target question',
  };

  const operatorLabels: Record<string, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    is_not_empty: 'is answered',
    is_empty: 'is left empty',
  };

  const actionText = actionLabels[rule.action] || rule.action;
  const opText = operatorLabels[rule.operator] || rule.operator;

  const isValuelessOp = rule.operator === 'is_not_empty' || rule.operator === 'is_empty';

  if (isValuelessOp) {
    return `${actionText} when "${parentName}" ${opText}`;
  }

  if (rule.action === 'jump_to' && rule.jumpToFieldId) {
    const targetField = allFields.find((f) => f.id === rule.jumpToFieldId);
    const targetName = targetField ? targetField.label : rule.jumpToFieldId;

    return `JUMP TO "${targetName}" when "${parentName}" ${opText} "${rule.expectedValue}"`;
  }

  return `${actionText} when "${parentName}" ${opText} "${rule.expectedValue}"`;
}
