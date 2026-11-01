/**
 * Extension point — wp-exam-v2 host apps may return extra diagnostics
 * (active quiz, route state) to embed in bug reports.
 */
export function getExtraReportContext(): Record<string, unknown> {
  return {};
}
