import React, { useState } from 'react';
import { GitBranch, Zap, Sparkles, Award, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BranchNode {
  id: string;
  label: string;
  type: 'start' | 'condition' | 'pass' | 'remediation' | 'certificate';
  description: string;
  points: number;
}

const NODES: BranchNode[] = [
  {
    id: 'n1',
    label: '01. Ingestion & Baseline',
    type: 'start',
    description: 'Cryptographic token handshake and foundation screening.',
    points: 10,
  },
  {
    id: 'n2',
    label: '02. Dynamic Branch Gate',
    type: 'condition',
    description: 'Real-time evaluation: Score >= 80% unlocks senior concurrency route.',
    points: 25,
  },
  {
    id: 'n3',
    label: '03A. Advanced Concurrency',
    type: 'pass',
    description: 'High-throughput Split SQLite WAL mode and memory locks.',
    points: 40,
  },
  {
    id: 'n4',
    label: '03B. Core Foundations',
    type: 'remediation',
    description: 'Foundational state management and relational constraints.',
    points: 20,
  },
  {
    id: 'n5',
    label: '04. Verified Credential',
    type: 'certificate',
    description: 'Cryptographic PDF certificate and instant ATS sync.',
    points: 25,
  },
];

export const InteractiveBranchingCanvas: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('n2');
  const activeNode = NODES.find((n) => n.id === activeNodeId) || NODES[1];

  return (
    <div className="w-full rounded-3xl glass-panel-elevated overflow-hidden border border-border/80 shadow-2xl relative">
      <div className="h-0.5 w-full bg-primary/70" />

      {/* Header Bar */}
      <div className="px-6 py-4 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-4 h-4 text-primary" />
          <span className="font-bold text-xs sm:text-sm text-foreground">
            Live Directed Graph Canvas &amp; Cycle Engine
          </span>
          <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px] hidden sm:inline px-2.5 py-0.5 rounded-full">
            Real-Time AST Simulation
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Graph Cycle Free</span>
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-8">
        {/* Interactive Node Graph Map */}
        <div className="relative py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {NODES.map((node, idx) => {
              const isSelected = node.id === activeNodeId;

              let badgeColor = 'bg-primary/10 text-primary border-primary/30';
              if (node.type === 'condition') {
                badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              } else if (node.type === 'pass') {
                badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              } else if (node.type === 'remediation') {
                badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
              } else if (node.type === 'certificate') {
                badgeColor = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
              }

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setActiveNodeId(node.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[120px] ${
                    isSelected
                      ? 'border-primary bg-primary/15 shadow-[0_0_25px_rgba(92,69,253,0.3)] ring-1 ring-primary/60 -translate-y-1'
                      : 'border-border/70 bg-card/60 hover:bg-muted/40 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground">NODE 0{idx + 1}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border font-mono uppercase ${badgeColor}`}>
                      {node.type}
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-foreground font-heading leading-snug">
                    {node.label}
                  </h5>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono mt-2 pt-2 border-t border-border/40">
                    <span>+{node.points} pts</span>
                    {isSelected && <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector Detail Banner */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary font-bold">{activeNode.label}</span>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary uppercase">
                Active Inspector
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-foreground/90 font-sans leading-relaxed">
              {activeNode.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-mono text-muted-foreground block">Branching Cost</span>
              <span className="text-xs font-mono font-bold text-emerald-500">&lt; 0.4ms Latency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
