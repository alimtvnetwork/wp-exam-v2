import React, { useState } from 'react';
import {
  Search,
  Terminal,
  Play,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  Shield,
  Cpu,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CommandAction {
  id: string;
  command: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const CommandPalettePreview: React.FC<{
  onExecute: (path: string) => void;
}> = ({ onExecute }) => {
  const [query, setQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const commands: CommandAction[] = [
    {
      id: 'cmd-runner',
      command: 'engine.startAssessment({ slug: "fullstack-eng" })',
      category: 'Runner',
      description: 'Trigger full-stack engineering candidate examination',
      icon: Play,
      action: () => onExecute('/apply'),
    },
    {
      id: 'cmd-builder',
      command: 'admin.openBuilder({ tab: "builder" })',
      category: 'Admin',
      description: 'Launch visual form builder and question editor',
      icon: Layers,
      action: () => onExecute('/admin?tab=builder'),
    },
    {
      id: 'cmd-portal',
      command: 'portal.authenticate({ mode: "candidate" })',
      category: 'Portal',
      description: 'Open candidate assessment checkpoint & results vault',
      icon: Shield,
      action: () => onExecute('/portal'),
    },
    {
      id: 'cmd-schema',
      command: 'sqlite.inspectSchema({ db: "repodb/pipeline.db" })',
      category: 'Database',
      description: 'Review Split SQLite tables, questions, and responses schema',
      icon: Database,
      action: () => onExecute('/admin?tab=projects'),
    },
    {
      id: 'cmd-simulate',
      command: 'simulator.runBranchingGraph({ fixture: "branching-onboarding" })',
      category: 'Simulator',
      description: 'Simulate adaptive conditional question paths with step narration',
      icon: Cpu,
      action: () => onExecute('/runner'),
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query) {
      return true;
    }

    return (
      cmd.command.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleRunCommand = (cmd: CommandAction) => {
    setFeedbackMessage(`[EXEC] ${cmd.command} -> HTTP 200 OK (latency: 3.4ms)`);
    setTimeout(() => {
      cmd.action();
    }, 450);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl bg-card/90 backdrop-blur-xl border border-border shadow-[0_16px_50px_rgba(0,0,0,0.3)] overflow-hidden font-mono text-xs relative">
      <div className="h-0.5 w-full bg-primary/70" />

      {/* Terminal Titlebar */}
      <div className="px-5 py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between text-muted-foreground select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-2xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-2xs" />
          </div>
          <span className="text-[11px] font-semibold text-foreground/90 flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>wp-exam-runtime v2.5.0 ~ zsh</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            Online
          </span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-foreground font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="p-3.5 border-b border-border/60 bg-card flex items-center gap-3">
        <Search className="w-4 h-4 text-primary shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Execute assessment command, slug, or system utility..."
          className="w-full bg-transparent border-0 outline-hidden text-foreground placeholder:text-muted-foreground text-xs font-mono"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md bg-muted cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Live Command Results List */}
      <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
        {feedbackMessage && (
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center gap-2 text-xs font-mono animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{feedbackMessage}</span>
          </div>
        )}

        {filteredCommands.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No matching command found for &quot;{query}&quot;
          </div>
        ) : (
          filteredCommands.map((cmd) => {
            const Icon = cmd.icon;

            return (
              <button
                key={cmd.id}
                type="button"
                onClick={() => handleRunCommand(cmd)}
                className="w-full p-3 rounded-2xl hover:bg-muted/60 transition-all text-left flex items-center justify-between group cursor-pointer border border-transparent hover:border-border/70"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-muted text-foreground flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {cmd.command}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 border-border text-muted-foreground font-mono">
                        {cmd.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate font-sans mt-0.5">
                      {cmd.description}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-3" />
              </button>
            );
          })
        )}
      </div>

      {/* Terminal Status Footer */}
      <div className="px-5 py-2.5 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Split SQLite Core • Zero Lock Contention WAL Mode</span>
        </span>
        <span className="text-primary font-mono font-bold">&lt; 3.4ms Write Response</span>
      </div>
    </div>
  );
};
