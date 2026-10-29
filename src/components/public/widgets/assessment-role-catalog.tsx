import React, { useState } from 'react';
import {
  Code,
  Palette,
  ShieldAlert,
  Server,
  FileCheck,
  TrendingUp,
  Clock,
  Award,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoleTemplate {
  id: string;
  category: 'engineering' | 'product' | 'security' | 'operations';
  title: string;
  description: string;
  questionsCount: number;
  durationMinutes: number;
  passingScorePct: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  skills: string[];
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'full-stack-eng',
    category: 'engineering',
    title: 'Senior Full-Stack Engineer',
    description: 'System architecture, concurrent data pipelines, TypeScript, and state synchronization.',
    questionsCount: 24,
    durationMinutes: 40,
    passingScorePct: 75,
    icon: Code,
    iconClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    skills: ['TypeScript', 'React 19', 'Split SQLite', 'System Design'],
  },
  {
    id: 'product-designer',
    category: 'product',
    title: 'Lead Product Designer',
    description: 'Design system governance, responsive heuristics, optical equilibrium, and WCAG accessibility.',
    questionsCount: 18,
    durationMinutes: 30,
    passingScorePct: 80,
    icon: Palette,
    iconClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    skills: ['Design Tokens', 'Information Architecture', 'Figma', 'WCAG AAA'],
  },
  {
    id: 'security-auditor',
    category: 'security',
    title: 'Security & Compliance Auditor',
    description: 'SOC2 Type II verification, zero-leak credential management, and anti-cheat audit trails.',
    questionsCount: 20,
    durationMinutes: 35,
    passingScorePct: 85,
    icon: ShieldAlert,
    iconClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    skills: ['SOC2', 'RBAC Casbin', 'Threat Modeling', 'GDPR/HIPAA'],
  },
  {
    id: 'devops-sre',
    category: 'engineering',
    title: 'Cloud DevOps & Site Reliability',
    description: 'Kubernetes orchestration, zero-storage CI/CD pipelines, and dynamic latency mitigation.',
    questionsCount: 22,
    durationMinutes: 35,
    passingScorePct: 75,
    icon: Server,
    iconClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    skills: ['Docker', 'CI/CD Actions', 'Prometheus', 'Edge Workers'],
  },
  {
    id: 'corp-governance',
    category: 'security',
    title: 'Corporate Ethics & Policy Assessment',
    description: 'Annual mandatory onboarding compliance, whistleblowing procedures, and conflict-of-interest gating.',
    questionsCount: 15,
    durationMinutes: 20,
    passingScorePct: 90,
    icon: FileCheck,
    iconClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    skills: ['Policy Enforcement', 'Anti-Bribery', 'Data Governance'],
  },
  {
    id: 'tech-account-exec',
    category: 'operations',
    title: 'Enterprise Technical Account Exec',
    description: 'Solution discovery, software licensing models, RFP evaluations, and executive presentation.',
    questionsCount: 16,
    durationMinutes: 25,
    passingScorePct: 70,
    icon: TrendingUp,
    iconClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    skills: ['SaaS Economics', 'RFP Responses', 'Contract Negotiation'],
  },
];

type CategoryFilter = 'all' | 'engineering' | 'product' | 'security' | 'operations';

export const AssessmentRoleCatalog: React.FC<{
  onSelectRole: (roleId: string) => void;
}> = ({ onSelectRole }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredTemplates = ROLE_TEMPLATES.filter((template) => {
    if (activeCategory === 'all') {
      return true;
    }

    return template.category === activeCategory;
  });

  return (
    <div className="w-full space-y-8">
      {/* Category Filter Pills with Luxury Styling */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {(
          [
            { id: 'all', label: 'All Disciplines' },
            { id: 'engineering', label: 'Engineering & SRE' },
            { id: 'product', label: 'Design & Product' },
            { id: 'security', label: 'Security & Compliance' },
            { id: 'operations', label: 'Enterprise Operations' },
          ] as const
        ).map((cat) => {
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/40'
                  : 'glass-panel text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Luxury Role Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((role) => {
          const Icon = role.icon;

          return (
            <div
              key={role.id}
              className="rounded-3xl glass-panel-elevated overflow-hidden hover:border-primary/60 transition-all flex flex-col justify-between group shadow-xl hover:-translate-y-1 duration-300"
            >
              <div>
                <div className="h-0.5 w-full bg-primary/70" />
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${role.iconClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary py-0.5 px-2.5 rounded-full">
                      {role.passingScorePct}% Pass Benchmark
                    </Badge>
                  </div>

                  <h4 className="text-lg font-bold text-foreground font-heading group-hover:text-primary transition-colors">
                    {role.title}
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {role.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-muted/60 text-muted-foreground border border-border/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-muted/30 border-t border-border/70 flex items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" /> {role.questionsCount} Qs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {role.durationMinutes}m
                  </span>
                </div>

                <Button
                  size="sm"
                  onClick={() => onSelectRole(role.id)}
                  className="h-8 text-xs font-bold px-3.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer gap-1.5 rounded-xl shadow-xs"
                >
                  <span>Launch</span>
                  <Play className="w-3 h-3 fill-current" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
