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
  Video,
  Plus,
  Layers,
  Search,
  Sparkles,
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
  // Choice & Quiz Category
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    shortLabel: 'Multi Choice',
    description: 'Multi-select checkboxes with scoring',
    icon: CheckSquare,
    category: 'choice',
    colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
  },
  {
    type: 'single_choice',
    label: 'Single Choice',
    shortLabel: 'Single Choice',
    description: 'Radio buttons for single correct answer',
    icon: CircleDot,
    category: 'choice',
    colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
  },
  {
    type: 'true_false',
    label: 'True / False',
    shortLabel: 'True / False',
    description: 'Binary claim verification',
    icon: ToggleLeft,
    category: 'choice',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  },
  {
    type: 'dropdown',
    label: 'Dropdown Select',
    shortLabel: 'Dropdown',
    description: 'Compact select menu options',
    icon: ListFilter,
    category: 'choice',
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  },
  {
    type: 'rating',
    label: 'Rating Scale',
    shortLabel: 'Rating (1-5)',
    description: 'Candidate confidence rating',
    icon: Star,
    category: 'choice',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  },

  // Text & Input Category
  {
    type: 'short_answer',
    label: 'Short Answer',
    shortLabel: 'Short Text',
    description: 'Single-line input for names or terms',
    icon: Type,
    category: 'text',
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  },
  {
    type: 'paragraph',
    label: 'Paragraph Text',
    shortLabel: 'Paragraph',
    description: 'Multi-line commentary and essays',
    icon: AlignLeft,
    category: 'text',
    colorClass: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
  },
  {
    type: 'email',
    label: 'Verified Email',
    shortLabel: 'Email Input',
    description: 'Validated candidate email address',
    icon: Mail,
    category: 'text',
    colorClass: 'text-teal-400 bg-teal-500/10 border-teal-500/25',
  },
  {
    type: 'phone',
    label: 'WhatsApp / Phone',
    shortLabel: 'Phone / WA',
    description: 'Direct mobile or WhatsApp number',
    icon: Phone,
    category: 'text',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  },

  // Media & Verification Category
  {
    type: 'regex_text',
    label: 'Regex Verified',
    shortLabel: 'Regex Match',
    description: 'Pattern-enforced IDs, codes, or rolls',
    icon: ShieldCheck,
    category: 'media',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  },
  {
    type: 'link',
    label: 'Reference Link',
    shortLabel: 'Doc Link',
    description: 'External link or document assignment',
    icon: Link,
    category: 'media',
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    shortLabel: 'File / CV',
    description: 'CV, portfolio, or work sample uploads',
    icon: Upload,
    category: 'media',
    colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
  },
  {
    type: 'video',
    label: 'Video Briefing / Walkthrough',
    shortLabel: 'Video Embed',
    description: 'YouTube, Vimeo, Loom, or direct MP4 video',
    icon: Video,
    category: 'media',
    colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/25',
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

  const categories = [
    { id: 'all', label: 'All', count: PALETTE_OPTIONS.length },
    { id: 'choice', label: 'Choice', count: PALETTE_OPTIONS.filter((o) => o.category === 'choice').length },
    { id: 'text', label: 'Text', count: PALETTE_OPTIONS.filter((o) => o.category === 'text').length },
    { id: 'media', label: 'Media', count: PALETTE_OPTIONS.filter((o) => o.category === 'media').length },
  ] as const;

  const content = (
    <div className="space-y-3">
      {/* Search Input for Field Types */}
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search question types..."
          className="h-8 text-xs pl-8 pr-7 bg-muted/20 border-border/70 rounded-lg placeholder:text-muted-foreground/60 focus:bg-background transition-colors"
        />
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-0.5 rounded"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Segmented Category Filter Pills */}
      <div className="flex items-center gap-1 p-0.5 bg-muted/40 rounded-lg border border-border/60">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-1 text-[10px] py-1 px-1 rounded-md transition-all font-medium text-center flex items-center justify-center gap-1 ${
              selectedCategory === cat.id
                ? 'bg-background text-foreground font-semibold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{cat.label}</span>
            <span className="text-[9px] opacity-60 font-mono">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Grid of Components */}
      {filteredOptions.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
          <Sparkles className="w-6 h-6 mx-auto opacity-40 text-muted-foreground" />
          <p>No component types match "{searchQuery}"</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-[11px] text-primary hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div
          className={
            layoutMode === 'vertical'
              ? 'grid grid-cols-1 gap-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-1 custom-scrollbar'
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
                className="flex items-center justify-between p-2 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/40 hover:border-primary/40 transition-all text-left group active:scale-[0.99] shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${opt.colorClass} group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  <div className="overflow-hidden min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {opt.label}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono opacity-60 shrink-0">
                        {opt.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
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
