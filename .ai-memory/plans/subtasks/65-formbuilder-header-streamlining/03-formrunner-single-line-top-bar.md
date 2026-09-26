# Subtask 03: FormRunner Single-Line Top Bar Compaction

> **/goal** Streamline `FormRunner.tsx` top navigation bar into a single-line horizontal layout without line-wrapping or wasted whitespace.
> **/learn** Grounded on `assets/screenshots/65-wpexam-header-layout-01.png` and `02-spec/21-app/12-formbuilder-header-streamlining.md`.

## Target Files
- `src/components/runner/FormRunner.tsx`

## Mandatory Requirements
1. **Single-Line Container**:
   - `flex items-center justify-between gap-2 p-2 sm:px-3 bg-card border border-border rounded-xl shadow-xs overflow-x-auto`.
2. **Compact Controls**:
   - `Project:` selector with compact width (`min-w-[170px] max-w-[210px] h-8 text-xs`).
   - Active slug chip (`/preview/{slug}`) in `text-xs px-2 py-1`.
   - `Theme:` selector with compact width (`w-[140px] sm:w-[160px] h-8 text-xs`).
3. **Streamlined Action Buttons**:
   - Share button: `<Button size="icon" variant="outline" className="h-8 w-8 rounded-lg" onClick={handleCopyProjectLink} title="Copy / Share Direct URL"><Share2 className="w-3.5 h-3.5 text-primary" /></Button>`.
   - Auto Fill button: `<Button size="sm" variant="outline" className="h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-lg" onClick={handleAutoFill}><Zap className="w-3.5 h-3.5 text-amber-500" /><span className="hidden md:inline">Auto Fill</span></Button>`.
   - Debug button: `<Button size="sm" variant={isDebugMode ? 'default' : 'outline'} className="h-8 px-2 text-xs font-semibold rounded-lg" onClick={() => setIsDebugMode(!isDebugMode)} title="Toggle Debug Mode"><Bug className="w-3.5 h-3.5 text-amber-500" /></Button>`.
   - Exit button: `<Button size="sm" variant="outline" className="h-8 px-2.5 gap-1 text-xs font-medium rounded-lg" onClick={handleExit}><ArrowLeft className="w-3.5 h-3.5" /><span>Exit</span></Button>`.
4. **Positive Booleans**:
   - Implicit evaluations only (`if isReady`), zero `== true`.
