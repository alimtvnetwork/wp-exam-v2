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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ 
  onAddField, 
  layoutMode = 'vertical',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'choice' | 'text' | 'media'>('all');

  const filteredOptions = PALETTE_OPTIONS.filter((opt) => {
    if (selectedCategory === 'all') {
      return true;
    }

    return opt.category === selectedCategory;
  });

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

      {/* Segmented Category Filter Pills */}
      <div className="flex items-center gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`flex-1 text-[10px] py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'all'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('choice')}
          className={`flex-1 text-[10px] py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'choice'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Choice
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('text')}
          className={`flex-1 text-[10px] py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'text'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('media')}
          className={`flex-1 text-[10px] py-1 px-1 rounded-md transition-all font-medium text-center ${
            selectedCategory === 'media'
              ? 'bg-background text-foreground font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Media
        </button>
      </div>

      {/* Compact 2-Column Grid in Vertical Sidebar */}
      <div
        className={
          layoutMode === 'vertical'
            ? 'grid grid-cols-2 gap-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-0.5 custom-scrollbar'
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
    </div>
  );
};
