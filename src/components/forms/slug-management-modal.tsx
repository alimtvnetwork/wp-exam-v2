import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Globe,
  Copy,
  ExternalLink,
  Wand2,
  Check,
  AlertCircle,
  Code2,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface SlugManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlug: string;
  formTitle: string;
  onUpdateSlug: (newSlug: string) => void;
}

const CATEGORY_PRESETS = [
  { id: 'none', label: 'None (Direct)', prefix: '' },
  { id: 'assessment', label: 'Assessment', prefix: 'assessment-' },
  { id: 'quiz', label: 'Quiz', prefix: 'quiz-' },
  { id: 'survey', label: 'Survey', prefix: 'survey-' },
  { id: 'exam', label: 'Exam', prefix: 'exam-' },
  { id: 'hiring', label: 'Hiring / HR', prefix: 'hiring-' },
];

export const SlugManagementModal: React.FC<SlugManagementModalProps> = ({
  isOpen,
  onClose,
  currentSlug,
  formTitle,
  onUpdateSlug,
}) => {
  const [editedSlug, setEditedSlug] = useState(currentSlug || 'custom-form');
  const [selectedCategory, setSelectedCategory] = useState('none');

  useEffect(() => {
    setEditedSlug(currentSlug || 'custom-form');
  }, [currentSlug]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleAutoGenerate = () => {
    if (!formTitle || formTitle.trim().length === 0) {
      toast.error('Form title is empty. Enter a title first to auto-generate a slug.');

      return;
    }

    const generated = slugify(formTitle);
    const prefix = CATEGORY_PRESETS.find((c) => c.id === selectedCategory)?.prefix || '';
    const fullGenerated = `${prefix}${generated}`;

    setEditedSlug(fullGenerated);
    toast.success(`Generated slug from title: "${fullGenerated}"`);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const selectedPreset = CATEGORY_PRESETS.find((c) => c.id === categoryId);
    const newPrefix = selectedPreset?.prefix || '';

    // Strip previous prefixes if present
    let clean = editedSlug;
    for (const cat of CATEGORY_PRESETS) {
      if (cat.prefix && clean.startsWith(cat.prefix)) {
        clean = clean.slice(cat.prefix.length);
        break;
      }
    }

    setEditedSlug(`${newPrefix}${clean}`);
  };

  const cleanCurrentSlug = slugify(editedSlug);
  const isValidSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(editedSlug);

  const publicUrl = `${origin}/f/${editedSlug}`;
  const previewUrl = `${origin}/preview/${editedSlug}`;
  const adminUrl = `${origin}/admin/form/${editedSlug}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="800" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleApply = () => {
    if (!editedSlug || editedSlug.trim().length === 0) {
      toast.error('Slug cannot be empty.');

      return;
    }

    const sanitized = slugify(editedSlug);
    onUpdateSlug(sanitized);

    // Synchronize browser address bar immediately
    if (typeof window !== 'undefined') {
      const expectedPath = `/admin/form/${encodeURIComponent(sanitized)}`;
      window.history.replaceState(null, '', expectedPath);
    }

    toast.success(`Canonical form slug updated to: "${sanitized}"`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] bg-card border border-border shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border/70 bg-muted/20">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Slug & Canonical URL Management</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/10">
                      Live Routing
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure the canonical URL identifier, category namespace, and address bar routing.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Visual Breakdown: How your slug is built */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>How Your Slug Is Built</span>
              </span>
              {isValidSlug ? (
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Valid URL Slug</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 bg-amber-500/10 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Invalid Formatting</span>
                </Badge>
              )}
            </div>

            {/* Architecture Path Diagram */}
            <div className="flex items-center gap-1.5 flex-wrap p-2.5 rounded-lg bg-background/80 border border-border font-mono text-xs overflow-x-auto">
              <span className="text-muted-foreground">{origin}</span>
              <span className="text-muted-foreground/60">/f/</span>
              <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-bold border border-primary/30">
                {editedSlug || 'your-slug-here'}
              </span>
            </div>

            {!isValidSlug && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Slugs should contain lowercase letters, numbers, and hyphens only (e.g. <code>{cleanCurrentSlug}</code>).
                </span>
              </p>
            )}
          </div>

          {/* Category Namespace Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Slug Category Prefix:
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {CATEGORY_PRESETS.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={`h-7 text-xs transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => handleSelectCategory(cat.id)}
                  >
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Editable Slug Input with Auto-Generate Action */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug-input" className="text-xs font-semibold text-foreground">
                Canonical URL Slug:
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoGenerate}
                className="h-6 text-[11px] px-2 text-primary border-primary/30 hover:bg-primary/10 gap-1 font-medium"
              >
                <Wand2 className="w-3 h-3" />
                <span>Auto-Generate from Title</span>
              </Button>
            </div>

            <div className="relative">
              <Input
                id="slug-input"
                value={editedSlug}
                onChange={(e) => setEditedSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="enter-custom-slug"
                className="font-mono text-xs h-9 bg-background border-border text-foreground font-semibold pr-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditedSlug(cleanCurrentSlug)}
                className="absolute right-1 top-1 h-7 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Sanitize
              </Button>
            </div>
          </div>

          {/* Canonical Links Registry */}
          <div className="space-y-2 pt-2 border-t border-border/70">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Active Canonical URLs
            </span>

            <div className="space-y-2">
              {/* Public Candidate Link */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/70 text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>Public Candidate Form</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      Live
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground truncate">{publicUrl}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(publicUrl, 'Public Candidate URL')}
                    title="Copy Public URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => window.open(publicUrl, '_blank')}
                    title="Open in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Live Preview Link */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/70 text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>Interactive Test Preview</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary bg-primary/10">
                      Dev
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground truncate">{previewUrl}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(previewUrl, 'Test Preview URL')}
                    title="Copy Preview URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => window.open(previewUrl, '_blank')}
                    title="Open in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Admin Studio URL */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/70 text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-foreground">Admin Builder Studio</div>
                  <div className="font-mono text-[11px] text-muted-foreground truncate">{adminUrl}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(adminUrl, 'Admin Studio URL')}
                    title="Copy Admin URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Iframe Embed Code */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/70 text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Embed Iframe Snippet</span>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{embedCode}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(embedCode, 'Iframe Embed Code')}
                    title="Copy Embed Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/10">
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleApply}
              className="text-xs bg-primary text-primary-foreground font-semibold gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Synchronize URL</span>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
