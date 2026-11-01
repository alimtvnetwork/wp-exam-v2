import type {
  BugReportSummary,
  RecorderSession,
} from "./types";
import {
  formatScreenNavigationPath,
  resolveScreenName,
} from "./screen-names";
import { generateSemanticDefaultTitle } from "./recorder-store";
import {
  getWorkspaceRoot,
  getAppDbPath,
  resolveImageRefs,
  sanitizeSlug,
} from "./prompt-path-resolver";
import {
  type SplitDbErrorEntry,
  extractCleanElementLabel,
  formatHumanActionInstruction,
  formatScreenshotsSection,
  formatSplitDbErrors,
  formatStepInstruction,
  formatTelemetryTable,
  resolveEventXPath,
} from "./prompt-instruction-formatter";
import type { LetterlyPromptOptions } from "./prompt-v6-generator";

export function generateV7LetterlyPrompt(
  session: RecorderSession,
  options?: LetterlyPromptOptions,
): string {
  const summary = options?.summary || session.summary;
  let rawTitle = summary?.title?.trim() || "";

  if (
    !rawTitle ||
    rawTitle.includes("rec-") ||
    rawTitle.startsWith("Recorded Session") ||
    rawTitle.startsWith("Recorded Issue: rec-")
  ) {
    rawTitle = generateSemanticDefaultTitle(session.initialRoute || "/");
  }

  const title = rawTitle;
  const slug = sanitizeSlug(title);
  const expected = summary?.expectedBehavior || "Expected normal operation without visual or logical glitches.";
  const actual = summary?.actualBehavior || "Unexpected defect observed during user interaction.";
  const description = summary?.description || "Session recorded with interaction steps and diagnostic evidence.";
  const baseDir = options?.baseDir;
  const workspaceRoot = getWorkspaceRoot(options?.workspaceRoot);
  const isAbsolute = options?.isAbsolute ?? true;
  const finalRoute = session.finalRoute || session.initialRoute;

  const isTimeRestricted = Boolean(options?.isTimeRestricted);
  const resolvedTimezone = options?.targetTimezone || "UTC";
  const botAgentName = options?.botAgentName || "AI coding assistant";

  const routes = session.routeHistory && session.routeHistory.length > 0
    ? session.routeHistory
    : [session.initialRoute, finalRoute];
  const navPath = formatScreenNavigationPath(routes);

  const imageRefs = resolveImageRefs(session, baseDir, workspaceRoot, isAbsolute);
  const telemetryTable = formatTelemetryTable(session, imageRefs, baseDir, workspaceRoot, isAbsolute);
  const effectiveSplitDbErrors =
    options?.splitDbErrors && options.splitDbErrors.length > 0
      ? options.splitDbErrors
      : ((session.errors || []) as SplitDbErrorEntry[]);
  const errorBlock = formatSplitDbErrors(effectiveSplitDbErrors, {
    sessionId: session.id,
    workspaceRoot,
  });
  const screenshotsBlock = formatScreenshotsSection(imageRefs);

  const operatingModeName = isTimeRestricted
    ? "Option 1: Time-Restricted Mode (Dynamic Waiting Protocol)"
    : "Option 2: Unrestricted Mode (Continuous Autonomous Loop)";

  const actionableItems: string[] = [
    `1. Git pull BEFORE starting any work — run \`git pull\` in the repository folder and resolve merge conflicts so the repository is up to date and clean before starting.`,
    `2. Write spec under 02-spec/21-app/XX-${slug}/ and enqueue plan task in .ai-memory/plans/pending/XX-${slug}.md (subtasks in .ai-memory/plans/subtasks/XX-${slug}/) first (XX is sequence 01, 02).`,
    `3. Search the codebase with your project's search tools (indexed search, find, grep) instead of slow unscoped scans; never commit generated search caches or artifacts.`,
    `4. Strictly use relative paths (02-spec/..., .ai-memory/..., src/...); only add relative paths, never add absolute paths during work or on the release page and in release notes.`,
    `5. IMPORTANT: The attached snapshot images are for learning purposes only to understand UI behavior and geometry. NEVER save, copy, move, or commit snapshot images into codebase assets (assets/, src/assets/, public/assets/). Leave image artifacts strictly in runtime logs (.logs/recorded-bugs/${session.id}/). Analyze the bug, formulate your fix, and discard/forget the images.`,
    `6. Use AI agents to automate repetitive data-entry steps.`,
    `7. Task completion includes committing and pushing to Git.`,
    `8. Give every Task-NN in confirmed task breakdown a \`Slug:\` sub-item derived from root slug (\`${slug} - Task NN\`) so subtasks stay linked and verifiable.`,
    `9. Execute the confirmed task breakdown step by step with your AI coding assistant: Option 1 (Time-Restricted commits before 08:00 AM weekdays / anytime weekends) or Option 2 (Unrestricted commits).`,
    `10. Enforce time-restricted recommits using semantic commit verbs without polluting git history.`,
    `11. Enforce the repository/data-access pattern: isolate all data access behind repository interfaces and keep error handling strongly typed.`,
  ];

  let currentItemIndex = 12;

  session.events.forEach((evt, idx) => {
    const seqNum = evt.seqNumber ?? (idx + 1);
    const elapsed = evt.elapsedMs;
    const route = evt.route || session.initialRoute;
    const screenName = resolveScreenName(route);
    const cleanLabel = extractCleanElementLabel(evt.targetComponent, evt.description);
    const xpathVal = resolveEventXPath(evt);
    const actionPhrase = formatHumanActionInstruction({
      eventType: evt.eventType,
      cleanLabel,
      targetComponent: evt.targetComponent,
      details: evt.details,
      screenName,
      route,
    });

    const matchedRef = imageRefs.find((r) => r.sequenceNumber === seqNum);
    const evidenceLink = matchedRef
      ? `Evidence: @[${String(seqNum).padStart(2, "0")}_${matchedRef.instanceId}_${matchedRef.actionDescriptor}.png](file;${matchedRef.absolutePath}).`
      : evt.hasScreenshot
        ? `Evidence: @[${String(seqNum).padStart(2, "0")}_${evt.eventType}_${cleanLabel}.png](file;.logs/recorded-bugs/${session.id}/screenshots/${String(seqNum).padStart(2, "0")}_${evt.eventType}_${cleanLabel}.png).`
        : "";

    const instruction = formatStepInstruction({
      seqNumber: seqNum,
      elapsedMs: elapsed,
      screenName,
      route,
      actionPhrase,
      xpath: xpathVal,
      evidenceLink: evidenceLink ? evidenceLink.replace(/^Evidence:\s*/, "").replace(/\.$/, "") : undefined,
    });

    actionableItems.push(`${currentItemIndex}. ${instruction}`);
    currentItemIndex += 1;
  });

  if (effectiveSplitDbErrors.length > 0) {
    const errSummaries = effectiveSplitDbErrors
      .slice(0, 5)
      .map((e) => `[${e.code || "ERR"}] ${e.message || "Unknown"} (Trigger: ${e.triggerComponent || "N/A"})`)
      .join("; ");
    const absDb = getAppDbPath("task.db").replace(/\\/g, "/");
    const absMeta = `.logs/recorded-bugs/${session.id}/metadata.json`;

    actionableItems.push(
      `${currentItemIndex}. Resolve active runtime and application errors recorded in @[task.db](file;${absDb}) and @[metadata.json](file;${absMeta}): ${errSummaries}.`,
    );

    currentItemIndex += 1;
  }

  actionableItems.push(
    `${currentItemIndex}. Commit and finalize all verified fixes atomically: \`git commit -m "fix: resolve ${slug}"\`.`,
  );

  return `# ${title}: high priority instruction, non-negotiable task

${description}

**Navigation Path:** ${navPath}
**Observed Behavior:** ${actual}
**Expected Behavior:** ${expected}

## task: ${title}
## slug: ${slug}

# Actionable Items Must Follow Non-Negotiable

${actionableItems.join("\n")}

## Operating Mode & Bot Identity

- **Active Mode**: ${operatingModeName} (\`isTimeRestricted: ${isTimeRestricted}\`)
- **Configured Timezone**: \`${resolvedTimezone}\`
- **AI Automation Bot Persona**: \`AI coding assistant - ${botAgentName}\`

## Sequential Event Timeline & UI Telemetry

${telemetryTable}

## Visual Evidence & Diagnostic Screenshots

${screenshotsBlock}

## Active Application & Runtime Diagnostics

${errorBlock}

## Session Reference

- Session ID: \`${session.id}\`
- Recorded bug artifacts live under \`.logs/recorded-bugs/${session.id}/\` (relative to the repository root).
- Session data is also persisted in the browser IndexedDB database \`wp-exam-recorder\`, object store \`bug-sessions\` (DevTools > Application > IndexedDB).

## Ask your AI coding assistant

Work through this AI Bug-Fix Prompt step by step with your AI coding assistant to diagnose and fix the defect.

## Additional Instructions

- [/plan](slashCommand;plan) first before doing work for improved work or less friction, faster execution for AI and coding without errors and following Coding Guidelines.
- [/learn](slashCommand;learn) first to pick up the project's conventions, search tooling, and caching before making changes.
- Track in-flight file touches and prevent write collisions while editing.
- Only add relative paths, never add absolute paths during work; this must be respected on release page and in release notes as well.
`;
}
