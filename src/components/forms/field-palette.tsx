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
  Sparkles,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaletteOption {
  type: FieldType;
  label: string;
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
    description: 'Select one or more choices with points',
    icon: CheckSquare,
    category: 'choice',
    colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    type: 'single_choice',
    label: 'Single Choice',
    description: 'Radio selection for single answer',
    icon: CircleDot,
    category: 'choice',
    colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    type: 'true_false',
    label: 'True / False',
    description: 'Binary claim verification with scoring',
    icon: ToggleLeft,
    category: 'choice',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    type: 'dropdown',
    label: 'Dropdown Select',
    description: 'Compact dropdown list of options',
    icon: ListFilter,
    category: 'choice',
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    type: 'rating',
    label: 'Rating Scale (1-5)',
    description: 'Candidate confidence or skill rating',
    icon: Star,
    category: 'choice',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },

  // Text Category
  {
    type: 'short_answer',
    label: 'Short Answer',
    description: 'Single-line text input for names or terms',
    icon: Type,
    category: 'text',
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    type: 'paragraph',
    label: 'Paragraph Text',
    description: 'Multi-line commentary and explanations',
    icon: AlignLeft,
    category: 'text',
    colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    type: 'email',
    label: 'Verified Email',
    description: 'Validated candidate email address',
    icon: Mail,
    category: 'text',
    colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  },
  {
    type: 'phone',
    label: 'WhatsApp / Phone',
    description: 'Direct phone number with country prefix',
    icon: Phone,
    category: 'text',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },

  // Media & Verification Category
  {
    type: 'regex_text',
    label: 'Regex Verified Input',
    description: 'Pattern-enforced IDs, codes, or rolls',
    icon: ShieldCheck,
    category: 'media',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    type: 'link',
    label: 'External Reference Link',
    description: 'Document or external assignment URL',
    icon: Link,
    category: 'media',
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    type: 'file_upload',
    label: 'File Upload (PDF / ZIP)',
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
  activeCount,
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
    <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3.5">
      {/* Palette Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Add Question or Input Field
            </span>
            <span className="text-[10px] text-muted-foreground block">
              Click any element below to append it to your form sequence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            All Types (12)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('choice')}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedCategory === 'choice'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            Choice & Quiz
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('text')}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedCategory === 'text'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            Text Inputs
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('media')}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedCategory === 'media'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            Media & Regex
          </button>
        </div>
      </div>

      {/* Grid of Palette Cards */}
      <div className={layoutMode === 'vertical' ? 'grid grid-cols-1 gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5'}>
        {filteredOptions.map((opt) => {
          const IconComp = opt.icon;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onAddField(opt.type)}
              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-card/60 hover:bg-muted/60 hover:border-primary/40 transition-all text-left group hover:scale-[1.01] active:scale-[0.99] shadow-2xs"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${opt.colorClass} group-hover:scale-105 transition-transform`}
              >
                <IconComp className="w-4 h-4" />
              </div>

              <div className="overflow-hidden">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                  {opt.label}
                </span>
                <span className="text-[10px] text-muted-foreground line-clamp-1 block">
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
