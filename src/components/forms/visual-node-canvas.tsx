import React, { useState } from 'react';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  ArrowRight,
  Database
} from 'lucide-react';

interface ProjectNode {
  id: string;
  name: string;
  description: string;
  stage: string;
  x: number;
  y: number;
}

interface ProjectEdge {
  id: string;
  from: string;
  to: string;
}

const INITIAL_NODES: ProjectNode[] = [
  { id: 'proj-1', name: 'Stage 1: Technical Screening', description: 'MCQs, Video Briefing, WhatsApp Ping', stage: 'Screening', x: 50, y: 100 },
  { id: 'proj-2', name: 'Stage 2: Coding Assessment', description: 'Algorithm tasks, DB schema design', stage: 'Assessment', x: 380, y: 100 },
  { id: 'proj-3', name: 'Stage 3: Systems Architecture', description: 'Split SQLite and DAG validation', stage: 'Deep Dive', x: 710, y: 100 },
  { id: 'proj-4', name: 'Stage 4: Candidate Interview', description: 'Final technical panel discussion', stage: 'Review', x: 710, y: 280 },
];

const INITIAL_EDGES: ProjectEdge[] = [
  { id: 'e-1-2', from: 'proj-1', to: 'proj-2' },
  { id: 'e-2-3', from: 'proj-2', to: 'proj-3' },
  { id: 'e-3-4', from: 'proj-3', to: 'proj-4' },
];

export const VisualNodeCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<ProjectNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<ProjectEdge[]>(INITIAL_EDGES);
  const [sourceNodeId, setSourceNodeId] = useState<string>('');
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [cycleWarning, setCycleWarning] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  /**
   * Topological DAG cycle detection: returns true if adding an edge from -> to creates a cycle.
   */
  const wouldCreateCycle = (fromId: string, toId: string): boolean => {
    if (fromId === toId) return true;

    // Build adjacency list
    const adj = new Map<string, string[]>();
    for (const node of nodes) {
      adj.set(node.id, []);
    }
    for (const edge of edges) {
      if (!adj.has(edge.from)) adj.set(edge.from, []);
      adj.get(edge.from)?.push(edge.to);
    }

    // Add candidate edge
    if (!adj.has(fromId)) adj.set(fromId, []);
    adj.get(fromId)?.push(toId);

    // Depth-First Search for cycle detection
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycleDfs = (curr: string): boolean => {
      visited.add(curr);
      recStack.add(curr);

      const neighbors = adj.get(curr) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          if (hasCycleDfs(next)) return true;
        } else if (recStack.has(next)) {
          return true; // Back-edge detected!
        }
      }

      recStack.delete(curr);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDfs(node.id)) return true;
      }
    }

    return false;
  };

  const handleAddEdge = () => {
    setCycleWarning('');
    setSuccessMsg('');

    if (!sourceNodeId || !targetNodeId) {
      setCycleWarning('Please select both a source and target project node.');
      return;
    }

    if (sourceNodeId === targetNodeId) {
      setCycleWarning('Self-referencing edges are strictly prohibited in DAG pipelines.');
      return;
    }

    const edgeExists = edges.some(e => e.from === sourceNodeId && e.to === targetNodeId);
    if (edgeExists) {
      setCycleWarning('An edge connecting these two nodes already exists.');
      return;
    }

    // DAG Cycle check
    const isCycle = wouldCreateCycle(sourceNodeId, targetNodeId);
    if (isCycle) {
      setCycleWarning(`DAG Cycle Intercepted: Connecting "${sourceNodeId}" to "${targetNodeId}" creates a cyclic dependency.`);
      return;
    }

    const newEdge: ProjectEdge = {
      id: `e-${sourceNodeId}-${targetNodeId}`,
      from: sourceNodeId,
      to: targetNodeId,
    };

    setEdges([...edges, newEdge]);
    setSuccessMsg(`Connection created safely from ${sourceNodeId} to ${targetNodeId}.`);
    setSourceNodeId('');
    setTargetNodeId('');
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges(edges.filter(e => e.id !== edgeId));
    setCycleWarning('');
    setSuccessMsg('Edge removed.');
  };

  const handleResetToDefault = () => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setCycleWarning('');
    setSuccessMsg('Pipeline restored to canonical linear flow.');
  };

  return (
    <div className="visual-node-canvas p-6 bg-card text-card-foreground rounded-xl shadow-lg border border-border space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-lg font-bold">Visual Project Node Canvas</h3>
            <p className="text-xs text-muted-foreground">
              Drag, link, and sequence curriculum projects with automated DAG cycle prevention
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetToDefault}
          className="text-xs px-3 py-1.5 border border-border rounded-md hover:bg-muted inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Flow
        </button>
      </div>

      {/* Cycle Detection Warning Banner */}
      {cycleWarning && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-md text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{cycleWarning}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-md text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="relative min-h-[360px] bg-muted/30 border border-dashed border-border rounded-lg p-6 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {nodes.map((node) => {
            const outgoing = edges.filter(e => e.from === node.id);
            const incoming = edges.filter(e => e.to === node.id);

            return (
              <div 
                key={node.id}
                className="bg-card border-2 border-border hover:border-primary/60 rounded-lg p-4 shadow-sm space-y-3 transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {node.stage}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {node.id}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold">{node.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{node.description}</p>
                </div>

                <div className="pt-2 border-t border-border/60 text-[11px] space-y-1 text-muted-foreground">
                  <div><strong>Pre-requisites:</strong> {incoming.length > 0 ? incoming.map(e => e.from).join(', ') : 'None (Root Node)'}</div>
                  <div><strong>Unlocks:</strong> {outgoing.length > 0 ? outgoing.map(e => e.to).join(', ') : 'Terminal Stage'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Edge Linking Controls */}
      <div className="bg-muted/40 p-4 rounded-lg border border-border space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Plus className="w-4 h-4 text-primary" /> Connect Project Nodes (DAG Validation Enabled)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">From:</span>
            <select
              value={sourceNodeId}
              onChange={(e) => setSourceNodeId(e.target.value)}
              className="text-xs px-3 py-1.5 bg-background border border-border rounded-md"
            >
              <option value="">Select Source Node</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">To:</span>
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
              className="text-xs px-3 py-1.5 bg-background border border-border rounded-md"
            >
              <option value="">Select Target Node</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.id})</option>)}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddEdge}
            className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-md hover:opacity-90 inline-flex items-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Add Connection
          </button>
        </div>

        {/* Existing Edges Table */}
        <div className="pt-2">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Active Graph Edges:</h5>
          <div className="flex flex-wrap gap-2">
            {edges.map((edge) => (
              <span 
                key={edge.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-full text-xs font-mono"
              >
                <span>{edge.from} &rarr; {edge.to}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteEdge(edge.id)}
                  className="text-muted-foreground hover:text-destructive"
                  title="Remove Edge"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualNodeCanvas;
