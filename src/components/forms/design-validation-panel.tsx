import React, { useState } from 'react';
import { FormField } from '@/lib/types/form';
import {
  DesignHealthReport,
  DesignValidationIssue,
  DesignIssueCategory,
  applyAutoFixToFields,
  applyAllAutoFixes,
} from '@/lib/design-validation-engine';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  ArrowRight,
  Wand2,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface DesignValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  report: DesignHealthReport;
  fields: FormField[];
  onUpdateFields: (newFields: FormField[]) => void;
  onJumpToField: (fieldId: string) => void;
}

export const DesignValidationPanel: React.FC<DesignValidationPanelProps> = ({
  isOpen,
  onClose,
  report,
  fields,
  onUpdateFields,
  onJumpToField,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredIssues = report.issues.filter((issue) => {
    if (selectedCategory === 'all') {
      return true;
    }
    if (selectedCategory === 'errors') {
      return issue.severity === 'error';
    }
    if (selectedCategory === 'warnings') {
      return issue.severity === 'warning';
    }
    return issue.category === selectedCategory;
  });

  const handleFixIssue = (issue: DesignValidationIssue) => {
    const updated = applyAutoFixToFields(fields, issue);
    onUpdateFields(updated);
    toast.success(`Auto-fixed: ${issue.title}`);
  };

  const handleFixAll = () => {
    const updated = applyAllAutoFixes(fields, report.issues);
    onUpdateFields(updated);
    toast.success(`Applied auto-fixes across all repairable issues!`);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-3 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-sm ${getScoreBadgeColor(
                  report.score
                )}`}
              >
                {report.grade}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Design Health & Validation Inspector</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Automated visual hierarchy, UX accessibility, choice completeness, and quiz scoring audit.
                </DialogDescription>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-foreground">
                Score: {report.score}/100
              </span>
              <span className="block text-xs text-muted-foreground capitalize">
                Grade {report.grade} Quality
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Health Score Overview Ribbon */}
        <div className="grid grid-cols-4 gap-2 py-1 text-center text-xs">
          <div className="p-2 rounded-lg bg-muted/30 border border-border/60">
            <span className="block font-bold text-foreground text-sm">{report.score}%</span>
            <span className="text-xs text-muted-foreground">Health Score</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <span className="block font-bold text-sm">{report.errorCount}</span>
            <span className="text-xs">Errors</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <span className="block font-bold text-sm">{report.warningCount}</span>
            <span className="text-xs">Warnings</span>
          </div>
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <span className="block font-bold text-sm">{report.infoCount}</span>
            <span className="text-xs">Suggestions</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/60 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              selectedCategory === 'all'
                ? 'bg-background text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({report.issues.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('errors')}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              selectedCategory === 'errors'
                ? 'bg-background text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Errors ({report.errorCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('warnings')}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              selectedCategory === 'warnings'
                ? 'bg-background text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Warnings ({report.warningCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('a11y')}
            className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-all ${
              selectedCategory === 'a11y'
                ? 'bg-background text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            A11y / UX
          </button>
        </div>

        {/* Issues List */}
        <div className="space-y-2.5 max-h-[calc(100vh-380px)] overflow-y-auto pr-1 custom-scrollbar">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-foreground">Zero Design Violations Detected</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Your form adheres completely to visual hierarchy standards, complete choice sets, proper scoring, and accessibility guidance.
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3 rounded-xl border border-border/80 bg-background/80 hover:border-primary/40 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    {issue.severity === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-foreground block">
                        {issue.title}
                      </span>
                      <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`uppercase text-xs font-mono shrink-0 ${
                      issue.severity === 'error'
                        ? 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                        : issue.severity === 'warning'
                        ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                        : 'border-sky-500/30 text-sky-400 bg-sky-500/10'
                    }`}
                  >
                    {issue.severity}
                  </Badge>
                </div>

                {/* Recommendation Ribbon */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span className="text-muted-foreground italic flex-1 pr-2 truncate">
                    💡 {issue.recommendation}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {issue.fieldId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onJumpToField(issue.fieldId!);
                          onClose();
                        }}
                        className="h-6 text-xs px-2 text-primary hover:bg-primary/10 gap-1"
                      >
                        <span>Jump</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}

                    {issue.autoFixAvailable && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleFixIssue(issue)}
                        className="h-6 text-xs px-2 bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 gap-1 font-medium"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>1-Click Fix</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border/80 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close Inspector
          </Button>

          {report.issues.some((i) => i.autoFixAvailable) && (
            <Button
              type="button"
              size="sm"
              onClick={handleFixAll}
              className="text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fix All Repairable Issues</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export interface DesignValidationSidebarViewProps {
  report: DesignHealthReport;
  fields: FormField[];
  onUpdateFields: (newFields: FormField[]) => void;
  onJumpToField: (fieldId: string) => void;
  onOpenFullDialog?: () => void;
}

export const DesignValidationSidebarView: React.FC<DesignValidationSidebarViewProps> = ({
  report,
  fields,
  onUpdateFields,
  onJumpToField,
  onOpenFullDialog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryDetails, setShowCategoryDetails] = useState<boolean>(false);

  const filteredIssues = report.issues.filter((issue) => {
    if (selectedCategory === 'all') {
      return true;
    }

    if (selectedCategory === 'errors') {
      return issue.severity === 'error';
    }

    if (selectedCategory === 'warnings') {
      return issue.severity === 'warning';
    }

    return issue.category === selectedCategory;
  });

  const handleFixIssue = (issue: DesignValidationIssue) => {
    const updated = applyAutoFixToFields(fields, issue);
    onUpdateFields(updated);
    toast.success(`Auto-fixed: ${issue.title}`);
  };

  const handleFixAll = () => {
    const updated = applyAllAutoFixes(fields, report.issues);
    onUpdateFields(updated);
    toast.success(`Applied auto-fixes across all repairable issues!`);
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Health Score Summary Card */}
      <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-sm ${getScoreBadgeColor(
                report.score
              )}`}
            >
              {report.grade}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Health Score: {report.score}%</span>
              </div>
              <span className="text-xs text-muted-foreground block">
                Grade {report.grade} Compliance
              </span>
            </div>
          </div>

          {onOpenFullDialog && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenFullDialog}
              className="h-6 text-xs px-2 text-primary hover:bg-primary/10 gap-1 font-medium"
              title="Open full expanded health inspector modal"
            >
              <span>Expand</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Severity Metrics Chips */}
        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="py-1 px-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 font-medium">
            <span className="font-bold">{report.errorCount}</span> Errors
          </div>
          <div className="py-1 px-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-medium">
            <span className="font-bold">{report.warningCount}</span> Warnings
          </div>
          <div className="py-1 px-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-medium">
            <span className="font-bold">{report.infoCount}</span> Tips
          </div>
        </div>

        {/* Category Breakdown Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowCategoryDetails(!showCategoryDetails)}
            className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-0.5 hover:underline flex items-center justify-center gap-1"
          >
            <span>{showCategoryDetails ? 'Hide Category Scores ▲' : 'View Category Breakdown ▼'}</span>
          </button>

          {showCategoryDetails && (
            <div className="mt-2 pt-2 border-t border-border/60 space-y-1.5">
              {Object.entries(report.categoryScores).map(([cat, score]) => (
                <div key={cat} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{cat}</span>
                    <span className="font-mono text-foreground font-semibold">{score}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60 text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`flex-1 py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'all'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({report.issues.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('errors')}
          className={`flex-1 py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'errors'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Errors ({report.errorCount})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('warnings')}
          className={`flex-1 py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'warnings'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Warn ({report.warningCount})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('a11y')}
          className={`flex-1 py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'a11y'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          A11y
        </button>
      </div>

      {/* Issues Feed in Sidebar */}
      <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto pr-1 custom-scrollbar">
        {filteredIssues.length === 0 ? (
          <div className="p-6 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Zero Violations</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your form passes all visual hierarchy, scoring, and branching checks.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="p-2.5 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/30 transition-colors space-y-1.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-start gap-1.5 min-w-0">
                  {issue.severity === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground block text-xs leading-tight">
                      {issue.title}
                    </span>
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2 leading-tight">
                      {issue.description}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`uppercase text-[8px] font-mono shrink-0 px-1 py-0 h-3.5 ${
                    issue.severity === 'error'
                      ? 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                      : issue.severity === 'warning'
                      ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                      : 'border-sky-500/30 text-sky-400 bg-sky-500/10'
                  }`}
                >
                  {issue.severity}
                </Badge>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                <span className="text-muted-foreground italic truncate max-w-[130px]" title={issue.recommendation}>
                  💡 {issue.recommendation}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {issue.fieldId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onJumpToField(issue.fieldId!)}
                      className="h-5 text-xs px-1.5 text-primary hover:bg-primary/10 gap-0.5"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Button>
                  )}

                  {issue.autoFixAvailable && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleFixIssue(issue)}
                      className="h-5 text-xs px-1.5 bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 gap-0.5 font-medium"
                    >
                      <Wand2 className="w-2.5 h-2.5" />
                      <span>Fix</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Global Fix All Button */}
      {report.issues.some((i) => i.autoFixAvailable) && (
        <Button
          type="button"
          size="sm"
          onClick={handleFixAll}
          className="w-full text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs h-7"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fix All Repairable Issues</span>
        </Button>
      )}
    </div>
  );
};

