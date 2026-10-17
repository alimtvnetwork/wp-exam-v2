/**
 * admin-tour-steps.ts — the 6-step guided onboarding tour for the admin panel.
 *
 * Each step points at a real sidebar tab (or admin surface) via an XPath
 * expression matched against the tab's visible label. If a tab is renamed or
 * removed, the tour skips that step gracefully and continues — never a blank
 * spotlight. When renaming a sidebar tab, update the matching selector here.
 *
 * Copy rules: one idea per card, text-sm minimum, "Section" never "Module".
 */

export interface AdminTourStep {
  /** XPath matched against the visible tab label, e.g. '//button[.//span[normalize-space(.)="Form & Quiz Builder"]]' */
  targetXPath: string;
  title: string;
  body: string;
  position: 'above' | 'below' | 'left' | 'right';
}

function tabXPath(label: string): string {
  return `//button[.//span[normalize-space(.)="${label}"]]`;
}

export const adminTourSteps: AdminTourStep[] = [
  {
    targetXPath: tabXPath('Form & Quiz Builder'),
    title: 'Step 1 of 6 — Build your quiz',
    body: 'Everything starts here. Add questions, choose their types, and arrange them into sections. This is the canvas where your quiz takes shape.',
    position: 'right',
  },
  {
    targetXPath: tabXPath('Form & Quiz Builder'),
    title: 'Step 2 of 6 — Add conditional rules',
    body: 'Open any question to add branching rules: jump candidates to different questions based on their answers. Rules are evaluated in order — the first match wins.',
    position: 'right',
  },
  {
    targetXPath: tabXPath('Live Form Runner'),
    title: 'Step 3 of 6 — Preview as a candidate',
    body: 'See exactly what candidates will see. The preview runs the same engine as the live quiz, so what you test here is what they get.',
    position: 'right',
  },
  {
    targetXPath: tabXPath('Live Form Runner'),
    title: 'Step 4 of 6 — Try the simulation',
    body: 'Open a guided demo to watch conditional quizzes behave section by section. Each transition is narrated, so you learn the branching model while taking the demo.',
    position: 'right',
  },
  {
    targetXPath: tabXPath('Candidate Invites'),
    title: 'Step 5 of 6 — Invite candidates',
    body: 'Send the quiz to people. Each invite carries a secure token link — candidates open it and start right away, no account needed.',
    position: 'right',
  },
  {
    targetXPath: tabXPath('Candidate Invites'),
    title: 'Step 6 of 6 — Track completion',
    body: 'Every invitee gets a personal checklist of their assigned quizzes, exams, and projects — visible in their dashboard and sent by email. You are all set.',
    position: 'right',
  },
];

export const TOUR_COMPLETED_FLAG = 'wp_exam_onboarding_tour_completed';
export const REPLAY_TOUR_EVENT = 'wp-exam:replay-tour';
