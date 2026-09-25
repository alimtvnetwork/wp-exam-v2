import React, { useState } from 'react';
import { FieldType } from '@/lib/types/form';
import {
  CheckSquare,
  CircleDot,
  ToggleLeft,
  ListFilter,
  Star,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Link,
  ShieldCheck,
  Upload,
  Plus,
  Layers,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface PaletteOption {
  type: FieldType;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'choice' | 'text' | 'media';
  colorClass: string;
}

const PALETTE_OPTIONS: PaletteOption[] = [
  // Choice Category
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    shortLabel: 'Multiple Choice',
    description: 'Multi-select checkboxes with scoring',
    icon: CheckSquare,
    category: 'choice',
    colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    type: 'single_choice',
    label: 'Single Choice',
    shortLabel: 'Single Choice',
    description: 'Radio buttons for single answer',
    icon: CircleDot,
    category: 'choice',
    colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    type: 'true_false',
    label: 'True / False',
    shortLabel: 'True / False',
    description: 'Binary claim verification',
    icon: ToggleLeft,
    category: 'choice',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    type: 'dropdown',
    label: 'Dropdown Select',
    shortLabel: 'Dropdown',
    description: 'Compact select menu options',
    icon: ListFilter,
    category: 'choice',
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    type: 'rating',
    label: 'Rating Scale',
    shortLabel: 'Rating (1-5)',
    description: 'Candidate confidence rating',
    icon: Star,
    category: 'choice',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },

  // Text Category
  {
    type: 'short_answer',
    label: 'Short Answer',
    shortLabel: 'Short Text',
    description: 'Single-line input for names or terms',
    icon: Type,
    category: 'text',
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    type: 'paragraph',
    label: 'Paragraph Text',
    shortLabel: 'Paragraph',
    description: 'Multi-line commentary and essays',
    icon: AlignLeft,
    category: 'text',
    colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    type: 'email',
    label: 'Verified Email',
    shortLabel: 'Email Input',
    description: 'Validated candidate email address',
    icon: Mail,
    category: 'text',
    colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  },
  {
    type: 'phone',
    label: 'WhatsApp / Phone',
    shortLabel: 'WhatsApp',
    description: 'Direct phone with country selector',
    icon: Phone,
    category: 'text',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },

  // Media & Verification Category
  {
    type: 'regex_text',
    label: 'Regex Verified',
    shortLabel: 'Regex Match',
    description: 'Pattern-enforced IDs, codes, or rolls',
    icon: ShieldCheck,
    category: 'media',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    type: 'link',
    label: 'Reference Link',
    shortLabel: 'Doc Link',
    description: 'External link or document assignment',
    icon: Link,
    category: 'media',
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    shortLabel: 'File / CV',
    description: 'CV, portfolio, or work sample uploads',
    icon: Upload,
    category: 'media',
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
  activeCount: number;
  layoutMode?: 'horizontal' | 'vertical';
  isEmbedded?: boolean;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ 
  onAddField, 
  layoutMode = 'vertical',
  isEmbedded = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'choice' | 'text' | 'media'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = PALETTE_OPTIONS.filter((opt) => {
    const matchesCategory = selectedCategory === 'all' || opt.category === selectedCategory;
    if (!matchesCategory) {
      return false;
    }

    if (!searchQuery.trim()) {
      return true;
    }

    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      opt.shortLabel.toLowerCase().includes(query) ||
      opt.description.toLowerCase().includes(query)
    );
  });

  const content = (
    <div className="space-y-3">
      {/* Search Input for Field Types */}
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter components..."
          className="h-8 text-xs pl-7 pr-7 bg-muted/30 border-border/80 rounded-lg placeholder:text-muted-foreground/70"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">
          🔍
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-0.5"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Segmented Category Filter Pills */}
      <div className="flex items-center gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60">
        {(['all', 'choice', 'text', 'media'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex-1 text-[10px] py-1 px-1 rounded-md transition-all font-medium text-center capitalize ${
              selectedCategory === cat
                ? 'bg-background text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Components */}
      {filteredOptions.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No component types match "{searchQuery}"
        </div>
      ) : (
        <div
          className={
            layoutMode === 'vertical'
              ? 'grid grid-cols-2 gap-1.5 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5 custom-scrollbar'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'
          }
        >
          {filteredOptions.map((opt) => {
            const IconComp = opt.icon;

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => onAddField(opt.type)}
                title={`${opt.label}: ${opt.description}`}
                className="flex items-center gap-2 p-2 rounded-lg border border-border/80 bg-background/60 hover:bg-primary/5 hover:border-primary/40 transition-all text-left group hover:scale-[1.01] active:scale-[0.99] shadow-2xs"
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${opt.colorClass} group-hover:scale-105 transition-transform`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>

                <div className="overflow-hidden min-w-0">
                  <span className="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors block truncate leading-tight">
                    {opt.shortLabel}
                  </span>
                  <span className="text-[9px] text-muted-foreground truncate block leading-tight">
                    {opt.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs space-y-3">
      {/* Sleek Palette Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">Field Palette</span>
        </div>
        <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4">
          {filteredOptions.length} items
        </Badge>
      </div>

      {content}
    </div>
  );
};
