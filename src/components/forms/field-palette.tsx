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
  Heading,
  HelpCircle,
  GripVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PaletteOption {
  type: FieldType;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'choice' | 'text' | 'media' | 'layout';
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
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    type: 'single_choice',
    label: 'Single Choice',
    shortLabel: 'Single Choice',
    description: 'Radio buttons for single correct answer',
    icon: CircleDot,
    category: 'choice',
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    type: 'true_false',
    label: 'True / False',
    shortLabel: 'True / False',
    description: 'Binary claim verification',
    icon: ToggleLeft,
    category: 'choice',
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    type: 'dropdown',
    label: 'Dropdown Select',
    shortLabel: 'Dropdown',
    description: 'Compact select menu options',
    icon: ListFilter,
    category: 'choice',
    colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    type: 'rating',
    label: 'Rating Scale',
    shortLabel: 'Rating (1-5)',
    description: 'Candidate confidence rating',
    icon: Star,
    category: 'choice',
    colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },

  // Text & Input Category
  {
    type: 'short_answer',
    label: 'Short Answer',
    shortLabel: 'Short Text',
    description: 'Single-line input for names or terms',
    icon: Type,
    category: 'text',
    colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    type: 'paragraph',
    label: 'Paragraph Text',
    shortLabel: 'Paragraph',
    description: 'Multi-line commentary and essays',
    icon: AlignLeft,
    category: 'text',
    colorClass: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    type: 'email',
    label: 'Verified Email',
    shortLabel: 'Email Input',
    description: 'Validated candidate email address',
    icon: Mail,
    category: 'text',
    colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    type: 'phone',
    label: 'WhatsApp / Phone',
    shortLabel: 'Phone / WA',
    description: 'Direct mobile or WhatsApp number',
    icon: Phone,
    category: 'text',
    colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },

  // Media & Verification Category
  {
    type: 'regex_text',
    label: 'Regex Verified',
    shortLabel: 'Regex Match',
    description: 'Pattern-enforced IDs, codes, or rolls',
    icon: ShieldCheck,
    category: 'media',
    colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    type: 'link',
    label: 'Reference Link',
    shortLabel: 'Doc Link',
    description: 'External link or document assignment',
    icon: Link,
    category: 'media',
    colorClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    shortLabel: 'File / CV',
    description: 'CV, portfolio, or work sample uploads',
    icon: Upload,
    category: 'media',
    colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    type: 'video',
    label: 'Video Briefing / Walkthrough',
    shortLabel: 'Video Embed',
    description: 'YouTube, Vimeo, Loom, or direct MP4 video',
    icon: Video,
    category: 'media',
    colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
  },

  // Layout Category
  {
    type: 'section_header',
    label: 'Section Header / Title',
    shortLabel: 'Heading',
    description: 'Elementor-style section header, subtitle, and divider',
    icon: Heading,
    category: 'layout',
    colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    type: 'faq',
    label: 'FAQ Accordion',
    shortLabel: 'FAQ',
    description: 'Collapsible questions & answers block',
    icon: HelpCircle,
    category: 'layout',
    colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
  activeCount: number;
  layoutMode?: 'horizontal' | 'vertical';
  isEmbedded?: boolean;
  onDragStartControl?: (type: FieldType, label: string) => void;
  onDragEndControl?: () => void;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({
  onAddField,
  layoutMode = 'vertical',
  isEmbedded = false,
  onDragStartControl,
  onDragEndControl,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'choice' | 'text' | 'media' | 'layout'>('all');
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
    { id: 'all', label: 'All', count: PALETTE_OPTIONS.length, icon: Layers },
    { id: 'choice', label: 'Choice', count: PALETTE_OPTIONS.filter((o) => o.category === 'choice').length, icon: CheckSquare },
    { id: 'text', label: 'Text', count: PALETTE_OPTIONS.filter((o) => o.category === 'text').length, icon: Type },
    { id: 'media', label: 'Media', count: PALETTE_OPTIONS.filter((o) => o.category === 'media').length, icon: Video },
    { id: 'layout', label: 'Page Elements', count: PALETTE_OPTIONS.filter((o) => o.category === 'layout').length, icon: Heading },
  ] as const;

  const content = (
    <div className="space-y-3.5">
      {/* Search Input for Field Types */}
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search question types..."
          className="h-9 text-xs sm:text-sm pl-8.5 pr-8 bg-muted/20 border-border/80 rounded-lg placeholder:text-muted-foreground/60 focus:bg-background transition-colors"
        />
        <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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

      {/* Segmented Category Filter Pills (Generous, accessible pills) */}
      <div className="flex flex-nowrap items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/60 min-w-0 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const CategoryIcon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <Tooltip key={cat.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  aria-label={`${cat.label} (${cat.count})`}
                  className={`flex-1 min-w-0 text-xs py-1.5 px-2 rounded-md transition-all font-medium text-center flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-background text-foreground font-semibold shadow-xs border border-border/50'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <CategoryIcon className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className={`text-xs truncate ${isEmbedded ? 'hidden 2xl:inline-block' : 'hidden sm:inline-block'}`}>
                    {cat.label}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {cat.label} ({cat.count})
              </TooltipContent>
            </Tooltip>
          );
        })}
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
            className="text-xs text-primary hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div
          className={
            layoutMode === 'vertical'
              ? 'grid grid-cols-1 gap-2.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5'
          }
        >
          {filteredOptions.map((opt) => {
            const IconComp = opt.icon;

            return (
              <div
                key={opt.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ fieldType: opt.type, label: opt.label }));
                  e.dataTransfer.setData('text/plain', opt.type);
                  e.dataTransfer.effectAllowed = 'copy';

                  if (onDragStartControl) {
                    onDragStartControl(opt.type, opt.label);
                  }
                }}
                onDragEnd={() => {
                  if (onDragEndControl) {
                    onDragEndControl();
                  }
                }}
                onClick={() => onAddField(opt.type)}
                title={`${opt.label}: ${opt.description} (Drag to form canvas or click to add)`}
                className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border bg-card hover:bg-accent/60 hover:border-primary/60 transition-all text-left group shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing min-w-0 w-full select-none"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1 mr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${opt.colorClass} group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200 mt-0.5 shadow-2xs`}
                  >
                    <IconComp className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight block truncate">
                      {opt.label}
                    </span>
                    <p className="text-xs text-muted-foreground leading-normal mt-0.5 line-clamp-2 break-words">
                      {opt.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70 group-hover:text-primary font-medium">
                        Drag or click
                      </span>
                    </div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center">
                  <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-all">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
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
        <Badge variant="secondary" className="text-xs font-mono px-1.5 py-0 h-4">
          {filteredOptions.length} items
        </Badge>
      </div>

      {content}
    </div>
  );
};
