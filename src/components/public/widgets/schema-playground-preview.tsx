import React, { useState } from 'react';
import { Code2, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const SchemaPlaygroundPreview: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const sampleQuestion = {
    title: 'How should Split SQLite databases handle concurrent writes in an assessment runner?',
    options: [
      { text: 'A single monolithic lock on the main database file', isCorrect: false },
      { text: 'Decouple responses.db from questions.db using WAL mode & zero lock contention', isCorrect: true },
      { text: 'Serialize all transactions through an external cloud Redis broker', isCorrect: false },
      { text: 'Disable ACID journaling during peak quiz hours', isCorrect: false },
    ],
    branchingNext: 'section_02_advanced_concurrency',
  };

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  return (
    <div className="w-full rounded-3xl glass-panel-elevated overflow-hidden shadow-2xl relative">
      <div className="h-0.5 w-full bg-primary/70" />

      {/* Header Bar */}
      <div className="px-6 py-4 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="font-bold text-xs sm:text-sm text-foreground">
            Schema-Driven Logic &amp; Live Runner Parity
          </span>
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary hidden sm:inline px-2 py-0.5 rounded-full">
            JSON Schema v2.5
          </Badge>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Playground</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
        {/* Left Column: Code / JSON Inspector */}
        <div className="lg:col-span-5 bg-card/60 p-5 font-mono text-[11px] border-b lg:border-b-0 lg:border-r border-border/80 overflow-x-auto space-y-1.5 text-muted-foreground">
          <div className="text-[10px] uppercase font-bold text-foreground/80 mb-3 flex items-center justify-between">
            <span>branching-node.json</span>
            <span className="text-emerald-500 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AST Tree: Valid
            </span>
          </div>

          <div>&#123;</div>
          <div className="pl-3 text-sky-400">&quot;id&quot;: <span className="text-amber-300">&quot;q_sqlite_concurrency&quot;</span>,</div>
          <div className="pl-3 text-sky-400">&quot;type&quot;: <span className="text-amber-300">&quot;multiple_choice&quot;</span>,</div>
          <div className="pl-3 text-sky-400">&quot;title&quot;: <span className="text-amber-300">&quot;Split SQLite Write Concurrency&quot;</span>,</div>
          <div className="pl-3 text-sky-400">&quot;branchingLogic&quot;: &#123;</div>
          <div className="pl-6 text-emerald-400">&quot;ifPassRoute&quot;: <span className="text-amber-300">&quot;section_02_advanced_concurrency&quot;</span>,</div>
          <div className="pl-6 text-rose-400">&quot;ifFailRoute&quot;: <span className="text-amber-300">&quot;remediation_sqlite_basics&quot;</span></div>
          <div className="pl-3">&#125;,</div>
          <div className="pl-3 text-sky-400">&quot;activeSelectionIndex&quot;: <span className="text-primary font-bold">{selectedOption !== null ? selectedOption : 'null'}</span>,</div>
          <div className="pl-3 text-sky-400">&quot;status&quot;: <span className="text-emerald-400">{isAnswerSubmitted ? '"evaluated"' : '"pending_input"'}</span></div>
          <div>&#125;</div>

          <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-muted-foreground font-sans leading-relaxed">
            Branching paths evaluate in &lt;1ms. Cyclic recursion is blocked before form publishing.
          </div>
        </div>

        {/* Right Column: Live Interactive Runner View */}
        <div className="lg:col-span-7 p-7 sm:p-8 flex flex-col justify-between space-y-6 bg-background/50">
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-muted-foreground tracking-wider uppercase">QUESTION 04 OF 12</span>
              <span className="text-primary font-bold font-mono">10 Points</span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-foreground font-heading leading-snug">
              {sampleQuestion.title}
            </h4>

            {/* Options */}
            <div className="space-y-3">
              {sampleQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = opt.isCorrect;

                let cardStyle = 'border-border/80 hover:border-primary/60 bg-card hover:bg-muted/40 text-foreground';

                if (isSelected) {
                  if (isAnswerSubmitted && isCorrect) {
                    cardStyle = 'border-emerald-500 bg-emerald-500/10 text-foreground font-bold shadow-xs';
                  } else if (isAnswerSubmitted && !isCorrect) {
                    cardStyle = 'border-rose-500 bg-rose-500/10 text-foreground';
                  } else {
                    cardStyle = 'border-primary bg-primary/10 text-primary font-semibold shadow-xs';
                  }
                }

                return (
                  <button
                    key={opt.text}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 cursor-pointer ${cardStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 min-w-0 leading-relaxed">{opt.text}</span>
                    {isSelected && isCorrect && isAnswerSubmitted && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Branching Notification */}
          {isAnswerSubmitted && (
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/30 text-xs flex items-center justify-between text-primary animate-in fade-in duration-200 shadow-xs">
              <span className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Next Node: {sampleQuestion.branchingNext}
              </span>
              <Badge variant="outline" className="border-primary/40 text-primary text-[10px] px-2.5 py-0.5 rounded-full">
                Adaptive Path
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
