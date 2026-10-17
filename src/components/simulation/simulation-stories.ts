/**
 * simulation-stories.ts — story-point content for the candidate-facing quiz simulator.
 *
 * A story point is one narrated beat of a guided walkthrough: a title, a body
 * line explaining what the candidate just experienced, and the step index it
 * maps to. Story points are ordered; the simulator shows one at a time
 * (single-focus principle: one beat on screen, never a wall of text).
 *
 * Plain data only — no secrets, no PII. Terminology uses "Section", never "Module".
 */

export interface SimulationStoryPoint {
  title: string;
  body: string;
  stepIndex: number;
}

export const simulationStories: Record<string, SimulationStoryPoint[]> = {
  'branching-onboarding': [
    {
      stepIndex: 0,
      title: 'Section 1 of 3 — Tell us your name',
      body: 'Every onboarding starts with identity. This short-answer step has no branching rules, so everyone answers it and the quiz always moves forward to the next step.',
    },
    {
      stepIndex: 1,
      title: 'Section 2 of 3 — Choose your track',
      body: 'This is the decision point of the quiz. Your answer here fires a jump rule that routes you down a different track — engineers, designers, and everyone else each see different questions next.',
    },
    {
      stepIndex: 2,
      title: 'Engineering track',
      body: 'You answered "Engineer", so the jump rule carried you straight here and the design track was skipped. Track-specific questions keep the quiz short and relevant to the person taking it.',
    },
    {
      stepIndex: 3,
      title: 'Design track',
      body: 'You answered "Designer", so the jump rule carried you straight here and the engineering track was skipped. Each track asks only what matters for that role.',
    },
    {
      stepIndex: 4,
      title: 'Section 3 of 3 — Wrap up',
      body: 'All tracks converge on this final step. It is an optional paragraph field — a last open question before the quiz ends, no matter which path you took.',
    },
  ],
  'simulation-showcase': [
    {
      stepIndex: 0,
      title: 'Section 1 of 4 — Pick a simulation track',
      body: 'Two jump rules watch this step. Answering "Engineering" jumps to the engineering stack question; "Design" jumps to the design discipline question. Try both to see the two paths.',
    },
    {
      stepIndex: 1,
      title: 'Section 2 of 4 — Engineering stack',
      body: 'You are on the engineering path. Any answer here fires an "is answered" rule that jumps forward to the skills step, skipping the design path entirely.',
    },
    {
      stepIndex: 2,
      title: 'Section 2 of 4 — Design discipline',
      body: 'You are on the design path. Any answer here fires an "is answered" rule that jumps forward to the skills step, skipping the engineering path entirely.',
    },
    {
      stepIndex: 3,
      title: 'Section 3 of 4 — Skill areas',
      body: 'This step demonstrates multi-select routing. Pick one skill or several: the contains rules are evaluated in order, and the first match decides where you go next.',
    },
    {
      stepIndex: 4,
      title: 'Frontend deep-dive',
      body: 'Your skills included "Frontend". Notice this question also carries a visibility rule nested inside the jump branch — it only appears when the skills answer contains "Frontend".',
    },
    {
      stepIndex: 5,
      title: 'Backend deep-dive',
      body: 'Your skills included "Backend". Like its frontend sibling, this question is guarded by a visibility rule nested inside the jump branch.',
    },
    {
      stepIndex: 6,
      title: 'Section 4 of 4 — Wrap up',
      body: 'The terminal step. It has no outgoing jump rules, so every path ends here. In the fixture data this step doubles as a dead-end guard: adding a jump back to an earlier step would be flagged as a cycle.',
    },
  ],
};

export function getStoryForStep(fixtureSlug: string, stepIndex: number): SimulationStoryPoint | undefined {
  const stories = simulationStories[fixtureSlug];

  if (!stories) {
    return undefined;
  }

  return stories.find((story) => story.stepIndex === stepIndex);
}
