import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, X, ListOrdered, Sparkles, CornerDownLeft } from 'lucide-react';

export interface MultilineListItemsInputProps {
  value: unknown;
  onChange: (val: string[]) => void;
  suggestionsPool?: string[];
  placeholder?: string;
  isReadOnly?: boolean;
}

export const MultilineListItemsInput: React.FC<MultilineListItemsInputProps> = ({
  value,
  onChange,
  suggestionsPool = [],
  placeholder = 'Type an item or link...',
  isReadOnly = false,
}) => {
  // Normalize value to array of non-empty strings, or single empty line if none
  const parsedItems: string[] = useMemo(() => {
    if (Array.isArray(value)) {
      const arr = value.map((v) => String(v || '').trim()).filter(Boolean);
      return arr.length > 0 ? arr : [''];
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        // Split strictly by newline (NOT comma)
        const lines = trimmed
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        return lines.length > 0 ? lines : [''];
      }
    }

    return [''];
  }, [value]);

  const [activeFocusedIndex, setActiveFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus management when adding new rows
  const focusTargetIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (focusTargetIndexRef.current !== null) {
      const targetInput = inputRefs.current[focusTargetIndexRef.current];
      if (targetInput) {
        targetInput.focus();
      }
      focusTargetIndexRef.current = null;
    }
  }, [parsedItems.length]);

  const commitUpdates = (newItems: string[]) => {
    // Pass clean array of non-empty strings (or empty array if all lines blank)
    const cleaned = newItems.map((s) => s.trim()).filter(Boolean);
    onChange(cleaned);
  };

  const handleRowChange = (index: number, text: string) => {
    const next = [...parsedItems];
    next[index] = text;
    commitUpdates(next);
  };

  const handleRowKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Insert a new blank line immediately following the current row
      const next = [...parsedItems];
      next.splice(index + 1, 0, '');
      focusTargetIndexRef.current = index + 1;
      commitUpdates(next);
    } else if (e.key === 'Backspace') {
      // If current row is empty and not the only line, delete it and focus previous row
      if (parsedItems[index] === '' && parsedItems.length > 1) {
        e.preventDefault();
        const next = parsedItems.filter((_, idx) => idx !== index);
        const prevIndex = Math.max(0, index - 1);
        focusTargetIndexRef.current = prevIndex;
        commitUpdates(next);
      }
    }
  };

  const handleRemoveRow = (index: number) => {
    if (parsedItems.length <= 1) {
      commitUpdates(['']);
      return;
    }
    const next = parsedItems.filter((_, idx) => idx !== index);
    commitUpdates(next);
  };

  const handleAppendBlankRow = () => {
    const next = [...parsedItems, ''];
    focusTargetIndexRef.current = next.length - 1;
    commitUpdates(next);
  };

  const handlePickSuggestion = (suggestion: string, targetRowIndex: number) => {
    const next = [...parsedItems];
    next[targetRowIndex] = suggestion;

    // Immediately create next empty row for smooth typing flow
    next.splice(targetRowIndex + 1, 0, '');
    focusTargetIndexRef.current = targetRowIndex + 1;
    commitUpdates(next);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Multiline Items List (Each item is its own line) */}
      <div className="space-y-2">
        {parsedItems.map((item, index) => {
          const isFocused = activeFocusedIndex === index;
          const currentText = item.trim().toLowerCase();

          // Autocomplete matching pool for active row
          const matchingSuggestions =
            isFocused && currentText.length > 0 && suggestionsPool.length > 0
              ? suggestionsPool
                  .filter((sug) => sug.toLowerCase().includes(currentText))
                  .filter((sug) => sug.toLowerCase() !== currentText)
                  .slice(0, 5)
              : [];

          return (
            <div key={index} className="relative group/row">
              <div className="flex items-center gap-2">
                {/* Line number badge */}
                <div className="w-7 h-9 flex items-center justify-center rounded-lg bg-muted/50 border border-border/70 text-xs font-mono font-bold text-muted-foreground shrink-0 select-none">
                  {index + 1}.
                </div>

                {/* Individual Line Text Input */}
                <div className="relative flex-1">
                  <Input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    value={item}
                    onChange={(e) => handleRowChange(index, e.target.value)}
                    onKeyDown={(e) => handleRowKeyDown(index, e)}
                    onFocus={() => setActiveFocusedIndex(index)}
                    onBlur={() => {
                      // Slight timeout to allow clicking a suggestion
                      setTimeout(() => {
                        setActiveFocusedIndex((current) => (current === index ? null : current));
                      }, 200);
                    }}
                    placeholder={index === 0 ? placeholder : 'Press Enter for new line...'}
                    disabled={isReadOnly}
                    className="font-sans font-normal text-sm h-10 px-3.5 bg-background text-foreground border border-input rounded-lg shadow-2xs focus-visible:ring-2 focus-visible:ring-primary transition-all w-full"
                  />

                  {/* Return Key Enter Hint */}
                  {isFocused && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 text-[10px] text-muted-foreground/50 font-mono">
                      <span>Enter</span>
                      <CornerDownLeft className="w-3 h-3 opacity-60" />
                    </div>
                  )}
                </div>

                {/* Remove Line Button */}
                {!isReadOnly && parsedItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
                    title="Remove this line"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dynamic Autocomplete Popup Dropdown when typing */}
              {matchingSuggestions.length > 0 && (
                <div className="absolute left-9 right-10 top-full mt-1 z-30 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl p-1 animate-in fade-in-50 duration-100">
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>Suggestions (Click to select & create next line)</span>
                  </div>
                  {matchingSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handlePickSuggestion(sug, index);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-md hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium text-foreground">{sug}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">+ Pick</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Row Control Footer: + Add Line button and Item Counter */}
      <div className="flex items-center justify-between pt-1">
        {!isReadOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAppendBlankRow}
            className="h-8 px-3 text-xs gap-1.5 font-medium border-border/80 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item (or press Enter)</span>
          </Button>
        )}

        <div className="text-xs text-muted-foreground font-mono ml-auto">
          {parsedItems.filter((s) => s.trim().length > 0).length} item
          {parsedItems.filter((s) => s.trim().length > 0).length === 1 ? '' : 's'} entered
        </div>
      </div>

      {/* Suggested Items Quick Pool (Available suggestions below) */}
      {suggestionsPool.length > 0 && (
        <div className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ListOrdered className="w-3.5 h-3.5 text-primary" />
            <span>Autocomplete Pool (Click to append):</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {suggestionsPool.map((sug) => {
              const isAlreadyEntered = parsedItems.some(
                (p) => p.trim().toLowerCase() === sug.trim().toLowerCase()
              );

              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    if (!isAlreadyEntered) {
                      // Find first empty row or append
                      const emptyIndex = parsedItems.findIndex((s) => s.trim().length === 0);
                      if (emptyIndex >= 0) {
                        handlePickSuggestion(sug, emptyIndex);
                      } else {
                        const next = [...parsedItems, sug, ''];
                        commitUpdates(next);
                      }
                    }
                  }}
                  disabled={isAlreadyEntered || isReadOnly}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs font-medium ${
                    isAlreadyEntered
                      ? 'border-border/40 bg-muted/40 text-muted-foreground line-through opacity-50 cursor-not-allowed'
                      : 'border-border/80 bg-background text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary'
                  }`}
                  title={isAlreadyEntered ? `"${sug}" already in list` : `Add "${sug}"`}
                >
                  + {sug}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
